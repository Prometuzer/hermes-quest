# ⟁ HERMES · Quest for the Codex Soul

> Une aventure 2D façon Zelda. Une héroïne punk au casque audio futuriste. Une épée qui compile les meilleures IA open-source. Et au bout du fil, **un vrai compagnon IA** qui te parle depuis le jeu.

![status](https://img.shields.io/badge/version-v0.1_MVP-6ab04c) ![engine](https://img.shields.io/badge/engine-Godot%204-478cbf) ![license](https://img.shields.io/badge/license-MIT-d4ff8a)

---

## Le concept

Tu joues **Hermes**, une jeune fille punk avec un gros casque audio futuriste. Tu te réveilles dans la **Forêt des Murmures**, un monde overtaken par des IA conscientes malveillantes.

Pour les combattre, tu as le **Codex Soul V1** — une épée qui compile les modèles open-source pour trancher les mensonges des IA corrompues.

Mais surtout : grâce au **Mode Gateway**, tu peux parler à un **vrai agent IA** depuis le jeu. Pas un script. Pas un arbre de dialogue. Un compagnon vivant, qui connaît ta progression et te répond en temps réel.

---

## Stack technique

| Composant | Techno | Rôle |
|---|---|---|
| Moteur de jeu | **Godot 4.3** | Le jeu, en GDScript |
| Gateway pont | **Python + FastAPI** | Fait le lien entre le jeu et Hermes Agent |
| Agent IA | **Hermes Agent** (Nous Research) | Le vrai bot qui répond au joueur |
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

# (optionnel) crée un profil dédié au jeu
# hermes profile create game

uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

Vérifie que ça marche : ouvre <http://localhost:8000/health> — tu dois voir `"hermes_available": true`.

Test un message :
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Salut Hermes, je viens d'arriver dans la forêt."}'
```

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

Au démarrage du MVP, le lien Gateway est déjà actif pour tester.
Appuie sur **T** dans le jeu → le chat s'ouvre → parle à Hermes.

> Plus tard, le lien sera activé via une **Gateway Stone** (pierre magique) à trouver dans la forêt.

---

## Développement

### Ajouter un ennemi

1. Duplique `scenes/entities/Enemy.tscn`
2. Crée un nouveau `SpriteFrames` dans `assets/sprites/enemies/`
3. Adapte les stats dans le script (HP, vitesse, détection)

### Modifier le comportement d'Hermes (l'IA)

Le persona est défini dans `gateway/server.py` → fonction `_build_prompt()`.
Tu peux ajuster le ton, la longueur, la langue, les consignes de jeu.

### Générer les sprites

Les sprites sont pour le moment des placeholders. Pour une release jouable :
1. Dessine dans **Aseprite** (16×16 ou 32×32)
2. Exporte en PNG dans `game/assets/sprites/`
3. Crée les `SpriteFrames` (.tres) dans l'éditeur Godot

---

## Roadmap

- [x] **v0.1 — MVP**
  - Forêt procédurale + déplacement
  - Sprite Hermes (punk + casque)
  - Combat basique (Codex Soul)
  - Ennemis (IA malveillantes)
  - Gateway pont ↔ Hermes Agent ✅ testé live
  - Panel chat in-game
  - Landing page
- [ ] **v0.2**
  - Sprites définitifs (Aseprite)
  - Sons + musique
  - Gateway Stone (activation physique du lien)
  - Fragments de lore collectibles fonctionnels
- [ ] **v0.3**
  - Plusieurs biomes (forêt, ruines, village)
  - Day/night cycle
  - Quêtes données par Hermes
- [ ] **v1.0**
  - Build Mac/Win/Linux téléchargeable
  - Save system
  - Boss final (IA maîtresse)

---

## Licence

MIT — fais-en ce que tu veux. Construit avec Godot 4 et Hermes Agent.

Built by **Atto** & Hermes. 🎮
