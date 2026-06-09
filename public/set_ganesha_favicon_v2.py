"""
RISHI favicon fix v2 -> guaranteed random Ganesha tab icon (kills the bolt).

Run from inside public/:
    cd D:\rishi\public
    python set_ganesha_favicon_v2.py

Make sure public/icons/fav-1.png ... fav-8.png exist (from rishi-ganesha-favicon.zip).
Safe to run more than once. Supersedes the earlier script.
"""
import os, re

# 1) remove any static favicon files at root (incl. the leftover lightning ones)
for fn in ["favicon.svg", "favicon.ico", "favicon-16x16.png", "favicon-32x32.png",
           "apple-touch-icon.png", "icon-192.png", "icon-512.png"]:
    if os.path.exists(fn):
        os.remove(fn); print("deleted:", fn)

# 2) blocks to strip from every page (old R links + old buggy v1 injector)
OLD_R   = re.compile(r"[ \t]*<!-- RISHI-FAVICONS -->.*?apple-touch-icon\.png\">", re.I | re.S)
OLD_V1  = re.compile(r"[ \t]*<!-- RISHI-FAVICON-GANESHA -->.*?</script>", re.I | re.S)
V2_MARK = "RISHI-FAVICON-GANESHA-V2"

# 3) corrected injector: runs after head is parsed, removes ALL icon tags, adds Ganesha last
NEW = """<!-- RISHI-FAVICON-GANESHA-V2 -->
  <script>
  (function(){
    function setFav(){
      document.querySelectorAll('link[rel~="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]')
        .forEach(function(e){e.parentNode.removeChild(e);});
      var l=document.createElement('link');
      l.rel='icon'; l.type='image/png';
      l.href='/icons/fav-'+(1+Math.floor(Math.random()*8))+'.png?v=2';
      document.head.appendChild(l);
    }
    if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',setFav);}
    else{setFav();}
  })();
  </script>"""

HEAD = re.compile(r"(<head[^>]*>)", re.I)

fixed = 0
for root, _, files in os.walk("."):
    for name in files:
        if not name.lower().endswith(".html"):
            continue
        path = os.path.join(root, name)
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            html = f.read()
        orig = html
        html = OLD_R.sub("", html)
        html = OLD_V1.sub("", html)
        if V2_MARK not in html and HEAD.search(html):
            html = HEAD.sub(lambda m: m.group(1) + "\n  " + NEW, html, count=1)
        if html != orig:
            with open(path, "w", encoding="utf-8") as f:
                f.write(html)
            fixed += 1
            print("fixed:", path)

print(f"\nDone. pages updated = {fixed}")
