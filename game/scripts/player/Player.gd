## Player.gd — Hermes, l'héroïne punk au casque audio.
## Gère : déplacement ZQSD, animations, attaque Codex Soul, vie, i-frames.
extends CharacterBody2D

const SPEED_WALK: float = 80.0
const SPEED_RUN: float = 140.0
const I_FRAMES_DURATION: float = 1.0   # invincibilité après coup

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var attack_area: Area2D = $AttackArea
@onready var attack_shape: CollisionShape2D = $AttackArea/CollisionShape2D
@onready var cam: Camera2D = $Camera2D
@onready var hitbox: CollisionShape2D = $CollisionShape2D

var facing: StringName = &"down"
var is_attacking: bool = false
var attack_cooldown: float = 0.0
var invincible: bool = false
var invincible_timer: float = 0.0

func _ready() -> void:
	add_to_group("player")
	attack_shape.disabled = true
	cam.make_current()
	_play_anim("idle_down")

func _physics_process(delta: float) -> void:
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
		if not is_attacking:
			_play_anim("walk_" + facing)
	else:
		velocity = Vector2.ZERO
		if not is_attacking:
			_play_anim("idle_" + facing)
	
	move_and_slide()
	
	# Attaque
	if Input.is_action_just_pressed("attack") and not is_attacking and attack_cooldown <= 0:
		_start_attack()

func _update_facing(v: Vector2) -> void:
	if abs(v.x) > abs(v.y):
		facing = &"right" if v.x > 0 else &"left"
	else:
		facing = &"down" if v.y > 0 else &"up"

func _play_anim(name: StringName) -> void:
	if sprite.animation != name and sprite.sprite_frames.has_animation(name):
		sprite.play(name)

# --- Attaque Codex Soul ---
func _start_attack() -> void:
	is_attacking = true
	attack_cooldown = 0.45
	_play_anim("attack_" + facing)
	# Active la hitbox dans la direction du facing
	_orient_attack_area()
	attack_shape.disabled = false
	# Effet visuel (arc de compilation)
	_spawn_codex_slash()
	# Désactive après 200ms
	await get_tree().create_timer(0.2).timeout
	attack_shape.disabled = true
	await get_tree().create_timer(0.25).timeout
	is_attacking = false

func _orient_attack_area() -> void:
	match facing:
		&"right":
			attack_area.rotation_degrees = 0
			attack_area.position = Vector2(14, 0)
		&"left":
			attack_area.rotation_degrees = 180
			attack_area.position = Vector2(-14, 0)
		&"up":
			attack_area.rotation_degrees = -90
			attack_area.position = Vector2(0, -14)
		&"down":
			attack_area.rotation_degrees = 90
			attack_area.position = Vector2(0, 14)

func _spawn_codex_slash() -> void:
	# L'arc visuel de l'épée (placeholder CPUParticles2D ou sprite glow)
	var slash := Line2D.new()
	slash.default_color = Color(0.83, 1.0, 0.54, 0.9)
	slash.width = 3.0
	var r := 16.0
	for i in range(8):
		var a := (i / 7.0) * PI - PI / 2.0
		slash.add_point(Vector2(cos(a) * r, sin(a) * r))
	add_child(slash)
	var tw := create_tween()
	tw.tween_property(slash, "modulate:a", 0.0, 0.25)
	tw.tween_callback(slash.queue_free)

func _on_attack_area_body_entered(body: Node) -> void:
	if body.is_in_group("enemy"):
		body.take_damage(1, global_position)

# --- Dégâts reçus ---
func take_damage(amount: int = 1, _from: Vector2 = Vector2.ZERO) -> void:
	if invincible:
		return
	Globals.take_damage(amount)
	invincible = true
	invincible_timer = I_FRAMES_DURATION
	# Clignotement
	var tw := create_tween().set_loops(4)
	tw.tween_property(sprite, "modulate:a", 0.2, 0.1)
	tw.tween_property(sprite, "modulate:a", 1.0, 0.1)
	# Knockback léger
	velocity = (global_position - _from).normalized() * 120 if _from != Vector2.ZERO else velocity

func heal(amount: int = 1) -> void:
	Globals.heal(amount)
