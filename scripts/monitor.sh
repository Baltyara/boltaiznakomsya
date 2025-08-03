#!/bin/bash

# Скрипт для мониторинга приложения
set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:3001"
HEALTH_CHECK_INTERVAL=30
LOG_FILE="/var/log/boltaiznakomsya/monitor.log"

# Функции для логирования
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1" >> "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARN] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $1" >> "$LOG_FILE"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DEBUG] $1" >> "$LOG_FILE"
}

# Создание директории для логов
setup_logging() {
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
}

# Проверка здоровья сервиса
check_health() {
    local url=$1
    local service_name=$2
    
    if curl -f -s "$url/health" > /dev/null 2>&1; then
        log_info "$service_name: OK"
        return 0
    else
        log_error "$service_name: FAILED"
        return 1
    fi
}

# Проверка доступности сервиса
check_availability() {
    local url=$1
    local service_name=$2
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        log_info "$service_name доступен"
        return 0
    else
        log_error "$service_name недоступен"
        return 1
    fi
}

# Проверка использования ресурсов
check_resources() {
    log_debug "Проверка использования ресурсов..."
    
    # CPU
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        log_warn "Высокое использование CPU: ${cpu_usage}%"
    fi
    
    # Memory
    memory_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
    if (( $(echo "$memory_usage > 80" | bc -l) )); then
        log_warn "Высокое использование памяти: ${memory_usage}%"
    fi
    
    # Disk
    disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    if [ "$disk_usage" -gt 80 ]; then
        log_warn "Высокое использование диска: ${disk_usage}%"
    fi
    
    log_debug "CPU: ${cpu_usage}%, Memory: ${memory_usage}%, Disk: ${disk_usage}%"
}

# Проверка Docker контейнеров
check_containers() {
    log_debug "Проверка Docker контейнеров..."
    
    containers=("boltaiznakomsya_frontend" "boltaiznakomsya_backend" "boltaiznakomsya_postgres" "boltaiznakomsya_redis")
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$container"; then
            log_info "Контейнер $container запущен"
        else
            log_error "Контейнер $container не запущен"
        fi
    done
}

# Проверка базы данных
check_database() {
    log_debug "Проверка базы данных..."
    
    if docker exec boltaiznakomsya_postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_info "PostgreSQL работает"
    else
        log_error "PostgreSQL не отвечает"
    fi
}

# Проверка Redis
check_redis() {
    log_debug "Проверка Redis..."
    
    if docker exec boltaiznakomsya_redis redis-cli ping > /dev/null 2>&1; then
        log_info "Redis работает"
    else
        log_error "Redis не отвечает"
    fi
}

# Отправка уведомления
send_notification() {
    local message=$1
    local level=$2
    
    # Здесь можно добавить отправку уведомлений
    # Например, через email, Slack, Telegram и т.д.
    log_debug "Отправка уведомления: $message"
}

# Основная функция мониторинга
monitor() {
    log_info "Запуск мониторинга..."
    
    local frontend_errors=0
    local backend_errors=0
    
    while true; do
        log_debug "Выполнение проверок..."
        
        # Проверка сервисов
        if ! check_health "$BACKEND_URL" "Backend"; then
            ((backend_errors++))
            send_notification "Backend недоступен" "error"
        else
            backend_errors=0
        fi
        
        if ! check_availability "$FRONTEND_URL" "Frontend"; then
            ((frontend_errors++))
            send_notification "Frontend недоступен" "error"
        else
            frontend_errors=0
        fi
        
        # Проверка ресурсов
        check_resources
        
        # Проверка контейнеров
        check_containers
        
        # Проверка базы данных
        check_database
        
        # Проверка Redis
        check_redis
        
        # Если много ошибок подряд, отправляем критическое уведомление
        if [ "$backend_errors" -ge 3 ] || [ "$frontend_errors" -ge 3 ]; then
            send_notification "Критические ошибки в приложении" "critical"
        fi
        
        log_info "Мониторинг завершен, ожидание $HEALTH_CHECK_INTERVAL секунд..."
        sleep "$HEALTH_CHECK_INTERVAL"
    done
}

# Функция для однократной проверки
single_check() {
    log_info "Выполнение однократной проверки..."
    
    check_health "$BACKEND_URL" "Backend"
    check_availability "$FRONTEND_URL" "Frontend"
    check_resources
    check_containers
    check_database
    check_redis
    
    log_info "Проверка завершена"
}

# Обработка аргументов командной строки
case "${1:-monitor}" in
    "monitor")
        setup_logging
        monitor
        ;;
    "check")
        setup_logging
        single_check
        ;;
    "logs")
        tail -f "$LOG_FILE"
        ;;
    *)
        echo "Использование: $0 {monitor|check|logs}"
        echo "  monitor - запуск непрерывного мониторинга"
        echo "  check   - однократная проверка"
        echo "  logs    - просмотр логов"
        exit 1
        ;;
esac 