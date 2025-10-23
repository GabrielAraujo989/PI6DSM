# EasyPanel Deployment Guide for DetectFace API

This guide provides specific instructions for deploying the DetectFace API to EasyPanel, addressing the common issue with environment file handling.

## Prerequisites

1. EasyPanel account with access to create applications
2. The `best.pt` model file
3. Git repository with your DetectFace code

## EasyPanel Configuration

### 1. Create a New Application

1. Log in to your EasyPanel dashboard
2. Click "Create Application" 
3. Select "Docker" as the application type
4. Connect your Git repository

### 2. Docker Build Configuration

Set the following build settings:

- **Dockerfile Path**: `DetectFace/Dockerfile`
- **Build Context**: `DetectFace/`
- **Image Tag**: `latest` (or your preferred tag)

### 3. Environment Variables

Only one environment variable is actually required for the application to function:

```bash
SECRET_KEY=your-secure-secret-key-here-change-this
```

**Important**: Replace `your-secure-secret-key-here-change-this` with a secure random key.

#### Optional Environment Variables

The following variables are optional and have sensible defaults in the Dockerfile:

```bash
MODEL_PATH=/app/best.pt
```

- `MODEL_PATH`: Path to the model file. Defaults to `/app/best.pt` which matches the volume mount location.

All other server configuration variables (HOST, PORT, WORKERS, etc.) are already set with production-ready defaults in the Dockerfile and don't need to be configured in EasyPanel unless you have specific requirements.

For a complete example of the minimal configuration needed, see the [`.env.example`](.env.example) file in the repository.

### 4. Resource Allocation

Set appropriate resource limits:

- **CPU**: 1.0 core (minimum)
- **Memory**: 2GB (minimum)
- **Disk**: 5GB (minimum)

### 5. Port Configuration

- **Container Port**: 8000
- **Protocol**: HTTP
- **URL**: Your preferred subdomain

### 6. Volume Mounting (for model file)

To ensure your model file is available:

1. Option A: Include `best.pt` in your Git repository (not recommended for large files)
2. Option B: Use EasyPanel's volume mounting feature:
   - Mount a persistent volume to `/app/`
   - Upload your `best.pt` file to the volume after deployment

### 7. Health Check

Configure the health check:

- **Path**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 60 seconds

## Deployment Process

1. Save your configuration
2. Click "Deploy" to start the build process
3. Monitor the build logs for any errors
4. Once deployed, test the health endpoint: `https://your-domain.easypanel.host/health`

## Troubleshooting

### "Build failed: .env.production not found" Error

This error is now automatically handled by the updated Dockerfile. The build will:

1. Check if `.env.production` exists in the build context
2. If found, copy it to `.env` in the container
3. If not found, create a default `.env` file with production-ready settings
4. Use the environment variables you set in EasyPanel to override defaults

### Application Not Starting

1. Check the application logs in EasyPanel
2. Verify that `SECRET_KEY` is set correctly (this is the only required variable)
3. Ensure the model file is accessible at `/app/best.pt`
4. Check that resource limits are sufficient

### Model Loading Issues

1. Verify the model file exists in the container
2. Check file permissions
3. Ensure the model is mounted at `/app/best.pt` (default `MODEL_PATH`)

### Performance Issues

1. Monitor resource usage in EasyPanel
2. If memory usage is high, reduce `WORKERS` to 1
3. If CPU usage is high, consider allocating more CPU resources

## Post-Deployment Verification

1. **Health Check**: Visit `/health` endpoint
2. **API Test**: Test the main API endpoint
3. **Logs**: Monitor application logs for any errors
4. **Resources**: Check CPU and memory usage

## Security Considerations

1. **Required**: Set a secure `SECRET_KEY` for JWT authentication
2. Consider using HTTPS (EasyPanel typically provides this)
3. Monitor logs for unusual activity
4. Regularly update your application

## Updates and Maintenance

To update your application:

1. Push changes to your Git repository
2. Click "Redeploy" in EasyPanel
3. Monitor the deployment process
4. Verify functionality after deployment

## Alternative: Using Docker Compose in EasyPanel

If EasyPanel supports Docker Compose, you can use the `docker-compose.yml` file with modifications:

1. Remove the volume mounts for files that won't exist in the build context
2. Ensure all environment variables are explicitly set
3. Add resource limits directly in the compose file

This approach provides more control over the deployment configuration while still working within the EasyPanel ecosystem.