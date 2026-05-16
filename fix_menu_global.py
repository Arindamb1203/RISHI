import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# 1. Remove the trapped function from inside the closure
h = re.sub(
    r'\nfunction toggleHdrMenu\(e\) \{.*?\}\n',
    '\n',
    h, flags=re.DOTALL, count=1
)
print("Removed trapped toggleHdrMenu")

# 2. Add as GLOBAL function in its own script tag before </body>
GLOBAL_SCRIPT = """
<script>
function toggleHdrMenu(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  var d = document.getElementById('hdr-menu-dropdown');
  var arrow = document.getElementById('hdr-menu-arrow');
  if (!d) return;
  var open = d.style.display === 'block';
  d.style.display = open ? 'none' : 'block';
  if (arrow) arrow.textContent = open ? '\\u25be' : '\\u25b4';
}
</script>
"""

h = h.replace('</body>', GLOBAL_SCRIPT + '</body>')
print("toggleHdrMenu added as GLOBAL script before </body>")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent: toggleHdrMenu as global function - fixes onclick"')
print("git push")
