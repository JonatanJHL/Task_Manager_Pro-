FROM node:18-alpine

WORKDIR /app

# Instala dependencias primero (mejor cache de capas)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia el resto del código
COPY . .

# Carpeta de adjuntos (se monta como volumen en compose)
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "src/app.js"]
