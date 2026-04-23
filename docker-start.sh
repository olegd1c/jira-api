#!/bin/bash

docker compose down
# Запуск для оновлення образу
# docker compose build --no-cache 

# Запуск контейнера
docker-compose up --build