import os
import sys

target = "const m=this._ink(t),g=void 0!==i.label?m:i.tint;"
replacement = 'const m=this._ink(t),g="none"===i.tint||!1===i.tint?void 0:(void 0!==i.label?m:i.tint);'

repos = [
    r"d:\Code\Antigravity\My_Projects\tradeboard",
    r"D:\Code\VS Code\tradeboard"
]

for repo in repos:
    for fname in ["openalgo-charts.mjs", "openalgo-charts.standalone.js"]:
        path = os.path.join(repo, "frontend", "node_modules", "openalgo-charts", "dist", fname)
        if not os.path.exists(path):
            print(f"Skipping non-existent {path}")
            continue
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        if target in content:
            new_content = content.replace(target, replacement)
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Successfully patched {path}")
        elif replacement in content:
            print(f"Already patched {path}")
        else:
            print(f"Target not found in {path}")
