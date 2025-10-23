FROM python:3.10-slim AS builder

# Evita criação de pyc e garante saída não bufferizada
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DEFAULT_TIMEOUT=600 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instala ferramentas necessárias para build de pacotes e dependências nativas
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        wget \
        libsm6 \
        libxext6 \
        libgl1 \
        libgl1-mesa-dri \
        ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia apenas requirements para aproveitar cache de camada
COPY requirements.txt /app/requirements.txt
COPY requirements-pytorch.txt /app/requirements-pytorch.txt

# Atualiza pip e instala as dependências no prefix /install (será copiado para final image)
# Primeiro instala as dependências padrão do PyPI com flags de otimização
RUN python -m pip install --upgrade pip setuptools wheel --timeout 600 --no-cache-dir && \
    python -m pip install --prefix=/install --no-cache-dir --no-deps -r /app/requirements.txt --timeout 600

# Depois instala o PyTorch do repositório específico com flags de otimização
RUN python -m pip install --prefix=/install --no-cache-dir --no-deps -r /app/requirements-pytorch.txt --timeout 600

########################################
## Final image (menor, runtime only)
########################################
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/install/bin:$PATH

# Instala runtime deps (sem ferramentas de build) e curl para healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libsm6 \
        libxext6 \
        libgl1 \
        libgl1-mesa-dri \
        ffmpeg \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Cria usuário não-root para executar a aplicação
RUN useradd --create-home --shell /bin/bash appuser

WORKDIR /app

# Copia as dependências instaladas no builder
COPY --from=builder /install /usr/local

# Copia apenas o código necessário (excluindo modelos grandes que serão montados como volume)
COPY server.py /app/

# Try to copy .env.production if it exists, otherwise create a default .env
# This handles both local builds and EasyPanel/Digital Ocean deployments
RUN if [ -f .env.production ]; then \
        cp .env.production /app/.env; \
    else \
        echo "# Default production environment" > /app/.env; \
        echo "ENV=production" >> /app/.env; \
        echo "HOST=0.0.0.0" >> /app/.env; \
        echo "PORT=8000" >> /app/.env; \
        echo "WORKERS=1" >> /app/.env; \
        echo "WORKER_CLASS=uvicorn.workers.UvicornWorker" >> /app/.env; \
        echo "TIMEOUT=600" >> /app/.env; \
        echo "KEEPALIVE=2" >> /app/.env; \
        echo "MAX_REQUESTS=500" >> /app/.env; \
        echo "MAX_REQUESTS_JITTER=100" >> /app/.env; \
        echo "PRELOAD_APP=1" >> /app/.env; \
        echo "LOG_LEVEL=info" >> /app/.env; \
        echo "SECRET_KEY=change-this-secret-key-in-production" >> /app/.env; \
        echo "MODEL_PATH=/app/best.pt" >> /app/.env; \
        echo "WORKER_CONNECTIONS=1000" >> /app/.env; \
        echo "WORKER_TEMP_DIR=/dev/shm" >> /app/.env; \
        echo "PIP_TIMEOUT=600" >> /app/.env; \
        echo "MODEL_LOADING_TIMEOUT=180" >> /app/.env; \
        echo "CAMERA_CONNECTION_TIMEOUT=10" >> /app/.env; \
        echo "ACCESS_LOG_FORMAT=%(h)s %(l)s %(u)s %(t)s \"%(r)s\" %(s)s %(b)s \"%(f)s\" \"%(a)s\" %(D)s" >> /app/.env; \
    fi

# Ajusta permissões e muda para usuário não-root
RUN chown -R appuser:appuser /app
USER appuser

# Health check para verificar se a API está respondendo
# Usa a variável de ambiente PORT injetada pelo Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

EXPOSE ${PORT:-8000}

# Script de inicialização que lê a variável de ambiente PORT do Railway
COPY <<EOF /app/start.sh
#!/bin/bash
# Usa a porta injetada pelo Railway ou fallback para 8000
PORT=\${PORT:-8000}
echo "Iniciando aplicação na porta \$PORT"
exec gunicorn --bind 0.0.0.0:\$PORT --workers \${WORKERS:-1} --timeout \${TIMEOUT:-600} --keepalive \${KEEPALIVE:-2} --max-requests \${MAX_REQUESTS:-500} --max-requests-jitter \${MAX_REQUESTS_JITTER:-100} --preload server:app
EOF

# Torna o script executável
RUN chmod +x /app/start.sh

# CMD para execução com o script que lê a variável de ambiente PORT
CMD ["/app/start.sh"]