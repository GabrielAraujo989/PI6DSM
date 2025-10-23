FROM python:3.10-slim AS builder

# Evita criação de pyc e garante saída não bufferizada
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DEFAULT_TIMEOUT=300 \
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

# Atualiza pip e instala as dependências no prefix /install (será copiado para final image)
# Usando timeout estendido e otimizações para evitar problemas de deploy
RUN python -m pip install --upgrade pip setuptools wheel --timeout 300 && \
    python -m pip install --prefix=/install --no-cache-dir -r /app/requirements.txt --timeout 300

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
COPY .env.production /app/.env

# Ajusta permissões e muda para usuário não-root
RUN chown -R appuser:appuser /app
USER appuser

# Health check para verificar se a API está respondendo
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

# CMD para execução com gunicorn em modo de produção
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120", "--keepalive", "2", "--max-requests", "1000", "--max-requests-jitter", "100", "--preload", "server:app"]