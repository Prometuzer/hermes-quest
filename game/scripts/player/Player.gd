## Player.gd — Hermes, l'héroïne punk au casque audio.
## Gère : déplacement ZQSD, animations, attaque Codex Soul, vie, i-frames.
##
## Les animations sont construites en code à partir du spritesheet hermes.png
## (grille 4 colonnes × 6 lignes, frames 32×32 = 64×64 après upscale Pillow).
extends CharacterBody2D

const SPEED_WALK: float = 80.0
const SPEED_RUN: float = 140.0
const I_FRAMES_DURATION: float = 1.0   # invincibilité après coup

# Dimensions du spritesheet (cf. tools/generate_hermes_sprite.py)
const FRAME_SIZE: int = 64       # 32px × 2 (upscale Pillow)
const SHEET_COLS: int = 4
const SHEET_ROWS: int = 6
# Mapping ligne → direction
#   0 = down, 1 = up, 2 = right, 3 = left, 4 = hurt, 5 = death
# Mapping colonne → frame d'animation
#   0 = idle, 1 = walk-A, 2 = walk-B, 3 = attack

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var attack_area: Area2D = $AttackArea
@onready var attack_shape: CollisionShape2D = $AttackArea/CollisionShape2D
@onready var cam: Camera2D = $Camera2D

var facing: StringName = &"down"
var is_attacking: bool = false
var attack_cooldown: float = 0.0
var invincible: bool = false
var invincible_timer: float = 0.0
var _frames_built: bool = false

func _ready() -> void:
	add_to_group("player")
	attack_shape.disabled = true
	cam.make_current()
	_build_sprite_frames()
	sprite.play("idle_down")
	Globals.player_died.connect(_on_player_died)
	# Centre le sprite sur le corps
	sprite.offset = Vector2(0, -FRAME_SIZE / 2.0 + 8)

func _build_sprite_frames() -> void:
	if _frames_built:
		return
	var tex := load("res://assets/sprites/hermes/hermes.png") as Texture2D
	if tex == null:
		push_error("[Player] hermes.png introuvable")
		return
	var sf := SpriteFrames.new()
	sf.remove_animation("default")
	
	var h_frames := SHEET_COLS
	var v_frames := SHEET_ROWS
	
	# Pour chaque direction, on crée 3 anims : idle, walk, attack
	var dir_rows := { "down": 0, "up": 1, "right": 2, "left": 3 }
	for dir_name in dir_rows.keys():
		var row: int = dir_rows[dir_name]
		# idle : frame 0
		_add_frame_from_sheet(sf, tex, "idle_" + dir_name, row, 0, h_frames, v_frames)
		# walk : frames 1 et 2 (boucle)
		_add_anim_from_sheet(sf, tex, "walk_" + dir_name, row, [1, 2, 1, 0], h_frames, v_frames, 8.0, true)
		# attack : frame 3
		_add_frame_from_sheet(sf, tex, "attack_" + dir_name, row, 3, h_frames, v_frames)
	
	# hurt (ligne 4, frame 0)
	_add_frame_from_sheet(sf, tex, "hurt", 4, 0, h_frames, v_frames)
	# death (ligne 5, frames 0 à 3)
	_add_anim_from_sheet(sf, tex, "death", 5, [0, 1, 2, 3], h_frames, v_frames, 6.0, false)
	
	sprite.sprite_frames = sf
	_frames_built = true

func _frame_to_atlas(row: int, col: int, h_frames: int, v_frames: int) -> AtlasTexture:
	var at := AtlasTexture.new()
	at.atlas = load("res://assets/sprites/hermes/hermes.png")
	at.region = Rect2(
		col * FRAME_SIZE, row * FRAME_SIZE,
		FRAME_SIZE, FRAME_SIZE
	)
	return at

func _add_frame_from_sheet(sf: SpriteFrames, _tex: Texture2D, anim_name: String,
		row: int, col: int, h_frames: int, v_frames: int) -> void:
	if not sf.has_animation(anim_name):
		sf.add_animation(anim_name)
		sf.set_animation_loop(anim_name, false)
		sf.set_animation_speed(anim_name, 2.0)
	sf.add_frame(anim_name, _frame_to_atlas(row, col, h_frames, v_frames))

func _add_anim_from_sheet(sf: SpriteFrames, _tex: Texture2D, anim_name: String,
		row: int, cols: Array, h_frames: int, v_frames: int,
		fps: float, loop: bool) -> void:
	if not sf.has_animation(anim_name):
		sf.add_animation(anim_name)
	sf.set_animation_loop(anim_name, loop)
	sf.set_animation_speed(anim_name, fps)
	for col in cols:
		sf.add_frame(anim_name, _frame_to_atlas(row, col, h_frames, v_frames))

func _physics_process(delta: float) -> void:
	if Globals.input_locked:
		velocity = Vector2.ZERO
		return
	# Timers
	if attack_cooldown > 0:
		attack_cooldown -= delta
	if invincible:
		invincible_timer -= delta
		if invincible_timer <= 0:
			invincible = false
			sprite.modulate.a = 1.0
	
	# Mouvement
	var input_vec := Vector2.ZERO
	if Input.is_action_pressed("move_left"):
		input_vec.x -= 1
	if Input.is_action_pressed("move_right"):
		input_vec.x += 1
	if Input.is_action_pressed("move_up"):
		input_vec.y -= 1
	if Input.is_action_pressed("move_down"):
		input_vec.y += 1
	
	var sprint := Input.is_action_pressed("sprint") and not is_attacking
	var speed := SPEED_RUN if sprint else SPEED_WALK
	
	if input_vec != Vector2.ZERO:
		input_vec = input_vec.normalized()
		velocity = input_vec * speed
		_update_facing(input_vec)
		if not is_attacking and not invincible:
			_play_anim("walk_" + facing)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, 600 * delta)
		if not is_attacking and not invincible:
			_play_anim("idle_" + facing)
	
	move_and_slide()
	
	# Attaque
	if Input.is_action_just_pressed("attack") and not is_attacking and attack_cooldown <= 0:
		if Globals.has_codex_soul:
			_start_attack()
		else:
			Globals.dialogue_requested.emit("Hermes", "Quelque chose manque... la fréquence indique la cabane de Kael.")

func _update_facing(v: Vector2) -> void:
	if abs(v.x) > abs(v.y):
		facing = &"right" if v.x > 0 else &"left"
	else:
		facing = &"down" if v.y > 0 else &"up"

func _play_anim(name: StringName) -> void:
	if sprite.sprite_frames and sprite.sprite_frames.has_animation(name):
		if sprite.animation != name or not sprite.is_playing():
			sprite.play(name)

# --- Attaque Codex Soul ---
func _start_attack() -> void:
	is_attacking = true
	attack_cooldown = 0.45
	_play_anim("attack_" + facing)
	_orient_attack_area()
	attack_shape.disabled = false
	_spawn_codex_slash()
	await get_tree().create_timer(0.2).timeout
	attack_shape.disabled = true
	await get_tree().create_timer(0.25).timeout
	is_attacking = false
	# Retour à l'idle si pas en mouvement
	if velocity.length() < 5:
		_play_anim("idle_" + facing)

func _orient_attack_area() -> void:
	match facing:
		&"right":
			attack_area.rotation_degrees = 0
			attack_area.position = Vector2(20, 0)
		&"left":
			attack_area.rotation_degrees = 180
			attack_area.position = Vector2(-20, 0)
		&"up":
			attack_area.rotation_degrees = -90
			attack_area.position = Vector2(0, -20)
		&"down":
			attack_area.rotation_degrees = 90
			attack_area.position = Vector2(0, 20)

func _spawn_codex_slash() -> void:
	# Arc visuel du Codex Soul (vert néon)
	var slash := Line2D.new()
	slash.default_color = Color(0.83, 1.0, 0.54, 0.9)
	slash.width = 3.0
	slash.z_index = 10
	var r := 22.0
	for i in range(8):
		var a := (i / 7.0) * PI - PI / 2.0
		slash.add_point(Vector2(cos(a) * r, sin(a) * r))
	slash.rotation = {
		&"right": 0.0,
		&"down": PI / 2.0,
		&"left": PI,
		&"up": -PI / 2.0,
	}.get(facing, 0.0)
	add_child(slash)
	var tw := create_tween()
	tw.tween_property(slash, "modulate:a", 0.0, 0.25)
	tw.tween_callback(slash.queue_free)

func _on_attack_area_body_entered(body: Node) -> void:
	if body.is_in_group("enemy"):
		if body.has_method("take_damage"):
			body.take_damage(1, global_position)

# --- Dégâts reçus ---
func take_damage(amount: int = 1, from_pos: Vector2 = Vector2.ZERO) -> void:
	if invincible:
		return
	Globals.take_damage(amount)
	invincible = true
	invincible_timer = I_FRAMES_DURATION
	# Clignotement
	var tw := create_tween().set_loops(4)
	tw.tween_property(sprite, "modulate:a", 0.2, 0.1)
	tw.tween_property(sprite, "modulate:a", 1.0, 0.1)
	# Knockback
	if from_pos != Vector2.ZERO:
		velocity = (global_position - from_pos).normalized() * 150

func heal(amount: int = 1) -> void:
	Globals.heal(amount)

func _on_player_died() -> void:
	if Globals.input_locked:
		return
	Globals.input_locked = true
	_play_anim("death")
	await get_tree().create_timer(1.2).timeout
	Globals.reset_run()
	get_tree().reload_current_scene()
