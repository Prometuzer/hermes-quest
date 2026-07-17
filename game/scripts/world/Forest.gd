## Forest.gd
## Zone jouable principale. Génère une forêt procédurale + TileSet en code.
extends Node2D

const WORLD_W: int = 80
const WORLD_H: int = 80
const TILE_SIZE: int = 16
const PLAYER_SPAWN: Vector2 = Vector2(WORLD_W * TILE_SIZE / 2.0, WORLD_H * TILE_SIZE / 2.0)

enum T {
	GRASS_A = 0, GRASS_B = 1, PATH = 2, TREE = 3,
	FLOWER_R = 4, FLOWER_Y = 5, FLOWER_W = 6,
	WATER_A = 7, WATER_B = 8, STONE = 9, BUSH = 10,
}

@onready var tilemap: TileMap = $TileMap
@onready var y_sort_root: Node2D = $YSortRoot
@onready var player: CharacterBody2D = $YSortRoot/Player
@onready var enemies_container: Node2D = $YSortRoot/Enemies
@onready var mushrooms_container: Node2D = $YSortRoot/Mushrooms

var map_data: Array = []

func _ready() -> void:
	_build_tileset()
	_generate_map()
	_build_tilemap()
	_spawn_enemies()
	_spawn_mushrooms()
	player.global_position = PLAYER_SPAWN
	Globals.has_codex_soul = true

# --- Construction du TileSet en code ---
# Le spritesheet forest-tiles.png fait 64×48 (4 cols × 3 rows de tuiles 16×16).
func _build_tileset() -> void:
	var tex := load("res://assets/sprites/tiles/forest-tiles.png") as Texture2D
	if tex == null:
		push_error("[Forest] forest-tiles.png introuvable")
		return
	
	var ts := TileSet.new()
	ts.tile_size = Vector2i(TILE_SIZE, TILE_SIZE)
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
			var r := rng.randf()
			var dist := Vector2(x - WORLD_W / 2.0, y - WORLD_H / 2.0).length()
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
			elif r < 0.21 and dist > 12:
				row.append(T.WATER_A)
			elif dist < 6:
				row.append(T.PATH)
			elif r < 0.55:
				row.append(T.GRASS_A)
			else:
				row.append(T.GRASS_B)
		map_data.append(row)
	# 4 chemins depuis le centre
	var cx := int(WORLD_W / 2)
	var cy := int(WORLD_H / 2)
	for i in range(1, 25):
		for pos in [[cx + i, cy], [cx - i, cy], [cx, cy + i], [cx, cy - i]]:
			var px: int = pos[0]
			var py: int = pos[1]
			if map_data[py] and map_data[py][px] == T.TREE:
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
	tilemap.set_layer_ysort_enabled(0, true)

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
			Vector2(0, 0),
			Vector2(TILE_SIZE, 0),
			Vector2(TILE_SIZE, TILE_SIZE),
			Vector2(0, TILE_SIZE),
		])
		var n := data.get_collision_polygon_count(0) - 1
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
