## Maître Kael — mentor d'Écho-Verdant.
## Silhouette procédurale temporaire : elle garde le MVP autonome jusqu'au sprite final.
extends StaticBody2D

var _pulse: float = 0.0

func _process(delta: float) -> void:
	_pulse += delta
	queue_redraw()

func _draw() -> void:
	# Ombre, robe et barbe donnent une silhouette immédiatement lisible en top-down.
	_draw_flat_ellipse(Vector2(0, 10), Vector2(12, 5), Color(0.03, 0.05, 0.04, 0.35))
	draw_colored_polygon(PackedVector2Array([
		Vector2(-10, 8), Vector2(-7, -5), Vector2(0, -11),
		Vector2(7, -5), Vector2(10, 8),
	]), Color("5f4b7a"))
	draw_circle(Vector2(0, -12), 8.0, Color("d8ad83"))
	draw_colored_polygon(PackedVector2Array([
		Vector2(-7, -10), Vector2(0, 5), Vector2(7, -10),
		Vector2(5, 0), Vector2(0, 9), Vector2(-5, 0),
	]), Color("f0eee2"))
	# Lunettes rondes et sourire moqueur.
	draw_circle(Vector2(-3, -13), 2.8, Color("263449"), false, 1.2)
	draw_circle(Vector2(3, -13), 2.8, Color("263449"), false, 1.2)
	draw_line(Vector2(-0.5, -13), Vector2(0.5, -13), Color("263449"), 1.0)
	draw_line(Vector2(-2, -7), Vector2(2, -6), Color("8a4e55"), 1.0)
	# Bâton noueux et cristal vivant.
	draw_line(Vector2(11, -17), Vector2(9, 11), Color("6c4931"), 2.5)
	var glow := 0.72 + sin(_pulse * 3.0) * 0.2
	draw_circle(Vector2(11, -19), 4.0, Color(0.35, 1.0, 0.78, glow))
	draw_circle(Vector2(11, -19), 1.8, Color("e7fff1"))

func _draw_flat_ellipse(center: Vector2, radius: Vector2, color: Color) -> void:
	var points := PackedVector2Array()
	for i in range(20):
		var angle := TAU * float(i) / 20.0
		points.append(center + Vector2(cos(angle) * radius.x, sin(angle) * radius.y))
	draw_colored_polygon(points, color)
