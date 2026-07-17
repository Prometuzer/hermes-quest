## Pierre Gateway — point d'ancrage physique du compagnon Écho.
extends StaticBody2D

var _time: float = 0.0

func _process(delta: float) -> void:
	_time += delta
	queue_redraw()

func _draw() -> void:
	var linked := Globals.gateway_linked
	var pulse := 0.65 + sin(_time * 2.8) * 0.2
	var rune_color := Color(0.35, 1.0, 0.78, pulse) if linked else Color(0.48, 0.67, 0.75, pulse)
	draw_colored_polygon(PackedVector2Array([
		Vector2(-12, 11), Vector2(-9, -10), Vector2(0, -20),
		Vector2(9, -10), Vector2(12, 11),
	]), Color("24373a"))
	draw_polyline(PackedVector2Array([
		Vector2(-12, 11), Vector2(-9, -10), Vector2(0, -20),
		Vector2(9, -10), Vector2(12, 11), Vector2(-12, 11),
	]), Color("55736e"), 1.5)
	# Rune du Codex : triangle ouvert et fréquence centrale.
	draw_polyline(PackedVector2Array([
		Vector2(-6, 5), Vector2(0, -9), Vector2(6, 5), Vector2(-6, 5),
	]), rune_color, 2.0)
	draw_line(Vector2(-4, 1), Vector2(4, 1), rune_color, 1.5)
	draw_circle(Vector2(0, 1), 2.2, Color("e7fff1"))
	if linked:
		draw_circle(Vector2.ZERO, 18.0 + sin(_time * 2.0) * 2.0, Color(0.35, 1.0, 0.78, 0.16), false, 1.5)
