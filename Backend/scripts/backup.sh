#!/bin/bash

# MongoDB Backup Script
# Automated backup using mongodump

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$BACKEND_DIR/backups"

# Load environment variables from .env file if it exists
if [ -f "$BACKEND_DIR/.env" ]; then
    export $(grep -v '^#' "$BACKEND_DIR/.env" | xargs)
fi

# Configuration
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist (needed for log file)
mkdir -p "$BACKUP_DIR"

# Log file
LOG_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.log"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Extract database name from MONGO_URI or use DB_NAME env var
# Format: mongodb://[username:password@]host:port/database_name[?options]
if [ -z "$DB_NAME" ]; then
    # Remove protocol
    URI_WITHOUT_PROTOCOL="${MONGO_URI#mongodb://}"
    # Remove query string
    URI_WITHOUT_QUERY="${URI_WITHOUT_PROTOCOL%%\?*}"
    # Extract path after host:port
    # Pattern: [user:pass@]host:port[/database]
    if [[ "$URI_WITHOUT_QUERY" == *"/"* ]]; then
        # Has database name in path
        DB_NAME="${URI_WITHOUT_QUERY##*/}"
        # Remove any trailing slashes
        DB_NAME="${DB_NAME%/}"
    fi
fi

# If still no database name, use default or allow all databases
if [ -z "$DB_NAME" ] || [ "$DB_NAME" == "$MONGO_URI" ]; then
    # Check if it looks like we extracted host:port instead of db name
    if [[ "$DB_NAME" == *":"* ]]; then
        DB_NAME=""
    fi
fi

# Use default database name if not specified (mongodump will dump all databases)
if [ -z "$DB_NAME" ]; then
    DB_NAME="all_databases"
    log "Warning: No database name found in MONGO_URI. Will backup all databases."
    log "To backup a specific database, include it in MONGO_URI or set DB_NAME environment variable."
fi

# Backup filename
BACKUP_PATH="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}"

log "Starting MongoDB backup..."
log "MongoDB URI: ${MONGO_URI//:[^:@]*@/:***@}"  # Hide password if present
log "Database: $DB_NAME"
log "Backup location: $BACKUP_PATH"

# Check if mongodump is installed
if ! command -v mongodump &> /dev/null; then
    log "Error: mongodump is not installed"
    log "Install MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools"
    exit 1
fi

# Perform backup
log "Running mongodump..."
if [ "$DB_NAME" == "all_databases" ]; then
    # Backup all databases
    if mongodump --uri="$MONGO_URI" --out="$BACKUP_PATH" --gzip >> "$LOG_FILE" 2>&1; then
        BACKUP_SUCCESS=true
    else
        BACKUP_SUCCESS=false
    fi
else
    # Backup specific database
    if mongodump --uri="$MONGO_URI" --db="$DB_NAME" --out="$BACKUP_PATH" --gzip >> "$LOG_FILE" 2>&1; then
        BACKUP_SUCCESS=true
    else
        BACKUP_SUCCESS=false
    fi
fi

if [ "$BACKUP_SUCCESS" = true ]; then
    # Calculate backup size
    if [ -d "$BACKUP_PATH" ]; then
        BACKUP_SIZE=$(du -sh "$BACKUP_PATH" 2>/dev/null | cut -f1)
        log "Backup completed successfully!"
        log "Backup location: $BACKUP_PATH"
        log "Backup size: $BACKUP_SIZE"
    else
        log "Warning: Backup directory not found after completion"
    fi
    exit 0
else
    log "Error: Backup failed! Check log file: $LOG_FILE"
    exit 1
fi

