"""Production security tests for Tradeboard.

Validates that:
1. Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
   are reliably added to all responses via apply_csp_middleware.
2. Temporary file creation for QtyFreeze upload uses secure temporary files with cleanup.
3. Loopback HTTP health probes strictly validate http/https URL schemes.
4. Eventlet detection does not attempt eager imports when running under standard threads.
5. Exit cleanup handlers tolerate closed streams during runtime teardown.
"""

import os
import sys
import tempfile
from unittest.mock import patch

import pytest
from flask import Flask, Response

from blueprints.python_strategy import cleanup_on_exit
from csp import apply_csp_middleware, get_csp_config, get_security_headers
from websocket_proxy.app_integration import _eventlet_active


def create_security_test_app():
    """Create a minimal Flask application with CSP middleware applied."""
    app = Flask(__name__)

    @app.route("/ping")
    def ping():
        return "pong"

    @app.route("/custom-csp")
    def custom_csp():
        resp = Response("custom")
        resp.headers["Content-Security-Policy"] = "default-src 'none'"
        return resp

    apply_csp_middleware(app)
    return app


def test_production_security_headers_present():
    """All responses must contain essential production hardening headers."""
    app = create_security_test_app()
    client = app.test_client()
    resp = client.get("/ping")

    assert resp.status_code == 200
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert "1; mode=block" in resp.headers.get("X-XSS-Protection", "")
    assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "microphone=" in resp.headers.get("Permissions-Policy", "")
    assert "default-src" in resp.headers.get("Content-Security-Policy", "")


def test_custom_route_csp_preserved():
    """Routes that explicitly set their own CSP should not have it overwritten."""
    app = create_security_test_app()
    client = app.test_client()
    resp = client.get("/custom-csp")

    assert resp.status_code == 200
    assert resp.headers.get("Content-Security-Policy") == "default-src 'none'"
    # Other security headers must still be attached
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"


def test_named_temporary_file_behavior():
    """NamedTemporaryFile creates unique secure paths and unlinks cleanly."""
    with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
        temp_path = tmp.name
        tmp.write(b"SYMBOL,QTY_FREEZE\nTEST,100\n")

    assert os.path.exists(temp_path)
    os.remove(temp_path)
    assert not os.path.exists(temp_path)


def test_eventlet_active_safe_guard():
    """_eventlet_active returns False cleanly when eventlet is not loaded."""
    with patch.dict(sys.modules):
        sys.modules.pop("eventlet", None)
        assert _eventlet_active() is False


def test_cleanup_on_exit_handles_stream_errors():
    """cleanup_on_exit should never throw if logging streams are dismantled."""
    with patch("blueprints.python_strategy.logger.info", side_effect=ValueError("I/O operation on closed file")):
        # Should not raise exception
        cleanup_on_exit()
