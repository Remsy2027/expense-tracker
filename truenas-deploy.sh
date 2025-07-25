#!/bin/bash

# ExpenseFlow TrueNAS Deployment Script
# This script deploys ExpenseFlow to TrueNAS with proper configuration

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="expenseflow"
DEFAULT_INSTALL_PATH="/mnt/tank/apps/expenseflow"
DEFAULT_DATA_PATH="/mnt/tank/appdata/expenseflow"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    local deps=("docker" "docker-compose" "git" "curl" "openssl")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [[ ${#missing_deps[@]} -ne 0 ]]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Installing missing dependencies..."
        
        # Install dependencies based on OS
        if command -v pkg &> /dev/null; then
            # FreeBSD (TrueNAS)
            pkg update
            for dep in "${missing_deps[@]}"; do
                case $dep in
                    "docker")
                        pkg install -y docker-engine
                        ;;
                    "docker-compose")
                        pkg install -y py38-docker-compose
                        ;;
                    *)
                        pkg install -y "$dep"
                        ;;
                esac
            done
        elif command -v apt-get &> /dev/null; then
            # Debian/Ubuntu
            apt-get update
            apt-get install -y "${missing_deps[@]}"
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            yum install -y "${missing_deps[@]}"
        else
            log_error "Unsupported package manager. Please install dependencies manually."
            exit 1
        fi
    fi
    
    log_success "All dependencies are installed"
}

setup_directories() {
    log_info "Setting up directory structure..."
    
    local dirs=(
        "$INSTALL_PATH"
        "$DATA_PATH"
        "$DATA_PATH/postgres"
        "$DATA_PATH/redis"
        "$DATA_PATH/uploads"
        "$DATA_PATH/backups"
        "$DATA_PATH/logs/backend"
        "$DATA_PATH/logs/frontend"
        "$DATA_PATH/logs/nginx"
        "$DATA_PATH/logs/backup"
        "$DATA_PATH/prometheus"
        "$DATA_PATH/grafana"
        "$DATA_PATH/ssl"
    )
    
    for dir in "${dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            mkdir -p "$dir"
            log_info "Created directory: $dir"
        fi
    done
    
    # Set proper permissions
    chown -R 1000:1000 "$DATA_PATH"
    chmod -R 755 "$DATA_PATH"
    
    # Special permissions for database
    chown -R 999:999 "$DATA_PATH/postgres"
    
    log_success "Directory structure created"
}

generate_secrets() {
    log_info "Generating secure secrets..."
    
    # Generate random secrets
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    GRAFANA_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
    
    log_success "Secrets generated"
}

create_env_file() {
    log_info "Creating environment configuration..."
    
    cat > "$INSTALL_PATH/.env" <<EOF
# ExpenseFlow Configuration
# Generated on $(date)

# Basic Settings
PROJECT_NAME=expenseflow
INSTALL_PATH=$INSTALL_PATH
DATA_PATH=$DATA_PATH
HOST_PORT=$HOST_PORT
HOST_SSL_PORT=$HOST_SSL_PORT

# Database Configuration
DB_PASSWORD=$DB_PASSWORD
DB_BACKUP_ENABLED=true
DB_BACKUP_INTERVAL=24h
MAX_BACKUPS=30

# Security
JWT_SECRET=$JWT_SECRET
REDIS_PASSWORD=$REDIS_PASSWORD

# Frontend Configuration
REACT_APP_API_URL=http://$SERVER_IP:$HOST_PORT/api
FRONTEND_URL=http://$SERVER_IP:$HOST_PORT

# Monitoring (optional)
GRAFANA_PASSWORD=$GRAFANA_PASSWORD
PROMETHEUS_ENABLED=false
GRAFANA_ENABLED=false

# Backup Configuration
BACKUP_INTERVAL=24h
S3_ENABLED=false
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Email Configuration (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL=noreply@expenseflow.local
EOF

    chmod 600 "$INSTALL_PATH/.env"
    log_success "Environment file created"
}

setup_ssl() {
    if [[ "$ENABLE_SSL" == "true" ]]; then
        log_info "Setting up SSL certificates..."
        
        if [[ ! -f "$DATA_PATH/ssl/cert.pem" ]] || [[ ! -f "$DATA_PATH/ssl/key.pem" ]]; then
            log_info "Generating self-signed SSL certificate..."
            
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout "$DATA_PATH/ssl/key.pem" \
                -out "$DATA_PATH/ssl/cert.pem" \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=$SERVER_IP"
            
            chmod 600 "$DATA_PATH/ssl/key.pem"
            chmod 644 "$DATA_PATH/ssl/cert.pem"
            
            log_success "Self-signed SSL certificate generated"
        else
            log_info "SSL certificates already exist"
        fi
    fi
}

download_project() {
    log_info "Downloading ExpenseFlow..."
    
    if [[ ! -d "$INSTALL_PATH/.git" ]]; then
        git clone https://github.com/yourusername/expenseflow.git "$INSTALL_PATH"
    else
        cd "$INSTALL_PATH"
        git pull origin main
    fi
    
    log_success "Project downloaded"
}

build_and_start() {
    log_info "Building and starting services..."
    
    cd "$INSTALL_PATH"
    
    # Copy configuration files
    cp "$SCRIPT_DIR/docker-compose.yml" "$INSTALL_PATH/"
    cp -r "$SCRIPT_DIR/nginx" "$INSTALL_PATH/"
    cp -r "$SCRIPT_DIR/backend" "$INSTALL_PATH/"
    
    # Build and start services
    docker-compose down --remove-orphans 2>/dev/null || true
    docker-compose build --no-cache
    docker-compose up -d
    
    log_success "Services started"
}

wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    local max_attempts=60
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -sf "http://localhost:$HOST_PORT/api/health" >/dev/null 2>&1; then
            log_success "Services are ready!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log_info "Waiting for services... ($attempt/$max_attempts)"
        sleep 5
    done
    
    log_error "Services failed to start properly"
    return 1
}

create_systemd_service() {
    log_info "Creating systemd service..."
    
    cat > /etc/systemd/system/expenseflow.service <<EOF
[Unit]
Description=ExpenseFlow Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$INSTALL_PATH
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable expenseflow.service
    
    log_success "Systemd service created and enabled"
}

create_backup_script() {
    log_info "Creating backup script..."
    
    cat > "$INSTALL_PATH/backup.sh" <<'EOF'
#!/bin/bash

# ExpenseFlow Backup Script
BACKUP_DIR="/mnt/tank/appdata/expenseflow/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="expenseflow_backup_$TIMESTAMP.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup database
docker exec expenseflow_postgres pg_dump -U expenseflow_user expenseflow > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Backup application data
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    --exclude="*.log" \
    --exclude="node_modules" \
    --exclude=".git" \
    /mnt/tank/apps/expenseflow \
    /mnt/tank/appdata/expenseflow

# Remove old backups (keep last 30)
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +30 -delete
find "$BACKUP_DIR" -name "*.sql" -type f -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

    chmod +x "$INSTALL_PATH/backup.sh"
    
    # Add to crontab for daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * $INSTALL_PATH/backup.sh") | crontab -
    
    log_success "Backup script created and scheduled"
}

create_update_script() {
    log_info "Creating update script..."
    
    cat > "$INSTALL_PATH/update.sh" <<'EOF'
#!/bin/bash

cd /mnt/tank/apps/expenseflow

echo "Pulling latest changes..."
git pull origin main

echo "Rebuilding and restarting services..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "Update completed!"
EOF

    chmod +x "$INSTALL_PATH/update.sh"
    
    log_success "Update script created"
}

show_summary() {
    log_success "ExpenseFlow deployment completed!"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 DEPLOYMENT SUMMARY"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    echo "📱 Application URL: http://$SERVER_IP:$HOST_PORT"
    if [[ "$ENABLE_SSL" == "true" ]]; then
        echo "🔒 HTTPS URL: https://$SERVER_IP:$HOST_SSL_PORT"
    fi
    echo "📁 Install Path: $INSTALL_PATH"
    echo "💾 Data Path: $DATA_PATH"
    echo
    echo "🔑 Admin Credentials:"
    echo "   Default admin will be created on first login"
    echo
    echo "🛠️ Management Commands:"
    echo "   Start:   docker-compose -f $INSTALL_PATH/docker-compose.yml up -d"
    echo "   Stop:    docker-compose -f $INSTALL_PATH/docker-compose.yml down"
    echo "   Logs:    docker-compose -f $INSTALL_PATH/docker-compose.yml logs -f"
    echo "   Update:  $INSTALL_PATH/update.sh"
    echo "   Backup:  $INSTALL_PATH/backup.sh"
    echo
    echo "📊 Monitoring (if enabled):"
    echo "   Grafana: http://$SERVER_IP:3001 (admin/$GRAFANA_PASSWORD)"
    echo "   Prometheus: http://$SERVER_IP:9090"
    echo
    echo "📁 Important Files:"
    echo "   Config: $INSTALL_PATH/.env"
    echo "   Logs: $DATA_PATH/logs/"
    echo "   Backups: $DATA_PATH/backups/"
    echo
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Main installation function
main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🚀 ExpenseFlow TrueNAS Deployment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo
    
    # Get configuration from user
    read -p "Enter installation path [$DEFAULT_INSTALL_PATH]: " INSTALL_PATH
    INSTALL_PATH=${INSTALL_PATH:-$DEFAULT_INSTALL_PATH}
    
    read -p "Enter data path [$DEFAULT_DATA_PATH]: " DATA_PATH
    DATA_PATH=${DATA_PATH:-$DEFAULT_DATA_PATH}
    
    read -p "Enter server IP address: " SERVER_IP
    if [[ -z "$SERVER_IP" ]]; then
        log_error "Server IP is required"
        exit 1
    fi
    
    read -p "Enter HTTP port [3000]: " HOST_PORT
    HOST_PORT=${HOST_PORT:-3000}
    
    read -p "Enable SSL? (y/n) [n]: " ENABLE_SSL_INPUT
    ENABLE_SSL=${ENABLE_SSL_INPUT:-n}
    if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]]; then
        ENABLE_SSL="true"
        read -p "Enter HTTPS port [3443]: " HOST_SSL_PORT
        HOST_SSL_PORT=${HOST_SSL_PORT:-3443}
    else
        ENABLE_SSL="false"
        HOST_SSL_PORT="3443"
    fi
    
    echo
    log_info "Starting deployment with the following configuration:"
    echo "  Install Path: $INSTALL_PATH"
    echo "  Data Path: $DATA_PATH"
    echo "  Server IP: $SERVER_IP"
    echo "  HTTP Port: $HOST_PORT"
    echo "  SSL Enabled: $ENABLE_SSL"
    if [[ "$ENABLE_SSL" == "true" ]]; then
        echo "  HTTPS Port: $HOST_SSL_PORT"
    fi
    echo
    
    read -p "Continue with deployment? (y/n): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
    
    # Execute deployment steps
    check_root
    check_dependencies
    setup_directories
    generate_secrets
    create_env_file
    setup_ssl
    download_project
    build_and_start
    wait_for_services
    create_systemd_service
    create_backup_script
    create_update_script
    show_summary
}

# Handle interrupts
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"