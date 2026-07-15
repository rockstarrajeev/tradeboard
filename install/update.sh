#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Tradeboard Update Banner
echo -e "${BLUE}"
echo " ████████╗██████╗  █████╗ ██████╗ ███████╗██████╗  ██████╗  █████╗ ██████╗ ██████╗ "
echo " ╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗"
echo "    ██║   ██████╔╝███████║██║  ██║█████╗  ██████╔╝██║   ██║███████║██████╔╝██║  ██║"
echo "    ██║   ██╔══██╗██╔══██║██║  ██║██╔══╝  ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║"
echo "    ██║   ██║  ██║██║  ██║██████╔╝███████╗██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝"
echo "    ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ "
echo "                                 UPDATE  SCRIPT                                    "
echo -e "${NC}"

# Tradeboard Update Script
# Updates an existing Tradeboard installation to the latest version using the UV method.
# Supports both server deployments (installed via install.sh) and local development setups.
REPO_URL="https://github.com/rockstarrajeev/tradeboard.git"
DEFAULT_BRANCH="main"

# Create logs directory if it doesn't exist
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOGS_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOGS_DIR"

# Generate unique log file name
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOGS_DIR/update_${TIMESTAMP}.log"

# Function to log messages to both console and log file
log_message() {
    local message="$1"
    local color="$2"
    echo -e "${color}${message}${NC}" | tee -a "$LOG_FILE"
}

# Function to check if command was successful
check_status() {
    if [ $? -ne 0 ]; then
        log_message "Error: $1" "$RED"
        exit 1
    fi
}

# Start logging
log_message "Starting Tradeboard update log at: $LOG_FILE" "$BLUE"
log_message "----------------------------------------" "$BLUE"

# Detect OS type
OS_TYPE=$(grep -w "ID" /etc/os-release | cut -d "=" -f 2 | tr -d '"')

# Handle OS variants - map to base distributions
case "$OS_TYPE" in
    "pop"|"linuxmint"|"zorin")
        OS_TYPE="ubuntu"
        ;;
    "manjaro"|"manjaro-arm"|"endeavouros"|"cachyos")
        OS_TYPE="arch"
        ;;
    "rocky"|"almalinux"|"ol")
        OS_TYPE="rhel"
        ;;
esac

# Detect web server user and Python command based on OS
case "$OS_TYPE" in
    ubuntu|debian|raspbian)
        WEB_USER="www-data"
        WEB_GROUP="www-data"
        PYTHON_CMD="python3"
        ;;
    centos|fedora|rhel|amzn)
        WEB_USER="nginx"
        WEB_GROUP="nginx"
        PYTHON_CMD="python3"
        ;;
    arch)
        WEB_USER="http"
        WEB_GROUP="http"
        PYTHON_CMD="python"
        ;;
    *)
        log_message "Warning: Unrecognized OS ($OS_TYPE). Defaulting to python3." "$YELLOW"
        WEB_USER="www-data"
        WEB_GROUP="www-data"
        PYTHON_CMD="python3"
        ;;
esac

log_message "Detected OS: $OS_TYPE" "$BLUE"
log_message "Python command: $PYTHON_CMD" "$BLUE"

# Detect uv command
detect_uv() {
    if command -v uv >/dev/null 2>&1; then
        UV_CMD="uv"
    elif $PYTHON_CMD -m uv --version >/dev/null 2>&1; then
        UV_CMD="$PYTHON_CMD -m uv"
    else
        log_message "Error: uv is not installed." "$RED"
        log_message "Install with: pip install uv" "$YELLOW"
        exit 1
    fi
    log_message "Using uv: $UV_CMD" "$GREEN"
}

# Find server deployments installed via install.sh
#
# Two layouts are supported:
#   1. Simple (current install.sh)   /var/python/tradeboard, service "tradeboard"
#   2. Legacy multi-deploy           /var/python/tradeboard-flask/<deploy>/tradeboard,
#                                    service "tradeboard-<deploy>" (still produced
#                                    by install/install-multi.sh)
# We try the simple layout first because it's unambiguous; only fall back
# to scanning the legacy parent dir when the simple path is absent.
SIMPLE_PATH="/var/python/tradeboard"
DEPLOY_BASE="/var/python/tradeboard-flask"
SERVER_MODE=false
STASHED=false

find_deployments() {
    local deployments=()
    if [ -d "$DEPLOY_BASE" ]; then
        for dir in "$DEPLOY_BASE"/*/; do
            if [ -d "${dir}tradeboard/.git" ]; then
                deploy_name=$(basename "$dir")
                deployments+=("$deploy_name")
            fi
        done
    fi
    echo "${deployments[@]}"
}

if [ -d "$SIMPLE_PATH/.git" ]; then
    SERVER_MODE=true
    SELECTED_DEPLOY="tradeboard"
    BASE_PATH="$SIMPLE_PATH"
    TRADEBOARD_PATH="$SIMPLE_PATH"
    VENV_PATH="$SIMPLE_PATH/.venv"
    SERVICE_NAME="tradeboard"

    log_message "Found Tradeboard install at $SIMPLE_PATH" "$GREEN"
    log_message "Service: $SERVICE_NAME" "$BLUE"
else
    DEPLOYMENTS=($(find_deployments))
fi

if [ "$SERVER_MODE" = false ] && [ ${#DEPLOYMENTS[@]} -gt 0 ]; then
    SERVER_MODE=true
    log_message "Found ${#DEPLOYMENTS[@]} legacy server deployment(s):" "$GREEN"

    for i in "${!DEPLOYMENTS[@]}"; do
        log_message "  $((i+1)). ${DEPLOYMENTS[$i]}" "$BLUE"
    done

    if [ ${#DEPLOYMENTS[@]} -eq 1 ]; then
        SELECTED_DEPLOY="${DEPLOYMENTS[0]}"
        log_message "\nAuto-selected: $SELECTED_DEPLOY" "$GREEN"
    else
        echo ""
        while true; do
            read -p "Select deployment to update (1-${#DEPLOYMENTS[@]}): " choice
            if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#DEPLOYMENTS[@]} ]; then
                SELECTED_DEPLOY="${DEPLOYMENTS[$((choice-1))]}"
                break
            else
                log_message "Invalid choice. Please enter a number between 1 and ${#DEPLOYMENTS[@]}." "$RED"
            fi
        done
    fi

    # Derive paths from deployment name (legacy multi-deploy layout)
    BASE_PATH="$DEPLOY_BASE/$SELECTED_DEPLOY"
    TRADEBOARD_PATH="$BASE_PATH/tradeboard"
    VENV_PATH="$BASE_PATH/venv"
    SERVICE_NAME="tradeboard-$SELECTED_DEPLOY"

    log_message "\nUpdating deployment: $SELECTED_DEPLOY" "$BLUE"
    log_message "Path: $TRADEBOARD_PATH" "$BLUE"
    log_message "Service: $SERVICE_NAME" "$BLUE"
fi

if [ "$SERVER_MODE" = false ]; then
    # Check if we're in or near a tradeboard git repo (local development)
    if [ -d ".git" ] && [ -f "app.py" ]; then
        TRADEBOARD_PATH="$(pwd)"
    elif [ -d "$SCRIPT_DIR/../.git" ] && [ -f "$SCRIPT_DIR/../app.py" ]; then
        TRADEBOARD_PATH="$(cd "$SCRIPT_DIR/.." && pwd)"
    else
        log_message "Error: No Tradeboard deployment found." "$RED"
        log_message "For server deployments, ensure install.sh was run first." "$YELLOW"
        log_message "For local development, run this script from the tradeboard directory." "$YELLOW"
        exit 1
    fi

    log_message "Detected local development setup at: $TRADEBOARD_PATH" "$GREEN"
fi

# Detect uv
detect_uv

# Get current version info before update
cd "$TRADEBOARD_PATH"
if [ "$SERVER_MODE" = true ]; then
    CURRENT_COMMIT=$(sudo git -C "$TRADEBOARD_PATH" rev-parse --short HEAD 2>/dev/null || echo "unknown")
    CURRENT_BRANCH=$(sudo git -C "$TRADEBOARD_PATH" branch --show-current 2>/dev/null || echo "$DEFAULT_BRANCH")
else
    CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "$DEFAULT_BRANCH")
fi
log_message "\nCurrent version: $CURRENT_COMMIT (branch: $CURRENT_BRANCH)" "$BLUE"

# ============================================
# Step 1: Stop service (server mode only)
# ============================================
if [ "$SERVER_MODE" = true ]; then
    log_message "\n[Step 1/7] Stopping service: $SERVICE_NAME..." "$BLUE"
    if sudo systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
        sudo systemctl stop "$SERVICE_NAME"
        check_status "Failed to stop $SERVICE_NAME"
        log_message "Service stopped successfully" "$GREEN"
    else
        log_message "Service is not currently running" "$YELLOW"
    fi
else
    log_message "\n[Step 1/7] Skipping service stop (local development mode)" "$BLUE"
fi

# ============================================
# Step 2: Backup databases
# ============================================
log_message "\n[Step 2/7] Backing up databases..." "$BLUE"
BACKUP_DIR="$TRADEBOARD_PATH/db/backup_${TIMESTAMP}"
BACKUP_COUNT=0

if [ -d "$TRADEBOARD_PATH/db" ]; then
    if [ "$SERVER_MODE" = true ]; then
        sudo mkdir -p "$BACKUP_DIR"
    else
        mkdir -p "$BACKUP_DIR"
    fi

    # Backup SQLite databases
    for db_file in tradeboard.db logs.db latency.db sandbox.db; do
        if [ -f "$TRADEBOARD_PATH/db/$db_file" ]; then
            if [ "$SERVER_MODE" = true ]; then
                sudo cp "$TRADEBOARD_PATH/db/$db_file" "$BACKUP_DIR/$db_file"
            else
                cp "$TRADEBOARD_PATH/db/$db_file" "$BACKUP_DIR/$db_file"
            fi
            log_message "  Backed up: $db_file" "$GREEN"
            BACKUP_COUNT=$((BACKUP_COUNT + 1))
        fi
    done

    # Backup DuckDB database
    if [ -f "$TRADEBOARD_PATH/db/historify.duckdb" ]; then
        if [ "$SERVER_MODE" = true ]; then
            sudo cp "$TRADEBOARD_PATH/db/historify.duckdb" "$BACKUP_DIR/historify.duckdb"
        else
            cp "$TRADEBOARD_PATH/db/historify.duckdb" "$BACKUP_DIR/historify.duckdb"
        fi
        log_message "  Backed up: historify.duckdb" "$GREEN"
        BACKUP_COUNT=$((BACKUP_COUNT + 1))
    fi

    if [ $BACKUP_COUNT -eq 0 ]; then
        log_message "  No databases found to backup (fresh installation)" "$YELLOW"
        if [ "$SERVER_MODE" = true ]; then
            sudo rmdir "$BACKUP_DIR" 2>/dev/null
        else
            rmdir "$BACKUP_DIR" 2>/dev/null
        fi
    else
        log_message "  Backup location: $BACKUP_DIR ($BACKUP_COUNT files)" "$GREEN"
    fi
else
    log_message "  No database directory found (fresh installation)" "$YELLOW"
fi

# ============================================
# Step 3: Pull latest code
# ============================================
log_message "\n[Step 3/7] Pulling latest code from repository..." "$BLUE"
cd "$TRADEBOARD_PATH"

# Check for local modifications (excluding untracked files)
if [ "$SERVER_MODE" = true ]; then
    LOCAL_CHANGES=$(sudo git -C "$TRADEBOARD_PATH" status --porcelain 2>/dev/null | grep -v "^??" | head -20)
else
    LOCAL_CHANGES=$(git status --porcelain 2>/dev/null | grep -v "^??" | head -20)
fi

if [ -n "$LOCAL_CHANGES" ]; then
    log_message "Local modifications detected:" "$YELLOW"
    echo "$LOCAL_CHANGES" | tee -a "$LOG_FILE"
    log_message "\nStashing local changes..." "$YELLOW"
    if [ "$SERVER_MODE" = true ]; then
        sudo git -C "$TRADEBOARD_PATH" stash push -m "auto-stash before update $TIMESTAMP"
    else
        git stash push -m "auto-stash before update $TIMESTAMP"
    fi
    STASHED=true
fi

# Ensure git remote is correct for existing app updates
if [ "$SERVER_MODE" = true ]; then
    CURRENT_REMOTE=$(sudo git -C "$TRADEBOARD_PATH" remote get-url origin 2>/dev/null || true)
else
    CURRENT_REMOTE=$(git -C "$TRADEBOARD_PATH" remote get-url origin 2>/dev/null || true)
fi

if [ -z "$CURRENT_REMOTE" ]; then
    log_message "No git origin found. Adding origin: $REPO_URL" "$YELLOW"
    if [ "$SERVER_MODE" = true ]; then
        sudo git -C "$TRADEBOARD_PATH" remote add origin "$REPO_URL"
    else
        git -C "$TRADEBOARD_PATH" remote add origin "$REPO_URL"
    fi
    check_status "Failed to add git origin"
elif [ "$CURRENT_REMOTE" != "$REPO_URL" ]; then
    log_message "Updating git origin from $CURRENT_REMOTE to $REPO_URL" "$YELLOW"
    if [ "$SERVER_MODE" = true ]; then
        sudo git -C "$TRADEBOARD_PATH" remote set-url origin "$REPO_URL"
    else
        git -C "$TRADEBOARD_PATH" remote set-url origin "$REPO_URL"
    fi
    check_status "Failed to update git origin"
fi

if [ -z "$CURRENT_BRANCH" ] || [ "$CURRENT_BRANCH" = "HEAD" ]; then
    CURRENT_BRANCH="$DEFAULT_BRANCH"
fi

if [ "$SERVER_MODE" = true ]; then
    sudo git -C "$TRADEBOARD_PATH" fetch origin "$CURRENT_BRANCH"
    check_status "Failed to fetch latest code from origin/$CURRENT_BRANCH"
    sudo git -C "$TRADEBOARD_PATH" reset --hard "origin/$CURRENT_BRANCH"
else
    git -C "$TRADEBOARD_PATH" fetch origin "$CURRENT_BRANCH"
    check_status "Failed to fetch latest code from origin/$CURRENT_BRANCH"
    git -C "$TRADEBOARD_PATH" reset --hard "origin/$CURRENT_BRANCH"
fi
check_status "Failed to update working tree to origin/$CURRENT_BRANCH"

# Get new commit hash
if [ "$SERVER_MODE" = true ]; then
    NEW_COMMIT=$(sudo git -C "$TRADEBOARD_PATH" rev-parse --short HEAD 2>/dev/null || echo "unknown")
else
    NEW_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
fi

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    log_message "Already up to date ($CURRENT_COMMIT)" "$GREEN"
else
    log_message "Updated: $CURRENT_COMMIT -> $NEW_COMMIT" "$GREEN"
fi

if [ "$STASHED" = true ]; then
    log_message "Note: Local changes were stashed. Use 'git stash list' and 'git stash pop' to restore if needed." "$YELLOW"
fi

# ============================================
# Step 4: Check environment configuration
# ============================================
log_message "\n[Step 4/7] Checking environment configuration..." "$BLUE"

if [ -f "$TRADEBOARD_PATH/.env" ] && [ -f "$TRADEBOARD_PATH/.sample.env" ]; then
    # Extract variable names from both files and compare
    SAMPLE_VARS=$(grep -oP "^[A-Z_][A-Z_0-9]+ *=" "$TRADEBOARD_PATH/.sample.env" 2>/dev/null | sed 's/ *=$//' | sort -u)
    CURRENT_VARS=$(grep -oP "^[A-Z_][A-Z_0-9]+ *=" "$TRADEBOARD_PATH/.env" 2>/dev/null | sed 's/ *=$//' | sort -u)

    NEW_VARS=$(comm -23 <(echo "$SAMPLE_VARS") <(echo "$CURRENT_VARS") 2>/dev/null)

    if [ -n "$NEW_VARS" ]; then
        log_message "New environment variables found in .sample.env:" "$YELLOW"
        while IFS= read -r var; do
            [ -n "$var" ] && log_message "  + $var" "$YELLOW"
        done <<< "$NEW_VARS"
        log_message "Please review .sample.env and add these to your .env if needed." "$YELLOW"
    else
        log_message "Environment configuration is up to date" "$GREEN"
    fi
elif [ ! -f "$TRADEBOARD_PATH/.env" ]; then
    log_message "Warning: No .env file found. Creating from .sample.env..." "$YELLOW"
    if [ "$SERVER_MODE" = true ]; then
        sudo cp "$TRADEBOARD_PATH/.sample.env" "$TRADEBOARD_PATH/.env"
    else
        cp "$TRADEBOARD_PATH/.sample.env" "$TRADEBOARD_PATH/.env"
    fi

    # Generate fresh APP_KEY and API_KEY_PEPPER and substitute the placeholders.
    NEW_APP_KEY=$($PYTHON_CMD -c "import secrets; print(secrets.token_hex(32))")
    NEW_PEPPER=$($PYTHON_CMD -c "import secrets; print(secrets.token_hex(32))")
    if [ "$SERVER_MODE" = true ]; then
        sudo sed -i "s|TRADEBOARD_PLACEHOLDER_APP_KEY_REGENERATE_BEFORE_USE|$NEW_APP_KEY|g" "$TRADEBOARD_PATH/.env"
        sudo sed -i "s|TRADEBOARD_PLACEHOLDER_API_KEY_PEPPER_REGENERATE_BEFORE_USE|$NEW_PEPPER|g" "$TRADEBOARD_PATH/.env"
        sudo chmod 600 "$TRADEBOARD_PATH/.env"
    else
        sed -i.bak "s|TRADEBOARD_PLACEHOLDER_APP_KEY_REGENERATE_BEFORE_USE|$NEW_APP_KEY|g" "$TRADEBOARD_PATH/.env" && rm -f "$TRADEBOARD_PATH/.env.bak"
        sed -i.bak "s|TRADEBOARD_PLACEHOLDER_API_KEY_PEPPER_REGENERATE_BEFORE_USE|$NEW_PEPPER|g" "$TRADEBOARD_PATH/.env" && rm -f "$TRADEBOARD_PATH/.env.bak"
        chmod 600 "$TRADEBOARD_PATH/.env"
    fi
    log_message "Generated fresh APP_KEY and API_KEY_PEPPER in $TRADEBOARD_PATH/.env" "$GREEN"
    log_message "Please edit $TRADEBOARD_PATH/.env with your broker credentials and settings." "$RED"
fi

# ============================================
# Step 4b: Existing-install hardening
# ============================================
if [ -f "$TRADEBOARD_PATH/.env" ]; then
    if [ "$SERVER_MODE" = true ]; then
        ENV_PERMS=$(stat -c '%a' "$TRADEBOARD_PATH/.env" 2>/dev/null || stat -f '%Lp' "$TRADEBOARD_PATH/.env" 2>/dev/null)
        if [ "$ENV_PERMS" != "600" ]; then
            sudo chmod 600 "$TRADEBOARD_PATH/.env"
            log_message "Tightened .env perms: $ENV_PERMS -> 600 (owner-only)" "$GREEN"
        fi
    fi

    if ! grep -q "^TRUST_PROXY_HEADERS" "$TRADEBOARD_PATH/.env"; then
        BEHIND_NGINX="false"
        if [ -d /etc/nginx/sites-enabled ]; then
            if find /etc/nginx/sites-enabled -type f -o -type l 2>/dev/null | xargs grep -l "unix:.*\.sock\|tradeboard\|gunicorn" 2>/dev/null | head -1 | grep -q .; then
                BEHIND_NGINX="true"
            fi
        fi
        if [ "$BEHIND_NGINX" = "false" ] && [ -d /etc/nginx/conf.d ]; then
            if find /etc/nginx/conf.d -type f -name "*.conf" 2>/dev/null | xargs grep -l "unix:.*\.sock\|tradeboard\|gunicorn" 2>/dev/null | head -1 | grep -q .; then
                BEHIND_NGINX="true"
            fi
        fi
        if [ "$BEHIND_NGINX" = "true" ]; then
            if [ "$SERVER_MODE" = true ]; then
                echo "" | sudo tee -a "$TRADEBOARD_PATH/.env" >/dev/null
                echo "# Auto-added by update.sh — nginx reverse proxy detected." | sudo tee -a "$TRADEBOARD_PATH/.env" >/dev/null
                echo "TRUST_PROXY_HEADERS = 'TRUE'" | sudo tee -a "$TRADEBOARD_PATH/.env" >/dev/null
            else
                {
                    echo ""
                    echo "# Auto-added by update.sh — nginx reverse proxy detected."
                    echo "TRUST_PROXY_HEADERS = 'TRUE'"
                } >> "$TRADEBOARD_PATH/.env"
            fi
            log_message "Added TRUST_PROXY_HEADERS=TRUE to .env (nginx reverse proxy detected)" "$GREEN"
        else
            if [ "$SERVER_MODE" = true ]; then
                echo "" | sudo tee -a "$TRADEBOARD_PATH/.env" >/dev/null
                echo "# Auto-added by update.sh — set to TRUE only if behind a reverse proxy" | sudo tee -a "$TRADEBOARD_PATH/.env" >/dev/null
                echo "# that strips client-supplied X-Forwarded-For / CF-Connecting-IP / X-Real-IP." | sudo tee -a "$TRADEBOARD_PATH/.env" >/dev/null
                echo "TRUST_PROXY_HEADERS = 'FALSE'" | sudo tee -a "$TRADEBOARD_PATH/.env" >/dev/null
            else
                {
                    echo ""
                    echo "# Auto-added by update.sh — set to TRUE only if behind a reverse proxy"
                    echo "# that strips client-supplied X-Forwarded-For / CF-Connecting-IP / X-Real-IP."
                    echo "TRUST_PROXY_HEADERS = 'FALSE'"
                } >> "$TRADEBOARD_PATH/.env"
            fi
            log_message "Added TRUST_PROXY_HEADERS=FALSE to .env (no proxy detected)" "$YELLOW"
        fi
    fi
fi

# ============================================
# Step 5: Update Python dependencies
# ============================================
log_message "\n[Step 5/7] Updating Python dependencies..." "$BLUE"

if [ "$SERVER_MODE" = true ]; then
    if [ ! -x "$VENV_PATH/bin/python" ]; then
        log_message "Virtual environment missing at $VENV_PATH. Recreating..." "$YELLOW"
        sudo mkdir -p "$VENV_PATH"
        sudo $UV_CMD venv "$VENV_PATH"
        check_status "Failed to recreate Python virtual environment"
    fi

    sudo $UV_CMD pip install --python "$VENV_PATH/bin/python" -r "$TRADEBOARD_PATH/requirements-nginx.txt"
    check_status "Failed to update Python dependencies"

    ACTIVATE_CMD="source $VENV_PATH/bin/activate"
    if ! sudo bash -c "$ACTIVATE_CMD && pip freeze | grep -q 'gunicorn=='"; then
        log_message "  Installing gunicorn..." "$YELLOW"
        sudo $UV_CMD pip install --python "$VENV_PATH/bin/python" "gunicorn>=25.0,<26"
        check_status "Failed to install gunicorn"
    fi
    if ! sudo bash -c "$ACTIVATE_CMD && pip freeze | grep -q 'eventlet=='"; then
        log_message "  Installing eventlet..." "$YELLOW"
        sudo $UV_CMD pip install --python "$VENV_PATH/bin/python" eventlet
        check_status "Failed to install eventlet"
    fi
else
    cd "$TRADEBOARD_PATH"
    $UV_CMD sync
    check_status "Failed to update Python dependencies"
fi

log_message "Dependencies updated successfully" "$GREEN"

# ============================================
# Step 6: Set permissions (server mode) and run database migrations
# ============================================
if [ "$SERVER_MODE" = true ]; then
    log_message "\n[Step 6/7] Setting permissions and running database migrations..." "$BLUE"

    sudo chown -R "$WEB_USER:$WEB_GROUP" "$BASE_PATH"
    sudo chmod -R 755 "$BASE_PATH"

    sudo mkdir -p "$TRADEBOARD_PATH/db"
    sudo mkdir -p "$TRADEBOARD_PATH/tmp/numba_cache"
    sudo mkdir -p "$TRADEBOARD_PATH/tmp/matplotlib"
    sudo mkdir -p "$TRADEBOARD_PATH/strategies/scripts"
    sudo mkdir -p "$TRADEBOARD_PATH/strategies/examples"
    sudo mkdir -p "$TRADEBOARD_PATH/log/strategies"
    sudo mkdir -p "$TRADEBOARD_PATH/keys"
    sudo chown -R "$WEB_USER:$WEB_GROUP" "$TRADEBOARD_PATH"
    sudo chmod 700 "$TRADEBOARD_PATH/keys"

    if [ -f "$TRADEBOARD_PATH/.env" ]; then
        sudo chmod 600 "$TRADEBOARD_PATH/.env"
    fi

    log_message "Permissions set successfully" "$GREEN"

    if [ -f "$TRADEBOARD_PATH/upgrade/migrate_all.py" ]; then
        log_message "Running database migrations..." "$BLUE"
        sudo -u "$WEB_USER" bash -c "source $VENV_PATH/bin/activate && cd \"$TRADEBOARD_PATH\" && python upgrade/migrate_all.py" 2>&1 | tee -a "$LOG_FILE"
        if [ ${PIPESTATUS[0]} -ne 0 ]; then
            log_message "Retrying migrations with elevated permissions..." "$YELLOW"
            sudo bash -c "source $VENV_PATH/bin/activate && cd \"$TRADEBOARD_PATH\" && python upgrade/migrate_all.py" 2>&1 | tee -a "$LOG_FILE"
            check_status "Failed to run database migrations"
        fi
        log_message "Database migrations completed" "$GREEN"
    else
        log_message "No migration script found (upgrade/migrate_all.py)" "$YELLOW"
    fi
else
    log_message "\n[Step 6/7] Running database migrations..." "$BLUE"
    if [ -f "$TRADEBOARD_PATH/upgrade/migrate_all.py" ]; then
        cd "$TRADEBOARD_PATH"
        $UV_CMD run upgrade/migrate_all.py 2>&1 | tee -a "$LOG_FILE"
        check_status "Failed to run database migrations"
        log_message "Database migrations completed" "$GREEN"
    else
        log_message "No migration script found (upgrade/migrate_all.py)" "$YELLOW"
    fi
fi

# ============================================
# Step 7: Restart services (server mode) or finish (local mode)
# ============================================
if [ "$SERVER_MODE" = true ]; then
    log_message "\n[Step 7/7] Restarting services..." "$BLUE"

    sudo systemctl daemon-reload

    sudo systemctl start "$SERVICE_NAME"
    check_status "Failed to start $SERVICE_NAME"

    if systemctl list-unit-files | grep -q '^nginx\.service'; then
        sudo systemctl reload nginx
        check_status "Failed to reload Nginx"
    fi

    log_message "Services restarted successfully" "$GREEN"

    sleep 3
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        log_message "Service $SERVICE_NAME is running" "$GREEN"
    else
        log_message "Warning: Service $SERVICE_NAME may not be running correctly" "$RED"
        log_message "Check status with: sudo systemctl status $SERVICE_NAME" "$YELLOW"
        log_message "View logs with: sudo journalctl -u $SERVICE_NAME -n 100 --no-pager" "$YELLOW"
        exit 1
    fi
else
    log_message "\n[Step 7/7] Local development update complete." "$GREEN"
fi

log_message "\n========================================" "$GREEN"
log_message "Tradeboard update completed successfully!" "$GREEN"
log_message "========================================" "$GREEN"

if [ "$SERVER_MODE" = true ]; then
    log_message "Updated app path: $TRADEBOARD_PATH" "$BLUE"
    log_message "Virtualenv path:  $VENV_PATH" "$BLUE"
    log_message "Service name:     $SERVICE_NAME" "$BLUE"
    log_message "Check status:     sudo systemctl status $SERVICE_NAME" "$BLUE"
    log_message "View logs:        sudo journalctl -u $SERVICE_NAME -f" "$BLUE"
else
    log_message "Updated local repository: $TRADEBOARD_PATH" "$BLUE"
fi

log_message "Update log saved to: $LOG_FILE" "$BLUE"