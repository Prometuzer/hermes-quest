## HUD.gd — Heads Up Display.
## Affiche : santé (cœurs), compteur ennemis, statut Gateway, hint touches.
extends CanvasLayer

@onready var hearts_container: HBoxContainer = $Margin/VBox/TopBar/Hearts
@onready var enemies_label: Label = $Margin/VBox/TopBar/EnemiesCount
@onready var gateway_status: Label = $Margin/VBox/TopBar/GatewayStatus
@onready var controls_hint: Label = $Margin/VBox/BottomBar/ControlsHint
@onready var gateway_panel: Control = $GatewayPanel

const HEART_FULL := "♥"
const HEART_HALF := "⌣"
const HEART_EMPTY := "♡"

func _ready() -> void:
	Globals.enemy_defeated.connect(_on_enemy_defeated)
	Globals.gateway_status_changed.connect(set_gateway_status)
	gateway_panel.visible = false
	_update_enemies_count()
	_set_controls_hint()

func set_health(hp: int, max_hp: int) -> void:
	hearts_container.text = ""
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
	hearts_container.text = " ".join(hearts)

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
	enemies_label.text = "IA purged: %d" % Globals.enemies_defeated

func _set_controls_hint() -> void:
	controls_hint.text = "[ZQSD] move   [J/Space] attack   [E] interact   [T] talk to Hermes   [Shift] run"

func toggle_gateway_panel() -> void:
	gateway_panel.visible = not gateway_panel.visible
	if gateway_panel.visible:
		gateway_panel.open()
