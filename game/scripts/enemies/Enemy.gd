## Enemy.gd — IA malveillante (glitch entity).
## Comportement MVP : patrouille, détecte le joueur si proche, poursuit, attaque au contact.
extends CharacterBody2D

enum State { IDLE, PATROL, CHASE, ATTACK, HURT, DEAD }

const MAX_HP: int = 2
const SPEED_PATROL: float = 35.0
const SPEED_CHASE: float = 65.0
const DETECTION_RANGE: float = 90.0
const ATTACK_RANGE: float = 18.0
const ATTACK_COOLDOWN: float = 1.2
const PATROL_WAIT_TIME: float = 1.5

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var detection_area: Area2D = $DetectionArea
@onready var hit_area: Area2D = $HitArea

var hp: int = MAX_HP
var state: int = State.PATROL
var player_ref: CharacterBody2D = null
var patrol_dir: Vector2 = Vector2.RIGHT
var patrol_timer: float = 0.0
var attack_cd: float = 0.0
var hurt_timer: float = 0.0

func _ready() -> void:
	add_to_group("enemy")
	_pick_random_patrol_dir()
	# Cherche le joueur
	await get_tree().process_frame
	player_ref = get_tree().get_first_node_in_group("player") as CharacterBody2D

func _physics_process(delta: float) -> void:
	if state == State.DEAD:
		return
	
	# Timers
	if attack_cd > 0:
		attack_cd -= delta
	if hurt_timer > 0:
		hurt_timer -= delta
		if hurt_timer <= 0 and state == State.HURT:
			state = State.CHASE
	
	# Détection
	if player_ref and state != State.HURT:
		var dist := global_position.distance_to(player_ref.global_position)
		if dist < ATTACK_RANGE and attack_cd <= 0:
			_enter_attack()
		elif dist < DETECTION_RANGE:
			if state != State.ATTACK:
				state = State.CHASE
		elif state == State.CHASE:
			state = State.PATROL
	
	# Mouvement
	match state:
		State.PATROL:
			_patrol(delta)
		State.CHASE:
			_chase(delta)
		State.ATTACK, State.HURT:
			velocity = velocity.move_toward(Vector2.ZERO, 200 * delta)
	
	move_and_slide()
	# Flip sprite selon direction
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
	sprite.play("walk")

func _chase(delta: float) -> void:
	if not player_ref:
		return
	var dir := (player_ref.global_position - global_position).normalized()
	velocity = velocity.move_toward(dir * SPEED_CHASE, 300 * delta)
	sprite.play("chase")

func _enter_attack() -> void:
	state = State.ATTACK
	attack_cd = ATTACK_COOLDOWN
	sprite.play("attack")
	# Inflige des dégâts si le joueur est toujours dans la zone après 0.2s
	await get_tree().create_timer(0.2).timeout
	if player_ref and is_instance_valid(player_ref) and global_position.distance_to(player_ref.global_position) < ATTACK_RANGE + 6:
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
		# Knockback
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
	# Drop potentiel : 1 chance sur 3 de lâcher un fragment de lore
	if randf() < 0.33:
		_spawn_lore_fragment()
	# Désactive collisions + fade out
	$CollisionShape2D.set_deferred("disabled", true)
	$HitArea/CollisionShape2D.set_deferred("disabled", true)
	var tw := create_tween()
	tw.tween_property(self, "modulate:a", 0.0, 0.6)
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
	spr.texture = preload("res://assets/sprites/items/lore_fragment.png")
	frag.add_child(spr)
	frag.global_position = global_position
	get_parent().add_child(frag)
