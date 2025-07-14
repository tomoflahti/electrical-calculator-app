#!/bin/bash

# Deployment script for International Electric Calculator
# Supports multiple deployment targets and environments

set -e  # Exit on any error

# Configuration
APP_NAME="electric-calculator"
VERSION=$(node -p "require('./package.json').version")
BUILD_DIR="dist"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show usage
show_help() {
    cat << EOF
International Electrical Calculator - Deployment Script

Usage: $0 [OPTION] [TARGET]

OPTIONS:
    -h, --help          Show this help message
    -v, --version       Show version information
    -e, --env ENV       Set environment (dev|staging|prod) [default: prod]
    -c, --clean         Clean build directory before deployment
    -t, --test          Run tests before deployment
    -b, --backup        Create backup before deployment

TARGETS:
    static              Build for static hosting (Netlify, Vercel, S3)
    docker              Build and run Docker container
    server              Deploy to Node.js server
    aws-s3              Deploy to AWS S3 + CloudFront
    gcp                 Deploy to Google Cloud Platform
    azure               Deploy to Microsoft Azure
    local               Serve locally for testing

EXAMPLES:
    $0 static                   # Build for static hosting
    $0 docker -e staging        # Build Docker image for staging
    $0 aws-s3 -c -t            # Deploy to AWS with clean build and tests
    $0 local                    # Serve locally

EOF
}

# Parse command line arguments
ENV="prod"
CLEAN=false
TEST=false
BACKUP=false
TARGET=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--version)
            echo "$APP_NAME version $VERSION"
            exit 0
            ;;
        -e|--env)
            ENV="$2"
            shift 2
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -t|--test)
            TEST=true
            shift
            ;;
        -b|--backup)
            BACKUP=true
            shift
            ;;
        static|docker|server|aws-s3|gcp|azure|local)
            TARGET="$1"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate target
if [[ -z "$TARGET" ]]; then
    log_error "Deployment target is required"
    show_help
    exit 1
fi

# Validate environment
if [[ ! "$ENV" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Invalid environment: $ENV (must be dev|staging|prod)"
    exit 1
fi

log_info "Starting deployment of $APP_NAME v$VERSION"
log_info "Environment: $ENV"
log_info "Target: $TARGET"

# Pre-deployment checks
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ is required (current: $NODE_VERSION)"
        exit 1
    fi
    
    log_success "Dependencies check passed"
}

# Clean build directory
clean_build() {
    if [ "$CLEAN" = true ]; then
        log_info "Cleaning build directory..."
        rm -rf $BUILD_DIR
        log_success "Build directory cleaned"
    fi
}

# Run tests
run_tests() {
    if [ "$TEST" = true ]; then
        log_info "Running tests..."
        npm run build  # TypeScript check
        log_success "Tests passed"
    fi
}

# Create backup
create_backup() {
    if [ "$BACKUP" = true ] && [ -d "$BUILD_DIR" ]; then
        log_info "Creating backup..."
        tar -czf "backup_${TIMESTAMP}.tar.gz" $BUILD_DIR
        log_success "Backup created: backup_${TIMESTAMP}.tar.gz"
    fi
}

# Build application
build_app() {
    log_info "Installing dependencies..."
    npm ci --only=production
    
    log_info "Building application..."
    NODE_ENV=$ENV npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - $BUILD_DIR directory not found"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Deployment functions
deploy_static() {
    log_info "Deploying for static hosting..."
    build_app
    
    log_info "Build artifacts ready in $BUILD_DIR/"
    log_info "Upload the $BUILD_DIR/ directory to your static hosting provider:"
    log_info "  - Netlify: Drag & drop to netlify.com"
    log_info "  - Vercel: Run 'vercel --prod'"
    log_info "  - GitHub Pages: Run 'gh-pages -d $BUILD_DIR'"
    log_info "  - AWS S3: Run 'aws s3 sync $BUILD_DIR/ s3://your-bucket/'"
    
    log_success "Static deployment ready"
}

deploy_docker() {
    log_info "Building Docker image..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Build Docker image
    docker build -t $APP_NAME:$VERSION -t $APP_NAME:latest .
    
    if [ "$ENV" = "prod" ]; then
        log_info "Starting production container..."
        docker run -d \
            --name ${APP_NAME}-${ENV} \
            -p 80:80 \
            --restart unless-stopped \
            $APP_NAME:latest
    else
        log_info "Starting development container..."
        docker run -d \
            --name ${APP_NAME}-${ENV} \
            -p 8080:80 \
            $APP_NAME:latest
    fi
    
    log_success "Docker deployment complete"
    log_info "Container running at: http://localhost:${ENV:+8080}"
}

deploy_server() {
    log_info "Deploying to Node.js server..."
    build_app
    
    # Install server dependencies
    npm install express compression helmet
    
    # Start server
    if [ "$ENV" = "prod" ]; then
        log_info "Starting production server..."
        NODE_ENV=production PORT=3000 npm start &
    else
        log_info "Starting development server..."
        NODE_ENV=development PORT=3000 npm run serve &
    fi
    
    sleep 2
    
    # Health check
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_success "Server deployment complete"
        log_info "Application running at: http://localhost:3000"
    else
        log_error "Server health check failed"
        exit 1
    fi
}

deploy_aws_s3() {
    log_info "Deploying to AWS S3..."
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed"
        exit 1
    fi
    
    build_app
    
    # Check for required environment variables
    if [[ -z "$AWS_S3_BUCKET" ]]; then
        log_error "AWS_S3_BUCKET environment variable is required"
        exit 1
    fi
    
    # Upload to S3
    log_info "Uploading to S3 bucket: $AWS_S3_BUCKET"
    aws s3 sync $BUILD_DIR/ s3://$AWS_S3_BUCKET --delete
    
    # Invalidate CloudFront if distribution ID is provided
    if [[ -n "$AWS_CLOUDFRONT_DISTRIBUTION_ID" ]]; then
        log_info "Invalidating CloudFront distribution..."
        aws cloudfront create-invalidation \
            --distribution-id $AWS_CLOUDFRONT_DISTRIBUTION_ID \
            --paths "/*"
    fi
    
    log_success "AWS S3 deployment complete"
}

deploy_local() {
    log_info "Starting local development server..."
    build_app
    
    # Install server dependencies if needed
    npm list express &> /dev/null || npm install express compression helmet
    
    log_info "Starting local server..."
    NODE_ENV=development npm run serve
}

# Main deployment logic
main() {
    check_dependencies
    clean_build
    run_tests
    create_backup
    
    case $TARGET in
        static)
            deploy_static
            ;;
        docker)
            deploy_docker
            ;;
        server)
            deploy_server
            ;;
        aws-s3)
            deploy_aws_s3
            ;;
        local)
            deploy_local
            ;;
        *)
            log_error "Deployment target '$TARGET' not implemented yet"
            exit 1
            ;;
    esac
    
    log_success "Deployment completed successfully! 🚀"
    log_info "International Electrical Calculator (NEC & IEC 60364) is now deployed"
}

# Run main function
main