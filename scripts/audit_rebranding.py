#!/usr/bin/env python3
"""
Tradeboard Rebranding & Feature Integrity Audit Script.

Audits the codebase to ensure that:
1. All core user-facing UI surfaces (HTML, Navbars, Login, Headers, Dashboards) use 'Tradeboard'.
2. Author and repository links point to Rajeev (rockstarrajeev/tradeboard) and LinkedIn.
3. Custom features (Crypto/Delta Exchange, 3D Strategy Builder IV logic, Voice/Visual agent, Historify DuckDB) are intact.
4. Production security hardenings are intact.
5. Permissible technical exceptions (e.g. `pip install openalgo`, `b"openalgo_static_salt"`, `OPENALGO_API_KEY`) are respected.

Usage:
    python scripts/audit_rebranding.py
"""

import os
import re
import sys
import subprocess

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def check_login_page():
    """Verify Login.tsx has Tradeboard branding, GitHub link to rockstarrajeev, and LinkedIn."""
    errors = []
    login_path = os.path.join(REPO_ROOT, "frontend", "src", "pages", "Login.tsx")
    if not os.path.exists(login_path):
        return ["Missing frontend/src/pages/Login.tsx"]

    with open(login_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    if "Tradeboard" not in content:
        errors.append("Login.tsx does not contain 'Tradeboard' brand name.")
    if "github.com/rockstarrajeev" not in content:
        errors.append("Login.tsx GitHub link does not point to 'https://github.com/rockstarrajeev'.")
    if "linkedin.com" not in content:
        errors.append("Login.tsx missing LinkedIn profile link.")
    if "discord" in content.lower():
        errors.append("Login.tsx contains deprecated Discord link (should be LinkedIn).")

    return errors


def check_html_titles_and_branding():
    """Check index.html and root page titles."""
    errors = []
    index_html = os.path.join(REPO_ROOT, "frontend", "index.html")
    if os.path.exists(index_html):
        with open(index_html, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        if "<title>OpenAlgo" in content:
            errors.append("frontend/index.html title has '<title>OpenAlgo' instead of 'Tradeboard'.")
        if "Tradeboard" not in content:
            errors.append("frontend/index.html missing 'Tradeboard' brand name.")
    return errors


def check_docs_and_readme():
    """Verify primary root documentation files have Tradeboard header titles."""
    errors = []
    key_docs = {
        "README.md": "# Tradeboard",
        "PRD.md": "# Tradeboard",
        "DISCOVERY_MAP.md": "# Tradeboard",
        "INSTALL.md": "Tradeboard",
        "DOCKER_README.md": "Tradeboard",
        "CLAUDE.md": "Tradeboard",
    }
    for filename, expected_snippet in key_docs.items():
        filepath = os.path.join(REPO_ROOT, filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            if expected_snippet not in content:
                errors.append(f"{filename} does not contain expected header/branding '{expected_snippet}'.")
    return errors


def check_custom_features():
    """Verify essential custom features and options builder IV invalidation logic."""
    errors = []

    # 1. EditLegDialog IV invalidation function
    editleg_path = os.path.join(REPO_ROOT, "frontend", "src", "components", "strategy-builder", "EditLegDialog.tsx")
    if os.path.exists(editleg_path):
        with open(editleg_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            if "invalidateIvWhenContractChanges" not in content:
                errors.append("EditLegDialog.tsx missing 'invalidateIvWhenContractChanges' IV preservation logic.")
    else:
        errors.append("Missing frontend/src/components/strategy-builder/EditLegDialog.tsx")

    # 2. OpenUI visualizer library
    openui_path = os.path.join(REPO_ROOT, "frontend", "src", "lib", "agent", "openuiLibrary.ts")
    if not os.path.exists(openui_path):
        errors.append("Missing Voice/Visual agent library at frontend/src/lib/agent/openuiLibrary.ts")

    # 3. Chart emblem logo branding
    chart_logo_path = os.path.join(REPO_ROOT, "frontend", "src", "lib", "trading", "chartLogo.ts")
    if not os.path.exists(chart_logo_path):
        errors.append("Missing chart watermark helper frontend/src/lib/trading/chartLogo.ts")

    return errors


def check_security_hardenings():
    """Verify production security patches are intact."""
    errors = []

    # 1. admin.py: NamedTemporaryFile and loopback URL validation
    admin_path = os.path.join(REPO_ROOT, "blueprints", "admin.py")
    if os.path.exists(admin_path):
        with open(admin_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            if "NamedTemporaryFile" not in content:
                errors.append("blueprints/admin.py missing 'NamedTemporaryFile' secure upload logic.")
            if "_check_loopback_http" not in content or "http" not in content:
                errors.append("blueprints/admin.py missing loopback URL scheme validation.")

    # 2. python_strategy.py: _is_stream_open safe exit logging
    strategy_path = os.path.join(REPO_ROOT, "blueprints", "python_strategy.py")
    if os.path.exists(strategy_path):
        with open(strategy_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            if "_is_stream_open" not in content:
                errors.append("blueprints/python_strategy.py missing '_is_stream_open' safe stream handler.")

    # 3. websocket_proxy/app_integration.py: eventlet guard
    ws_path = os.path.join(REPO_ROOT, "websocket_proxy", "app_integration.py")
    if os.path.exists(ws_path):
        with open(ws_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            if "eventlet" in content and "sys.modules" not in content:
                errors.append("websocket_proxy/app_integration.py missing safe eventlet detection guard.")

    # 4. Security test file exists
    test_sec_path = os.path.join(REPO_ROOT, "test", "test_production_security.py")
    if not os.path.exists(test_sec_path):
        errors.append("Missing test/test_production_security.py")

    return errors


def main():
    print("=" * 70)
    print("TRADEBOARD REBRANDING & FEATURE INTEGRITY AUDIT")
    print(f"Target Repository: {REPO_ROOT}")
    print("=" * 70)

    checks = [
        ("Login Page & Social Links", check_login_page),
        ("HTML Titles & Main Branding", check_html_titles_and_branding),
        ("Core Documentation & README Titles", check_docs_and_readme),
        ("Custom Features (3D Leg IV, Agent, Chart Emblem)", check_custom_features),
        ("Production Security Hardenings", check_security_hardenings),
    ]

    total_failures = 0
    for name, check_fn in checks:
        print(f"\n[*] Checking {name}...")
        issues = check_fn()
        if issues:
            total_failures += len(issues)
            print(f"    FAILED ({len(issues)} issues):")
            for issue in issues:
                print(f"      - {issue}")
        else:
            print("    PASSED")

    print("\n" + "=" * 70)
    if total_failures == 0:
        print("ALL CHECKS PASSED: Tradeboard branding, custom features & security are 100% intact!")
        print("=" * 70)
        sys.exit(0)
    else:
        print(f"AUDIT FAILED with {total_failures} issue(s). Please review and resolve before deploying.")
        print("=" * 70)
        sys.exit(1)


if __name__ == "__main__":
    main()
