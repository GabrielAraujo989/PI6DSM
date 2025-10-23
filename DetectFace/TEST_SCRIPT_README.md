# Docker Setup Test Script for Windows

## Overview
The `test_docker_setup.bat` script is a Windows batch file designed to validate that the DetectFace Docker image builds successfully and the container works correctly.

## Prerequisites
Before running the script, make sure you have:
1. Docker Desktop installed and running
2. Docker Compose (included with Docker Desktop)
3. curl (included with Windows 10/11)

## How to Run
1. Open Command Prompt or PowerShell
2. Navigate to the DetectFace directory:
   ```
   cd DetectFace
   ```
3. Run the script:
   ```
   test_docker_setup.bat
   ```

## What the Script Tests
1. **Dependencies Check**: Verifies Docker, Docker Compose, and curl are available
2. **File Check**: Confirms all required files are present (Dockerfile, requirements.txt, server.py, .env.production, best.pt)
3. **Docker Build**: Tests building the Docker image
4. **Container Startup**: Verifies the container starts correctly
5. **Health Endpoint**: Tests the health endpoint (if curl is available)
6. **API Endpoints**: Tests basic API accessibility (if curl is available)
7. **Model Loading**: Verifies the model file is accessible in the container
8. **Resource Usage**: Displays container resource usage

## Troubleshooting
- If Docker is not running, start Docker Desktop and wait for it to fully initialize
- If curl is not available, the script will skip health and API endpoint tests
- Make sure all required files are in the DetectFace directory

## Output
The script provides detailed output with [INFO], [WARNING], and [ERROR] prefixes to clearly indicate what is happening at each step.