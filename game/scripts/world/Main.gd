## Main.tscn — Point d'entrée du jeu.
## Charge la scène Forest + instancie le HUD par-dessus.
extends Node2D

@onready var forest = $Forest
@onready var hud: HermesHUD = $HUD

func _ready() -> void:
	# Wire les signaux globaux vers le HUD
	Globals.health_changed.connect(_on_health_changed)
	Globals.gateway_status_changed.connect(_on_gateway_status_changed)
	
	# État initial
	hud.set_health(Globals.player_health, Globals.player_max_health)
	hud.set_gateway_status(Globals.gateway_linked)
	
	# Focus clavier
	get_viewport().gui_get_focus_owner()

func _on_health_changed(hp: int, max_hp: int) -> void:
	hud.set_health(hp, max_hp)

func _on_gateway_status_changed(linked: bool) -> void:
	hud.set_gateway_status(linked)

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("toggle_gateway"):
		hud.toggle_gateway_panel()
