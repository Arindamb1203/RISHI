"""
Remove backgrounds from Observing.png and Good Morning.png using OpenCV GrabCut.
Black-background images (Naughty, Celebrating, Angry) are handled via CSS mix-blend-mode.
"""
import cv2
import numpy as np
from PIL import Image
import os

SPRITES = os.path.dirname(os.path.abspath(__file__))

def grabcut_remove_bg(src_path, dst_path, margin_pct=0.04):
    img = cv2.imread(src_path)
    h, w = img.shape[:2]

    # Bounding rect: small margin from edges so GrabCut knows bg corners
    m = int(min(h, w) * margin_pct)
    rect = (m, m, w - 2*m, h - 2*m)

    mask = np.zeros((h, w), np.uint8)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)

    cv2.grabCut(img, mask, rect, bgd, fgd, 8, cv2.GC_INIT_WITH_RECT)

    # PR_FGD (3) and FGD (1) → keep; everything else → discard
    mask2 = np.where((mask == 2) | (mask == 0), 0, 255).astype(np.uint8)

    # Slight feathering for natural edges
    mask2 = cv2.GaussianBlur(mask2, (3, 3), 0)

    # Convert to RGBA
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    rgba = np.dstack((img_rgb, mask2))
    out = Image.fromarray(rgba, 'RGBA')
    out.save(dst_path)
    print(f'Saved: {dst_path}  ({w}x{h} transparent bg)')

for fname in ['Observing.png', 'Good Morning.png']:
    src = os.path.join(SPRITES, fname)
    grabcut_remove_bg(src, src)

print('Done.')
