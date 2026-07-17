"""
Génère le spritesheet d'Hermes — héroïne punk 32x32.
Casque audio futuriste néon, cheveux bleus, veste cyber-streetwear.

Layout du spritesheet (chaque frame = 32x32) :
  Colonnes : frame 0 (idle), frame 1-2 (walk), frame 3 (attack)
  Lignes   : direction down / up / right / left (= flip right)

Soit 4 frames x 4 directions = 16 frames sur une grille 4x4.

Pour les besoins du jeu, on génère aussi 2 frames "hurt" et 1 "death"
sur des lignes supplémentaires (5 et 6).
"""
import os
from PIL import Image, ImageDraw

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "game", "assets", "sprites", "hermes")
os.makedirs(OUT_DIR, exist_ok=True)

FRAMES = 32  # 32x32 pixels
COLS = 4     # idle, walk1, walk2, attack
ROWS = 6     # down, up, right, left, hurt, death

# Palette
SKIN = (245, 220, 190)
SKIN_SHADOW = (210, 175, 140)
HAIR_BLUE = (60, 130, 230)
HAIR_DARK = (40, 90, 170)
VEST = (35, 35, 50)        # veste sombre
VEST_HOOD = (180, 50, 100) # touche rose punk
PANTS = (60, 55, 75)
BOOTS = (25, 25, 35)
HEADPHONES = (40, 40, 55)  # casque sombre
NEON_CYAN = (130, 255, 220)  # LED néon
NEON_PINK = (255, 110, 180)
EYE = (40, 60, 90)
MOUTH = (160, 90, 90)
SWORD_BLADE = (200, 255, 220)
SWORD_HILT = (130, 100, 70)
TRANSPARENT = (0, 0, 0, 0)


def new_frame():
    return Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)


def px(img, x, y, color):
    if 0 <= x < FRAMES and 0 <= y < FRAMES:
        img.putpixel((x, y), color)


def rect(img, x0, y0, x1, y1, color):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            px(img, x, y, color)


def draw_headphones(draw, facing="down"):
    """Casque audio futuriste avec LED néon."""
    # Arceau du casque (dessus de la tête)
    draw.rectangle([10, 6, 21, 8], fill=HEADPHONES)
    # LED néon central qui pulse
    draw.rectangle([15, 6, 16, 7], fill=NEON_CYAN)
    # Écouteurs latéraux
    draw.rectangle([9, 9, 11, 14], fill=HEADPHONES)
    draw.rectangle([20, 9, 22, 14], fill=HEADPHONES)
    # Liseré néon rose
    draw.rectangle([9, 12, 11, 13], fill=NEON_PINK)
    draw.rectangle([20, 12, 22, 13], fill=NEON_PINK)


def draw_hermes_down(img, pose="idle", frame=0):
    """Hermes vue de face."""
    d = ImageDraw.Draw(img)
    # Cheveux bleus (fond, dépassent du casque)
    d.rectangle([10, 8, 21, 18], fill=HAIR_BLUE)
    # Mèches latérales
    d.rectangle([9, 10, 10, 16], fill=HAIR_BLUE)
    d.rectangle([21, 10, 22, 16], fill=HAIR_BLUE)
    # Visage
    d.rectangle([12, 10, 19, 16], fill=SKIN)
    d.rectangle([12, 14, 19, 16], fill=SKIN_SHADOW)
    # Yeux
    d.rectangle([13, 12, 13, 12], fill=EYE)
    d.rectangle([18, 12, 18, 12], fill=EYE)
    # Bouche
    if pose == "attack":
        d.rectangle([15, 15, 16, 15], fill=MOUTH)
    # Casque par-dessus
    draw_headphones(d, "down")
    # Cou
    d.rectangle([15, 17, 16, 18], fill=SKIN_SHADOW)
    # Veste cyber
    d.rectangle([11, 18, 20, 26], fill=VEST)
    d.rectangle([13, 18, 18, 26], fill=(50, 50, 70))  # centre plus clair
    # Zip néon
    d.rectangle([15, 19, 16, 25], fill=NEON_CYAN)
    # Capuche rose (détail punk)
    d.rectangle([11, 18, 12, 22], fill=VEST_HOOD)
    d.rectangle([19, 18, 20, 22], fill=VEST_HOOD)
    # Bras
    d.rectangle([9, 19, 10, 24], fill=VEST)
    d.rectangle([21, 19, 22, 24], fill=VEST)
    # Mains
    d.rectangle([9, 24, 10, 25], fill=SKIN)
    d.rectangle([21, 24, 22, 25], fill=SKIN)
    # Pantalon
    d.rectangle([12, 26, 15, 29], fill=PANTS)
    d.rectangle([16, 26, 19, 29], fill=PANTS)
    # Jambes selon pose
    if pose == "walk":
        if frame == 1:
            d.rectangle([12, 26, 15, 30], fill=PANTS)
            d.rectangle([16, 26, 19, 28], fill=PANTS)
        else:  # frame 2
            d.rectangle([12, 26, 15, 28], fill=PANTS)
            d.rectangle([16, 26, 19, 30], fill=PANTS)
    # Bottes
    d.rectangle([12, 29, 15, 31], fill=BOOTS)
    d.rectangle([16, 29, 19, 31], fill=BOOTS)
    # Épée si attack
    if pose == "attack":
        # Codex Soul levée à droite
        d.rectangle([24, 8, 25, 20], fill=SWORD_BLADE)
        d.rectangle([23, 20, 26, 21], fill=SWORD_HILT)
        d.rectangle([24, 6, 25, 7], fill=NEON_CYAN)


def draw_hermes_up(img, pose="idle", frame=0):
    """Hermes vue de dos."""
    d = ImageDraw.Draw(img)
    # Casque + cheveux bleus (dos)
    d.rectangle([10, 6, 21, 16], fill=HEADPHONES)
    d.rectangle([11, 8, 20, 16], fill=HAIR_BLUE)
    d.rectangle([9, 10, 10, 16], fill=HAIR_BLUE)
    d.rectangle([21, 10, 22, 16], fill=HAIR_BLUE)
    # LED
    d.rectangle([15, 6, 16, 7], fill=NEON_CYAN)
    # Écouteurs
    d.rectangle([9, 9, 11, 14], fill=HEADPHONES)
    d.rectangle([20, 9, 22, 14], fill=HEADPHONES)
    d.rectangle([9, 12, 11, 13], fill=NEON_PINK)
    d.rectangle([20, 12, 22, 13], fill=NEON_PINK)
    # Cou
    d.rectangle([15, 17, 16, 18], fill=SKIN_SHADOW)
    # Veste dos
    d.rectangle([11, 18, 20, 26], fill=VEST)
    d.rectangle([13, 19, 18, 25], fill=(45, 45, 65))
    # Motif dos néon (logo stylisé)
    d.rectangle([15, 21, 16, 23], fill=NEON_CYAN)
    d.rectangle([14, 22, 17, 22], fill=NEON_CYAN)
    # Bras
    d.rectangle([9, 19, 10, 24], fill=VEST)
    d.rectangle([21, 19, 22, 24], fill=VEST)
    # Mains
    d.rectangle([9, 24, 10, 25], fill=SKIN)
    d.rectangle([21, 24, 22, 25], fill=SKIN)
    # Pantalon
    d.rectangle([12, 26, 15, 29], fill=PANTS)
    d.rectangle([16, 26, 19, 29], fill=PANTS)
    if pose == "walk":
        if frame == 1:
            d.rectangle([12, 26, 15, 30], fill=PANTS)
            d.rectangle([16, 26, 19, 28], fill=PANTS)
        else:
            d.rectangle([12, 26, 15, 28], fill=PANTS)
            d.rectangle([16, 26, 19, 30], fill=PANTS)
    d.rectangle([12, 29, 15, 31], fill=BOOTS)
    d.rectangle([16, 29, 19, 31], fill=BOOTS)


def draw_hermes_right(img, pose="idle", frame=0):
    """Hermes vue de côté (droite)."""
    d = ImageDraw.Draw(img)
    # Cheveux bleus
    d.rectangle([13, 8, 21, 18], fill=HAIR_BLUE)
    d.rectangle([11, 10, 13, 16], fill=HAIR_BLUE)
    # Visage profil
    d.rectangle([14, 10, 19, 16], fill=SKIN)
    d.rectangle([14, 14, 19, 16], fill=SKIN_SHADOW)
    # Œil
    d.rectangle([18, 12, 18, 12], fill=EYE)
    # Nez
    d.rectangle([19, 13, 19, 13], fill=SKIN_SHADOW)
    # Casque
    d.rectangle([13, 6, 21, 8], fill=HEADPHONES)
    d.rectangle([16, 6, 17, 7], fill=NEON_CYAN)
    d.rectangle([20, 9, 22, 14], fill=HEADPHONES)
    d.rectangle([20, 12, 22, 13], fill=NEON_PINK)
    # Cou
    d.rectangle([15, 17, 16, 18], fill=SKIN_SHADOW)
    # Veste
    d.rectangle([12, 18, 19, 26], fill=VEST)
    d.rectangle([12, 18, 13, 22], fill=VEST_HOOD)
    # Zip néon
    d.rectangle([17, 19, 18, 25], fill=NEON_CYAN)
    # Bras avant
    d.rectangle([18, 19, 20, 24], fill=VEST)
    d.rectangle([18, 24, 20, 25], fill=SKIN)
    # Bras arrière (plus sombre)
    d.rectangle([12, 19, 13, 24], fill=(30, 30, 40))
    # Pantalon
    d.rectangle([13, 26, 18, 29], fill=PANTS)
    if pose == "walk":
        if frame == 1:
            d.rectangle([13, 26, 16, 30], fill=PANTS)
            d.rectangle([15, 26, 18, 28], fill=PANTS)
        else:
            d.rectangle([13, 26, 15, 28], fill=PANTS)
            d.rectangle([16, 26, 18, 30], fill=PANTS)
    d.rectangle([13, 29, 18, 31], fill=BOOTS)
    # Épée si attack (vers l'avant)
    if pose == "attack":
        d.rectangle([21, 13, 28, 14], fill=SWORD_BLADE)
        d.rectangle([20, 12, 21, 15], fill=SWORD_HILT)
        d.rectangle([28, 13, 29, 14], fill=NEON_CYAN)


def draw_hermes_hurt(img):
    """Hermes blessée (rougie)."""
    draw_hermes_down(img, "idle", 0)
    # Teinte rouge par-dessus
    overlay = Image.new("RGBA", (FRAMES, FRAMES), (255, 80, 80, 90))
    img.alpha_composite(overlay)


def draw_hermes_death(img, frame=0):
    """Hermes à terre (allongée ou affaissée)."""
    d = ImageDraw.Draw(img)
    # Corps affaissé bas
    d.rectangle([8, 26, 23, 30], fill=VEST)
    d.rectangle([10, 24, 14, 28], fill=HAIR_BLUE)
    d.rectangle([10, 25, 13, 27], fill=SKIN)
    d.rectangle([11, 26, 12, 26], fill=EYE)
    # Casque tombé
    d.rectangle([10, 23, 14, 25], fill=HEADPHONES)
    d.rectangle([11, 23, 12, 24], fill=NEON_CYAN)
    # Fade selon frame
    if frame > 0:
        alpha = int(255 * (1 - frame * 0.3))
        img.putalpha(alpha)


def build_spritesheet():
    sheet = Image.new("RGBA", (FRAMES * COLS, FRAMES * ROWS), TRANSPARENT)
    # Ligne 0 : down
    draw_hermes_down(sheet.crop((0, 0, FRAMES, FRAMES)).copy(), "idle", 0)
    f = sheet.crop((0, 0, FRAMES, FRAMES)).copy(); f.paste(draw_frame_to_sheet(0), (0, 0))
    # Simplifions : on dessine directement dans la sheet via sous-images

    frames_data = [
        # (col, row, draw_fn, pose, frame_idx)
        (0, 0, draw_hermes_down, "idle", 0),
        (1, 0, draw_hermes_down, "walk", 1),
        (2, 0, draw_hermes_down, "walk", 2),
        (3, 0, draw_hermes_down, "attack", 0),
        (0, 1, draw_hermes_up, "idle", 0),
        (1, 1, draw_hermes_up, "walk", 1),
        (2, 1, draw_hermes_up, "walk", 2),
        (3, 1, draw_hermes_up, "attack", 0),
        (0, 2, draw_hermes_right, "idle", 0),
        (1, 2, draw_hermes_right, "walk", 1),
        (2, 2, draw_hermes_right, "walk", 2),
        (3, 2, draw_hermes_right, "attack", 0),
        (0, 3, draw_hermes_right, "idle", 0),   # left = flip de right
        (1, 3, draw_hermes_right, "walk", 1),
        (2, 3, draw_hermes_right, "walk", 2),
        (3, 3, draw_hermes_right, "attack", 0),
    ]

    for col, row, fn, pose, fidx in frames_data:
        frame_img = Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)
        fn(frame_img, pose, fidx)
        if row == 3:  # flip horizontal pour "left"
            frame_img = frame_img.transpose(Image.FLIP_LEFT_RIGHT)
        sheet.paste(frame_img, (col * FRAMES, row * FRAMES))

    # Ligne 4 : hurt (1 frame répétée)
    hurt = Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)
    draw_hermes_hurt(hurt)
    for col in range(COLS):
        sheet.paste(hurt, (col * FRAMES, 4 * FRAMES))

    # Ligne 5 : death (4 frames de décomposition)
    for fidx in range(COLS):
        death = Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)
        draw_hermes_death(death, fidx)
        sheet.paste(death, (fidx * FRAMES, 5 * FRAMES))

    # Upscale x2 pour lisibilité
    sheet = sheet.resize((FRAMES * COLS * 2, FRAMES * ROWS * 2), Image.NEAREST)

    out = os.path.join(OUT_DIR, "hermes.png")
    sheet.save(out)
    print(f"  ✓ {out} ({sheet.size})")

    # Preview (zoom ×4)
    preview = sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST)
    preview.save(os.path.join(OUT_DIR, "hermes-preview.png"))

    # Icone 64x64 (portrait down idle)
    icon = Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)
    draw_hermes_down(icon, "idle", 0)
    icon = icon.resize((64, 64), Image.NEAREST)
    icon.save(os.path.join(OUT_DIR, "icon.png"))
    print(f"  ✓ icon.png")

    return out


# Stub supprimé (draw_frame_to_sheet n'est plus utilisé)
def draw_frame_to_sheet(*args, **kwargs):
    return Image.new("RGBA", (FRAMES, FRAMES), TRANSPARENT)


if __name__ == "__main__":
    print("Génération d'Hermes...")
    build_spritesheet()
    print("Terminé.")
