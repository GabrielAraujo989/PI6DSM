#!/bin/bash

# Railpack Setup Script for DetecFace
# This script configures the environment for Railway deployment using Railpack

set -e  # Exit on any error

echo "🚀 Starting Railpack setup for DetecFace..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p /app/models
mkdir -p /app/logs
mkdir -p /app/temp

# Set environment variables
export PYTHONPATH="/app:$PYTHONPATH"
export PYTHONUNBUFFERED=1
export MODEL_PATH="/app/best.pt"

# Update pip to latest version
echo "📦 Updating pip..."
python -m pip install --upgrade pip --no-cache-dir

# Install Python dependencies with optimized flags
echo "📦 Installing Python dependencies from requirements.txt..."
pip install --no-cache-dir --no-deps -r requirements.txt

echo "📦 Installing PyTorch dependencies..."
pip install --no-cache-dir --no-deps -r requirements-pytorch.txt

# Install additional dependencies that might be needed
echo "📦 Installing additional dependencies..."
pip install --no-cache-dir gunicorn

# Set proper permissions
echo "🔐 Setting permissions..."
chmod +x server.py
chmod +x init-model.sh

# Initialize model if script exists
if [ -f "init-model.sh" ]; then
    echo "🤖 Initializing model..."
    ./init-model.sh
fi

# Create log files
echo "📝 Creating log files..."
touch /app/logs/app.log
touch /app/logs/error.log

# Verify installation
echo "🔍 Verifying installation..."
python -c "import fastapi, uvicorn, torch, cv2, numpy; print('✅ All dependencies installed successfully')"

# Check if model file exists
if [ -f "best.pt" ]; then
    echo "✅ Model file found"
else
    echo "⚠️  Model file not found, will need to be uploaded separately"
fi

echo "🎉 Railpack setup completed successfully!"
echo "🌐 Application ready to start with: python server.py"