FROM node:20 AS builder

WORKDIR /shared
COPY shared/ ./

WORKDIR /app

# Копіюємо Angular проєкт
COPY front/ ./

RUN npm install
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=builder /app/dist/jira-front /usr/share/nginx/html

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
