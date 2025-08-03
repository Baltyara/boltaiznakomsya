#!/bin/bash

# Скрипт для деплоя приложения
set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функции для логирования
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка переменных окружения
check_env() {
    log_info "Проверка переменных окружения..."
    
    required_vars=(
        "NODE_ENV"
        "DB_HOST"
        "DB_PASSWORD"
        "JWT_SECRET"
        "REDIS_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Переменная $var не установлена"
            exit 1
        fi
    done
    
    log_info "Все переменные окружения установлены"
}

# Проверка зависимостей
check_dependencies() {
    log_info "Проверка зависимостей..."
    
    # Проверка Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker не установлен"
        exit 1
    fi
    
    # Проверка Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose не установлен"
        exit 1
    fi
    
    log_info "Все зависимости установлены"
}

# Сборка образов
build_images() {
    log_info "Сборка Docker образов..."
    
    # Сборка frontend
    log_info "Сборка frontend образа..."
    docker build -t boltaiznakomsya-frontend:latest .
    
    # Сборка backend
    log_info "Сборка backend образа..."
    docker build -t boltaiznakomsya-backend:latest ./backend
    
    log_info "Образы собраны успешно"
}

# Остановка старых контейнеров
stop_containers() {
    log_info "Остановка старых контейнеров..."
    
    docker-compose down --remove-orphans || true
    
    log_info "Старые контейнеры остановлены"
}

# Запуск новых контейнеров
start_containers() {
    log_info "Запуск новых контейнеров..."
    
    # Запуск с пересборкой
    docker-compose up -d --build
    
    log_info "Контейнеры запущены"
}

# Проверка здоровья сервисов
health_check() {
    log_info "Проверка здоровья сервисов..."
    
    # Ожидание запуска сервисов
    sleep 30
    
    # Проверка backend
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_info "Backend работает"
    else
        log_error "Backend не отвечает"
        exit 1
    fi
    
    # Проверка frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "Frontend работает"
    else
        log_error "Frontend не отвечает"
        exit 1
    fi
    
    log_info "Все сервисы работают корректно"
}

# Очистка старых образов
cleanup() {
    log_info "Очистка старых образов..."
    
    # Удаление неиспользуемых образов
    docker image prune -f
    
    log_info "Очистка завершена"
}

# Основная функция
main() {
    log_info "Начало деплоя приложения..."
    
    check_env
    check_dependencies
    stop_containers
    build_images
    start_containers
    health_check
    cleanup
    
    log_info "Деплой завершен успешно!"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend API: http://localhost:3001"
    log_info "Health check: http://localhost:3001/health"
}

# Обработка сигналов
trap 'log_error "Деплой прерван"; exit 1' INT TERM

# Запуск основной функции
main "$@" 