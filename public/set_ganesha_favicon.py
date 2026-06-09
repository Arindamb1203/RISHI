"""
RISHI favicon reset -> random Ganesha tab icon.

Run from inside your public/ folder:
    cd D:\rishi\public
    python set_ganesha_favicon.py

What it does:
  1. Deletes the old favicon files (the 'R' set and any leftover lightning favicon)
     from public/ root.
  2. Removes the old favicon <link> block I had inserted into every page's <head>.
  3. Injects an invisible script into each page's <head> that, on every load,
     removes any existing tab icon and sets a RANDOM one of your 8 Ganesha images
     (public/icons/fav-1.png ... fav-8.png) as the browser tab icon.
     Nothing visible is added to any page.

Safe to run more than once.
"""
import os, re

# 1) delete old icon files in the current (public) folder root
OLD_FILES = [
    "favicon.svg", "favicon.ico",
    "favicon-16x16.png", "favicon-32x32.png",
    "apple-touch-icon.png", "icon-192.png", "icon-512.png",
]
for fn in OLD_FILES:
    if os.path.exists(fn):
        os.remove(fn)
        print("deleted:", fn)
# remove old unused image sets if present
for fn in os.listdir("icons") if os.path.isdir("icons") else []:
    if re.match(r"(logo|tab)-\d+\.png$", fn):
        os.remove(os.path.join("icons", fn))
        print("deleted: icons/" + fn)

# 2) old <link> block I previously inserted (marker-bounded)
OLD_BLOCK = re.compile(
    r"[ \t]*<!-- RISHI-FAVICONS -->.*?apple-touch-icon\.png\">",
    re.IGNORECASE | re.DOTALL,
)

# 3) new invisible injector
NEW_MARK = "RISHI-FAVICON-GANESHA"
NEW_BLOCK = """<!-- RISHI-FAVICON-GANESHA -->
  <script>
  (function(){
    document.querySelectorAll('link[rel~="icon"],link[rel="shortcut icon"]').forEach(function(e){e.parentNode.removeChild(e);});
    var l=document.createElement('link');
    l.rel='icon'; l.type='image/png';
    l.href='/icons/fav-'+(1+Math.floor(Math.random()*8))+'.png';
    document.head.appendChild(l);
  })();
  </script>"""

HEAD = re.compile(r"(<head[^>]*>)", re.IGNORECASE)

added = cleaned = 0
for root, _, files in os.walk("."):
    for name in files:
        if not name.lower().endswith(".html"):
            continue
        path = os.path.join(root, name)
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            html = f.read()
        orig = html
        html, n = OLD_BLOCK.subn("", html)
        if n:
            cleaned += 1
        if NEW_MARK not in html and HEAD.search(html):
            html = HEAD.sub(lambda m: m.group(1) + "\n  " + NEW_BLOCK, html, count=1)
            added += 1
        if html != orig:
            with open(path, "w", encoding="utf-8") as f:
                f.write(html)
            print("updated:", path)

print(f"\nDone. old-block-removed={cleaned}  ganesha-injected={added}")
