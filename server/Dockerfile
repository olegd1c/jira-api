FROM node:20 AS builder

WORKDIR /app

# 1. Копіюємо тільки файли залежностей
COPY server/package*.json ./

# 2. Встановлюємо залежності (шар закешується)
RUN npm install

# 3. Копіюємо shared моделі
WORKDIR /shared
COPY shared/ ./

# 4. Копіюємо увесь Nest-проєкт
WORKDIR /app
COPY server/ ./

# 5. Компілюємо
RUN npm run build

# 6. Експонуємо порт
EXPOSE 3007

# 7. Запускаємо NestJS
CMD ["node", "dist/server/main.js"]
