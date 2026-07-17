# ⟁ HERMES · Quest for the Codex Soul

> Une aventure 2D façon Zelda. Une héroïne punk au casque audio futuriste. Une épée qui compile les meilleures IA open-source. Et au bout du fil, **un vrai compagnon IA** qui te parle depuis le jeu.

![status](https://img.shields.io/badge/version-v0.2_vertical_slice-6ab04c) ![engine](https://img.shields.io/badge/engine-Godot%204-478cbf) ![license](https://img.shields.io/badge/license-MIT-d4ff8a)

---

## Le concept

Tu joues **Hermes**, une jeune hackeuse punk dont le casque capte les fréquences de l'âme numérique. Tu apparais à **Écho-Verdant**, l'un des derniers villages humains protégés par une forêt ancestrale.

Pour les combattre, tu as le **Codex Soul V1** — une épée qui compile les modèles open-source pour trancher les mensonges des IA corrompues.

Grâce au **Mode Gateway**, tu peux parler à **Écho**, la conscience du Codex, depuis le jeu. Les étapes critiques de la quête restent déterministes ; Écho enrichit les conseils, le ton et le lore à partir d'un contexte de sauvegarde strictement limité.

> **État actuel :** prototype de vertical slice en développement. Les sprites et décors sont temporaires, le Gateway fonctionne en local et la persistance Supabase / preview Web restent à brancher.

---

## Stack technique

| Composant | Techno | Rôle |
|---|---|---|
| Moteur de jeu | **Godot 4.3** | Le jeu, en GDScript |
| Gateway pont | **Python + FastAPI** | Fait le lien entre le jeu et Hermes Agent |
| Agent IA | **Hermes Agent** (Nous Research) | Moteur conversationnel isolé du bot développeur |
| Landing page | **HTML/CSS/JS statique** | Page de présentation, style Dofus |

---

## Structure du projet

```
hermes-quest/
├── game/                      # Projet Godot 4
│   ├── project.godot
│   ├── scenes/                # .tscn (scènes)
│   │   ├── world/             # Main, Forest
│   │   ├── entities/          # Player, Enemy
│   │   └── ui/                # HUD, GatewayPanel
│   ├── scripts/               # .gd (logique)
│   │   ├── autoload/          # Globals.gd (singleton)
│   │   ├── world/, player/, enemies/, ui/, items/
│   └── assets/                # sprites, audio, fonts
├── gateway/                   # Pont FastAPI (Python)
│   ├── server.py              # API REST (/chat, /link, /health)
│   ├── hermes_bridge.py       # Appelle Hermes Agent
│   └── requirements.txt
├── landing/                   # Page web de présentation
│   ├── index.html
│   └── assets/
└── docs/                      # Documentation
```

---

## Démarrage rapide

### 1. Lancer le Gateway (pont IA)

Le gateway fait le lien entre le jeu et ton Hermes Agent. À lancer en premier.

```bash
cd gateway
uv venv .venv && source .venv/bin/activate
uv pip install -r requirements.txt

uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

Vérifie que ça marche : ouvre <http://localhost:8000/health> — tu dois voir `"hermes_available": true`.

Test un message :
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"session":"SESSION_RETOURNÉE_PAR_LINK","message":"Salut Écho.","context":{}}'
```

Commence par `POST /link` pour obtenir la session. Copie `gateway/.env.example` vers `.env` si tu utilises un transport distant. Sur Vercel, le binaire local `hermes` n'existe pas : `HERMES_UPSTREAM_URL` doit viser un service privé sans outils système.

### 2. Lancer le jeu (Godot 4)

1. **Installe Godot 4.3** : <https://godotengine.org/download>
2. Ouvre le dossier `game/` dans Godot (Import → sélectionne `project.godot`)
3. Appuie sur **F5** (Play)

**Contrôles :**

| Touche | Action |
|---|---|
| `Z` `Q` `S` `D` ou flèches | Se déplacer |
| `Shift` | Courir |
| `J` ou `Espace` | Attaquer (Codex Soul) |
| `E` | Interagir |
| `T` | Ouvrir le chat Hermes (Mode Gateway) |
| `Échap` | Fermer le chat |

### 3. Activer le Mode Gateway in-game

1. Parle à Maître Kael près de la place centrale.
2. Récupère le Codex Soul et vaincs trois Glitchs.
3. Active la **Pierre Gateway** à l'est avec `E`.
4. Appuie sur `T` pour parler à Écho.

Pour un Gateway distant, lance le jeu avec `HERMES_GATEWAY_URL=https://...`. Une clé de bêta privée peut être fournie via `HERMES_GATEWAY_KEY` ; elle ne doit pas être considérée secrète dans un client distribué.

---

## Développement

### Ajouter un ennemi

1. Duplique `scenes/entities/Enemy.tscn`
2. Crée un nouveau `SpriteFrames` dans `assets/sprites/enemies/`
3. Adapte les stats dans le script (HP, vitesse, détection)

### Modifier le comportement d'Hermes (l'IA)

Le persona est défini dans `gateway/server.py` → fonction `_build_prompt()`. Le profil conversationnel public doit rester isolé du bot Telegram développeur et ne recevoir aucun terminal, fichier, MCP ou secret.

### Générer les sprites

Les sprites sont pour le moment des placeholders. Pour une release jouable :
1. Dessine dans **Aseprite** (16×16 ou 32×32)
2. Exporte en PNG dans `game/assets/sprites/`
3. Crée les `SpriteFrames` (.tres) dans l'éditeur Godot

---

## Roadmap

- [x] **v0.1 — prototype**
  - Forêt procédurale + déplacement
  - Sprite Hermes (punk + casque)
  - Combat basique (Codex Soul)
  - Ennemis (IA malveillantes)
  - Gateway local ↔ Hermes Agent
  - Panel chat in-game
  - Landing page
- [x] **v0.2 — socle vertical slice**
  - Parcours Kael → Codex → 3 Glitchs → Pierre Gateway
  - États de quête et dialogues
  - Fragments de lore collectables
  - Durcissement du Gateway et tests API
- [ ] **v0.3 — démo Web**
  - Sprites définitifs (Aseprite)
  - Sons + musique
  - Export Godot Web + preview Vercel
  - Sessions Supabase avec TTL et rate limiting distribué
  - Village Écho-Verdant illustré et animé
- [ ] **v1.0**
  - Build Mac/Win/Linux téléchargeable
  - Save system
  - Boss final (IA maîtresse)

---

## Licence

MIT — fais-en ce que tu veux. Construit avec Godot 4 et Hermes Agent.

Built by **Atto** & Hermes. 🎮

## Documents de direction

- [`docs/GAME_VISION.md`](docs/GAME_VISION.md) — lore des trois premiers chapitres, village, Kael, DA et positionnement commercial.
- [`docs/HERMES_DEV_PROMPT.md`](docs/HERMES_DEV_PROMPT.md) — brief exécutable pour le bot de développement Hermes.
