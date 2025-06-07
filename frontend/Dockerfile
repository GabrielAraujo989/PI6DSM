# Dockerfile para frontend Expo/React Native Web

# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# Build para web (Expo Router)
RUN echo "[BUILD] Iniciando build Expo Router..." && npx expo export --platform web && echo "[BUILD] Build Expo finalizado."

# Etapa de produção
FROM nginx:alpine

# Adiciona logs customizados de inicialização
RUN echo 'echo "[NGINX] Iniciando container NGINX..."' > /docker-entrypoint.d/00-log.sh && chmod +x /docker-entrypoint.d/00-log.sh

# Copia o build gerado para o nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia nossa configuração customizada do NGINX, que sabe lidar com SPAs.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
