## HUD.gd — Heads Up Display.
## Affiche : santé (cœurs), compteur ennemis, statut Gateway, hint touches.
extends CanvasLayer
class_name HermesHUD

@onready var hearts_label: Label = $Margin/VBox/TopBar/Hearts
@onready var enemies_label: Label = $Margin/VBox/TopBar/EnemiesCount
@onready var lore_label: Label = $Margin/VBox/TopBar/LoreCount
@onready var gateway_status: Label = $Margin/VBox/TopBar/GatewayStatus
@onready var quest_label: Label = $Margin/VBox/QuestLabel
@onready var controls_hint: Label = $Margin/VBox/BottomBar/ControlsHint
@onready var interaction_hint: Label = $Margin/VBox/BottomBar/InteractionHint
@onready var dialogue_panel: PanelContainer = $DialoguePanel
@onready var dialogue_speaker: Label = $DialoguePanel/Margin/VBox/Speaker
@onready var dialogue_text: Label = $DialoguePanel/Margin/VBox/Text
@onready var gateway_panel: Control = $GatewayPanel

const HEART_FULL := "♥"
const HEART_HALF := "⌣"
const HEART_EMPTY := "♡"

func _ready() -> void:
	Globals.enemy_defeated.connect(_on_enemy_defeated)
	Globals.lore_fragment_collected.connect(_update_lore_count)
	Globals.gateway_status_changed.connect(set_gateway_status)
	Globals.quest_changed.connect(_on_quest_changed)
	Globals.dialogue_requested.connect(show_dialogue)
	Globals.interaction_hint_changed.connect(set_interaction_hint)
	gateway_panel.visible = false
	dialogue_panel.visible = false
	_update_enemies_count()
	_update_lore_count()
	quest_label.text = Globals.get_objective()
	_set_controls_hint()

func set_health(hp: int, max_hp: int) -> void:
	hearts_label.text = ""
	# Chaque cœur représente 2 PV
	var hearts := []
	for i in range(max_hp / 2):
		var idx := i * 2
		if hp >= idx + 2:
			hearts.append(HEART_FULL)
		elif hp == idx + 1:
			hearts.append(HEART_HALF)
		else:
			hearts.append(HEART_EMPTY)
	hearts_label.text = " ".join(hearts)

func set_gateway_status(linked: bool) -> void:
	if linked:
		gateway_status.text = "● LINK ACTIVE"
		gateway_status.add_theme_color_override("font_color", Color(0.83, 1.0, 0.54))
	else:
		gateway_status.text = "○ LINK INACTIVE"
		gateway_status.add_theme_color_override("font_color", Color(0.5, 0.5, 0.5))

func _on_enemy_defeated() -> void:
	_update_enemies_count()

func _update_enemies_count() -> void:
	enemies_label.text = "Glitchs: %d" % Globals.enemies_defeated
	quest_label.text = Globals.get_objective()

func _update_lore_count() -> void:
	lore_label.text = "Fragments: %d" % Globals.lore_fragments

func _on_quest_changed(_stage: int, objective: String) -> void:
	quest_label.text = objective

func set_interaction_hint(text: String) -> void:
	interaction_hint.text = text
	interaction_hint.visible = text != ""

func show_dialogue(speaker: String, text: String) -> void:
	dialogue_speaker.text = speaker
	dialogue_text.text = text
	dialogue_panel.visible = true
	var token := Time.get_ticks_msec()
	dialogue_panel.set_meta("message_token", token)
	await get_tree().create_timer(4.8).timeout
	if dialogue_panel.get_meta("message_token", 0) == token:
		dialogue_panel.visible = false

func _set_controls_hint() -> void:
	controls_hint.text = "[ZQSD] move   [J/Space] attack   [E] interact   [T] talk to Hermes   [Shift] run"

func toggle_gateway_panel() -> void:
	gateway_panel.visible = not gateway_panel.visible
	Globals.input_locked = gateway_panel.visible
	if gateway_panel.visible:
		gateway_panel.open()
	else:
		gateway_panel.close()
