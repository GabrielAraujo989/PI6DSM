FROM node:18-alpine

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

# Remover arquivos desnecessários
RUN npm prune --production && \
    rm -rf src/ test/ node_modules/.cache

# Expor a porta da aplicação
EXPOSE 8081

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8081

# Comando para iniciar a aplicação
CMD ["node", "dist/src/main.js"]
