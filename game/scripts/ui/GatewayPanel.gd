## GatewayPanel.gd — Interface de chat avec Hermes Agent.
## Le joueur tape un message → POST vers le pont FastAPI → réponse affichée.
extends Control

@onready var log_richtext: RichTextLabel = $Panel/VBox/Scroll/Log
@onready var input: LineEdit = $Panel/VBox/InputRow/Input
@onready var send_button: Button = $Panel/VBox/InputRow/SendButton
@onready var status_label: Label = $Panel/VBox/StatusRow/StatusLabel
@onready var typing_indicator: Control = $Panel/VBox/TypingIndicator

const STYLE_COLOR_HERMES := "#d4ff8a"
const STYLE_COLOR_PLAYER := "#88ccff"
const STYLE_COLOR_SYSTEM := "#888888"
const STYLE_COLOR_ERROR := "#ff6b6b"

var _http: HTTPRequest
var _busy: bool = false

func _ready() -> void:
	_http = HTTPRequest.new()
	add_child(_http)
	_http.request_completed.connect(_on_request_completed)
	send_button.pressed.connect(_send_message)
	input.text_submitted.connect(func(_t): _send_message())
	typing_indicator.visible = false

func open() -> void:
	input.grab_focus()
	if Globals.gateway_linked:
		status_label.text = "Connected to Hermes"
		status_label.add_theme_color_override("font_color", Color(0.83, 1.0, 0.54))
	else:
		_push_system("Gateway inactive — press [L] near a Gateway Stone to link with Hermes.")
		status_label.text = "Offline"

func _input(event: InputEvent) -> void:
	if visible and event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		visible = false
		get_viewport().set_input_as_handled()

func _send_message() -> void:
	if _busy:
		return
	var text := input.text.strip_edges()
	if text == "":
		return
	_push_player(text)
	input.clear()
	
	if not Globals.gateway_linked:
		_push_system("(No link active. Find a Gateway Stone in the forest.)")
		return
	
	_busy = true
	send_button.disabled = true
	typing_indicator.visible = true
	_post_to_gateway(text)

func _post_to_gateway(text: String) -> void:
	var payload := {
		"session": Globals.player_handle,
		"message": text,
		"context": {
			"health": Globals.player_health,
			"enemies_defeated": Globals.enemies_defeated,
			"lore_fragments": Globals.lore_fragments,
		}
	}
	var body := JSON.stringify(payload)
	var headers := PackedStringArray(["Content-Type: application/json"])
	var err := _http.request(
		Globals.GATEWAY_URL + "/chat",
		headers,
		HTTPClient.METHOD_POST,
		body
	)
	if err != OK:
		_push_error("Network error (code %d)" % err)
		_finish_request()

func _on_request_completed(result: int, _response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	_finish_request()
	if result != HTTPRequest.RESULT_SUCCESS:
		_push_error("Gateway unreachable. Is the bridge server running?")
		return
	var parsed = JSON.parse_string(body.get_string_from_utf8())
	if typeof(parsed) != TYPE_DICTIONARY or not parsed.has("reply"):
		_push_error("Malformed response from bridge.")
		return
	var reply: String = parsed.get("reply", "...")
	_push_hermes(reply)

func _finish_request() -> void:
	_busy = false
	send_button.disabled = false
	typing_indicator.visible = false

# --- Append helpers ---
func _push_player(text: String) -> void:
	log_richtext.append_text("[color=%s][b]You:[/b] %s[/color]\n" % [STYLE_COLOR_PLAYER, _escape(text)])

func _push_hermes(text: String) -> void:
	log_richtext.append_text("[color=%s][b]Hermes:[/b] %s[/color]\n" % [STYLE_COLOR_HERMES, _escape(text)])

func _push_system(text: String) -> void:
	log_richtext.append_text("[color=%s][i]%s[/i][/color]\n" % [STYLE_COLOR_SYSTEM, _escape(text)])

func _push_error(text: String) -> void:
	log_richtext.append_text("[color=%s][b]! %s[/b][/color]\n" % [STYLE_COLOR_ERROR, _escape(text)])

func _escape(text: String) -> String:
	return text.replace("[", "&amp;#91;").replace("]", "&amp;#93;")
