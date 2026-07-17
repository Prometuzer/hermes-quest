## Enemy.gd — IA malveillante (glitch entity).
## Comportement : patrouille, détecte le joueur, poursuit, attaque.
##
## Animations construites en code depuis glitch.png (grille 4×5, 32×32 → 64×64).
extends CharacterBody2D

enum State { IDLE, PATROL, CHASE, ATTACK, HURT, DEAD }

const MAX_HP: int = 2
const SPEED_PATROL: float = 35.0
const SPEED_CHASE: float = 65.0
const DETECTION_RANGE: float = 110.0
const ATTACK_RANGE: float = 22.0
const ATTACK_COOLDOWN: float = 1.2
const PATROL_WAIT_TIME: float = 1.8

# Spritesheet glitch.png (cf. tools/generate_glitch_sprite.py)
const FRAME_SIZE: int = 64
const SHEET_COLS: int = 4
const SHEET_ROWS: int = 5
# 0 = walk, 1 = chase, 2 = attack, 3 = hurt, 4 = death

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D

var hp: int = MAX_HP
var state: int = State.PATROL
var player_ref: CharacterBody2D = null
var patrol_dir: Vector2 = Vector2.RIGHT
var patrol_timer: float = 0.0
var attack_cd: float = 0.0
var hurt_timer: float = 0.0

func _ready() -> void:
	add_to_group("enemy")
	_build_sprite_frames()
	sprite.offset = Vector2(0, -FRAME_SIZE / 2.0 + 8)
	_pick_random_patrol_dir()
	sprite.play("walk")
	await get_tree().process_frame
	player_ref = get_tree().get_first_node_in_group("player") as CharacterBody2D

func _build_sprite_frames() -> void:
	var tex := load("res://assets/sprites/enemies/glitch.png") as Texture2D
	if tex == null:
		push_error("[Enemy] glitch.png introuvable")
		return
	var sf := SpriteFrames.new()
	sf.remove_animation("default")
	
	var anim_defs := {
		"walk":    { "row": 0, "cols": [0,1,2,3], "fps": 6.0, "loop": true },
		"chase":   { "row": 1, "cols": [0,1,2,3], "fps": 10.0, "loop": true },
		"attack":  { "row": 2, "cols": [0,1,2,3], "fps": 12.0, "loop": false },
		"hurt":    { "row": 3, "cols": [0,1], "fps": 8.0, "loop": false },
		"death":   { "row": 4, "cols": [0,1,2,3], "fps": 8.0, "loop": false },
	}
	
	for anim_name in anim_defs.keys():
		var d: Dictionary = anim_defs[anim_name]
		sf.add_animation(anim_name)
		sf.set_animation_loop(anim_name, d.loop)
		sf.set_animation_speed(anim_name, d.fps)
		for col in d.cols:
			sf.add_frame(anim_name, _frame_to_atlas(d.row, col))
	
	sprite.sprite_frames = sf

func _frame_to_atlas(row: int, col: int) -> AtlasTexture:
	var at := AtlasTexture.new()
	at.atlas = load("res://assets/sprites/enemies/glitch.png")
	at.region = Rect2(col * FRAME_SIZE, row * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE)
	return at

func _physics_process(delta: float) -> void:
	if state == State.DEAD:
		return
	
	if attack_cd > 0:
		attack_cd -= delta
	if hurt_timer > 0:
		hurt_timer -= delta
		if hurt_timer <= 0 and state == State.HURT:
			state = State.CHASE
	
	# Détection joueur
	if player_ref and state != State.HURT and state != State.ATTACK:
		var dist := global_position.distance_to(player_ref.global_position)
		if dist < ATTACK_RANGE and attack_cd <= 0:
			_enter_attack()
		elif dist < DETECTION_RANGE:
			if state != State.CHASE:
				state = State.CHASE
				if sprite.animation != "chase":
					sprite.play("chase")
		elif state == State.CHASE:
			state = State.PATROL
			if sprite.animation != "walk":
				sprite.play("walk")
	
	match state:
		State.PATROL:
			_patrol(delta)
		State.CHASE:
			_chase(delta)
		State.ATTACK, State.HURT:
			velocity = velocity.move_toward(Vector2.ZERO, 200 * delta)
	
	move_and_slide()
	
	if velocity.x < -5:
		sprite.flip_h = true
	elif velocity.x > 5:
		sprite.flip_h = false

func _patrol(delta: float) -> void:
	patrol_timer -= delta
	if patrol_timer <= 0:
		patrol_timer = PATROL_WAIT_TIME
		_pick_random_patrol_dir()
	velocity = velocity.move_toward(patrol_dir * SPEED_PATROL, 200 * delta)

func _chase(delta: float) -> void:
	if not player_ref:
		return
	var dir := (player_ref.global_position - global_position).normalized()
	velocity = velocity.move_toward(dir * SPEED_CHASE, 300 * delta)

func _enter_attack() -> void:
	state = State.ATTACK
	attack_cd = ATTACK_COOLDOWN
	sprite.play("attack")
	await get_tree().create_timer(0.2).timeout
	if player_ref and is_instance_valid(player_ref) and global_position.distance_to(player_ref.global_position) < ATTACK_RANGE + 8:
		if player_ref.has_method("take_damage"):
			player_ref.take_damage(1, global_position)
	await get_tree().create_timer(0.3).timeout
	if state != State.DEAD and state != State.HURT:
		state = State.CHASE

func _pick_random_patrol_dir() -> void:
	var dirs := [Vector2.RIGHT, Vector2.LEFT, Vector2.UP, Vector2.DOWN, Vector2.ZERO]
	patrol_dir = dirs[randi() % dirs.size()]

# --- Dégâts reçus ---
func take_damage(amount: int, from_pos: Vector2) -> void:
	if state == State.DEAD:
		return
	hp -= amount
	if hp <= 0:
		_die()
	else:
		state = State.HURT
		hurt_timer = 0.4
		var kb_dir := (global_position - from_pos).normalized()
		velocity = kb_dir * 150
		sprite.play("hurt")
		sprite.modulate = Color(1, 0.4, 0.4, 1)
		await get_tree().create_timer(0.15).timeout
		sprite.modulate = Color.WHITE

func _die() -> void:
	state = State.DEAD
	sprite.play("death")
	Globals.register_enemy_defeat()
	if randf() < 0.33:
		_spawn_lore_fragment()
	$CollisionShape2D.set_deferred("disabled", true)
	if $HitArea/CollisionShape2D:
		$HitArea/CollisionShape2D.set_deferred("disabled", true)
	# Attend la fin de l'anim death avant de disparaître
	await get_tree().create_timer(0.8).timeout
	var tw := create_tween()
	tw.tween_property(self, "modulate:a", 0.0, 0.4)
	tw.tween_callback(queue_free)

func _spawn_lore_fragment() -> void:
	var frag := Area2D.new()
	frag.add_to_group("lore_fragment")
	var col := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = Vector2(10, 10)
	col.shape = rect
	frag.add_child(col)
	var spr := Sprite2D.new()
	spr.texture = load("res://assets/sprites/items/lore_fragment.png")
	frag.add_child(spr)
	frag.global_position = global_position
	get_parent().add_child(frag)
