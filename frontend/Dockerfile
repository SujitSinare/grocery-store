# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Nginx stage
FROM nginx:alpine
COPY --from=builder /app/dist/grocery-store/browser /usr/share/nginx/html
# COPY custom nginx.conf if needed, or rely on default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
