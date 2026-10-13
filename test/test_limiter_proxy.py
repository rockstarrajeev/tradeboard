"""Tests that Flask-Limiter key function correctly isolates client IPs behind proxies."""

from unittest.mock import patch
from flask import Flask
from limiter import _rate_limit_key


def test_rate_limit_key_direct_connection():
    """Without proxy headers trusted, key defaults to remote_addr."""
    app = Flask(__name__)
    with app.test_request_context("/", environ_base={"REMOTE_ADDR": "192.168.1.50"}):
        with patch.dict("os.environ", {"TRUST_PROXY_HEADERS": "false"}):
            assert _rate_limit_key() == "192.168.1.50"


def test_rate_limit_key_trusted_proxy_cf():
    """With proxy headers trusted, key extracts CF-Connecting-IP."""
    app = Flask(__name__)
    with app.test_request_context(
        "/",
        headers={"CF-Connecting-IP": "203.0.113.19"},
        environ_base={"REMOTE_ADDR": "127.0.0.1"},
    ):
        with patch.dict("os.environ", {"TRUST_PROXY_HEADERS": "true"}):
            assert _rate_limit_key() == "203.0.113.19"


def test_rate_limit_key_trusted_proxy_forwarded_for():
    """With proxy headers trusted, key extracts first IP from X-Forwarded-For."""
    app = Flask(__name__)
    with app.test_request_context(
        "/",
        headers={"X-Forwarded-For": "198.51.100.42, 10.0.0.1"},
        environ_base={"REMOTE_ADDR": "127.0.0.1"},
    ):
        with patch.dict("os.environ", {"TRUST_PROXY_HEADERS": "true"}):
            assert _rate_limit_key() == "198.51.100.42"


def test_rate_limit_key_outside_request_context():
    """Outside request context, key function safely returns 127.0.0.1 without throwing."""
    assert _rate_limit_key() == "127.0.0.1"
