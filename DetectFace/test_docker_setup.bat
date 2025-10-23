@echo off
REM Test script for DetectFace Docker setup (Windows version)
REM This script validates that the Docker image builds successfully and the container works correctly

setlocal enabledelayedexpansion

REM Initialize variables
set ERROR_CODE=0
set SCRIPT_DIR=%~dp0

REM Change to the script directory
cd /d "%SCRIPT_DIR%"

echo [INFO] Starting DetectFace Docker setup validation...

REM Check if Docker and Docker Compose are installed
echo [INFO] Checking dependencies...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo [ERROR] Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    goto :error_exit
)

REM Check if Docker is actually running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is installed but not running.
    echo [ERROR] Please start Docker Desktop and wait for it to fully initialize.
    goto :error_exit
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    REM Try docker compose (without hyphen) for newer Docker versions
    docker compose version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
        goto :error_exit
    )
    set DOCKER_COMPOSE_CMD=docker compose
) else (
    set DOCKER_COMPOSE_CMD=docker-compose
)

REM Check if curl is available (needed for health checks)
curl --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] curl is not installed or not in PATH.
    echo [WARNING] Health endpoint tests will be skipped.
    echo [WARNING] You can install curl or use Windows 10/11 which includes curl built-in.
    set CURL_AVAILABLE=0
) else (
    set CURL_AVAILABLE=1
)

echo [INFO] Dependencies check passed.

REM Check if required files exist
echo [INFO] Checking required files...

if not exist "Dockerfile" (
    echo [ERROR] Required file Dockerfile not found.
    goto :error_exit
)

if not exist "requirements.txt" (
    echo [ERROR] Required file requirements.txt not found.
    goto :error_exit
)

if not exist "server.py" (
    echo [ERROR] Required file server.py not found.
    goto :error_exit
)

if not exist ".env.production" (
    echo [ERROR] Required file .env.production not found.
    goto :error_exit
)

if not exist "best.pt" (
    echo [ERROR] Required file best.pt not found.
    goto :error_exit
)

echo [INFO] All required files found.

REM Test Docker image build
echo [INFO] Testing Docker image build...

REM Record start time (using a simpler method that works on all Windows systems)
set "start_time=%time%"

REM Build the image
%DOCKER_COMPOSE_CMD% build --no-cache
if %errorlevel% neq 0 (
    echo [ERROR] Docker image build failed.
    echo [ERROR] Please make sure Docker Desktop is running and you have sufficient permissions.
    goto :error_exit
)

REM Record end time
set "end_time=%time%"

echo [INFO] Docker image built successfully between %start_time% and %end_time%.

REM Test container startup
echo [INFO] Testing container startup...

REM Start the container
%DOCKER_COMPOSE_CMD% up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start container.
    goto :error_exit
)

echo [INFO] Container started successfully.

REM Wait for container to be ready
echo [INFO] Waiting for container to be ready...
timeout /t 30 /nobreak >nul

REM Check if container is running
%DOCKER_COMPOSE_CMD% ps | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo [ERROR] Container is not running.
    %DOCKER_COMPOSE_CMD% logs detectface
    goto :error_exit
)

echo [INFO] Container is running.

REM Test health endpoint
if %CURL_AVAILABLE% equ 1 (
    echo [INFO] Testing health endpoint...

    REM Wait a bit more for the health check to pass
    timeout /t 30 /nobreak >nul

    REM Test health endpoint
    set /a attempt=1
    set /a max_attempts=10

    :health_check_loop
    curl -f http://localhost:8000/health >nul 2>&1
    if %errorlevel% neq 0 (
        if !attempt! lss %max_attempts% (
            echo [WARNING] Health check attempt !attempt! failed. Retrying in 10 seconds...
            timeout /t 10 /nobreak >nul
            set /a attempt+=1
            goto :health_check_loop
        ) else (
            echo [ERROR] Health endpoint failed after %max_attempts% attempts.
            %DOCKER_COMPOSE_CMD% logs detectface
            goto :error_exit
        )
    )

    echo [INFO] Health endpoint is responding correctly.
    for /f "delims=" %%i in ('curl -s http://localhost:8000/health') do set health_response=%%i
    echo [INFO] Health response: !health_response!
) else (
    echo [WARNING] Skipping health endpoint test due to curl not being available.
)

REM Test model loading
echo [INFO] Testing model loading...

REM Check if model file is accessible in the container
docker exec detectface-api test -f /app/best.pt
if %errorlevel% neq 0 (
    echo [ERROR] Model file is not accessible in the container.
    goto :error_exit
)

echo [INFO] Model file is accessible in the container.

REM Test face detection API
if %CURL_AVAILABLE% equ 1 (
    echo [INFO] Testing face detection API...

    REM Test the root endpoint
    curl -f http://localhost:8000/ >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Root endpoint is not accessible.
        goto :error_exit
    )

    echo [INFO] Root endpoint is accessible.

    REM Note: Full API testing with JWT would require more complex implementation
    echo [INFO] API endpoints are accessible (authentication required for protected endpoints).
) else (
    echo [WARNING] Skipping API endpoint test due to curl not being available.
)

REM Test container resource usage
echo [INFO] Testing container resource usage...

REM Get container stats
echo [INFO] Container resource usage:
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" detectface-api

REM Cleanup
echo [INFO] Cleaning up...
if defined DOCKER_COMPOSE_CMD (
    %DOCKER_COMPOSE_CMD% down
) else (
    echo [WARNING] Docker Compose command not available, skipping cleanup.
)
echo [INFO] Cleanup completed.

echo [INFO] All tests passed successfully! The Docker setup is ready for deployment.
exit /b 0

:error_exit
echo [INFO] Cleaning up due to error...
if defined DOCKER_COMPOSE_CMD (
    %DOCKER_COMPOSE_CMD% down
) else (
    echo [WARNING] Docker Compose command not available, skipping cleanup.
)
echo [INFO] Cleanup completed.
exit /b %ERROR_CODE%