Teste YOLO versão 11

Versão do Python Utilizada: 3.11.7


![Slide39](https://github.com/user-attachments/assets/1fa5019f-1528-44ba-9bbb-27b010593b21)

## Deploy com Docker

1. Certifique-se de que o arquivo `.env` está presente com sua SECRET_KEY.
2. O arquivo `.dockerignore` já está configurado para não subir modelos, vídeos, imagens, cache e arquivos sensíveis.
3. Para buildar e rodar:
   ```bash
   docker build -t detectface .
   docker run -p 8000:8000 --env-file .env detectface
   ```
4. O container estará pronto para receber requisições JWT do backend.

> **Atenção:**
> - Não suba arquivos de modelo (.pt), vídeos, imagens ou dados sensíveis para o repositório.
> - O backend deve apontar para o endpoint do container (ex: http://detectface:8000 ou via ngrok para testes externos).
