import os
import sys
from unittest.mock import patch
import pytest

# Use temporary file-based databases to persist tables across NullPool connection cycles
DB_DIR = "db"
TEST_DB_PATH = os.path.join(DB_DIR, "test_tradeboard.db")
TEST_SANDBOX_DB_PATH = os.path.join(DB_DIR, "test_sandbox.db")

os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["SANDBOX_DATABASE_URL"] = f"sqlite:///{TEST_SANDBOX_DB_PATH}"
os.environ["API_KEY_PEPPER"] = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"
os.environ["FERNET_SALT"] = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"

def pytest_configure(config):
    # Ensure test databases do not exist before starting
    cleanup_test_databases()
    
    os.makedirs(DB_DIR, exist_ok=True)
    
    from database.auth_db import init_db as init_auth_db
    from database.sandbox_db import init_db as init_sandbox_db
    
    # Initialize auth db (creates tables)
    init_auth_db()
    
    # Initialize sandbox db (creates tables and populates default configs)
    init_sandbox_db()

def pytest_unconfigure(config):
    # Clean up test database files after tests finish
    cleanup_test_databases()

def cleanup_test_databases():
    from database.auth_db import db_session as auth_session
    from database.sandbox_db import db_session as sandbox_session
    
    try:
        auth_session.remove()
    except Exception:
        pass
    try:
        sandbox_session.remove()
    except Exception:
        pass

    for path in [TEST_DB_PATH, TEST_SANDBOX_DB_PATH]:
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass

# Mock starting_capital to ensure consistency in sandbox fund calculations
@pytest.fixture(scope="session", autouse=True)
def mock_starting_capital():
    with patch("sandbox.fund_manager.get_config", return_value="10000000.00"):
        yield
