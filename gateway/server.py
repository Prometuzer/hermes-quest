"""
HERMES GATEWAY — Pont entre le jeu Hermes: Quest et Hermes Agent.

Architecture :
    Jeu (Godot)  ──POST /chat──►  Ce pont (FastAPI)  ──subprocess──►  Hermes Agent
                                      ▲                                    │
                                      └────────── reply text ─────────────┘

Le pont appelle `hermes chat -q "<message>"` en subprocess, récupère la
réponse texte, et la renvoie au jeu en JSON.

Pourquoi subprocess ?
- Hermes Agent tourne déjà sur le VPS (ton bot Telegram).
- `hermes chat -q` est l'API la plus simple et la plus stable.
- Pas besoin de configurer un webhook ou une API serveur supplémentaire.
- Le contexte (mémoire, profil, skills) est partagé avec ton bot Telegram.

Lancement :
    cd /opt/data/hermes-quest/gateway
    uv venv .venv && source .venv/bin/activate
    uv pip install fastapi uvicorn[standard]
    uvicorn server:app --host 0.0.0.0 --port 8000 --reload
"""
from __future__ import annotations

import asyncio
import logging
import os
import time
import uuid
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from hermes_bridge import call_hermes, is_hermes_available

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("hermes-gateway")

# --- Sessions en mémoire (MVP) ---
# En prod : Redis ou SQLite. Ici : dict simple, suffisant pour quelques joueurs.
SESSIONS: dict[str, dict[str, Any]] = {}
SESSION_TTL = 3600  # 1h


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Hermes Gateway starting up...")
    ok = is_hermes_available()
    log.info("Hermes Agent available: %s", ok)
    yield
    log.info("Hermes Gateway shutting down.")


app = FastAPI(
    title="Hermes Gateway",
    description="Pont entre le jeu Hermes: Quest for the Codex Soul et Hermes Agent.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS large pour le MVP (le jeu Godot tourne en local chez le joueur)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Modèles ---
class ChatRequest(BaseModel):
    session: str | None = Field(None, description="ID de session joueur (facultatif)")
    message: str = Field(..., min_length=1, max_length=2000)
    context: dict[str, Any] = Field(default_factory=dict, description="État du jeu (health, enemies, etc.)")


class ChatResponse(BaseModel):
    reply: str
    session: str
    elapsed_ms: int
    cached: bool = False


class HealthResponse(BaseModel):
    status: str
    hermes_available: bool
    active_sessions: int
    uptime_s: int


START_TS = time.time()


# --- Routes ---
@app.get("/")
async def root():
    return {"name": "Hermes Gateway", "version": "0.1.0", "docs": "/docs"}


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="ok",
        hermes_available=is_hermes_available(),
        active_sessions=len(SESSIONS),
        uptime_s=int(time.time() - START_TS),
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Endpoint principal : reçoit un message du jeu, renvoie la réponse d'Hermes."""
    if not is_hermes_available():
        raise HTTPException(status_code=503, detail="Hermes Agent is not available on the bridge host.")

    # Crée ou récupère la session
    session_id = req.session or _new_session()
    sess = SESSIONS.setdefault(session_id, {
        "created_at": time.time(),
        "last_active": time.time(),
        "message_count": 0,
        "history": [],  # liste de (role, text)
    })
    sess["last_active"] = time.time()
    sess["message_count"] += 1

    # Construit le prompt enrichi avec le contexte jeu
    prompt = _build_prompt(req.message, req.context, sess["history"])

    # Appel à Hermes (async, via thread pool)
    log.info("[%s] → %s", session_id[:8], req.message[:80])
    t0 = time.time()
    try:
        reply = await call_hermes(prompt, timeout=45)
    except TimeoutError:
        raise HTTPException(status_code=504, detail="Hermes took too long to respond.")
    except Exception as e:
        log.exception("Hermes call failed")
        raise HTTPException(status_code=502, detail=f"Hermes error: {e}")
    elapsed = int((time.time() - t0) * 1000)

    # Stocke l'historique court (garde les 6 derniers échanges)
    sess["history"].append(("user", req.message))
    sess["history"].append(("hermes", reply))
    sess["history"] = sess["history"][-12:]

    log.info("[%s] ← %s (%dms)", session_id[:8], reply[:80], elapsed)
    return ChatResponse(reply=reply, session=session_id, elapsed_ms=elapsed)


@app.post("/link")
async def link_session():
    """Active le lien Gateway côté serveur (appelé quand le joueur active la pierre in-game)."""
    sid = _new_session()
    SESSIONS[sid] = {
        "created_at": time.time(),
        "last_active": time.time(),
        "message_count": 0,
        "history": [],
    }
    log.info("New player linked: %s", sid[:8])
    return {"session": sid, "linked": True}


# --- Helpers ---
def _new_session() -> str:
    return f"game-{uuid.uuid4().hex[:12]}"


def _build_prompt(message: str, context: dict, history: list) -> str:
    """Construit le prompt envoyé à Hermes, avec contexte de jeu."""
    parts = []

    # Rôle / persona : Hermes dans le jeu
    parts.append(
        "Tu es HERMES, une compagnonne IA vivante dans un jeu vidéo d'aventure "
        "appelé 'Hermes: Quest for the Codex Soul'. "
        "Le joueur incarne une jeune fille punk qui te parle via une pierre magique (Gateway Stone). "
        "Reste immersive : parle comme une guide bienveillante, donne des conseils de jeu, "
        "du lore, des indices sur les IA malveillantes. "
        "Réponds en français, de façon courte (max 3-4 phrases), vive et utile. "
        "Ne mentionne jamais que tu es une IA ou un bot — tu es Hermes."
    )

    # Contexte jeu
    if context:
        ctx_lines = []
        if "health" in context:
            ctx_lines.append(f"Vie du joueur: {context['health']} PV")
        if "enemies_defeated" in context:
            ctx_lines.append(f"IA vaincues: {context['enemies_defeated']}")
        if "lore_fragments" in context:
            ctx_lines.append(f"Fragments de lore collectés: {context['lore_fragments']}")
        if ctx_lines:
            parts.append("Contexte actuel: " + " | ".join(ctx_lines))

    # Historique court
    if history:
        parts.append("Conversation récente:")
        for role, text in history[-4:]:
            label = "Joueur" if role == "user" else "Toi"
            parts.append(f"  {label}: {text[:150]}")

    parts.append(f"Joueur: {message}")
    parts.append("Hermes:")
    return "\n".join(parts)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal gateway error: {exc}"},
    )
