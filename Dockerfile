#FROM node:20.2.0-alpine AS build
#WORKDIR /app

# Copiar package.json y package-lock.json (si existe) e instalar dependencias
#COPY package*.json ./
#RUN npm install

# Copiar el resto del código fuente
#COPY . .

# Exponer el puerto 4200
#EXPOSE 4200

# Iniciar el servidor de desarrollo de Angular
#CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]


# Usar una imagen base de Nginx para servir contenido estático
FROM nginx:alpine

# Eliminar configuración por defecto de Nginx
#RUN rm /etc/nginx/conf.d/default.conf

# Copiar archivos de la build de Angular a Nginx
COPY dist/aprendiendo/browser /usr/share/nginx/html

# Copiar la nueva configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf


# Exponer el puerto en el que Nginx sirve (80 por defecto)
EXPOSE 80

# Iniciar Nginx (se inicia automáticamente con CMD predeterminado)
CMD ["nginx", "-g", "daemon off;"]

