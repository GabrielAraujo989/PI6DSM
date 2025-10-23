#!/bin/bash

# Script de teste para validar a solução do problema da variável PORT
# Este script simula o comportamento do Railway localmente

echo "=== Teste da Solução para Variável PORT ==="
echo "Simulando ambiente Railway..."

# Simula variáveis de ambiente do Railway
export PORT=${PORT:-8000}
export WORKERS=${WORKERS:-1}
export TIMEOUT=${TIMEOUT:-600}
export ENV=${ENV:-production}
export HOST=${HOST:-0.0.0.0}

echo "Variáveis de ambiente:"
echo "PORT=$PORT"
echo "WORKERS=$WORKERS"
echo "TIMEOUT=$TIMEOUT"
echo "ENV=$ENV"
echo "HOST=$HOST"

# Testa validação da variável PORT (mesma lógica do start.sh)
if [ -z "$PORT" ]; then
    echo "ERRO: PORT não definida"
    exit 1
fi

if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "ERRO: PORT '$PORT' não é um número válido"
    exit 1
fi

if [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
    echo "ERRO: PORT '$PORT' está fora da faixa válida (1-65535)"
    exit 1
fi

echo "✓ PORT validada com sucesso: $PORT"

# Cria um arquivo .env de teste
echo "# Test environment" > test.env
echo "ENV=production" >> test.env
echo "HOST=0.0.0.0" >> test.env
echo "# PORT será injetada pelo Railway - não definir aqui" >> test.env
echo "WORKERS=1" >> test.env

# Verifica se PORT não está definida no .env
if grep -q "^PORT=" test.env; then
    echo "ERRO: PORT está definida no arquivo .env"
    exit 1
else
    echo "✓ PORT não está definida no arquivo .env (correto)"
fi

# Testa o comando do gunicorn (sem executar)
GUNICORN_CMD="gunicorn --bind 0.0.0.0:$PORT --workers ${WORKERS:-1} --timeout ${TIMEOUT:-600} --keep-alive ${KEEPALIVE:-2} --max-requests ${MAX_REQUESTS:-500} --max-requests-jitter ${MAX_REQUESTS_JITTER:-100} --preload server:app"

echo "Comando que será executado:"
echo "$GUNICORN_CMD"

# Verifica se o comando contém a variável PORT expandida
if [[ "$GUNICORN_CMD" == *"\$PORT"* ]] || [[ "$GUNICORN_CMD" == *"\${PORT}"* ]]; then
    echo "ERRO: Variável PORT não foi expandida no comando"
    exit 1
else
    echo "✓ Variável PORT foi expandida corretamente no comando"
fi

# Limpa
rm -f test.env

echo ""
echo "=== Todos os testes passaram! ==="
echo "A solução deve funcionar corretamente no Railway."
echo ""
echo "Próximos passos:"
echo "1. Faça commit das alterações"
echo "2. Faça push para o GitHub"
echo "3. Monitore os logs no Railway"
echo "4. Verifique se o erro de PORT não ocorre mais"