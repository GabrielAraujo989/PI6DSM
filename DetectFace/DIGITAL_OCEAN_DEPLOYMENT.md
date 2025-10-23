# Digital Ocean Deployment Guide for DetectFace API

This guide provides step-by-step instructions for deploying the DetectFace API to Digital Ocean with the optimized Docker configuration that addresses the 3-minute timeout issue.

## Prerequisites

1. Digital Ocean account with a Droplet (recommended: 2GB RAM, 1 CPU, Ubuntu 22.04)
2. Docker and Docker Compose installed on the Droplet
3. The `best.pt` model file available
4. SSH access to your Droplet

## Installation Steps

### 1. Prepare the Digital Ocean Droplet

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
sudo mkdir -p /opt/detectface
sudo chown $USER:$USER /opt/detectface
cd /opt/detectface
```

### 2. Deploy the Application Files

```bash
# Clone or copy your project files to the server
# If using git:
git clone <your-repo-url> .

# If using scp (from your local machine):
scp -r DetectFace/* root@your-droplet-ip:/opt/detectface/

# Ensure the model file is present
# Upload your best.pt file if not already in the repository
scp best.pt root@your-droplet-ip:/opt/detectface/
```

### 3. Configure Environment Variables

Create a production environment file:

```bash
# Create production environment file
cp .env.production .env

# Edit the environment file with your settings
nano .env
```

Important settings to update:
- `SECRET_KEY`: Generate a secure random key
- `MODEL_PATH`: Ensure it points to `/app/best.pt`
- Timeouts and worker settings should remain as configured

### 4. Build and Deploy with Docker Compose

```bash
# Build the Docker image with optimized configuration
docker-compose build --no-cache

# Start the container
docker-compose up -d

# Check the logs to ensure it started correctly
docker-compose logs -f detectface
```

### 5. Verify Health Check

```bash
# Check if the container is running
docker-compose ps

# Check the health status
docker inspect detectface-api | grep -A 10 "Health"

# Test the health endpoint
curl http://localhost:8000/health
```

## Production Docker Run Command (Alternative)

If you prefer to run with Docker directly instead of Docker Compose:

```bash
# Build the image
docker build -t detectface-api .

# Create a directory for the model
mkdir -p /opt/detectface/model
cp best.pt /opt/detectface/model/

# Run the container with proper configuration
docker run -d \
  --name detectface-api \
  --restart unless-stopped \
  -p 8000:8000 \
  -v /opt/detectface/model/best.pt:/app/best.pt:ro \
  -v /opt/detectface/logs:/app/logs \
  --memory=2g \
  --cpus=1.0 \
  --health-cmd="curl -f http://localhost:8000/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --health-start-period=60s \
  -e ENV=production \
  -e SECRET_KEY=your-secure-secret-key-here \
  -e MODEL_PATH=/app/best.pt \
  -e WORKERS=2 \
  -e TIMEOUT=120 \
  detectface-api
```

## Monitoring and Maintenance

### Check Container Status

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f detectface

# Check resource usage
docker stats detectface-api
```

### Update the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

### Backup

```bash
# Backup the model file
cp /opt/detectface/best.pt /opt/detectface/backups/best-$(date +%Y%m%d).pt

# Backup logs
tar -czf /opt/detectface/backups/logs-$(date +%Y%m%d).tar.gz /opt/detectface/logs/
```

## Troubleshooting

### Common Issues and Solutions

1. **Container fails to start with model loading error**
   ```bash
   # Check if model file exists and is accessible
   docker exec detectface-api ls -la /app/best.pt
   
   # Check logs for specific error
   docker-compose logs detectface
   ```

2. **Health check fails**
   ```bash
   # Manual health check
   curl http://localhost:8000/health
   
   # Check if port is exposed
   docker port detectface-api
   ```

3. **Memory issues**
   ```bash
   # Check memory usage
   docker stats detectface-api
   
   # If needed, reduce workers in .env file
   # WORKERS=1
   ```

4. **Timeout during deployment**
   - The optimized Dockerfile with multi-stage build reduces deployment time
   - Pip timeout is set to 300 seconds
   - Model loading has retry mechanism with 180-second timeout

### Performance Optimization

1. **For better performance on larger Droplets:**
   - Increase `WORKERS` to match CPU cores (but not more than 4)
   - Increase memory limit if using larger instance

2. **For resource-constrained environments:**
   - Reduce `WORKERS` to 1
   - Add memory limits to prevent OOM kills

## Security Considerations

1. **Firewall Configuration**
   ```bash
   # Only allow necessary ports
   sudo ufw allow 22
   sudo ufw allow 8000
   sudo ufw enable
   ```

2. **Use SSL/TLS in Production**
   - Consider using a reverse proxy like Nginx with SSL termination
   - Or use Digital Ocean Load Balancer with SSL

3. **Regular Updates**
   ```bash
   # Regularly update Docker and system packages
   sudo apt update && sudo apt upgrade -y
   ```

## Scaling Options

1. **Horizontal Scaling**
   - Use Digital Ocean Load Balancer
   - Deploy multiple instances behind the load balancer

2. **Vertical Scaling**
   - Upgrade to larger Droplet with more CPU/memory
   - Adjust worker count accordingly

This deployment guide ensures that your DetectFace API will work reliably on Digital Ocean without the 3-minute timeout issues that were present in the previous configuration.