## Forest.gd
## Zone jouable principale. Génère une forêt procédurale, spawn Hermes,
## les ennemis, et gère les layers de profondeur (y-sort).
extends Node2D

const WORLD_W: int = 80
const WORLD_H: int = 80
const TILE_SIZE: int = 16
const SCALE: int = 3              # zoom caméra (style pixel-art)
const PLAYER_SPAWN: Vector2 = Vector2(WORLD_W * TILE_SIZE / 2.0, WORLD_H * TILE_SIZE / 2.0)

# Types de tuiles (doit correspondre au tileset généré)
enum T {
	GRASS_A = 0, GRASS_B = 1, PATH = 2, TREE = 3,
	FLOWER_R = 4, FLOWER_Y = 5, FLOWER_W = 6,
	WATER_A = 7, WATER_B = 8, STONE = 9, BUSH = 10,
}

@onready var tilemap: TileMap = $TileMap
@onready var y_sort_root: Node2D = $YSortRoot
@onready var player: CharacterBody2D = $YSortRoot/Player
@onready var enemies_container: Node2D = $YSortRoot/Enemies
@onready var items_container: Node2D = $YSortRoot/Items
@onready var mushrooms_container: Node2D = $YSortRoot/Mushrooms

var map_data: Array = []

func _ready() -> void:
	_generate_map()
	_build_tilemap()
	_spawn_enemies()
	_spawn_mushrooms()
	_setup_camera()
	# Donne le Codex Soul dès le début pour le MVP
	Globals.has_codex_soul = true

# --- Génération procédurale ---
func _generate_map() -> void:
	# Seed fixe pour reproductibilité (changera par release)
	seed(1337)
	map_data.clear()
	var rng := RandomNumberGenerator.new()
	rng.seed = 1337
	for y in range(WORLD_H):
		var row := []
		for x in range(WORLD_W):
			# Bordure = arbres (mur naturel)
			if x == 0 or y == 0 or x == WORLD_W - 1 or y == WORLD_H - 1:
				row.append(T.TREE)
				continue
			var r := rng.randf()
			var dist_from_center := Vector2(x - WORLD_W / 2.0, y - WORLD_H / 2.0).length()
			if r < 0.08:
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
			elif r < 0.21 and dist_from_center > 12:
				row.append(T.WATER_A)
			elif dist_from_center < 6:
				row.append(T.PATH)
			elif r < 0.55:
				row.append(T.GRASS_A)
			else:
				row.append(T.GRASS_B)
		map_data.append(row)
	# Creuse 4 chemins depuis le centre
	var cx := int(WORLD_W / 2)
	var cy := int(WORLD_H / 2)
	for i in range(1, 25):
		for pos in [[cx + i, cy], [cx - i, cy], [cx, cy + i], [cx, cy - i]]:
			var px := pos[0] as int
			var py := pos[1] as int
			if map_data[py] and map_data[py][px] == T.TREE:
				map_data[py][px] = T.PATH

# --- Construction de la tilemap ---
func _build_tilemap() -> void:
	# Tile source = 0 (notre seul tileset)
	for y in range(WORLD_H):
		for x in range(WORLD_W):
			var t: int = map_data[y][x]
			tilemap.set_cell(0, Vector2i(x, y), 0, Vector2i(t % 4, t / 4))
	# Tuiles collision
	var collision_tiles := [T.TREE, T.WATER_A, T.WATER_B, T.STONE, T.BUSH]
	for t in collision_tiles:
		tilemap.set_layer_ysort_enabled(0, true)
	# Bounds monde
	var world_size := Vector2(WORLD_W * TILE_SIZE, WORLD_H * TILE_SIZE)
	$PlayerBarrier/CollisionShape.shape.size = world_size
	$PlayerBarrier/CollisionShape.position = world_size / 2.0

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
			# Loin du spawn joueur
			var dist := Vector2(x * TILE_SIZE, y * TILE_SIZE).distance_to(PLAYER_SPAWN)
			if dist > 150:
				var e: CharacterBody2D = enemy_scene.instantiate()
				e.position = Vector2(x * TILE_SIZE + 8, y * TILE_SIZE + 8)
				enemies_container.add_child(e)
				placed += 1

# --- Champignons lumineux (lore fragments collectibles) ---
func _spawn_mushrooms() -> void:
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
			m.texture = preload("res://assets/sprites/items/mushroom.png")
			m.position = Vector2(x * TILE_SIZE + 8, y * TILE_SIZE + 8)
			m.modulate = Color(0.83, 1.0, 0.54)  # vert lime
			mushrooms_container.add_child(m)
			# Glow tween
			var tw := create_tween().set_loops()
			tw.tween_property(m, "modulate:a", 0.3, 1.2)
			tw.tween_property(m, "modulate:a", 1.0, 1.2)
			placed += 1

# --- Caméra ---
func _setup_camera() -> void:
	player.global_position = PLAYER_SPAWN

func get_player() -> CharacterBody2D:
	return player
