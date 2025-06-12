FROM python:3.10-slim

# Instala dependências do sistema
RUN apt-get update && \
    apt-get install -y ffmpeg libsm6 libxext6 libgl1-mesa-glx && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia requirements e instala dependências Python
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copia o código do projeto
COPY . .

# Expõe a porta padrão do FastAPI
EXPOSE 8000

# Comando para rodar o servidor
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]