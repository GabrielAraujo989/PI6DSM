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

### Usando Docker Compose (Recomendado)

Para facilitar o deploy, use o docker-compose:

```bash
docker-compose up -d
```

### Reconstruindo o Container (Após Mudanças no requirements.txt)

Se você fez alterações no requirements.txt (como correções de versão do PyTorch), use os scripts de reconstrução:

**Linux/Mac:**
```bash
./rebuild_docker.sh
```

**Windows:**
```cmd
rebuild_docker.bat
```

Ou manualmente:
```bash
docker-compose down
docker-compose down --rmi all
docker-compose build --no-cache
docker-compose up -d
```

> **Atenção:**
> - Não suba arquivos de modelo (.pt), vídeos, imagens ou dados sensíveis para o repositório.
> - O backend deve apontar para o endpoint do container (ex: http://detectface:8000 ou via ngrok para testes externos).
> - Ao atualizar dependências, sempre reconstrua o container com --no-cache para garantir que as novas versões sejam instaladas.
