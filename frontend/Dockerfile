# Dockerfile para frontend Expo/React Native Web

# Etapa de build
FROM node:20-alpine as build

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos package.json e package-lock.json
COPY package*.json ./

# Instalar as dependências
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Build para web (Expo Router)
RUN npx expo export --platform web

# Etapa de produção
FROM nginx:alpine

# Copia o build gerado para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia nossa configuração customizada do NGINX, que sabe lidar com SPAs.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
