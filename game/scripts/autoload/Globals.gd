## Globals.gd
## Singleton autoload accessible depuis toutes les scènes.
## Gère l'état global du jeu + config de la Gateway.
extends Node

# --- État du joueur (persistant entre scènes) ---
var player_health: int = 6         # coeurs (3 coeurs x 2 moitiés)
var player_max_health: int = 6
var has_codex_soul: bool = false    # obtenu après le tutoriel
var enemies_defeated: int = 0
var lore_fragments: int = 0

# --- Gateway (pont vers Hermes Agent) ---
const GATEWAY_URL: String = "http://localhost:8000"
const GATEWAY_TIMEOUT: float = 30.0
var gateway_enabled: bool = true
var gateway_linked: bool = false    # vrai si le joueur a "activé le Lien"
var player_handle: String = ""      # identifiant de session côté pont

signal health_changed(new_health: int, max_health: int)
signal enemy_defeated
signal lore_fragment_collected
signal gateway_status_changed(linked: bool)

func take_damage(amount: int = 1) -> void:
	player_health = max(0, player_health - amount)
	health_changed.emit(player_health, player_max_health)

func heal(amount: int = 1) -> void:
	player_health = min(player_max_health, player_health + amount)
	health_changed.emit(player_health, player_max_health)

func register_enemy_defeat() -> void:
	enemies_defeated += 1
	enemy_defeated.emit()

func set_gateway_linked(v: bool) -> void:
	gateway_linked = v
	gateway_status_changed.emit(v)
