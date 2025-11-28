#!/bin/bash

docker compose down
docker compose build --no-cache

# Запуск контейнера
docker-compose up --build