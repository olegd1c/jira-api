FROM node:20 AS builder

WORKDIR /shared
COPY shared/ ./

WORKDIR /app

# 1. Копіюємо тільки файли залежностей
COPY front/package*.json ./

# 2. Встановлюємо залежності (шар закешується)
RUN npm install

# 3. Копіюємо решту Angular-проєкту
COPY front/ ./
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=builder /app/dist/jira-front /usr/share/nginx/html

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
