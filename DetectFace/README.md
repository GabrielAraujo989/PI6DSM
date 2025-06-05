# DetectFace

Esta pasta contém scripts e modelos para detecção facial utilizando YOLO e outros métodos.

## Estrutura
- **Yolo_Test/**: Scripts de teste, exemplos de vídeo, modelos pré-treinados e API FastAPI para streaming seguro.
- **recognition-system/**: Sistema de reconhecimento facial, implementado em Node.js/TypeScript.

## Como usar a API FastAPI (Yolo_Test/server.py)
1. Instale as dependências necessárias:
   ```bash
   pip install -r requirements.txt
   sudo apt-get update && sudo apt-get install ffmpeg libsm6 libxext6 -y
   ```
2. Defina a variável de ambiente `SECRET_KEY` (ou edite o arquivo `.env`) para corresponder ao backend.
3. Inicie a API:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8000
   ```
4. Para rodar via Docker:
   ```bash
   docker build -t detectface .
   docker run -p 8000:8000 --env-file .env detectface
   ```
5. Para iniciar o monitoramento de uma câmera IP (JWT obrigatório):
   ```bash
   curl -X POST http://localhost:8000/start_camera/ \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <SEU_TOKEN_JWT>" \
     -d '{"url":"http://IP_DA_CAMERA:PORTA/video"}'
   ```
   Resposta:
   ```json
   {
     "status": "started",
     "camera": "http://IP_DA_CAMERA:PORTA/video",
     "stream_url": "/stream/video/0"
   }
   ```
6. Para acessar o stream (JWT obrigatório):
   ```
   GET http://localhost:8000/stream/video/0
   Header: Authorization: Bearer <SEU_TOKEN_JWT>
   ```

## Observações
- Todos os endpoints de streaming exigem autenticação JWT.
- O backend NestJS faz a ponte entre o frontend e esta API, repassando o token do usuário.
- Modelos grandes (.pt, .onnx) estão ignorados no Git.
- Consulte os READMEs específicos de cada subpasta para detalhes de uso.
