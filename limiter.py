from flask_limiter import Limiter

from utils.ip_helper import get_real_ip


def _rate_limit_key() -> str:
    """Get client IP for rate limiting.

    When TRUST_PROXY_HEADERS=TRUE (reverse proxy / Nginx / Cloudflare),
    respects real client IP so distinct traders and webhooks are not collapsed
    into 127.0.0.1. Falls back to 127.0.0.1 if outside request context or undetermined.
    """
    try:
        ip = get_real_ip()
        return ip if ip else "127.0.0.1"
    except Exception:
        return "127.0.0.1"


# Initialize Flask-Limiter without the app object
limiter = Limiter(key_func=_rate_limit_key, storage_uri="memory://", strategy="moving-window")

