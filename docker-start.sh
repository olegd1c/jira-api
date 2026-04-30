#!/bin/bash

COMMAND=$1

# Функція для запуску
run_compose() {
  local build_flag=$1
  echo "🚀 Запуск контейнерів..."
  # --remove-orphans видалить контейнери, яких більше немає в конфігу
  docker compose -f docker-compose.yml up $build_flag -d --remove-orphans
  echo "✅ Готово! Контейнери запущені у фоні."
  echo "Щоб переглянути логи, виконайте: docker compose logs -f"
}

if [ "$COMMAND" == "build" ]; then
  echo "🛠 Перезбірка та запуск..."
  run_compose "--build"
elif [ "$COMMAND" == "stop" ]; then
  echo "🛑 Зупинка сервісів..."
  docker compose down
else
  echo "▶️ Звичайний запуск..."
  run_compose ""
fi

#./docker-start.sh build — перезібрати та запустити.
#./docker-start.sh — просто запустити те, що вже зібрано.
#./docker-start.sh stop — зупинити все.