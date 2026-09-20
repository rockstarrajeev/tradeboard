# Rule: Upstream Upgrade Protocol & Tradeboard Preservation

## Objective
When tasked with pulling, porting, or merging new upstream features, broker integrations, or bug fixes from the `openalgo` repository (`https://github.com/marketcalls/openalgo.git`):
**Preserve 100% of Tradeboard's brand identity, custom features, UI layouts, and security hardenings.**

## Non-Negotiable Invariants

### 1. Rebranding & Identity
- **Product Name**: Always **Tradeboard**. Never overwrite or revert to OpenAlgo in UI titles, headers, navbars, docs, or scripts.
- **Author & Repositories**:
  - Author: Rajeev (`rockstarrajeev`)
  - Repo: `https://github.com/rockstarrajeev/tradeboard`
  - Social: LinkedIn link on Login page (never Discord).
- **Logos**: Always keep Tradeboard logos in `frontend/public/`, sidebar, and chart emblem.

### 2. UI Layouts & Styling
- Do NOT revert the modernized glassmorphism and animated gradient cards with hover effects on `/dashboard`, `/platforms`, `/logs`, `/tools`, and `/login`.
- Do NOT hide or break post-login sidebar and header branding.

### 3. Custom Features & Superpowers
- **Crypto Derivatives**: Delta Exchange broker integration and crypto order routing.
- **3D Strategy Builder**: Preserve `invalidateIvWhenContractChanges()` in `frontend/src/components/strategy-builder/EditLegDialog.tsx`.
- **Voice/Visual Agent**: OpenUI visualizer library at `frontend/src/lib/agent/openuiLibrary.ts`.
- **Historify DuckDB**: Historical analytics engine.
- **Security Hardening**:
  - `blueprints/admin.py`: `NamedTemporaryFile` + `try...finally` cleanup and strict loopback URL validation.
  - `blueprints/python_strategy.py`: `_is_stream_open` safe exit handler and restricted permissions.
  - `websocket_proxy/app_integration.py`: `eventlet` guard.

### 4. Upgrade Workflow
1. Never perform a blind `git merge` or `git pull`. Always review the upstream diff with `git fetch openalgo` and `git diff HEAD..openalgo/main --stat`.
2. Port additions (new brokers, indicator functions, or bug fixes) selectively.
3. Always run `python scripts/audit_rebranding.py` to confirm zero brand regressions.
4. Always verify with tests: `pytest test/test_production_security.py` and `cd frontend && npm test && npm run build`.
5. Precompress assets: `python -m utils.precompress_assets`.
6. Always mirror the changes across both repositories:
   - Crypto Repo: `d:\Code\Antigravity\My_Projects\tradeboard`
   - Indian Stock Repo: `D:\Code\VS Code\tradeboard`
