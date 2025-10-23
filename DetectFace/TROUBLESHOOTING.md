# Troubleshooting Guide for DetecFace Deployment

This document provides solutions to common problems encountered during the deployment and operation of the DetecFace application on Railway and GitHub Actions.

## Table of Contents

1. [Memory Issues](#memory-issues)
2. [Synchronization Problems](#synchronization-problems)
3. [Railway Builder Issues (Railpack vs Dockerfile)](#railway-builder-issues-railpack-vs-dockerfile)
4. [Railway Deployment Issues](#railway-deployment-issues)
5. [GitHub Actions Failures](#github-actions-failures)
6. [Region Change Procedures](#region-change-procedures)
7. [Deployment Status Verification](#deployment-status-verification)
8. [Recovery Strategies](#recovery-strategies)

## Memory Issues

### Problem: Out of Memory Errors During Deployment

**Symptoms:**
- Build failures with "memory limit exceeded" messages
- Container crashes during startup
- Railway deployment failures

**Solutions:**

1. **Reduced Worker Count**
   - Workers reduced from 2 to 1 in both Dockerfile and railway.toml
   - This significantly reduces memory consumption

2. **Optimized Dependencies Installation**
   - Added `--no-cache-dir` and `--no-deps` flags to pip install commands
   - This reduces memory usage during package installation

3. **Extended Timeouts**
   - Increased timeout from 120 to 600 seconds
   - Gives more time for memory-intensive operations to complete

4. **Reduced Request Limits**
   - MAX_REQUESTS reduced from 1000 to 500
   - Helps prevent memory accumulation over time

### Verification Commands

```bash
# Check memory usage on Railway
railway logs --service detecface

# Monitor container resources
docker stats <container_id>
```

## Synchronization Problems

### Problem: File Synchronization Issues

**Symptoms:**
- Deployment fails with missing file errors
- Inconsistent application behavior
- Configuration not applied correctly

**Solutions:**

1. **File Verification in GitHub Actions**
   - Added verification step to check critical files before deployment
   - Ensures all required files are present and synchronized

2. **Explicit Configuration**
   - Added explicit start command in railway.toml
   - Ensures consistent configuration across deployments

### Critical Files Checklist

- `server.py` - Main application file
- `requirements.txt` - Python dependencies
- `requirements-pytorch.txt` - PyTorch dependencies
- `Dockerfile` - Container configuration
- `railway.toml` - Railway deployment configuration

## Railway Builder Issues (Railpack vs Dockerfile)

### SOLUÇÃO DEFINITIVA: Usando Root Directory com Docker Builder

**Problema Resolvido:**
- Railpack estava detectando Node.js em vez de Python
- Quando configuramos Root Directory, o Builder muda para Docker (que é o que queremos)

**Solução Implementada:**
Usar Root Directory para forçar o Railway a usar Docker builder em vez do Railpack, resolvendo o problema de detecção de linguagem.

### Problema: Detecção Incorreta de Linguagem pelo Railpack

**Sintomas:**
- Railpack detecta Node.js em vez de Python
- Build falha com erros de dependências incorretas
- Railway não reconhece o projeto Python corretamente

**Causa Raiz:**
O Railpack pode ter dificuldade em detectar corretamente projetos Python em estruturas de diretórios complexas ou quando há arquivos de outras linguagens no projeto.

### Solução: Root Directory com Docker Builder

**Estratégia:**
1. Configurar Root Directory para ativar Docker builder
2. Manter o Dockerfile para controle total do build
3. Usar arquivos de configuração para forçar o uso do Docker

#### 1. Configuração do railway.toml

```toml
[build]
# Usa Docker builder com Root Directory para forçar uso do Dockerfile
builder = "dockerfile"
# Caminho do Dockerfile relativo ao Root Directory
dockerfilePath = "./Dockerfile"

[service]
name = "detecface"
# Root Directory configurado para ativar Docker builder
sourceDir = "./DetectFace"

# Comando de início otimizado para Docker builder
startCommand = "gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 600 --keepalive 2 --max-requests 500 --max-requests-jitter 100 --preload server:app"
```

#### 2. Configuração do package.json

```json
{
  "name": "detecface-python-app",
  "version": "1.0.0",
  "description": "DetecFace Python application - Configured for Railway Docker builder with Root Directory",
  "scripts": {
    "start": "python server.py",
    "build": "pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir -r requirements-pytorch.txt",
    "docker-build": "docker build -t detecface .",
    "docker-run": "docker run -p 8000:8000 detecface"
  },
  "railway": {
    "builder": "dockerfile",
    "dockerfilePath": "./Dockerfile",
    "buildCommand": "npm run build",
    "startCommand": "gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 600 --keepalive 2 --max-requests 500 --max-requests-jitter 100 --preload server:app",
    "pythonVersion": "3.10",
    "sourceDir": "./DetectFace"
  }
}
```

#### 3. Arquivo .railway na Raiz do Projeto

Crie um arquivo `.railway` na raiz do projeto:

```toml
[build]
# Força o uso do Docker builder
builder = "dockerfile"

[service]
# Define o Root Directory para o projeto DetectFace
# Isso ativa o Docker builder em vez do Railpack
sourceDir = "./DetectFace"
```

#### 4. Passos para Configuração no Railway UI

1. **Acesse as configurações do projeto no Railway**
2. **Configure o Root Directory:**
   - Vá para Settings → Build & Deploy
   - Defina Root Directory como: `DetectFace`
3. **Verifique o Builder:**
   - O Railway deve detectar automaticamente o uso do Dockerfile
   - O Builder deve mostrar "Dockerfile" em vez de "Railpack"
4. **Variáveis de Ambiente:**
   - Configure todas as variáveis necessárias
   - Especialmente `PORT`, `ENV`, `MODEL_PATH`

#### 5. Vantagens Desta Abordagem

- **Controle Total:** Dockerfile oferece controle completo sobre o ambiente
- **Determinístico:** Build sempre reproduzível
- **Performance:** Otimizado para o runtime específico
- **Independência:** Não depende da detecção automática do Railway
- **Flexibilidade:** Permite customizações avançadas

#### 6. Verificação do Deploy

Após o deploy, verifique se está usando Docker:

```bash
# Verifica logs do build
railway logs --service detecface | grep -i docker

# Verifica se Python está sendo usado
railway logs --service detecface | grep -i python

# Verifica se as dependências foram instaladas
railway logs --service detecface | grep -i pip
```

## Forçando Docker Builder com railway.json

### Problema: Railpack Continua Detectando Node.js em Vez de Python

**Sintomas:**
- Railway ainda mostra "builder": "RAILPACK" no painel
- Railpack detecta incorretamente Node.js em vez de Python
- Build falha com dependências incorretas
- Configurações anteriores não estão funcionando

### SOLUÇÃO DEFINITIVA: railway.json na Raiz do Projeto

Quando as configurações anteriores não funcionam, use um arquivo `railway.json` na raiz do projeto para forçar explicitamente o uso do Docker builder.

#### 1. Crie railway.json na Raiz do Projeto

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "./DetectFace/Dockerfile",
    "buildArgs": {
      "PYTHON_VERSION": "3.10"
    }
  },
  "deploy": {
    "startCommand": "gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 600 --keepalive 2 --max-requests 500 --max-requests-jitter 100 --preload server:app",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "service": {
    "name": "detecface",
    "sourceDir": "./DetectFace"
  },
  "env": {
    "ENV": "production",
    "HOST": "0.0.0.0",
    "PORT": "8000",
    "WORKERS": "1",
    "WORKER_CLASS": "uvicorn.workers.UvicornWorker",
    "TIMEOUT": "600",
    "KEEPALIVE": "2",
    "MAX_REQUESTS": "500",
    "MAX_REQUESTS_JITTER": "100",
    "PRELOAD_APP": "1",
    "LOG_LEVEL": "info",
    "MODEL_PATH": "/app/best.pt",
    "WORKER_CONNECTIONS": "1000",
    "WORKER_TEMP_DIR": "/dev/shm",
    "PIP_TIMEOUT": "600",
    "MODEL_LOADING_TIMEOUT": "180",
    "CAMERA_CONNECTION_TIMEOUT": "10",
    "ACCESS_LOG_FORMAT": "%(h)s %(l)s %(u)s %(t)s \"%(r)s\" %(s)s %(b)s \"%(f)s\" \"%(a)s\" %(D)s"
  }
}
```

#### 2. Dockerfile Alternativo na Raiz (Opcional)

Crie um Dockerfile alternativo na raiz do projeto como fallback:

```dockerfile
# Dockerfile alternativo na raiz do projeto
# Este arquivo redireciona para o Dockerfile real em DetectFace/
# Garante que o Railway encontre o Dockerfile mesmo com configurações complexas

# Usa o Dockerfile real do DetectFace como base
FROM ./DetectFace/Dockerfile

# Mantém todas as configurações do Dockerfile original
# Este arquivo serve apenas como um ponteiro para o Dockerfile real
```

#### 3. Atualize .railway para Consistência

```toml
[build]
# Força o uso do Docker builder (em vez do Railpack)
builder = "dockerfile"
# Caminho explícito para o Dockerfile
dockerfilePath = "./DetectFace/Dockerfile"

[service]
# Define o Root Directory para o projeto DetectFace
# Isso ativa o Docker builder em vez do Railpack
sourceDir = "./DetectFace"
name = "detecface"

[deploy]
# Configurações de deployment otimizadas
healthcheckPath = "/health"
healthcheckTimeout = 120
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

#### 4. Vantagens do railway.json

- **Força Explícita:** Sobrescreve a detecção automática do Railway
- **Configuração Centralizada:** Todas as configurações em um único arquivo
- **Prioridade Alta:** O Railway dá prioridade ao railway.json sobre outras configurações
- **Clareza:** Deixa explícito que queremos usar DOCKERFILE builder
- **Flexibilidade:** Permite configurações avançadas de build e deploy

#### 5. Passos para Implementação

1. **Crie o arquivo railway.json** na raiz do projeto
2. **Adicione o Dockerfile alternativo** na raiz (opcional, mas recomendado)
3. **Atualize o arquivo .railway** para consistência
4. **Faça commit e push** das alterações
5. **Verifique no painel do Railway** se o builder mudou para DOCKERFILE
6. **Monitore os logs** para confirmar que Python está sendo usado

#### 6. Verificação

Após o deploy, verifique se está usando Docker builder:

```bash
# Verifica logs do build
railway logs --service detecface | grep -i docker

# Verifica se Python está sendo usado
railway logs --service detecface | grep -i python

# Verifica se as dependências foram instaladas
railway logs --service detecface | grep -i pip
```

#### 7. Troubleshooting

Se ainda assim o Railpack for usado:

1. **Verifique a sintaxe** do railway.json
2. **Confirme o caminho** do Dockerfile está correto
3. **Limpe o cache** do Railway: Settings → Build & Deploy → Clear Cache
4. **Reinicie o serviço** no Railway
5. **Contate o suporte** do Railway se o problema persistir

### Problema: Railway Migration from Dockerfile to Railpack (Anterior)

**Nota:** Esta seção foi mantida para referência histórica, mas a solução acima (Root Directory com Docker) é a abordagem recomendada atualmente.

**Sintomas:**
- Build fails with "Dockerfile `./Dockerfile` does not exist" when Root Directory is set
- Railway no longer recognizes Dockerfile builder option
- Deployment configurations that previously worked now fail
- Error messages about missing builder configuration

**Root Cause:**
Railway has deprecated the Dockerfile builder and now requires all deployments to use Railpack or Nixpacks. The Root Directory feature conflicts with this new approach.

**New Solutions for Railpack Deployment:**

1. **Configure railway.toml for Nixpacks**
   ```toml
   [build]
   # Usa Railpack para Python (Dockerfile builder não está mais disponível)
   builder = "NIXPACKS"
   # Comando para instalar dependências Python
   buildCommand = "pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir -r requirements-pytorch.txt"
   
   [service]
   name = "detecface"
   # Removido sourceDir para evitar erro "Dockerfile does not exist" com Root Directory
   
   # Comando de início explícito para otimizar o uso de recursos com Railpack
   startCommand = "gunicorn --bind 0.0.0.0:$PORT --workers 1 --timeout 600 --keepalive 2 --max-requests 500 --max-requests-jitter 100 --preload server:app"
   ```

2. **Update package.json for Railpack**
   ```json
   {
     "name": "detecface-python-app",
     "version": "1.0.0",
     "scripts": {
       "start": "python server.py",
       "build": "pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir -r requirements-pytorch.txt",
       "install": "pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir -r requirements-pytorch.txt",
       "setup": "chmod +x railpack-setup.sh && ./railpack-setup.sh"
     },
     "railway": {
       "builder": "NIXPACKS",
       "buildCommand": "npm run install",
       "startCommand": "python server.py",
       "pythonVersion": "3.10"
     }
   }
   ```

3. **Use railpack-setup.sh Script**
   - Create a setup script to handle Python environment configuration
   - Ensure proper dependency installation
   - Set up directories and permissions

4. **Deployment Strategy Without Root Directory**
   - Deploy from the repository root without setting Root Directory
   - Use Nixpacks to automatically detect Python project
   - Configure build and start commands in railway.toml

### Verification Steps for Railpack

1. Check build logs for Nixpacks usage:
   ```bash
   railway logs --service detecface | grep -i nixpacks
   ```

2. Verify the application is running Python:
   ```bash
   railway logs --service detecface | grep -i python
   ```

3. Check if dependencies were installed:
   ```bash
   railway logs --service detecface | grep -i pip
   ```

### Migration Steps from Dockerfile to Railpack

1. **Remove Dockerfile References**
   - Update railway.toml to use NIXPACKS builder
   - Remove dockerfilePath references
   - Remove Root Directory configuration in Railway UI

2. **Update Configuration Files**
   - Modify package.json for Railpack compatibility
   - Create railpack-setup.sh for environment setup
   - Update build commands

3. **Deploy Without Root Directory**
   - Deploy from repository root
   - Let Railway auto-detect Python project
   - Use explicit build and start commands

4. **Test and Verify**
   - Monitor deployment logs
   - Verify all dependencies are installed
   - Test application functionality

## Railway Deployment Issues

### Problem: Health Check Failures

**Symptoms:**
- Deployment marked as unhealthy
- Service not starting properly
- Connection timeouts

**Solutions:**

1. **Extended Health Check Timeout**
   - Increased from 100 to 120 seconds
   - Gives more time for application to initialize

2. **Optimized Health Check Configuration**
   ```toml
   [deploy]
   healthcheckPath = "/health"
   healthcheckTimeout = 120
   restartPolicyType = "ON_FAILURE"
   restartPolicyMaxRetries = 10
   ```

### Problem: Service Not Responding

**Solutions:**

1. **Check Application Logs**
   ```bash
   railway logs --service detecface
   ```

2. **Verify Environment Variables**
   ```bash
   railway variables
   ```

3. **Restart Service**
   ```bash
   railway restart --service detecface
   ```

## GitHub Actions Failures

### Problem: Memory Issues in CI/CD Pipeline

**Symptoms:**
- GitHub Actions runner out of memory
- Docker build failures
- Deployment timeouts

**Solutions:**

1. **Removed Docker Build from Workflow**
   - Eliminated memory-intensive Docker build step
   - Railway now handles the build process

2. **Implemented Retry with Exponential Backoff**
   - Up to 3 retry attempts for deployment
   - Exponential backoff between retries (30s, 60s, 120s)

3. **Extended Timeouts**
   - Health check timeout increased to 10 minutes
   - More time for deployment verification

### Example Retry Implementation

```yaml
- name: Deploy to Railway with retry
  run: |
    ATTEMPT=1
    MAX_ATTEMPTS=3
    BACKOFF=30
    
    while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
      echo "Deployment attempt $ATTEMPT/$MAX_ATTEMPTS"
      
      if railway up --service detecface; then
        echo "✅ Deployment successful!"
        break
      else
        echo "❌ Deployment failed, retrying in $BACKOFF seconds..."
        sleep $BACKOFF
        BACKOFF=$((BACKOFF * 2))
        ATTEMPT=$((ATTEMPT + 1))
        
        if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
          echo "❌ Deployment failed after $MAX_ATTEMPTS attempts"
          exit 1
        fi
      fi
    done
```

## Region Change Procedures

### When to Change Region

- Persistent deployment failures in current region
- High latency or connection issues
- Resource constraints in current region

### Steps to Change Region

1. **Backup Current Configuration**
   ```bash
   railway variables --service detecface > variables-backup.txt
   ```

2. **Create New Service in Different Region**
   ```bash
   railway create --service detecface-new --region <new-region>
   ```

3. **Restore Configuration**
   ```bash
   railway variables set --service detecface-new $(cat variables-backup.txt)
   ```

4. **Deploy to New Region**
   ```bash
   cd DetectFace
   railway up --service detecface-new
   ```

5. **Update GitHub Actions**
   - Update `RAILWAY_PROJECT_NAME` environment variable
   - Update any hardcoded service references

6. **Verify New Deployment**
   ```bash
   railway logs --service detecface-new
   railway domain --service detecface-new
   ```

7. **Delete Old Service (Optional)**
   ```bash
   railway delete --service detecface
   ```

### Available Railway Regions

- `us-east-1` - US East (N. Virginia)
- `us-west-1` - US West (Oregon)
- `eu-west-1` - Europe (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)

## Deployment Status Verification

### Commands to Check Deployment Status

1. **Check Service Status**
   ```bash
   railway status --service detecface
   ```

2. **View Deployment Logs**
   ```bash
   railway logs --service detecface
   ```

3. **Get Deployment URL**
   ```bash
   railway domain --service detecface
   ```

4. **Check Environment Variables**
   ```bash
   railway variables --service detecface
   ```

5. **Monitor Resource Usage**
   ```bash
   railway metrics --service detecface
   ```

### Health Check Endpoints

- Main endpoint: `https://your-domain.railway.app/`
- Health check: `https://your-domain.railway.app/health`

## Recovery Strategies

### Strategy 1: Automatic Recovery

The system is configured with automatic recovery mechanisms:

1. **Restart Policy**
   ```toml
   restartPolicyType = "ON_FAILURE"
   restartPolicyMaxRetries = 10
   ```

2. **Health Checks**
   ```toml
   healthcheckPath = "/health"
   healthcheckTimeout = 120
   ```

### Strategy 2: Manual Recovery

1. **Restart Service**
   ```bash
   railway restart --service detecface
   ```

2. **Redeploy Application**
   ```bash
   cd DetectFace
   railway up --service detecface
   ```

3. **Rollback to Previous Version**
   ```bash
   railway rollback --service detecface <deployment-id>
   ```

### Strategy 3: Emergency Recovery

1. **Create New Service**
   ```bash
   railway create --service detecface-emergency
   ```

2. **Deploy to Emergency Service**
   ```bash
   cd DetectFace
   railway up --service detecface-emergency
   ```

3. **Update DNS/Load Balancer**
   - Point traffic to emergency service
   - Monitor for stability

4. **Troubleshoot Original Service**
   - Once stable, switch back to original service

## Common Error Messages and Solutions

### Error: "Memory limit exceeded"

**Solution:**
- Verify worker count is set to 1
- Check if MAX_REQUESTS is set to 500
- Ensure timeouts are set to 600 seconds

### Error: "Health check failed"

**Solution:**
- Increase health check timeout to 120 seconds
- Verify application is binding to correct port
- Check if all dependencies are installed

### Error: "Deployment timeout"

**Solution:**
- Verify retry logic is implemented
- Check if timeouts are properly configured
- Monitor Railway logs for specific errors

### Error: "File not found"

**Solution:**
- Verify file synchronization step in GitHub Actions
- Check if all critical files are present
- Ensure correct working directory in deployment

## Monitoring and Alerting

### Recommended Monitoring Practices

1. **Set up alerts for service failures**
2. **Monitor memory usage trends**
3. **Track deployment success rates**
4. **Monitor response times**

### Alert Configuration

```bash
# Example: Set up alert for high memory usage
railway alerts create --service detecface --metric memory --threshold 80 --action notify
```

## Contact Support

If issues persist after trying these solutions:

1. **Railway Support**
   - Email: support@railway.app
   - Discord: https://discord.gg/railway

2. **GitHub Issues**
   - Create an issue in the project repository
   - Include logs and error messages

3. **Documentation**
   - Railway Documentation: https://docs.railway.app/
   - GitHub Actions Documentation: https://docs.github.com/en/actions

---

**Last Updated:** October 23, 2025

**Version:** 1.0

For questions or contributions to this troubleshooting guide, please create an issue in the project repository.