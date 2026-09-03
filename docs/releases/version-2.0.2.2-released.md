# Version 2.0.2.2 Released

**Date: 29th August 2026**

**Stability and Security Release: closes the eventlet boundary defects behind the long-standing "the first order works and the next one hangs the app" reports; completes a four-pass broker credential redaction sweep across 30 plugins; upgrades the charting terminal to openalgo-charts 1.8.2 with user indicator files; repairs Motilal Oswal and adds GTT for three more brokers; and audits the Flow automation node contract across all 61 types.**

This release spans 143 commits since 2.0.2.1, dominated by two tree-wide sweeps:

1. **The eventlet boundary**: four defects that caused application hangs under async socket workloads. A real thread contending on a green lock, a green logging handler lock, `PRAGMA busy_timeout` waiting inside C while holding the hub, and `run_coroutine_threadsafe` failing to wake its caller.
2. **Broker credential redaction**: 73 bare `logging.getLogger()` call sites across 30 plugins bypassing `SensitiveDataFilter`, credentials interpolated into messages in 12 plugins, 35 sites leaking a secret inside a URL, payload, headers dict or exception message, and a defect in the Bearer pattern itself.

Alongside those: Dhan master contract and symbol construction fixes, runtime-loaded user chart indicators, the Motilal Oswal plugin repair, GTT for Angel One, Fyers and Upstox, the Flow node-contract audit across 61 node types, and frontend asset precompression at startup.

---

### Key Features & Enhancements

* **Eventlet and Cross-Thread Stability**:
  - Eliminated green thread lock contention across worker threads via `utils/real_threading.py`.
  - Replaced blocking database pragmas with cooperative SQLite lock management via `upgrade/_pragmas.py`.
  - Resolved eventlet logging handler lock starvation.

* **Security & Credential Redaction**:
  - Full redaction sweep across all 30 broker plugins to prevent secrets from appearing in error traces or URLs.
  - Hardened CORS configuration (`cors.py`): cross-origin requests are rejected by default unless explicitly enabled.
  - Client error report URL sanitization to prevent leaking reset tokens and OAuth codes in server logs.

* **Broker Integrations**:
  - **Dhan**: Master contract parsing, symbol construction, NCO segment support, and unsubscribe handling.
  - **Motilal Oswal**: Modernized plugin, WebSocket connection pooling, and leak fixes.
  - **GTT Support**: Added GTT order placement for Angel One, Fyers, and Upstox.
  - **Angel One & Zerodha**: Holdings LTP, average price calculation, and null-row resilience.
  - **Flattrade**: Collateral calculation fixes.
  - **TradeSmart**: Order tagging and 100/sec quote budget enforcement.
  - **Shoonya**: Quote guard against wrong-instrument quotes.
  - **Aliceblue**: Token format fix, index history, error code mapping, and WebSocket reuse.
  - **HDFC Securities (InvestRight)**: New broker plugin integration.
  - **Samco**: Upgraded to Trade API v3.2.

* **Charting Terminal & Indicators**:
  - Upgraded to `openalgo-charts` **1.8.2** (11 input types, OHLC plot groups, drawings, stop-limit drag fix).
  - Runtime-loaded user chart indicators (`blueprints/custom_indicators.py`, `strategies/indicators/`).
  - Terminal market replay, chart settings dialog, and 86 indicator search.

* **Flow Automation & Strategy Engine**:
  - Comprehensive Flow 61-node contract validation (`services/flow_node_contracts.py`, `services/flow_workflow_validator.py`, `services/flow_executor_service.py`).
  - Market hours window, payload-driven order fields, MCX commodity options, and multi-leg option baskets.
  - Strategy Builder carry curves, contract safety, and live Greeks streaming.

* **Sandbox Engine & Preserved Features**:
  - Database clock session boundary (`sandbox/session_boundary.py`).
  - MIS square-off by `updated_at` session boundary.
  - Concurrent position update serialization.
  - Fully preserved **Calendar for P&L Record in Sandbox** with monthly/annual heatmaps and daily breakdown.
  - Custom starting capitals ($50 to $10M) and custom leverage settings intact.

---

### Dependencies

* `openalgo-charts`: **1.8.2**
* `zmq==0.0.0`: Removed from dependency manifests as it was a placeholder package.
* PyPI SDK: `openalgo==2.0.3`

---

### Developer & Contact Info

* **Platform**: Tradeboard
* **Developer**: Rajeev Upadhyay
* **Website**: [rajeevupadhyay.com](https://rajeevupadhyay.com)
* **Documentation**: [docs.rajeevupadhyay.com](https://docs.rajeevupadhyay.com)
* **Contact**: [rajeev.upadhyay@live.in](mailto:rajeev.upadhyay@live.in)
* **Repository**: [github.com/rockstarrajeev/tradeboard](https://github.com/rockstarrajeev/tradeboard)
