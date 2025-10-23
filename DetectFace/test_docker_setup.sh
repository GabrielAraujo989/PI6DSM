#!/bin/bash

# Test script for DetectFace Docker setup
# This script validates that the Docker image builds successfully and the container works correctly

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Dependencies check passed."
}

# Check if required files exist
check_files() {
    print_status "Checking required files..."
    
    required_files=("Dockerfile" "requirements.txt" "server.py" ".env.production" "best.pt")
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file $file not found."
            exit 1
        fi
    done
    
    print_status "All required files found."
}

# Test Docker image build
test_docker_build() {
    print_status "Testing Docker image build..."
    
    # Start build timer
    start_time=$(date +%s)
    
    # Build the image
    if docker-compose build --no-cache; then
        end_time=$(date +%s)
        build_time=$((end_time - start_time))
        print_status "Docker image built successfully in ${build_time} seconds."
        
        # Check if build time is reasonable (less than 10 minutes)
        if [ $build_time -gt 600 ]; then
            print_warning "Build took ${build_time} seconds, which is longer than expected."
        fi
    else
        print_error "Docker image build failed."
        exit 1
    fi
}

# Test container startup
test_container_startup() {
    print_status "Testing container startup..."
    
    # Start the container
    if docker-compose up -d; then
        print_status "Container started successfully."
    else
        print_error "Failed to start container."
        exit 1
    fi
    
    # Wait for container to be ready
    print_status "Waiting for container to be ready..."
    sleep 30
    
    # Check if container is running
    if docker-compose ps | grep -q "Up"; then
        print_status "Container is running."
    else
        print_error "Container is not running."
        docker-compose logs detectface
        exit 1
    fi
}

# Test health endpoint
test_health_endpoint() {
    print_status "Testing health endpoint..."
    
    # Wait a bit more for the health check to pass
    sleep 30
    
    # Test health endpoint
    max_attempts=10
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            print_status "Health endpoint is responding correctly."
            health_response=$(curl -s http://localhost:8000/health)
            print_status "Health response: $health_response"
            return 0
        else
            print_warning "Health check attempt $attempt failed. Retrying in 10 seconds..."
            sleep 10
            ((attempt++))
        fi
    done
    
    print_error "Health endpoint failed after $max_attempts attempts."
    docker-compose logs detectface
    exit 1
}

# Test face detection API
test_face_detection_api() {
    print_status "Testing face detection API..."
    
    # Generate a test JWT token (using a simple approach for testing)
    # In a real scenario, you would get this from your authentication service
    test_token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.test"
    
    # Test the root endpoint
    if curl -f http://localhost:8000/ > /dev/null 2>&1; then
        print_status "Root endpoint is accessible."
    else
        print_error "Root endpoint is not accessible."
        exit 1
    fi
    
    # Test starting a camera with authentication
    # Note: This will fail without a valid JWT token, but we're testing if the endpoint exists
    camera_test_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $test_token" \
        -d '{"url": "test", "conf": 0.5}' \
        http://localhost:8000/start_camera/)
    
    if [ "$camera_test_response" = "401" ]; then
        print_status "Camera endpoint is accessible (authentication required as expected)."
    elif [ "$camera_test_response" = "200" ]; then
        print_status "Camera endpoint is accessible and accepted request."
    else
        print_warning "Camera endpoint returned unexpected status code: $camera_test_response"
    fi
}

# Test model loading
test_model_loading() {
    print_status "Testing model loading..."
    
    # Check if model file is accessible in the container
    if docker exec detectface-api test -f /app/best.pt; then
        print_status "Model file is accessible in the container."
    else
        print_error "Model file is not accessible in the container."
        exit 1
    fi
    
    # Check model file size (should be more than a few MB)
    model_size=$(docker exec detectface-api stat -c%s /app/best.pt)
    if [ "$model_size" -gt 1000000 ]; then  # 1MB
        print_status "Model file size is reasonable: $(echo "scale=2; $model_size/1024/1024" | bc)MB"
    else
        print_error "Model file size is too small: $model_size bytes"
        exit 1
    fi
}

# Test container resource usage
test_resource_usage() {
    print_status "Testing container resource usage..."
    
    # Get container stats
    stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" detectface-api)
    print_status "Container resource usage:"
    echo "$stats"
    
    # Extract memory usage
    mem_usage=$(echo "$stats" | tail -n 1 | awk '{print $3}')
    mem_value=$(echo $mem_usage | cut -d'/' -f1)
    mem_unit=$(echo $mem_usage | cut -d'/' -f1 | tail -c 2)
    
    # Convert to MB for comparison (rough estimation)
    if [[ "$mem_unit" == "MiB" ]]; then
        mem_mb=${mem_value%.*}
        if [ "$mem_mb" -gt 1800 ]; then  # Close to 2GB limit
            print_warning "Memory usage is high: $mem_usage"
        else
            print_status "Memory usage is acceptable: $mem_usage"
        fi
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    docker-compose down
    print_status "Cleanup completed."
}

# Main test execution
main() {
    print_status "Starting DetectFace Docker setup validation..."
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Run all tests
    check_dependencies
    check_files
    test_docker_build
    test_container_startup
    test_health_endpoint
    test_model_loading
    test_face_detection_api
    test_resource_usage
    
    print_status "All tests passed successfully! The Docker setup is ready for deployment."
}

# Execute main function
main "$@"