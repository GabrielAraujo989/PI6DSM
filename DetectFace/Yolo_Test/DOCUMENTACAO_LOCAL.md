# DOCUMENTAÇÃO LOCAL – Detecção Facial com YOLO e FastAPI

**Este arquivo é para uso interno e não deve ser enviado ao GitHub.**

---

## Visão Geral
Este sistema permite detectar rostos em tempo real a partir de múltiplas câmeras (webcam, celular, IP) usando um modelo YOLO customizado. A aplicação expõe uma API FastAPI para receber URLs de câmeras e exibe todas as imagens processadas em uma única janela, lado a lado.

---

## Estrutura dos Arquivos
- `server.py`: API principal e lógica de detecção/processamento.
- `best.pt`: Modelo YOLO treinado para detecção facial.
- `requirements.txt`: Dependências Python.
- `Dockerfile`: (opcional) Para rodar em container.

---

## Passo a Passo para Rodar o Projeto

### 1. Instale as dependências
```bash
pip install -r requirements.txt
sudo apt-get update && sudo apt-get install ffmpeg libsm6 libxext6 -y
```

### 2. Execute a API FastAPI
```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```

### 3. (Opcional) Exponha a API para acesso externo
```bash
ngrok config add-authtoken SEU_TOKEN_NGROK
ngrok http 8000
```

### 4. Transforme seu celular em uma câmera IP
- Instale o app IP Webcam (Android) ou similar.
- Inicie a transmissão e anote a URL do vídeo (ex: `http://192.168.1.196:8080/video`).

### 5. Conecte a câmera à API
Envie um POST para a API:
```bash
curl -X POST http://localhost:8000/start_camera/ \
  -H "Content-Type: application/json" \
  -d '{"url":"http://192.168.1.196:8080/video"}'
```
Ou, se estiver usando ngrok:
```bash
curl -X POST https://SEU_LINK_NGROK/start_camera/ \
  -H "Content-Type: application/json" \
  -d '{"url":"http://192.168.1.196:8080/video"}'
```

### 6. Visualize as câmeras
- Uma janela chamada "Monitoramento" será aberta mostrando todas as câmeras conectadas, lado a lado.
- Para fechar, pressione `q` ou `ESC` na janela.

---

## Como funciona internamente
- Cada câmera conectada roda em uma thread separada.
- O frame processado de cada câmera é salvo em um dicionário global.
- Uma thread principal monta todos os frames em um painel único e exibe na tela.
- O modelo YOLO é carregado uma única vez e compartilhado entre as threads.

---

## Observações
- O arquivo `DOCUMENTACAO_LOCAL.md` é apenas para consulta interna.
- Não suba este arquivo para o GitHub.
- Para dúvidas ou problemas, consulte o código-fonte ou entre em contato com o responsável pelo projeto.
