import os, re

PATH = os.path.join('public', 'parent.html')
with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()
h = h.replace('\r\n', '\n')

# 1. Fix button — onclick only, no ontouchstart
h = re.sub(
    r'<button([^>]*)ontouchstart="[^"]*"([^>]*)onclick="[^"]*"([^>]*)>',
    r'<button\1onclick="toggleHdrMenu(event)"\3>',
    h, count=1
)
print("Button: onclick only")

# 2. Add toggleHdrMenu function — inject before </script> closing tag
FN = """
function toggleHdrMenu(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  var d = document.getElementById('hdr-menu-dropdown');
  if (!d) return;
  d.style.display = (d.style.display === 'block') ? 'none' : 'block';
}
"""

if 'toggleHdrMenu' not in h or 'function toggleHdrMenu' not in h:
    # Inject before first </script>
    h = h.replace('</script>', FN + '\n</script>', 1)
    print("toggleHdrMenu function INJECTED")
else:
    print("Function already exists")

with open(PATH, 'w', encoding='utf-8', newline='\n') as f:
    f.write(h)
print("Saved")
print()
print("git add .")
print('git commit -m "Parent: inject missing toggleHdrMenu function"')
print("git push")
