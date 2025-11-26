FROM python:3.10-slim AS builder

# Evita criação de pyc e garante saída não bufferizada
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

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
RUN python -m pip install --upgrade pip setuptools wheel && \
    python -m pip install --prefix=/install --no-cache-dir -r /app/requirements.txt

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

# Copia apenas o código necessário
COPY . /app

# Ajusta permissões e muda para usuário não-root
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000