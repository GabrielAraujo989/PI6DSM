FROM node:20-alpine

# Criar diretório da aplicação
WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar a aplicação
RUN npm run build

# Script de inicialização: executa migrations e inicia o backend
RUN echo '#!/bin/sh' > /usr/src/app/start.sh && \
    echo 'echo "Aguardando banco de dados..."' >> /usr/src/app/start.sh && \
    echo 'until nc -z $DB_HOST $DB_PORT; do sleep 1; done' >> /usr/src/app/start.sh && \
    echo 'echo "Banco de dados pronto! Executando migrations..."' >> /usr/src/app/start.sh && \
    echo 'npm run migration:run' >> /usr/src/app/start.sh && \
    echo 'echo "Iniciando backend..."' >> /usr/src/app/start.sh && \
    echo 'node dist/src/main.js' >> /usr/src/app/start.sh && \
    chmod +x /usr/src/app/start.sh

# Remover arquivos desnecessários, mas manter node_modules para as migrações
RUN npm prune --production && \
    rm -rf src/ test/ node_modules/.cache

# Expor a porta da aplicação
EXPOSE 8082

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8082

# Comando para iniciar a aplicação
CMD ["/bin/sh", "/usr/src/app/start.sh"]