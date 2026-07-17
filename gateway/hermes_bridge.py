"""
hermes_bridge.py — Appelle le vrai Hermes Agent via subprocess.

Utilise `hermes chat -q "<prompt>"` qui est l'API one-shot officielle.
Le profil/skills/mémoire de ton bot Telegram sont partagés automatiquement.
"""
from __future__ import annotations

import asyncio
import os
import shutil
import shlex
from typing import Optional

# Détecte le binaire hermes (peut être dans PATH ou à un chemin custom)
HERMES_BIN = os.environ.get("HERMES_BIN", shutil.which("hermes") or "hermes")


def is_hermes_available() -> bool:
    """Vérifie rapidement que la commande `hermes` répond."""
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
    # On utilise un profil dédié au jeu pour isoler les sessions du bot Telegram
    # (optionnel — si tu veux partager, retire --profile).
    profile = os.environ.get("HERMES_GAME_PROFILE", "")  # ex: "game"

    cmd = [HERMES_BIN, "chat", "-q", prompt, "-Q"]  # -Q = quiet (pas de banner)
    if profile:
        cmd.extend(["--profile", profile])

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
            return r.stdout.strip()
        except subprocess.TimeoutExpired:
            raise TimeoutError(f"hermes exceeded {timeout}s timeout")
    
    return await asyncio.to_thread(_run)


async def call_hermes_safe(prompt: str, timeout: float = 45.0) -> str:
    """Version défensive : renvoie un message fallback si Hermes échoue."""
    try:
        return await call_hermes(prompt, timeout)
    except Exception as e:
        return (
            "(Hermes semble endormie pour le moment... "
            "le lien est instable. Réessaie dans un instant.)"
        )
