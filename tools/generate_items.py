"""
Génère les sprites d'items : mushroom (champignon lumineux) et lore_fragment.
Format 16x16 PNG avec transparence.
"""
import os
from PIL import Image, ImageDraw

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "game", "assets", "sprites", "items")
os.makedirs(OUT_DIR, exist_ok=True)


def draw_mushroom():
    """Champignon lumineux vert lime."""
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Tige
    d.rectangle([6, 8, 9, 13], fill=(230, 230, 200))
    d.rectangle([6, 12, 9, 13], fill=(180, 180, 150))
    # Chapeau
    d.ellipse([3, 4, 12, 11], fill=(130, 255, 100))
    d.rectangle([3, 8, 12, 11], fill=(100, 220, 80))
    # Glow néon
    d.ellipse([5, 6, 10, 9], fill=(200, 255, 180))
    # Points lumineux
    d.point([6, 7], fill=(255, 255, 255))
    d.point([9, 8], fill=(255, 255, 255))
    img = img.resize((32, 32), Image.NEAREST)
    img.save(os.path.join(OUT_DIR, "mushroom.png"))
    print("  ✓ mushroom.png")


def draw_lore_fragment():
    """Fragment de lore — éclat bleu cristallin."""
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Forme de cristal (losange)
    points = [(8, 2), (13, 8), (8, 14), (3, 8)]
    d.polygon(points, fill=(100, 180, 255))
    # Highlight
    d.polygon([(8, 3), (11, 7), (8, 7)], fill=(180, 220, 255))
    # Éclat central
    d.line([8, 4, 8, 12], fill=(255, 255, 255))
    # Halo
    d.point([4, 8], fill=(150, 200, 255))
    d.point([12, 8], fill=(150, 200, 255))
    img = img.resize((32, 32), Image.NEAREST)
    img.save(os.path.join(OUT_DIR, "lore_fragment.png"))
    print("  ✓ lore_fragment.png")


if __name__ == "__main__":
    print("Génération des items...")
    draw_mushroom()
    draw_lore_fragment()
    print("Terminé.")
