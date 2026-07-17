"""Transport isolé vers Hermes Agent.

Deux modes sont supportés :
- local : CLI Hermes en ``--safe-mode`` pour le développement ;
- distant : endpoint HTTP privé, requis sur Vercel où le binaire n'existe pas.

Le compagnon public ne doit jamais partager le profil outillé du bot développeur.
"""
from __future__ import annotations

import asyncio
import os
import shutil

import httpx

# Détecte le binaire hermes (peut être dans PATH ou à un chemin custom)
HERMES_BIN = os.environ.get("HERMES_BIN", shutil.which("hermes") or "hermes")
HERMES_UPSTREAM_URL = os.environ.get("HERMES_UPSTREAM_URL", "").rstrip("/")
HERMES_UPSTREAM_TOKEN = os.environ.get("HERMES_UPSTREAM_TOKEN", "")


def is_hermes_available() -> bool:
    """Vérifie rapidement que la commande `hermes` répond."""
    if HERMES_UPSTREAM_URL:
        return True
    if not shutil.which(HERMES_BIN) and not os.path.exists(HERMES_BIN):
        return False
    try:
        import subprocess
        r = subprocess.run(
            [HERMES_BIN, "--version"],
            capture_output=True, text=True, timeout=5,
        )
        return r.returncode == 0
    except Exception:
        return False


async def call_hermes(prompt: str, timeout: float = 45.0) -> str:
    """
    Appelle Hermes Agent en mode one-shot et renvoie le texte de réponse.
    Lance dans un thread pool pour ne pas bloquer la boucle async.
    """
    if HERMES_UPSTREAM_URL:
        headers = {"Content-Type": "application/json"}
        if HERMES_UPSTREAM_TOKEN:
            headers["Authorization"] = f"Bearer {HERMES_UPSTREAM_TOKEN}"
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                HERMES_UPSTREAM_URL,
                headers=headers,
                json={"prompt": prompt, "source": "hermes-quest"},
            )
            response.raise_for_status()
            payload = response.json()
            reply = payload.get("reply") or payload.get("response")
            if not isinstance(reply, str) or not reply.strip():
                raise RuntimeError("Hermes upstream returned no reply")
            return reply.strip()

    # Le mode jeu doit rester sans mémoire, plugins ni MCP du bot développeur.
    # max-turns=1 limite aussi les dégâts si un modèle tente malgré tout un outil.
    cmd = [
        HERMES_BIN, "chat", "-q", prompt, "-Q",
        "--safe-mode", "--max-turns", "1", "--source", "tool",
    ]

    def _run():
        import subprocess
        try:
            r = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                env={**os.environ},
            )
            if r.returncode != 0:
                err = r.stderr.strip()[:500]
                raise RuntimeError(f"hermes exited {r.returncode}: {err}")
            reply = r.stdout.strip()
            if not reply:
                raise RuntimeError("hermes returned an empty response")
            return reply
        except subprocess.TimeoutExpired:
            raise TimeoutError(f"hermes exceeded {timeout}s timeout")
    
    return await asyncio.to_thread(_run)
