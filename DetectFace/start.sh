#!/bin/bash

# Script de inicialização para o DetecFace no Railway
# Este script lida com a variável PORT de forma segura e evita conflitos

echo "=== Iniciando DetecFace no Railway ==="
echo "Variáveis de ambiente recebidas:"
echo "PORT=${PORT:-não definida}"
echo "WORKERS=${WORKERS:-1}"
echo "TIMEOUT=${TIMEOUT:-600}"

# Se PORT não estiver definida, usa o padrão 8000
if [ -z "$PORT" ]; then
    echo "PORT não definida, usando padrão 8000"
    PORT=8000
fi

# Verifica se PORT é um número válido
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "ERRO: PORT '$PORT' não é um número válido"
    exit 1
fi

# Verifica se PORT está na faixa válida
if [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    echo "ERRO: PORT '$PORT' está fora da faixa válida (1-65535)"
    exit 1
fi

echo "Usando PORT=$PORT (validada)"

# Atualiza o arquivo .env se existir, removendo qualquer definição de PORT
if [ -f /app/.env ]; then
    echo "Removendo definição de PORT do arquivo .env"
    sed -i '/^PORT=/d' /app/.env
fi

# Inicia a aplicação com gunicorn
echo "Iniciando gunicorn na porta $PORT..."
exec gunicorn \
    --bind 0.0.0.0:$PORT \
    --workers ${WORKERS:-1} \
    --timeout ${TIMEOUT:-600} \
    --keep-alive ${KEEPALIVE:-2} \
    --max-requests ${MAX_REQUESTS:-500} \
    --max-requests-jitter ${MAX_REQUESTS_JITTER:-100} \
    --preload \
    server:app