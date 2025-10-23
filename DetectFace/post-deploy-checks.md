# Verificações Pós-Deploy do DetecFace no Railway

Este documento contém uma lista completa de verificações a serem realizadas após o deploy do DetecFace no Railway, além de orientações para monitoramento, alertas e solução de problemas.

## Índice

1. [Lista de Verificações Pós-Deploy](#lista-de-verificações-pós-deploy)
2. [Teste de Endpoints Específicos](#teste-de-endpoints-específicos)
3. [Monitoramento de Logs](#monitoramento-de-logs)
4. [Configuração de Alertas Básicos](#configuração-de-alertas-básicos)
5. [Solução de Problemas Comuns](#solução-de-problemas-comuns)

## 1. Lista de Verificações Pós-Deploy

### Verificações Básicas

- [ ] **Status do Deployment**: Verificar se o deployment aparece como "✅ Deployed" no dashboard Railway
- [ ] **URL Acessível**: Confirmar que a URL do serviço está acessível via navegador
- [ ] **Health Check**: Verificar se o endpoint `/health` retorna status 200
- [ ] **Variáveis de Ambiente**: Confirmar que todas as variáveis de ambiente foram configuradas corretamente
- [ ] **Logs de Inicialização**: Verificar logs em busca de erros durante a inicialização

### Verificações de Funcionalidade

- [ ] **API de Detecção**: Testar endpoint de detecção com uma imagem de exemplo
- [ ] **Upload de Arquivos**: Verificar se o upload de imagens funciona corretamente
- [ ] **Respostas JSON**: Confirmar que as respostas da API estão em formato JSON válido
- [ ] **Códigos de Status**: Verificar se os códigos HTTP estão corretos (200, 400, 500, etc.)
- [ ] **Performance**: Testar tempo de resposta dos endpoints

### Verificações de Recursos

- [ ] **Uso de Memória**: Monitorar consumo de memória da aplicação
- [ ] **Uso de CPU**: Verificar uso de CPU durante operações de detecção
- [ ] **Armazenamento**: Confirmar que há espaço suficiente para modelos e arquivos temporários
- [ ] **Rede**: Verificar conectividade com serviços externos (se aplicável)

## 2. Teste de Endpoints Específicos

### Script de Teste Automatizado

Crie um arquivo `test-api.sh` com o seguinte conteúdo:

```bash
#!/bin/bash

# Script para testar endpoints do DetecFace após deploy

API_URL="https://seu-produto.up.railway.app"  # Substitua pela sua URL

echo "Testando API do DetecFace em: $API_URL"
echo "=========================================="

# Teste 1: Health Check
echo "1. Testando Health Check..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$response" = "200" ]; then
    echo "✅ Health Check OK (HTTP $response)"
else
    echo "❌ Health Check Falhou (HTTP $response)"
fi

# Teste 2: Detecção com URL de imagem
echo -e "\n2. Testando Detecção com URL..."
test_image_url="https://via.placeholder.com/300x300/000000/FFFFFF?text=Face"
response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"image_url\": \"$test_image_url\"}" \
  "$API_URL/detect")

if echo "$response" | grep -q "faces\|error"; then
    echo "✅ Endpoint de Detecção OK"
    echo "Resposta: $response"
else
    echo "❌ Endpoint de Detecção Falhou"
    echo "Resposta: $response"
fi

# Teste 3: Upload de arquivo
echo -e "\n3. Testando Upload de Arquivo..."
if [ -f "test_image.jpg" ]; then
    response=$(curl -s -X POST \
      -F "file=@test_image.jpg" \
      "$API_URL/detect")
    
    if echo "$response" | grep -q "faces\|error"; then
        echo "✅ Upload de Arquivo OK"
        echo "Resposta: $response"
    else
        echo "❌ Upload de Arquivo Falhou"
        echo "Resposta: $response"
    fi
else
    echo "⚠️ Arquivo de teste (test_image.jpg) não encontrado"
fi

# Teste 4: Endpoint inválido
echo -e "\n4. Testando Endpoint Inválido..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/endpoint-inexistente")
if [ "$response" = "404" ]; then
    echo "✅ Tratamento de Endpoint Inválido OK (HTTP $response)"
else
    echo "❌ Tratamento de Endpoint Inválido Falhou (HTTP $response)"
fi

echo -e "\nTestes concluídos!"
```

### Testes Manuais

#### Health Check

```bash
curl -X GET https://seu-projeto.up.railway.app/health

# Resposta esperada:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0"
}
```

#### Detecção com URL

```bash
curl -X POST \
  https://seu-projeto.up.railway.app/detect \
  -H 'Content-Type: application/json' \
  -d '{
    "image_url": "https://example.com/face.jpg"
  }'

# Resposta esperada:
{
  "faces": [
    {
      "confidence": 0.95,
      "bbox": [100, 150, 200, 250]
    }
  ],
  "processing_time": 0.123
}
```

#### Upload de Arquivo

```bash
curl -X POST \
  https://seu-projeto.up.railway.app/detect \
  -F 'file=@/caminho/para/imagem.jpg'
```

## 3. Monitoramento de Logs

### Acessando Logs

#### Via Interface Web

1. Acesse o dashboard do Railway
2. Selecione seu projeto e serviço
3. Clique na aba "Logs"
4. Use os filtros para visualizar logs específicos

#### Via CLI

```bash
# Verificar logs em tempo real
railway logs

# Verificar logs dos últimos 100 eventos
railway logs --tail 100

# Verificar logs de um deployment específico
railway logs --deployment <deployment-id>
```

### Tipos de Logs para Monitorar

#### Logs de Aplicação

```
[INFO] Application starting...
[INFO] Server running on port 8000
[INFO] Model loaded successfully
[INFO] Processing detection request
[INFO] Detection completed in 0.123s
```

#### Logs de Erro

```
[ERROR] Failed to load model: Model file not found
[ERROR] Invalid image format
[ERROR] Database connection failed
[ERROR] Memory allocation failed
```

#### Logs de Performance

```
[PERF] Request processed in 0.456s
[PERF] Memory usage: 256MB
[PERF] CPU usage: 45%
```

### Configurando Logs Estruturados

Adicione ao seu `server.py`:

```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        if hasattr(record, 'extra'):
            log_entry.update(record.extra)
            
        return json.dumps(log_entry)

# Configurar logger
logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

## 4. Configuração de Alertas Básicos

### Alertas no Railway

O Railway oferece monitoramento básico integrado. Para configurar alertas:

1. Vá para "Settings" > "Notifications"
2. Configure notificações por email para:
   - Falhas de deployment
   - Alto uso de recursos
   - Erros frequentes

### Alertas Personalizados com Uptime Robot

1. Crie uma conta em [Uptime Robot](https://uptimerobot.com/)
2. Adicione um novo monitor:
   - **Tipo**: HTTP(s)
   - **URL**: `https://seu-projeto.up.railway.app/health`
   - **Intervalo**: 5 minutos
   - **Alertas**: Configure email, Slack, etc.

### Script de Monitoramento Personalizado

Crie `monitor.sh`:

```bash
#!/bin/bash

API_URL="https://seu-projeto.up.railway.app"
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

check_health() {
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
    
    if [ "$response" != "200" ]; then
        send_alert "Health check failed with HTTP $response"
        return 1
    fi
    
    return 0
}

send_alert() {
    message="🚨 DetecFace Alert: $1"
    
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"$message\"}" \
        "$WEBHOOK_URL"
}

# Verificação principal
if ! check_health; then
    echo "Alert sent!"
else
    echo "All systems operational"
fi
```

### Configurar Cron Job

Adicione ao seu crontab para verificações a cada 5 minutos:

```bash
*/5 * * * * /caminho/para/monitor.sh >> /var/log/detecface-monitor.log 2>&1
```

## 5. Solução de Problemas Comuns

### Problema: Deployment Falha

#### Sintomas
- Deployment aparece com status "❌ Failed"
- Logs mostram erros de build

#### Soluções

1. **Verificar Dockerfile**
   ```bash
   # Testar build localmente
   docker build -t detecface-test .
   docker run -p 8000:8000 detecface-test
   ```

2. **Verificar requirements.txt**
   ```bash
   # Verificar se há dependências faltando
   pip install -r requirements.txt
   ```

3. **Verificar variáveis de ambiente**
   ```bash
   railway variables list
   ```

### Problema: API Não Responde

#### Sintomas
- Health check retorna 404 ou 500
- Timeout nas requisições

#### Soluções

1. **Verificar se a aplicação iniciou**
   ```bash
   railway logs | grep "Server running"
   ```

2. **Verificar porta**
   ```bash
   # Confirmar que a variável PORT está configurada
   railway variables get PORT
   ```

3. **Verificar se o modelo foi carregado**
   ```bash
   railway logs | grep "Model loaded"
   ```

### Problema: Detecção Não Funciona

#### Sintomas
- Endpoint de detecção retorna erro
- Resultados vazios ou incorretos

#### Soluções

1. **Verificar arquivo do modelo**
   ```bash
   # Verificar se best.pt existe no container
   railway exec -- ls -la best.pt
   ```

2. **Verificar dependências de ML**
   ```bash
   # Verificar se PyTorch e OpenCV estão instalados
   railway exec -- python -c "import torch; import cv2; print('OK')"
   ```

3. **Testar com imagem conhecida**
   ```bash
   # Fazer upload de uma imagem de teste
   curl -X POST -F "file=@test_face.jpg" https://seu-projeto.up.railway.app/detect
   ```

### Problema: Alto Consumo de Memória

#### Sintomas
- Aplicação reinicia inesperadamente
- Logs mostram "Out of Memory"

#### Soluções

1. **Otimizar carregamento do modelo**
   ```python
   # Carregar modelo uma única vez
   model = None
   
   def get_model():
       global model
       if model is None:
           model = YOLO('best.pt')
       return model
   ```

2. **Limpar cache regularmente**
   ```python
   import gc
   
   def detect_faces(image):
       # ... processamento ...
       gc.collect()  # Forçar garbage collection
   ```

3. **Upgrade do plano Railway**
   - Considere um plano com mais memória
   - Configure variáveis de ambiente para otimização

### Problema: Lentidão na Resposta

#### Sintomas
- Tempo de resposta > 5 segundos
- Timeout em requisições grandes

#### Soluções

1. **Implementar cache**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=128)
   def get_cached_result(image_hash):
       # ... processamento ...
   ```

2. **Otimizar processamento de imagem**
   ```python
   # Reduzir tamanho da imagem antes do processamento
   def preprocess_image(image, max_size=640):
       height, width = image.shape[:2]
       if max(height, width) > max_size:
           scale = max_size / max(height, width)
           new_width = int(width * scale)
           new_height = int(height * scale)
           image = cv2.resize(image, (new_width, new_height))
       return image
   ```

3. **Configurar timeout adequado**
   ```python
   # No railway.toml
   [deploy]
   healthcheckPath = "/health"
   healthcheckTimeout = 30
   restartPolicyType = "on_failure"
   ```

### Comandos de Diagnóstico Úteis

```bash
# Verificar status completo
railway status

# Verificar uso de recursos
railway metrics

# Reiniciar serviço
railway restart

# Verificar variáveis de ambiente
railway variables list

# Acessar shell do container
railway exec -- bash

# Verificar deployments anteriores
railway deployments list

# Reverter para deployment anterior
railway rollback <deployment-id>
```

## Checklist de Emergência

Se a API estiver fora do ar:

1. [ ] Verificar status no dashboard Railway
2. [ ] Analisar logs de erro recentes
3. [ ] Verificar se há deployment em andamento
4. [ ] Tentar reiniciar o serviço
5. [ ] Reverter para último deployment funcional
6. [ ] Notificar usuários sobre a interrupção
7. [ ] Documentar o incidente para análise posterior

## Recursos Adicionais

- [Documentação Oficial do Railway](https://docs.railway.app/)
- [Guia de Docker para DetecFace](./DOCKER_OPTIMIZATION_GUIDE.md)
- [Guia de Deployment no Railway](./RAILWAY_DEPLOYMENT_GUIDE.md)
- [Script de Configuração Automática](./setup-railway.sh)