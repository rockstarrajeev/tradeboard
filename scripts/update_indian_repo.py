import os
import shutil

indian_repo = r"D:\Code\VS Code\tradeboard"
my_repo = r"d:\Code\Antigravity\My_Projects\tradeboard"

# 1. Update blueprints/react_app.py
react_app_path = os.path.join(indian_repo, "blueprints", "react_app.py")
with open(react_app_path, "r", encoding="utf-8") as f:
    content = f.read()

route_code = """@react_bp.route("/chart-logo.png")
def serve_chart_logo():
    \"\"\"Serve chart watermark logo.\"\"\"
    if not is_react_frontend_available():
        return "Not found", 404
    return send_from_directory(FRONTEND_DIST, "chart-logo.png")
"""

if "serve_chart_logo" not in content:
    target = 'def serve_logo():\n    """Serve logo."""\n    if not is_react_frontend_available():\n        return "Not found", 404\n    return send_from_directory(FRONTEND_DIST, "logo.png")\n'
    if target in content:
        content = content.replace(target, target + "\n\n" + route_code)
        with open(react_app_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Added serve_chart_logo to Indian react_app.py")
    else:
        print("Target not found in Indian react_app.py")
else:
    print("Already in Indian react_app.py")

# 2. Copy chart-logo.png and softcorp-full-logo.png into images/ and public/ and dist/
for sub in ["public", "public/images", "dist", "dist/images"]:
    dest_dir = os.path.join(indian_repo, "frontend", *sub.split("/"))
    os.makedirs(dest_dir, exist_ok=True)
    for fname in ["chart-logo.png", "softcorp-full-logo.png"]:
        src_file = os.path.join(my_repo, "frontend", "public", fname)
        if os.path.exists(src_file):
            shutil.copy2(src_file, os.path.join(dest_dir, fname))
            print(f"Copied {fname} to {dest_dir}")

# 3. Copy frontend/src/lib/trading/chartLogo.ts
src_chart_logo = os.path.join(my_repo, "frontend", "src", "lib", "trading", "chartLogo.ts")
dst_chart_logo = os.path.join(indian_repo, "frontend", "src", "lib", "trading", "chartLogo.ts")
shutil.copy2(src_chart_logo, dst_chart_logo)
print("Copied chartLogo.ts to Indian repo")

# 4. Update frontend/src/lib/trading/terminal.ts
indian_terminal = os.path.join(indian_repo, "frontend", "src", "lib", "trading", "terminal.ts")
with open(indian_terminal, "r", encoding="utf-8") as f:
    term_content = f.read()

# Add import if missing
if "CHART_EMBLEM_DATA_URI" not in term_content:
    import_target = "import { runTransform } from 'openalgo-charts/transform'\n"
    import_repl = """import { runTransform } from 'openalgo-charts/transform'
import { CHART_EMBLEM_DATA_URI } from './chartLogo'

// Preload the Tradeboard emblem image early so it decodes in memory before chart initialization
const chartEmblemImage = typeof Image !== 'undefined' ? new Image() : null
if (chartEmblemImage) {
  chartEmblemImage.src = CHART_EMBLEM_DATA_URI
}
"""
    if import_target in term_content:
        term_content = term_content.replace(import_target, import_repl)
        print("Added emblem import to Indian terminal.ts")
    else:
        print("Import target not found in Indian terminal.ts")

# Replace branding configuration
old_branding = """      branding: {
        position: 'bottom-left',
        src: '/chart-logo.png',
        label: 'Chart by Tradeboard',
        href: 'https://docs.algo.wesoftcorp.com',
        height: 24,
      },
    })"""

new_branding = """      branding: {
        position: 'bottom-left',
        src: CHART_EMBLEM_DATA_URI,
        ...(chartEmblemImage && chartEmblemImage.complete && chartEmblemImage.naturalWidth > 0
          ? { image: chartEmblemImage }
          : {}),
        label: 'Chart by Tradeboard',
        href: 'https://docs.algo.wesoftcorp.com',
        height: 24,
        opacity: 1,
        tint: 'none',
      },
    })
    if (chartEmblemImage && !chartEmblemImage.complete) {
      chartEmblemImage.onload = () => {
        this.chart?.setBranding({
          position: 'bottom-left',
          src: CHART_EMBLEM_DATA_URI,
          image: chartEmblemImage,
          label: 'Chart by Tradeboard',
          href: 'https://docs.algo.wesoftcorp.com',
          height: 24,
          opacity: 1,
          tint: 'none',
        })
      }
    }"""

if old_branding in term_content:
    term_content = term_content.replace(old_branding, new_branding)
    with open(indian_terminal, "w", encoding="utf-8") as f:
        f.write(term_content)
    print("Updated branding in Indian terminal.ts")
elif "opacity: 1" in term_content:
    print("Indian terminal.ts already has new branding")
else:
    print("Branding target not matched in Indian terminal.ts")
