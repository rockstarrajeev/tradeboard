# Tradeboard Version Management
# This file is the single source of truth for version information

VERSION = "2.0.2.7"


def get_version() -> str:
    """Return the current Tradeboard version.

    Returns:
        str: The current version string (e.g. '2.0.2.5')
    """
    return VERSION
