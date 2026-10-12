"""Retoque de las fotos originales: quita textos y logos sobreimpresos.

Genera img/retocadas/*.png, que despues toma scripts/optimize-images.mjs.
Solo hace falta volver a correrlo si cambian las fotos originales.
Requiere: pip install opencv-python-headless numpy
Uso: python scripts/retouch.py
"""
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "img" / "productos"
OUT = ROOT / "img" / "retocadas"
WA = "WhatsApp Image 2026-10-11 at "

STAGE = (255, 255, 255)  # blanco puro: en la web se funde con el recuadro (mix-blend-multiply)


def bottle():
    """Recorta la botella del flyer y la monta sobre fondo de estudio."""
    img = cv2.imread(str(SRC / f"{WA}11.43.24 (1).jpeg"))
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    roi = np.zeros((h, w), bool)
    roi[152:770, 135:395] = True
    mask[roi] = cv2.GC_PR_BGD
    mask[roi & (gray < 70)] = cv2.GC_PR_FGD
    mask[400:720, 178:330] = cv2.GC_FGD  # cuerpo
    mask[235:380, 218:288] = cv2.GC_FGD  # cuello
    mask[200:360, 0:176] = cv2.GC_BGD  # texto del flyer
    cv2.circle(mask, (452, 105), 92, cv2.GC_BGD, -1)  # logo del flyer
    cv2.grabCut(img, mask, None, np.zeros((1, 65)), np.zeros((1, 65)), 8, cv2.GC_INIT_WITH_MASK)
    fg = ((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)).astype(np.uint8)
    _, labels, stats, _ = cv2.connectedComponentsWithStats(fg)
    fg = (labels == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])).astype(np.uint8)

    # Las flores tapan la base izquierda: el cuerpo es convexo, asi que se
    # completa la silueta con su envolvente y se reconstruye lo tapado.
    original = fg.copy()
    pts = cv2.findNonZero(np.where(np.arange(h)[:, None] >= 420, fg, 0).astype(np.uint8))
    cv2.fillConvexPoly(fg, cv2.convexHull(pts), 1)
    hole = ((fg == 1) & (original == 0)).astype(np.uint8)
    lower_left = np.zeros_like(fg)
    lower_left[540:, :182] = 1
    hole |= ((gray > 75) & (fg == 1) & (lower_left == 1)).astype(np.uint8)
    hole = cv2.dilate(hole, np.ones((5, 5), np.uint8)) & fg
    img = cv2.inpaint(img, hole * 255, 6, cv2.INPAINT_TELEA)

    # Recorte, ampliacion y borde suavizado
    ys, xs = np.where(fg)
    y0, y1, x0, x1 = ys.min() - 4, ys.max() + 5, xs.min() - 4, xs.max() + 5
    scale = 2.1
    cut = cv2.resize(img[y0:y1, x0:x1], None, fx=scale, fy=scale, interpolation=cv2.INTER_LANCZOS4)
    alpha = cv2.resize(fg[y0:y1, x0:x1] * 255, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 1.1)
    alpha = np.clip((alpha.astype(np.float32) - 96) * 2.2, 0, 255) / 255.0  # contrae 1px el borde

    ch, cw = cut.shape[:2]
    W, H = 1200, 1500
    canvas = np.full((H, W, 3), STAGE, np.float32)
    ox, oy = (W - cw) // 2, H - ch - 110
    # sombra de apoyo
    shadow = np.zeros((H, W), np.float32)
    cv2.ellipse(shadow, (W // 2, oy + ch - 6), (int(cw * 0.36), 20), 0, 0, 360, 1.0, -1)
    shadow = cv2.GaussianBlur(shadow, (0, 0), 22)[..., None]
    canvas = canvas * (1 - 0.38 * shadow) + np.array((60, 60, 60), np.float32) * 0.38 * shadow
    a = alpha[..., None]
    canvas[oy : oy + ch, ox : ox + cw] = cut * a + canvas[oy : oy + ch, ox : ox + cw] * (1 - a)
    cv2.imwrite(str(OUT / "botella-venecia.png"), canvas.astype(np.uint8))


def dispenser():
    """Aisla el dispenser de la foto ambientada y borra las varillas vecinas."""
    img = cv2.imread(str(SRC / f"{WA}11.45.41.jpeg"))
    crop = img[13:463, 0:360].copy()
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    sticks = np.zeros(gray.shape, np.uint8)
    sticks[0:140, 296:360] = (gray[0:140, 296:360] < 120).astype(np.uint8) * 255
    sticks = cv2.dilate(sticks, np.ones((7, 7), np.uint8))
    crop = cv2.inpaint(crop, sticks, 7, cv2.INPAINT_TELEA)
    cv2.imwrite(str(OUT / "dispenser-vidrio.png"), crop)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    bottle()
    dispenser()
    print("ok", OUT)
