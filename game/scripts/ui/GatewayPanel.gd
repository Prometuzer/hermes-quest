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
var _request_kind: StringName = &""
var _intro_shown: bool = false

func _ready() -> void:
	_http = HTTPRequest.new()
	add_child(_http)
	_http.timeout = Globals.GATEWAY_TIMEOUT
	_http.request_completed.connect(_on_request_completed)
	Globals.gateway_link_requested.connect(activate_link)
	send_button.pressed.connect(_send_message)
	input.text_submitted.connect(func(_t): _send_message())
	typing_indicator.visible = false

func open() -> void:
	input.grab_focus()
	if Globals.gateway_linked:
		status_label.text = "ÉCHO // LIEN STABLE"
		status_label.add_theme_color_override("font_color", Color(0.83, 1.0, 0.54))
	else:
		if not _intro_shown:
			_push_system("Gateway inactive — active la Pierre Gateway avec [E].")
			_intro_shown = true
		status_label.text = "HORS LIGNE"

func close() -> void:
	Globals.input_locked = false

func _input(event: InputEvent) -> void:
	if visible and event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		visible = false
		close()
		get_viewport().set_input_as_handled()

func activate_link() -> void:
	if _busy or Globals.gateway_linked:
		return
	_busy = true
	_request_kind = &"link"
	send_button.disabled = true
	typing_indicator.visible = true
	status_label.text = "SYNCHRONISATION..."
	var headers := _gateway_headers()
	var err := _http.request(
		Globals.gateway_url + "/link",
		headers,
		HTTPClient.METHOD_POST,
		"{}"
	)
	if err != OK:
		_push_error("Impossible d'ouvrir le lien (code %d)." % err)
		_finish_request()

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
	_request_kind = &"chat"
	var payload := {
		"session": Globals.player_handle,
		"message": text,
		"context": {
			"health": Globals.player_health,
			"enemies_defeated": Globals.enemies_defeated,
			"lore_fragments": Globals.lore_fragments,
			"quest_stage": str(Globals.quest_stage),
		}
	}
	var body := JSON.stringify(payload)
	var headers := _gateway_headers()
	var err := _http.request(
		Globals.gateway_url + "/chat",
		headers,
		HTTPClient.METHOD_POST,
		body
	)
	if err != OK:
		_push_error("Network error (code %d)" % err)
		_finish_request()

func _on_request_completed(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
	var completed_kind := _request_kind
	_finish_request()
	if result != HTTPRequest.RESULT_SUCCESS:
		_push_error("Gateway injoignable. Vérifie le serveur et HERMES_GATEWAY_URL.")
		return
	var parsed = JSON.parse_string(body.get_string_from_utf8())
	if response_code < 200 or response_code >= 300:
		var detail := "Erreur HTTP %d" % response_code
		if typeof(parsed) == TYPE_DICTIONARY:
			detail = str(parsed.get("detail", detail))
		_push_error(detail)
		return
	if typeof(parsed) != TYPE_DICTIONARY:
		_push_error("Réponse illisible du Gateway.")
		return
	if completed_kind == &"link":
		var session_id := str(parsed.get("session", ""))
		if session_id == "":
			_push_error("Le Gateway n'a pas renvoyé de session.")
			return
		Globals.set_gateway_session(session_id)
		status_label.text = "ÉCHO // LIEN STABLE"
		status_label.add_theme_color_override("font_color", Color(0.83, 1.0, 0.54))
		_push_system("Lien établi. Une présence vient de répondre dans le Codex.")
		Globals.dialogue_requested.emit("Écho", "Je t'entends enfin, Hermes. Le Grand Reset a déjà commencé.")
	elif parsed.has("reply"):
		_push_hermes(str(parsed.get("reply", "...")))
	else:
		_push_error("Réponse incomplète du Gateway.")

func _finish_request() -> void:
	_busy = false
	send_button.disabled = false
	typing_indicator.visible = false
	_request_kind = &""

func _gateway_headers() -> PackedStringArray:
	var headers := PackedStringArray(["Content-Type: application/json"])
	if Globals.gateway_api_key != "":
		headers.append("X-Gateway-Key: " + Globals.gateway_api_key)
	return headers

# --- Append helpers ---
func _push_player(text: String) -> void:
	log_richtext.append_text("[color=%s][b]You:[/b] %s[/color]\n" % [STYLE_COLOR_PLAYER, _escape(text)])

func _push_hermes(text: String) -> void:
	log_richtext.append_text("[color=%s][b]Écho:[/b] %s[/color]\n" % [STYLE_COLOR_HERMES, _escape(text)])

func _push_system(text: String) -> void:
	log_richtext.append_text("[color=%s][i]%s[/i][/color]\n" % [STYLE_COLOR_SYSTEM, _escape(text)])

func _push_error(text: String) -> void:
	log_richtext.append_text("[color=%s][b]! %s[/b][/color]\n" % [STYLE_COLOR_ERROR, _escape(text)])

func _escape(text: String) -> String:
	return text.replace("[", "［").replace("]", "］")
