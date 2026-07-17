## Forest.gd
## Zone jouable principale. Génère une forêt procédurale + TileSet en code.
extends Node2D

const WORLD_W: int = 80
const WORLD_H: int = 80
const TILE_SIZE: int = 16
const PLAYER_SPAWN: Vector2 = Vector2(WORLD_W * TILE_SIZE / 2.0, WORLD_H * TILE_SIZE / 2.0)
const KAEL_POSITION: Vector2 = PLAYER_SPAWN + Vector2(72, -48)
const GATEWAY_STONE_POSITION: Vector2 = PLAYER_SPAWN + Vector2(220, 0)
const INTERACTION_RANGE: float = 38.0

enum T {
	GRASS_A = 0, GRASS_B = 1, PATH = 2, TREE = 3,
	FLOWER_R = 4, FLOWER_Y = 5, FLOWER_W = 6,
	WATER_A = 7, WATER_B = 8, STONE = 9, BUSH = 10,
}

@onready var tilemap: TileMap = $TileMap
@onready var y_sort_root: Node2D = $YSortRoot
@onready var player: CharacterBody2D = $YSortRoot/Player
@onready var kael: StaticBody2D = $YSortRoot/Kael
@onready var gateway_stone: StaticBody2D = $YSortRoot/GatewayStone
@onready var enemies_container: Node2D = $YSortRoot/Enemies
@onready var mushrooms_container: Node2D = $YSortRoot/Mushrooms

var map_data: Array = []
var _nearby_interaction: StringName = &""

func _ready() -> void:
	_build_tileset()
	_generate_map()
	_build_tilemap()
	_spawn_enemies()
	_spawn_mushrooms()
	player.global_position = PLAYER_SPAWN
	kael.global_position = KAEL_POSITION
	gateway_stone.global_position = GATEWAY_STONE_POSITION
	call_deferred("_start_intro")

func _process(_delta: float) -> void:
	if Globals.input_locked:
		_set_nearby_interaction(&"")
		return
	var kael_distance := player.global_position.distance_to(kael.global_position)
	var stone_distance := player.global_position.distance_to(gateway_stone.global_position)
	if kael_distance <= INTERACTION_RANGE and kael_distance <= stone_distance:
		_set_nearby_interaction(&"kael")
	elif stone_distance <= INTERACTION_RANGE:
		_set_nearby_interaction(&"gateway")
	else:
		_set_nearby_interaction(&"")

func _unhandled_input(event: InputEvent) -> void:
	if Globals.input_locked or not event.is_action_pressed("interact"):
		return
	match _nearby_interaction:
		&"kael":
			_interact_with_kael()
		&"gateway":
			_interact_with_gateway()

func _start_intro() -> void:
	Globals.set_quest_stage(Globals.QuestStage.MEET_KAEL)
	Globals.dialogue_requested.emit("Fréquence inconnue", "...Hermes ? Si tu m'entends, trouve le vieux Kael. Le village n'est plus seul.")

func _set_nearby_interaction(kind: StringName) -> void:
	if _nearby_interaction == kind:
		return
	_nearby_interaction = kind
	match kind:
		&"kael":
			Globals.interaction_hint_changed.emit("[E] Parler à Maître Kael")
		&"gateway":
			Globals.interaction_hint_changed.emit("[E] Toucher la Pierre Gateway")
		_:
			Globals.interaction_hint_changed.emit("")

func _interact_with_kael() -> void:
	match Globals.quest_stage:
		Globals.QuestStage.MEET_KAEL, Globals.QuestStage.ARRIVAL:
			Globals.has_codex_soul = true
			Globals.set_quest_stage(Globals.QuestStage.PURGE_GLITCHES)
			Globals.dialogue_requested.emit("Maître Kael", "Enfin ! J'allais finir ma sieste. Prends le Codex Soul et purifie trois Glitchs — ensuite la pierre acceptera ta fréquence.")
		Globals.QuestStage.PURGE_GLITCHES:
			Globals.dialogue_requested.emit("Maître Kael", "Le Codex ne coupe pas du métal, petite. Il coupe les mensonges. Trois Glitchs, pas deux et demi.")
		Globals.QuestStage.ACTIVATE_GATEWAY:
			Globals.dialogue_requested.emit("Maître Kael", "La pierre à l'est pulse déjà. Pose la main dessus... et évite de promettre ton âme au premier signal venu.")
		Globals.QuestStage.COMPLETE:
			Globals.dialogue_requested.emit("Maître Kael", "Le lien tient. Maintenant demande à Écho pourquoi elle connaît ton vrai nom — moi, je retourne travailler très fort les yeux fermés.")

func _interact_with_gateway() -> void:
	if Globals.quest_stage < Globals.QuestStage.ACTIVATE_GATEWAY:
		Globals.dialogue_requested.emit("Pierre Gateway", "La rune reste froide. Une fréquence manque encore au Codex.")
	elif Globals.gateway_linked:
		Globals.dialogue_requested.emit("Écho", "Le lien est ouvert. Appuie sur [T] quand tu veux m'entendre.")
	else:
		Globals.dialogue_requested.emit("Pierre Gateway", "Synchronisation de l'âme numérique...")
		Globals.gateway_link_requested.emit()

# --- Construction du TileSet en code ---
# Le spritesheet forest-tiles.png fait 64×48 (4 cols × 3 rows de tuiles 16×16).
func _build_tileset() -> void:
	var tex := load("res://assets/sprites/tiles/forest-tiles.png") as Texture2D
	if tex == null:
		push_error("[Forest] forest-tiles.png introuvable")
		return
	
	var ts := TileSet.new()
	ts.tile_size = Vector2i(TILE_SIZE, TILE_SIZE)
	ts.add_physics_layer()
	ts.set_physics_layer_collision_layer(0, 4)
	# Une seule source atlas (source_id = 0)
	var src := TileSetAtlasSource.new()
	src.texture = tex
	src.texture_region_size = Vector2i(TILE_SIZE, TILE_SIZE)
	# Crée 12 tiles (atlas coords 0..3 × 0..2)
	for tile_id in range(12):
		var ax := tile_id % 4
		var ay := tile_id / 4
		src.create_tile(Vector2i(ax, ay))
	ts.add_source(src)  # source_id = 0
	tilemap.tile_set = ts

# --- Génération procédurale ---
func _generate_map() -> void:
	seed(1337)
	var rng := RandomNumberGenerator.new()
	rng.seed = 1337
	map_data.clear()
	for y in range(WORLD_H):
		var row := []
		for x in range(WORLD_W):
			if x == 0 or y == 0 or x == WORLD_W - 1 or y == WORLD_H - 1:
				row.append(T.TREE)
				continue
			var dist := Vector2(x - WORLD_W / 2.0, y - WORLD_H / 2.0).length()
			var r := rng.randf()
			if dist < 7:
				row.append(T.PATH)
			elif r < 0.08:
				row.append(T.TREE)
			elif r < 0.11:
				row.append(T.BUSH)
			elif r < 0.13:
				row.append(T.STONE)
			elif r < 0.15:
				row.append(T.FLOWER_R)
			elif r < 0.17:
				row.append(T.FLOWER_Y)
			elif r < 0.19:
				row.append(T.FLOWER_W)
			elif r < 0.21 and dist > 12:
				row.append(T.WATER_A)
			elif dist < 6:
				row.append(T.PATH)
			elif r < 0.55:
				row.append(T.GRASS_A)
			else:
				row.append(T.GRASS_B)
		map_data.append(row)
	# Place centrale d'Écho-Verdant et quatre chemins lisibles.
	var cx := int(WORLD_W / 2)
	var cy := int(WORLD_H / 2)
	for y in range(cy - 6, cy + 7):
		for x in range(cx - 9, cx + 10):
			map_data[y][x] = T.PATH if abs(x - cx) <= 1 or abs(y - cy) <= 1 else T.GRASS_A
	for i in range(1, 28):
		for pos in [[cx + i, cy], [cx - i, cy], [cx, cy + i], [cx, cy - i]]:
			var px: int = pos[0]
			var py: int = pos[1]
			map_data[py][px] = T.PATH

# --- Pose des tuiles ---
func _build_tilemap() -> void:
	tilemap.clear()
	for y in range(WORLD_H):
		for x in range(WORLD_W):
			var t: int = map_data[y][x]
			# TileSetAtlasSource : atlas coords = (id % 4, id / 4)
			tilemap.set_cell(0, Vector2i(x, y), 0, Vector2i(t % 4, t / 4))
	# Collisions sur tree, water, stone, bush
	_set_tile_collision(T.TREE)
	_set_tile_collision(T.WATER_A)
	_set_tile_collision(T.WATER_B)
	_set_tile_collision(T.STONE)
	_set_tile_collision(T.BUSH)
	tilemap.set_layer_y_sort_enabled(0, true)

func _set_tile_collision(tile_id: int) -> void:
	var ts := tilemap.tile_set
	var src := ts.get_source(0) as TileSetAtlasSource
	var atlas := Vector2i(tile_id % 4, tile_id / 4)
	# Récupère ou crée la data de collision
	var data: TileData = src.get_tile_data(atlas, 0)
	if data == null:
		# create_tile_data n'existe pas en une étape ; on utilise add_collision
		# La méthode standard : create_tile crée déjà la data vide
		data = src.get_tile_data(atlas, 0)
	if data:
		# Collision polygon simplifié : un rectangle = tuile entière
		data.add_collision_polygon(0)  # layer 0 (physics)
		var pts := PackedVector2Array([
			Vector2(-TILE_SIZE / 2.0, -TILE_SIZE / 2.0),
			Vector2(TILE_SIZE / 2.0, -TILE_SIZE / 2.0),
			Vector2(TILE_SIZE / 2.0, TILE_SIZE / 2.0),
			Vector2(-TILE_SIZE / 2.0, TILE_SIZE / 2.0),
		])
		var n: int = data.get_collision_polygons_count(0) - 1
		data.set_collision_polygon_points(0, n, pts)

# --- Spawn ennemis ---
func _spawn_enemies() -> void:
	var enemy_scene: PackedScene = preload("res://scenes/entities/Enemy.tscn")
	var rng := RandomNumberGenerator.new()
	rng.seed = 999
	var placed := 0
	var attempts := 0
	while placed < 6 and attempts < 200:
		attempts += 1
		var x := rng.randi_range(4, WORLD_W - 5)
		var y := rng.randi_range(4, WORLD_H - 5)
		if map_data[y][x] == T.GRASS_A or map_data[y][x] == T.GRASS_B:
			var dist := Vector2(x * TILE_SIZE, y * TILE_SIZE).distance_to(PLAYER_SPAWN)
			if dist > 150:
				var e: CharacterBody2D = enemy_scene.instantiate()
				e.position = Vector2(x * TILE_SIZE + 8, y * TILE_SIZE + 8)
				enemies_container.add_child(e)
				placed += 1

# --- Champignons ---
func _spawn_mushrooms() -> void:
	var tex := load("res://assets/sprites/items/mushroom.png")
	var rng := RandomNumberGenerator.new()
	rng.seed = 4242
	var placed := 0
	var attempts := 0
	while placed < 12 and attempts < 300:
		attempts += 1
		var x := rng.randi_range(2, WORLD_W - 3)
		var y := rng.randi_range(2, WORLD_H - 3)
		if map_data[y][x] == T.GRASS_A or map_data[y][x] == T.GRASS_B:
			var m := Sprite2D.new()
			m.texture = tex
			m.position = Vector2(x * TILE_SIZE + 8, y * TILE_SIZE + 8)
			m.modulate = Color(0.83, 1.0, 0.54)
			mushrooms_container.add_child(m)
			var tw := create_tween().set_loops()
			tw.tween_property(m, "modulate:a", 0.3, 1.2)
			tw.tween_property(m, "modulate:a", 1.0, 1.2)
			placed += 1

func get_player() -> CharacterBody2D:
	return player
