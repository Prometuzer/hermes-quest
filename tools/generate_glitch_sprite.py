"""
Génère le spritesheet du Glitch — ennemi IA malveillante.
Entité numérique instable, pixel brouillé, rouge/cyan/magenta.

Layout (32x32, 4 colonnes x 5 lignes) :
  Ligne 0 : walk (4 frames de flottement)
  Ligne 1 : chase (4 frames agitées)
  Ligne 2 : attack (4 frames explosion)
  Ligne 3 : hurt (4 frames rouges)
  Ligne 4 : death (4 frames de décomposition)
"""
import os, random
from PIL import Image, ImageDraw

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "game", "assets", "sprites", "enemies")
os.makedirs(OUT_DIR, exist_ok=True)

FRAMES = 32
COLS = 4
ROWS = 5

# Palette glitch
CORE = (255, 40, 80)         # cœur rouge
CORE_BRIGHT = (255, 120, 150)
EDGE = (180, 30, 200)        # bord magenta
GLITCH_CYAN = (80, 255, 255)
GLITCH_YELLOW = (255, 230, 80)
DARK = (20, 10, 25)
TRANSPARENT = (0, 0, 0, 0)

random.seed(42)


def draw_glitch_body(img, intensity=0.5, color_shift=0, exploded=False):
    """Dessine un corps glitch instable."""
    d = ImageDraw.Draw(img)
    cx, cy = 16, 16
    
    # Halo de corruption (cercle brumeux)
    for r in range(13, 6, -1):
        alpha = int(60 * (1 - (r - 6) / 7))
        color = (CORE[0], CORE[1] - color_shift, CORE[2], alpha)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    
    # Corps central : forme losange/carré déformé
    body_size = 8 + int(intensity * 3)
    if exploded:
        body_size += 4
    half = body_size // 2
    
    # Carré central avec décalages glitch
    for i in range(3):
        offset_x = random.randint(-2, 2) if intensity > 0.3 else 0
        offset_y = random.randint(-1, 1) if intensity > 0.3 else 0
        col = [CORE, CORE_BRIGHT, EDGE][i]
        d.rectangle(
            [cx - half + offset_x, cy - half + offset_y,
             cx + half + offset_x, cy + half + offset_y],
            fill=col
        )
    
    # Cœur brillant (œil unique)
    eye_color = GLITCH_CYAN if intensity < 0.7 else GLITCH_YELLOW
    d.rectangle([cx - 2, cy - 1, cx + 2, cy + 1], fill=eye_color)
    d.rectangle([cx - 1, cy, cx + 1, cy], fill=(255, 255, 255))
    
    # Pixels de corruption dispersés
    n_glitches = int(15 * intensity)
    for _ in range(n_glitches):
        gx = random.randint(4, 27)
        gy = random.randint(4, 27)
        # Ne pas dessiner sur le cœur
        if abs(gx - cx) < 4 and abs(gy - cy) < 4:
            continue
        col = random.choice([GLITCH_CYAN, GLITCH_YELLOW, EDGE, CORE_BRIGHT])
        d.rectangle([gx, gy, gx, gy], fill=col)
    
    # Tentacules de données (vers le bas)
    for i in range(3):
        tx = cx - 4 + i * 4
        ty = cy + half + 1
        length = random.randint(2, 5)
        col = random.choice([EDGE, GLITCH_CYAN])
        d.line([tx, ty, tx + random.randint(-1, 1), ty + length], fill=col)


def build_spritesheet():
    sheet = Image.new("RGBA", (FRAMES * COLS, FRAMES * ROWS), TRANSPARENT)
    
    # Ligne 0 : walk (intensité basse, stable)
    for f in range(COLS):
        frame = Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)
        random.seed(100 + f)
        draw_glitch_body(frame, intensity=0.3, color_shift=0)
        sheet.paste(frame, (f * FRAMES, 0 * FRAMES))
    
    # Ligne 1 : chase (intensité moyenne, agitée)
    for f in range(COLS):
        frame = Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)
        random.seed(200 + f)
        draw_glitch_body(frame, intensity=0.6, color_shift=30)
        sheet.paste(frame, (f * FRAMES, 1 * FRAMES))
    
    # Ligne 2 : attack (explosion)
    for f in range(COLS):
        frame = Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)
        random.seed(300 + f)
        draw_glitch_body(frame, intensity=0.9, color_shift=60, exploded=True)
        sheet.paste(frame, (f * FRAMES, 2 * FRAMES))
    
    # Ligne 3 : hurt (rouge plein)
    for f in range(COLS):
        frame = Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)
        random.seed(400 + f)
        draw_glitch_body(frame, intensity=0.5, color_shift=-50)
        # Overlay rouge
        red = Image.new("RGBA", (FRAMES, FRAMES), (255, 50, 50, 80))
        frame.alpha_composite(red)
        sheet.paste(frame, (f * FRAMES, 3 * FRAMES))
    
    # Ligne 4 : death (décomposition)
    for f in range(COLS):
        frame = Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)
        if f == 0:
            random.seed(500)
            draw_glitch_body(frame, intensity=0.8, color_shift=0)
        else:
            # De plus en plus éclaté
            random.seed(500 + f)
            draw_glitch_body(frame, intensity=0.4, color_shift=0)
            # Scinde en morceaux
            d = ImageDraw.Draw(frame)
            for _ in range(f * 8):
                gx = random.randint(0, 31)
                gy = random.randint(0, 31)
                d.rectangle([gx, gy, gx, gy], fill=GLITCH_CYAN)
            # Fade
            alpha = frame.split()[3].point(lambda a: int(a * (1 - f * 0.25)))
            frame.putalpha(alpha)
        sheet.paste(frame, (f * FRAMES, 4 * FRAMES))
    
    # Upscale x2
    sheet = sheet.resize((FRAMES * COLS * 2, FRAMES * ROWS * 2), Image.NEAREST)
    
    out = os.path.join(OUT_DIR, "glitch.png")
    sheet.save(out)
    print(f"  ✓ {out} ({sheet.size})")
    
    preview = sheet.resize((sheet.width, sheet.height), Image.NEAREST)
    preview.save(os.path.join(OUT_DIR, "glitch-preview.png"))
    print(f"  ✓ glitch-preview.png")


if __name__ == "__main__":
    print("Génération du Glitch...")
    build_spritesheet()
    print("Terminé.")
