#!/bin/bash

# Script para verificar e baixar o modelo best.pt caso não exista
# Útil para deployments em nuvem onde o modelo pode não estar incluído na imagem

MODEL_PATH="${MODEL_PATH:-/app/best.pt}"
MODEL_URL="${MODEL_URL:-https://github.com/ultralytics/ultralytics/releases/download/v8.0.0/yolov8n.pt}"

echo "Verificando se o modelo existe em: $MODEL_PATH"

# Verifica se o arquivo do modelo existe
if [ -f "$MODEL_PATH" ]; then
    echo "Modelo encontrado em $MODEL_PATH"
    echo "Tamanho do modelo: $(du -h $MODEL_PATH | cut -f1)"
else
    echo "Modelo não encontrado. Baixando modelo padrão..."
    
    # Cria o diretório se não existir
    mkdir -p "$(dirname "$MODEL_PATH")"
    
    # Baixa o modelo com retry
    MAX_RETRIES=3
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        echo "Tentativa $((RETRY_COUNT + 1)) de baixar o modelo..."
        
        if wget -O "$MODEL_PATH" "$MODEL_URL" --timeout=300 --tries=1; then
            echo "Modelo baixado com sucesso!"
            echo "Tamanho do modelo: $(du -h $MODEL_PATH | cut -f1)"
            break
        else
            echo "Falha ao baixar o modelo. Tentativa $((RETRY_COUNT + 1)) de $MAX_RETRIES"
            RETRY_COUNT=$((RETRY_COUNT + 1))
            
            # Limpa arquivo parcial se existir
            if [ -f "$MODEL_PATH" ]; then
                rm -f "$MODEL_PATH"
            fi
            
            # Espera antes de tentar novamente
            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                echo "Aguardando 10 segundos antes de tentar novamente..."
                sleep 10
            fi
        fi
    done
    
    # Verifica se o download foi bem-sucedido
    if [ ! -f "$MODEL_PATH" ]; then
        echo "ERRO: Não foi possível baixar o modelo após $MAX_RETRIES tentativas."
        echo "Verifique a URL do modelo ou a conectividade com a internet."
        exit 1
    fi
fi

# Verifica se o arquivo é válido (não está vazio)
if [ ! -s "$MODEL_PATH" ]; then
    echo "ERRO: O arquivo do modelo está vazio ou corrompido."
    exit 1
fi

echo "Inicialização do modelo concluída com sucesso!"