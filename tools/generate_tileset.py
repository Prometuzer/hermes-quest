"""
Génère le tileset de la forêt.
12 tuiles 16x16 organisées en grille 4 colonnes x 3 lignes.

Indices (doivent correspondre à l'enum T dans Forest.gd) :
  0=grass_a, 1=grass_b, 2=path, 3=tree,
  4=flower_red, 5=flower_yellow, 6=flower_white,
  7=water_a, 8=water_b, 9=stone, 10=bush, 11=grass_a_bis
"""
import os, random
from PIL import Image, ImageDraw

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "game", "assets", "sprites", "tiles")
os.makedirs(OUT_DIR, exist_ok=True)

TILE = 16
COLS = 4
ROWS = 3

# Palette forêt
GRASS_A = (74, 124, 58)
GRASS_B = (90, 140, 70)
GRASS_DARK = (50, 90, 40)
PATH = (160, 130, 85)
PATH_DARK = (120, 95, 60)
TREE_TRUNK = (90, 55, 35)
TREE_LEAVES = (45, 110, 50)
TREE_LEAVES_DARK = (30, 80, 35)
WATER_A = (60, 110, 180)
WATER_B = (80, 140, 200)
WATER_DEEP = (40, 80, 140)
STONE = (130, 130, 135)
STONE_DARK = (95, 95, 100)
BUSH = (55, 130, 55)
BUSH_DARK = (35, 90, 40)
FLOWER_R = (220, 60, 90)
FLOWER_Y = (240, 210, 70)
FLOWER_W = (240, 240, 240)
FLOWER_CENTER = (255, 200, 50)

random.seed(7)


def noise(draw, x0, y0, color, density=0.15, variance=20):
    """Ajoute du bruit pixel pour un effet naturel."""
    for y in range(y0, y0 + TILE):
        for x in range(x0, x0 + TILE):
            if random.random() < density:
                v = random.randint(-variance, variance)
                c = (max(0, min(255, color[0] + v)),
                     max(0, min(255, color[1] + v)),
                     max(0, min(255, color[2] + v)), 255)
                draw.point([x, y], fill=c)


def draw_grass(img, x0, y0, variant=0):
    d = ImageDraw.Draw(img)
    base = GRASS_A if variant == 0 else GRASS_B
    d.rectangle([x0, y0, x0 + TILE - 1, y0 + TILE - 1], fill=base)
    noise(d, x0, y0, base, density=0.2, variance=15)
    # Petites herbes
    for _ in range(5):
        gx = x0 + random.randint(0, TILE - 1)
        gy = y0 + random.randint(8, TILE - 1)
        d.point([gx, gy], fill=GRASS_DARK)
        d.point([gx, gy - 1], fill=GRASS_DARK)


def draw_path(img, x0, y0):
    d = ImageDraw.Draw(img)
    d.rectangle([x0, y0, x0 + TILE - 1, y0 + TILE - 1], fill=PATH)
    noise(d, x0, y0, PATH, density=0.25, variance=15)
    # Petites pierres
    for _ in range(3):
        sx = x0 + random.randint(2, TILE - 4)
        sy = y0 + random.randint(2, TILE - 4)
        d.rectangle([sx, sy, sx + 1, sy + 1], fill=STONE_DARK)


def draw_tree(img, x0, y0):
    d = ImageDraw.Draw(img)
    # Fond herbe
    d.rectangle([x0, y0, x0 + TILE - 1, y0 + TILE - 1], fill=GRASS_A)
    noise(d, x0, y0, GRASS_A, density=0.15, variance=10)
    # Tronc
    d.rectangle([x0 + 6, y0 + 11, x0 + 9, y0 + 15], fill=TREE_TRUNK)
    # Feuillage (cercle pixel)
    d.ellipse([x0 + 2, y0 + 1, x0 + 13, y0 + 12], fill=TREE_LEAVES)
    # Ombres feuillage
    d.rectangle([x0 + 3, y0 + 8, x0 + 6, y0 + 11], fill=TREE_LEAVES_DARK)
    d.rectangle([x0 + 9, y0 + 9, x0 + 12, y0 + 11], fill=TREE_LEAVES_DARK)
    # Highlights
    d.point([x0 + 4, y0 + 3], fill=(120, 180, 90))
    d.point([x0 + 5, y0 + 4], fill=(120, 180, 90))


def draw_flower(img, x0, y0, color):
    d = ImageDraw.Draw(img)
    draw_grass(img, x0, y0, variant=0)
    # Tige
    d.point([x0 + 8, y0 + 11], fill=GRASS_DARK)
    d.point([x0 + 8, y0 + 10], fill=GRASS_DARK)
    # Pétales (5 pixels autour du centre)
    cx, cy = x0 + 8, y0 + 7
    for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2), (-1, -1), (1, 1)]:
        d.point([cx + dx, cy + dy], fill=color)
    # Centre
    d.point([cx, cy], fill=FLOWER_CENTER)


def draw_water(img, x0, y0, deep=False):
    d = ImageDraw.Draw(img)
    base = WATER_DEEP if deep else WATER_A
    d.rectangle([x0, y0, x0 + TILE - 1, y0 + TILE - 1], fill=base)
    # Vagues
    wave_color = WATER_B if not deep else WATER_A
    for i in range(0, TILE, 4):
        d.line([x0 + i, y0 + 3, x0 + i + 2, y0 + 3], fill=wave_color)
        d.line([x0 + i + 2, y0 + 9, x0 + i + 4, y0 + 9], fill=wave_color)
        d.line([x0 + i + 1, y0 + 13, x0 + i + 3, y0 + 13], fill=wave_color)


def draw_stone(img, x0, y0):
    d = ImageDraw.Draw(img)
    draw_grass(img, x0, y0, variant=1)
    # Pierre principale
    d.ellipse([x0 + 3, y0 + 5, x0 + 12, y0 + 12], fill=STONE)
    # Ombre
    d.rectangle([x0 + 4, y0 + 10, x0 + 11, y0 + 12], fill=STONE_DARK)
    # Highlight
    d.point([x0 + 6, y0 + 6], fill=(180, 180, 185))


def draw_bush(img, x0, y0):
    d = ImageDraw.Draw(img)
    draw_grass(img, x0, y0, variant=0)
    d.ellipse([x0 + 2, y0 + 4, x0 + 13, y0 + 13], fill=BUSH)
    d.rectangle([x0 + 3, y0 + 10, x0 + 12, y0 + 13], fill=BUSH_DARK)
    # Baies
    d.point([x0 + 5, y0 + 7], fill=FLOWER_R)
    d.point([x0 + 9, y0 + 6], fill=FLOWER_R)
    d.point([x0 + 7, y0 + 9], fill=FLOWER_R)


def build_tileset():
    sheet = Image.new("RGBA", (TILE * COLS, TILE * ROWS), (0, 0, 0, 0))
    
    tiles = [
        (0, 0, lambda: draw_grass(sheet, 0, 0, 0)),        # 0 grass_a
        (1, 0, lambda: draw_grass(sheet, TILE, 0, 1)),     # 1 grass_b
        (2, 0, lambda: draw_path(sheet, TILE * 2, 0)),     # 2 path
        (3, 0, lambda: draw_tree(sheet, TILE * 3, 0)),     # 3 tree
        (0, 1, lambda: draw_flower(sheet, 0, TILE, FLOWER_R)),  # 4 flower_red
        (1, 1, lambda: draw_flower(sheet, TILE, TILE, FLOWER_Y)), # 5 flower_yellow
        (2, 1, lambda: draw_flower(sheet, TILE * 2, TILE, FLOWER_W)), # 6 flower_white
        (3, 1, lambda: draw_water(sheet, TILE * 3, TILE, deep=False)), # 7 water_a
        (0, 2, lambda: draw_water(sheet, 0, TILE * 2, deep=True)),     # 8 water_b
        (1, 2, lambda: draw_stone(sheet, TILE, TILE * 2)),             # 9 stone
        (2, 2, lambda: draw_bush(sheet, TILE * 2, TILE * 2)),          # 10 bush
        (3, 2, lambda: draw_grass(sheet, TILE * 3, TILE * 2, 0)),      # 11 grass_a_bis
    ]
    
    for col, row, draw_fn in tiles:
        random.seed(col * 10 + row + 7)
        draw_fn()
    
    # Format natif 16x16 (pour match TILE_SIZE dans Forest.gd)
    # Pas d'upscale — Godot gère le zoom via la caméra
    
    out = os.path.join(OUT_DIR, "forest-tiles.png")
    sheet.save(out)
    print(f"  ✓ {out} ({sheet.size})")
    
    # Preview grossi (×4) pour inspection visuelle
    preview = sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST)
    preview.save(os.path.join(OUT_DIR, "forest-tiles-preview.png"))
    print(f"  ✓ forest-tiles-preview.png ({preview.size})")


if __name__ == "__main__":
    print("Génération du tileset forêt...")
    build_tileset()
    print("Terminé.")
