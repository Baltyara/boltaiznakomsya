#!/bin/bash

# Скрипт для backup базы данных
set -e

# Конфигурация
BACKUP_DIR="/var/backups/boltaiznakomsya"
RETENTION_DAYS=30
DATE_FORMAT=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="boltaiznakomsya_${DATE_FORMAT}.sql"

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
    if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
        log_error "Переменные окружения базы данных не установлены"
        exit 1
    fi
}

# Создание директории для backup
setup_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log_info "Директория для backup: $BACKUP_DIR"
}

# Создание backup
create_backup() {
    log_info "Создание backup базы данных..."
    
    # Создание backup с помощью pg_dump
    if docker exec boltaiznakomsya_postgres pg_dump \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-password \
        --verbose \
        --clean \
        --no-owner \
        --no-privileges \
        > "$BACKUP_DIR/$BACKUP_FILE"; then
        
        log_info "Backup создан: $BACKUP_FILE"
        
        # Сжатие backup
        gzip "$BACKUP_DIR/$BACKUP_FILE"
        log_info "Backup сжат: $BACKUP_FILE.gz"
        
        # Проверка размера
        size=$(du -h "$BACKUP_DIR/$BACKUP_FILE.gz" | cut -f1)
        log_info "Размер backup: $size"
        
    else
        log_error "Ошибка создания backup"
        exit 1
    fi
}

# Проверка целостности backup
verify_backup() {
    log_info "Проверка целостности backup..."
    
    if gunzip -t "$BACKUP_DIR/$BACKUP_FILE.gz" 2>/dev/null; then
        log_info "Backup прошел проверку целостности"
    else
        log_error "Backup поврежден"
        exit 1
    fi
}

# Очистка старых backup
cleanup_old_backups() {
    log_info "Очистка старых backup (старше $RETENTION_DAYS дней)..."
    
    find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    log_info "Старые backup удалены"
}

# Отправка backup в облачное хранилище (опционально)
upload_to_cloud() {
    if [ -n "$CLOUD_BACKUP_ENABLED" ] && [ "$CLOUD_BACKUP_ENABLED" = "true" ]; then
        log_info "Загрузка backup в облачное хранилище..."
        
        # Здесь можно добавить логику загрузки в S3, Google Cloud Storage и т.д.
        # Пример для AWS S3:
        # aws s3 cp "$BACKUP_DIR/$BACKUP_FILE.gz" "s3://your-bucket/backups/"
        
        log_info "Backup загружен в облачное хранилище"
    fi
}

# Отправка уведомления
send_notification() {
    local message=$1
    local status=$2
    
    # Здесь можно добавить отправку уведомлений
    # Например, через email, Slack, Telegram и т.д.
    log_info "Уведомление: $message ($status)"
}

# Основная функция
main() {
    log_info "Начало процесса backup..."
    
    check_env
    setup_backup_dir
    
    # Создание backup
    if create_backup; then
        verify_backup
        upload_to_cloud
        cleanup_old_backups
        send_notification "Backup успешно создан" "success"
        log_info "Backup завершен успешно"
    else
        send_notification "Ошибка создания backup" "error"
        log_error "Backup завершен с ошибкой"
        exit 1
    fi
}

# Функция для восстановления
restore() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log_error "Не указан файл для восстановления"
        echo "Использование: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_DIR/$backup_file" ]; then
        log_error "Файл backup не найден: $backup_file"
        exit 1
    fi
    
    log_info "Восстановление из backup: $backup_file"
    
    # Восстановление базы данных
    gunzip -c "$BACKUP_DIR/$backup_file" | docker exec -i boltaiznakomsya_postgres psql \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-password
    
    log_info "Восстановление завершено"
}

# Функция для списка backup
list_backups() {
    log_info "Список доступных backup:"
    
    if [ -d "$BACKUP_DIR" ]; then
        ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || log_warn "Backup не найдены"
    else
        log_warn "Директория backup не существует"
    fi
}

# Обработка аргументов командной строки
case "${1:-backup}" in
    "backup")
        main
        ;;
    "restore")
        restore "$2"
        ;;
    "list")
        list_backups
        ;;
    *)
        echo "Использование: $0 {backup|restore|list}"
        echo "  backup        - создание backup"
        echo "  restore <file> - восстановление из backup"
        echo "  list          - список доступных backup"
        exit 1
        ;;
esac 