# Система мониторинга "Болтай и Знакомься"

## 📊 Обзор

Система мониторинга включает:
- **Prometheus** - сбор и хранение метрик
- **Grafana** - визуализация и дашборды
- **Alertmanager** - уведомления и алерты
- **Node Exporter** - метрики системы
- **PostgreSQL Exporter** - метрики базы данных
- **Redis Exporter** - метрики Redis

## 🚀 Быстрый старт

### 1. Запуск системы мониторинга
```bash
cd backend
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Доступ к сервисам
- **Grafana**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093

### 3. Импорт дашборда
1. Откройте Grafana
2. Перейдите в Dashboards → Import
3. Загрузите файл `grafana/dashboards/app-metrics.json`

## 📈 Метрики приложения

### HTTP метрики
- `http_requests_total` - общее количество HTTP запросов
- `http_request_duration_seconds` - время ответа HTTP запросов

### Аутентификация
- `auth_attempts_total` - попытки входа/регистрации
- `user_registrations_total` - регистрации пользователей
- `active_users_total` - активные пользователи

### Звонки
- `calls_total` - общее количество звонков
- `call_duration_seconds` - длительность звонков
- `active_calls_total` - активные звонки

### WebSocket
- `websocket_connections_total` - общее количество соединений
- `websocket_connections_active` - активные соединения

### Пользователи
- `user_reports_total` - жалобы на пользователей

### Системные метрики
- `memory_usage_bytes` - использование памяти
- `cpu_usage_percent` - использование CPU
- `errors_total` - общее количество ошибок

## 🔔 Алерты

### Критические алерты
- **ServiceDown** - сервис недоступен
- **HighErrorRate** - высокая частота ошибок
- **HighHTTP5xxRate** - высокая частота серверных ошибок

### Предупреждения
- **HighHTTPResponseTime** - высокое время ответа
- **HighMemoryUsage** - высокое использование памяти
- **HighCPUUsage** - высокое использование CPU
- **HighWebSocketConnections** - много WebSocket соединений
- **HighActiveCalls** - много активных звонков
- **HighAuthFailureRate** - много неудачных попыток входа
- **HighUserReportsRate** - много жалоб

## 📊 Дашборды Grafana

### Основной дашборд
Включает 12 панелей:
1. **HTTP Запросы** - статистика по запросам
2. **Время ответа HTTP** - 95-й и 50-й перцентили
3. **Активные пользователи** - текущее количество
4. **Активные звонки** - текущее количество
5. **WebSocket соединения** - активные соединения
6. **Попытки аутентификации** - успешные/неудачные
7. **Регистрации пользователей** - статистика
8. **Жалобы на пользователей** - по причинам
9. **Использование памяти** - heap и process
10. **Использование CPU** - процент использования
11. **Ошибки** - по типам и серьезности
12. **Длительность звонков** - перцентили

## ⚙️ Конфигурация

### Prometheus
- Файл: `prometheus/prometheus.yml`
- Интервал сбора: 15 секунд
- Хранение данных: 200 часов

### Alertmanager
- Файл: `alertmanager/alertmanager.yml`
- Уведомления: webhook, email, Slack
- Группировка алертов: по имени

### Grafana
- Порт: 3000
- Логин: admin/admin123
- Автоматический импорт дашбордов

## 🔧 Настройка уведомлений

### Email уведомления
1. Отредактируйте `alertmanager/alertmanager.yml`
2. Укажите SMTP сервер и учетные данные
3. Перезапустите Alertmanager

### Slack уведомления
1. Создайте webhook в Slack
2. Обновите URL в конфигурации
3. Перезапустите Alertmanager

### Webhook уведомления
1. Создайте endpoint для получения уведомлений
2. Обновите URL в конфигурации
3. Перезапустите Alertmanager

## 📝 Добавление новых метрик

### 1. Создание метрики
```javascript
const newMetric = new promClient.Counter({
  name: 'new_metric_total',
  help: 'Описание метрики',
  labelNames: ['label1', 'label2']
});
```

### 2. Регистрация метрики
```javascript
register.registerMetric(newMetric);
```

### 3. Использование в коде
```javascript
newMetric.labels('value1', 'value2').inc();
```

### 4. Добавление в дашборд
1. Откройте Grafana
2. Добавьте новую панель
3. Используйте PromQL запрос

## 🐛 Отладка

### Проверка метрик
```bash
curl http://localhost:3001/metrics
```

### Проверка Prometheus
```bash
curl http://localhost:9090/api/v1/targets
```

### Проверка алертов
```bash
curl http://localhost:9090/api/v1/alerts
```

### Логи Prometheus
```bash
docker logs boltaiznakomsya-prometheus
```

### Логи Grafana
```bash
docker logs boltaiznakomsya-grafana
```

## 📚 Полезные PromQL запросы

### Топ-5 самых медленных эндпоинтов
```promql
topk(5, histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])))
```

### Частота ошибок по типам
```promql
rate(errors_total[5m])
```

### Использование памяти в процентах
```promql
(memory_usage_bytes{type="heap"} / memory_usage_bytes{type="process"}) * 100
```

### Активные пользователи за последний час
```promql
increase(active_users_total[1h])
```

## 🔒 Безопасность

### Рекомендации
1. Измените пароли по умолчанию
2. Настройте HTTPS для всех сервисов
3. Ограничьте доступ к портам мониторинга
4. Настройте аутентификацию в Grafana
5. Используйте VPN для доступа к мониторингу

### Переменные окружения
```bash
# Grafana
GF_SECURITY_ADMIN_PASSWORD=secure_password

# Prometheus
PROMETHEUS_CONFIG_FILE=/etc/prometheus/prometheus.yml

# Alertmanager
ALERTMANAGER_CONFIG_FILE=/etc/alertmanager/alertmanager.yml
```

## 📈 Масштабирование

### Горизонтальное масштабирование
1. Добавьте несколько экземпляров Prometheus
2. Настройте federation для агрегации метрик
3. Используйте Thanos для долгосрочного хранения

### Вертикальное масштабирование
1. Увеличьте ресурсы контейнеров
2. Настройте retention policy
3. Оптимизируйте запросы PromQL

## 🆘 Поддержка

### Частые проблемы
1. **Метрики не собираются** - проверьте доступность `/metrics`
2. **Алерты не срабатывают** - проверьте конфигурацию правил
3. **Grafana не подключается** - проверьте настройки datasource
4. **Высокое потребление ресурсов** - настройте retention policy

### Контакты
- Документация: [README.md](../README.md)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Поддержка: support@boltaiznakomsya.com 