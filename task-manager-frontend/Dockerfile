# --- Etapa 1: build ---
FROM node:18-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Vite "hornea" las variables VITE_* dentro del bundle en build time, no se
# pueden cambiar después arrancando el contenedor con otro valor.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# --- Etapa 2: servir con nginx ---
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
