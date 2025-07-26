#!/bin/bash
# scripts/backup.sh - Comprehensive Backup Script for ExpenseFlow

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="${POSTGRES_DB:-expenseflow}"
DB_USER="${POSTGRES_USER:-expenseflow_user}"
DB_HOST="${DB_HOST:-postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
COMPRESSION_LEVEL="${COMPRESSION_LEVEL:-6}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Create backup directory structure
create_backup_structure() {
    local backup_path="$BACKUP_DIR/$TIMESTAMP"
    mkdir -p "$backup_path"/{database,uploads,config,logs}
    echo "$backup_path"
}

# Backup PostgreSQL database
backup_database() {
    local backup_path="$1"
    local db_file="$backup_path/database/expenseflow_db.sql"
    
    log_info "Starting database backup..."
    
    if pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --no-password > "$db_file"; then
        # Compress database backup
        gzip "$db_file"
        log_success "Database backup completed: ${db_file}.gz"
        return 0
    else
        log_error "Database backup failed"
        return 1
    fi
}

# Backup application files
backup_app_files() {
    local backup_path="$1"
    local files_archive="$backup_path/app_files.tar.gz"
    
    log_info "Starting application files backup..."
    
    # Create list of files to backup
    local backup_files=(
        "/app/uploads"
        "/app/config"
        "/app/.env"
    )
    
    # Check which files exist and backup them
    local existing_files=()
    for file in "${backup_files[@]}"; do
        if [[ -e "$file" ]]; then
            existing_files+=("$file")
        fi
    done
    
    if [[ ${#existing_files[@]} -gt 0 ]]; then
        tar -czf "$files_archive" "${existing_files[@]}" 2>/dev/null || true
        log_success "Application files backup completed: $files_archive"
    else
        log_warning "No application files found to backup"
    fi
}

# Backup logs
backup_logs() {
    local backup_path="$1"
    local logs_archive="$backup_path/logs/logs.tar.gz"
    
    log_info "Starting logs backup..."
    
    if [[ -d "/app/logs" ]]; then
        tar -czf "$logs_archive" /app/logs/ 2>/dev/null || true
        log_success "Logs backup completed: $logs_archive"
    else
        log_warning "No logs directory found"
    fi
}

# Create backup metadata
create_metadata() {
    local backup_path="$1"
    local metadata_file="$backup_path/backup_metadata.json"
    
    cat > "$metadata_file" <<EOF
{
    "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "backup_timestamp": "$TIMESTAMP",
    "database_name": "$DB_NAME",
    "database_user": "$DB_USER",
    "app_version": "${APP_VERSION:-1.0.0}",
    "backup_type": "full",
    "compression": "gzip",
    "retention_days": $RETENTION_DAYS,
    "files": {
        "database": "database/expenseflow_db.sql.gz",
        "app_files": "app_files.tar.gz",
        "logs": "logs/logs.tar.gz"
    }
}
EOF
    
    log_success "Backup metadata created: $metadata_file"
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."
    
    if [[ -d "$BACKUP_DIR" ]]; then
        find "$BACKUP_DIR" -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
        log_success "Old backups cleaned up"
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_path="$1"
    local errors=0
    
    log_info "Verifying backup integrity..."
    
    # Check if metadata exists
    if [[ ! -f "$backup_path/backup_metadata.json" ]]; then
        log_error "Backup metadata missing"
        ((errors++))
    fi
    
    # Check if database backup exists and is readable
    if [[ -f "$backup_path/database/expenseflow_db.sql.gz" ]]; then
        if ! gzip -t "$backup_path/database/expenseflow_db.sql.gz" 2>/dev/null; then
            log_error "Database backup is corrupted"
            ((errors++))
        fi
    else
        log_error "Database backup missing"
        ((errors++))
    fi
    
    # Check if app files backup exists
    if [[ -f "$backup_path/app_files.tar.gz" ]]; then
        if ! tar -tzf "$backup_path/app_files.tar.gz" >/dev/null 2>&1; then
            log_error "App files backup is corrupted"
            ((errors++))
        fi
    fi
    
    if [[ $errors -eq 0 ]]; then
        log_success "Backup verification passed"
        return 0
    else
        log_error "Backup verification failed with $errors errors"
        return 1
    fi
}

# Calculate backup size
calculate_backup_size() {
    local backup_path="$1"
    local size=$(du -sh "$backup_path" | cut -f1)
    echo "$size"
}

# Send backup notification (if configured)
send_notification() {
    local status="$1"
    local backup_path="$2"
    local size="$3"
    
    if [[ -n "${WEBHOOK_URL:-}" ]]; then
        local message
        if [[ "$status" == "success" ]]; then
            message="✅ ExpenseFlow backup completed successfully. Size: $size"
        else
            message="❌ ExpenseFlow backup failed. Check logs for details."
        fi
        
        curl -X POST -H "Content-Type: application/json" \
             -d "{\"text\":\"$message\"}" \
             "$WEBHOOK_URL" 2>/dev/null || true
    fi
}

# Main backup function
main() {
    log_info "Starting ExpenseFlow backup process..."
    
    # Create backup structure
    local backup_path
    backup_path=$(create_backup_structure)
    
    local backup_success=true
    
    # Perform backups
    if ! backup_database "$backup_path"; then
        backup_success=false
    fi
    
    backup_app_files "$backup_path"
    backup_logs "$backup_path"
    create_metadata "$backup_path"
    
    # Verify backup
    if ! verify_backup "$backup_path"; then
        backup_success=false
    fi
    
    # Calculate size
    local backup_size
    backup_size=$(calculate_backup_size "$backup_path")
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Send notification
    if [[ "$backup_success" == true ]]; then
        log_success "Backup process completed successfully. Total size: $backup_size"
        send_notification "success" "$backup_path" "$backup_size"
    else
        log_error "Backup process completed with errors"
        send_notification "failure" "$backup_path" "$backup_size"
        exit 1
    fi
}

# Restore function
restore_backup() {
    local restore_path="$1"
    
    if [[ ! -d "$restore_path" ]]; then
        log_error "Restore path does not exist: $restore_path"
        exit 1
    fi
    
    log_info "Starting restore from: $restore_path"
    
    # Check metadata
    if [[ ! -f "$restore_path/backup_metadata.json" ]]; then
        log_error "Backup metadata not found"
        exit 1
    fi
    
    # Restore database
    if [[ -f "$restore_path/database/expenseflow_db.sql.gz" ]]; then
        log_info "Restoring database..."
        
        # Drop and recreate database
        psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" || true
        psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"
        
        # Restore database
        gunzip -c "$restore_path/database/expenseflow_db.sql.gz" | \
            psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"
        
        log_success "Database restored successfully"
    fi
    
    # Restore application files
    if [[ -f "$restore_path/app_files.tar.gz" ]]; then
        log_info "Restoring application files..."
        tar -xzf "$restore_path/app_files.tar.gz" -C /
        log_success "Application files restored successfully"
    fi
    
    log_success "Restore completed successfully"
}

# Parse command line arguments
case "${1:-backup}" in
    "backup")
        main
        ;;
    "restore")
        if [[ -z "${2:-}" ]]; then
            log_error "Usage: $0 restore <backup_path>"
            exit 1
        fi
        restore_backup "$2"
        ;;
    "list")
        log_info "Available backups:"
        if [[ -d "$BACKUP_DIR" ]]; then
            ls -la "$BACKUP_DIR" | grep "^d" | grep "20"
        else
            log_warning "No backup directory found"
        fi
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {backup|restore|list|cleanup}"
        echo "  backup           - Create a new backup"
        echo "  restore <path>   - Restore from backup path"
        echo "  list             - List available backups"
        echo "  cleanup          - Remove old backups"
        exit 1
        ;;
esac

---

# scripts/restore.sh - Restore script
#!/bin/bash

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
DB_NAME="${POSTGRES_DB:-expenseflow}"
DB_USER="${POSTGRES_USER:-expenseflow_user}"
DB_HOST="${DB_HOST:-postgres}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# List available backups
list_backups() {
    log_info "Available backups:"
    if [[ -d "$BACKUP_DIR" ]]; then
        local count=0
        for backup in "$BACKUP_DIR"/20*; do
            if [[ -d "$backup" && -f "$backup/backup_metadata.json" ]]; then
                local timestamp=$(basename "$backup")
                local date=$(echo "$timestamp" | sed 's/_/ /')
                local size=$(du -sh "$backup" | cut -f1)
                echo "  [$count] $date (Size: $size)"
                ((count++))
            fi
        done
        
        if [[ $count -eq 0 ]]; then
            log_error "No valid backups found"
            exit 1
        fi
        
        return $count
    else
        log_error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
}

# Interactive backup selection
select_backup() {
    local backup_count
    backup_count=$(list_backups)
    
    echo
    read -p "Select backup to restore (0-$((backup_count-1))): " selection
    
    if ! [[ "$selection" =~ ^[0-9]+$ ]] || [[ $selection -ge $backup_count ]]; then
        log_error "Invalid selection"
        exit 1
    fi
    
    local count=0
    for backup in "$BACKUP_DIR"/20*; do
        if [[ -d "$backup" && -f "$backup/backup_metadata.json" ]]; then
            if [[ $count -eq $selection ]]; then
                echo "$backup"
                return
            fi
            ((count++))
        fi
    done
}

# Confirm restore
confirm_restore() {
    local backup_path="$1"
    
    echo
    log_info "You are about to restore from: $(basename "$backup_path")"
    echo "⚠️  WARNING: This will OVERWRITE all current data!"
    echo
    read -p "Are you sure you want to continue? (yes/no): " confirmation
    
    if [[ "$confirmation" != "yes" ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
}

# Stop services before restore
stop_services() {
    log_info "Stopping application services..."
    
    # Try to stop services gracefully
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose stop backend frontend 2>/dev/null || true
    fi
    
    sleep 2
}

# Start services after restore
start_services() {
    log_info "Starting application services..."
    
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose start backend frontend
    fi
    
    log_success "Services restarted"
}

# Main restore function
main() {
    local backup_path="${1:-}"
    
    if [[ -z "$backup_path" ]]; then
        backup_path=$(select_backup)
    fi
    
    if [[ ! -d "$backup_path" ]]; then
        log_error "Backup path does not exist: $backup_path"
        exit 1
    fi
    
    confirm_restore "$backup_path"
    stop_services
    
    # Call the backup script with restore option
    /backup.sh restore "$backup_path"
    
    start_services
    
    log_success "Restore completed successfully!"
    echo
    echo "Your ExpenseFlow instance has been restored from backup."
    echo "Please verify that everything is working correctly."
}

main "$@"