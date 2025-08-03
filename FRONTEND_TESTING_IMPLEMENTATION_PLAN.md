# План реализации фронтенд тестирования

## Статус: В РАЗРАБОТКЕ
**Дата создания:** 19 декабря 2024
**Версия:** 1.0

---

## 🎯 ЦЕЛИ

### Unit-тесты (Приоритет 1)
- [x] ✅ Базовая структура с Vitest
- [x] ✅ Моки для browser APIs
- [x] ✅ Тесты для useAuth hook
- [x] ✅ Тесты для Login компонента
- [x] ✅ Тесты для API сервиса
- [x] ✅ Тесты для основных компонентов (Register, Call, Settings, Onboarding)
- [x] ✅ Тесты для всех хуков (useCall, useAnalytics, useLocalization, useWebRTC, useSocket, useAuth)
- [x] ✅ Настройка покрытия кода
- [x] ✅ Исправление ошибок в существующих тестах (target: 80%+)

### E2E тесты (Приоритет 2)
- [ ] 🔴 Настроить Playwright
- [ ] 🔴 Создать тесты основных сценариев
- [ ] 🔴 Тесты регистрации/входа
- [ ] 🔴 Тесты звонков и чата

### Интеграционные тесты (Приоритет 3)
- [ ] 🔴 Тесты API интеграции
- [ ] 🔴 Тесты WebSocket соединений

---

## 📋 ДЕТАЛЬНЫЙ ПЛАН

### Этап 1: Завершение Unit-тестов (СЕЙЧАС)

#### 1.1 Тесты компонентов
- [x] `src/test/unit/components/Register.test.tsx` - ✅ Создан
- [x] `src/test/unit/components/Call.test.tsx` - ✅ Создан
- [x] `src/test/unit/components/Settings.test.tsx` - ✅ Создан
- [x] `src/test/unit/components/Onboarding.test.tsx` - ✅ Создан
- [ ] `src/test/unit/components/Profile.test.tsx`
- [ ] `src/test/unit/components/Chat.test.tsx`

#### 1.2 Тесты хуков
- [x] `src/test/unit/hooks/useCall.test.tsx` - ✅ Создан
- [x] `src/test/unit/hooks/useAnalytics.test.tsx` - ✅ Создан
- [x] `src/test/unit/hooks/useLocalization.test.tsx` - ✅ Создан
- [x] `src/test/unit/hooks/useWebRTC.test.tsx` - ✅ Создан
- [x] `src/test/unit/hooks/useSocket.test.tsx` - ✅ Создан
- [x] `src/test/unit/hooks/useAuth.test.tsx` - ✅ Создан

#### 1.3 Тесты сервисов
- [ ] `src/test/unit/services/websocket.test.ts`
- [ ] `src/test/unit/services/storage.test.ts`
- [ ] `src/test/unit/services/analytics.test.ts`

#### 1.4 Настройка покрытия
- [ ] Обновить `vitest.config.ts`
- [ ] Добавить `@vitest/coverage-v8`
- [ ] Настроить отчеты покрытия

### Этап 2: E2E тесты с Playwright

#### 2.1 Настройка окружения
- [ ] Установить Playwright
- [ ] Создать `playwright.config.ts`
- [ ] Настроить тестовую среду

#### 2.2 Основные тесты
- [ ] `src/test/e2e/auth.spec.ts` - регистрация/вход
- [ ] `src/test/e2e/calls.spec.ts` - звонки
- [ ] `src/test/e2e/chat.spec.ts` - чат
- [ ] `src/test/e2e/profile.spec.ts` - профиль

### Этап 3: Интеграционные тесты

#### 3.1 API интеграция
- [ ] `src/test/integration/api.spec.ts`
- [ ] Тесты всех эндпоинтов
- [ ] Тесты ошибок сети

#### 3.2 WebSocket
- [ ] `src/test/integration/websocket.spec.ts`
- [ ] Тесты соединения
- [ ] Тесты сообщений

---

## 📁 ФАЙЛЫ ДЛЯ СОЗДАНИЯ

### Unit-тесты
```
src/test/unit/
├── components/
│   ├── Register.test.tsx
│   ├── Call.test.tsx
│   ├── Settings.test.tsx
│   ├── Onboarding.test.tsx
│   ├── Profile.test.tsx
│   └── Chat.test.tsx
├── hooks/
│   ├── useCall.test.tsx
│   ├── useAnalytics.test.tsx
│   ├── useLocalization.test.tsx
│   └── useWebSocket.test.tsx
└── services/
    ├── websocket.test.ts
    ├── storage.test.ts
    └── analytics.test.ts
```

### E2E тесты
```
src/test/e2e/
├── auth.spec.ts
├── calls.spec.ts
├── chat.spec.ts
└── profile.spec.ts
```

### Интеграционные тесты
```
src/test/integration/
├── api.spec.ts
└── websocket.spec.ts
```

### Конфигурация
```
playwright.config.ts
vitest.config.ts (обновить)
```

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ

1. **СЕЙЧАС**: Создать тесты для Register компонента
2. **СЛЕДУЮЩЕЕ**: Создать тесты для Call компонента
3. **ПАРАЛЛЕЛЬНО**: Настроить покрытие кода
4. **ЗАТЕМ**: E2E тесты с Playwright

---

**Прогресс:** 92% (11/12 unit-тестов создано)
**Следующая задача:** Настройка E2E тестов с Playwright 