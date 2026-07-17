## Globals.gd
## Singleton autoload accessible depuis toutes les scènes.
## Gère l'état global du jeu + config de la Gateway.
extends Node

enum QuestStage {
	ARRIVAL,
	MEET_KAEL,
	PURGE_GLITCHES,
	ACTIVATE_GATEWAY,
	COMPLETE,
}

# --- État du joueur (persistant entre scènes) ---
var player_health: int = 6         # coeurs (3 coeurs x 2 moitiés)
var player_max_health: int = 6
var has_codex_soul: bool = false    # obtenu après le tutoriel
var enemies_defeated: int = 0
var lore_fragments: int = 0
var quest_stage: QuestStage = QuestStage.ARRIVAL
var input_locked: bool = false

const QUEST_TARGET_GLITCHES: int = 3

# --- Gateway (pont vers Hermes Agent) ---
const GATEWAY_TIMEOUT: float = 30.0
var gateway_url: String = "http://127.0.0.1:8000"
var gateway_api_key: String = ""
var gateway_enabled: bool = true
var gateway_linked: bool = false    # vrai si le joueur a "activé le Lien"
var player_handle: String = ""      # identifiant de session côté pont

signal health_changed(new_health: int, max_health: int)
signal enemy_defeated
signal lore_fragment_collected
signal gateway_status_changed(linked: bool)
signal gateway_link_requested
signal quest_changed(stage: QuestStage, objective: String)
signal dialogue_requested(speaker: String, text: String)
signal interaction_hint_changed(text: String)
signal player_died

func _ready() -> void:
	var configured_url := OS.get_environment("HERMES_GATEWAY_URL").strip_edges()
	if configured_url != "":
		gateway_url = configured_url.trim_suffix("/")
	gateway_api_key = OS.get_environment("HERMES_GATEWAY_KEY").strip_edges()

func reset_run() -> void:
	player_health = player_max_health
	has_codex_soul = false
	enemies_defeated = 0
	lore_fragments = 0
	quest_stage = QuestStage.ARRIVAL
	input_locked = false
	gateway_linked = false
	player_handle = ""

func take_damage(amount: int = 1) -> void:
	player_health = max(0, player_health - amount)
	health_changed.emit(player_health, player_max_health)
	if player_health == 0:
		player_died.emit()

func heal(amount: int = 1) -> void:
	player_health = min(player_max_health, player_health + amount)
	health_changed.emit(player_health, player_max_health)

func register_enemy_defeat() -> void:
	enemies_defeated += 1
	enemy_defeated.emit()
	if quest_stage == QuestStage.PURGE_GLITCHES and enemies_defeated >= QUEST_TARGET_GLITCHES:
		set_quest_stage(QuestStage.ACTIVATE_GATEWAY)

func collect_lore_fragment() -> void:
	lore_fragments += 1
	lore_fragment_collected.emit()

func set_gateway_linked(v: bool) -> void:
	gateway_linked = v
	gateway_status_changed.emit(v)
	if v and quest_stage == QuestStage.ACTIVATE_GATEWAY:
		set_quest_stage(QuestStage.COMPLETE)

func set_gateway_session(session_id: String) -> void:
	player_handle = session_id
	set_gateway_linked(session_id != "")

func set_quest_stage(stage: QuestStage) -> void:
	quest_stage = stage
	quest_changed.emit(stage, get_objective())

func get_objective() -> String:
	match quest_stage:
		QuestStage.ARRIVAL:
			return "Écoute la fréquence qui traverse Écho-Verdant."
		QuestStage.MEET_KAEL:
			return "Trouve Maître Kael près du feu central."
		QuestStage.PURGE_GLITCHES:
			return "Purifie les Glitchs : %d/%d" % [min(enemies_defeated, QUEST_TARGET_GLITCHES), QUEST_TARGET_GLITCHES]
		QuestStage.ACTIVATE_GATEWAY:
			return "Active la Pierre Gateway à l'est du village."
		QuestStage.COMPLETE:
			return "Lien établi — parle à Écho avec [T]."
	return ""
