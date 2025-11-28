FROM node:20 AS builder

# Копіюємо shared у корінь контейнера
WORKDIR /shared
COPY shared/ ./

# Переходимо до NestJS проекту
WORKDIR /app

# 1. Копіюємо package.json з server/
COPY server/package*.json ./

# 2. Встановлюємо залежності
RUN npm install

# 3. Копіюємо увесь Nest-проєкт
COPY server/ ./

# 4. Компілюємо
RUN npm run build

# 5. Експонуємо порт
EXPOSE 3007

# 6. Запускаємо NestJS
CMD ["node", "dist/server/main.js"]
#CMD ["npm", "run", "start"]
