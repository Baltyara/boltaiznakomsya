# 🎯 Детальный план реализации алгоритма случайного подбора

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ АЛГОРИТМА

### ✅ Что уже реализовано:
- Базовая проверка совместимости по полу (`lookingFor`)
- Проверка возрастного диапазона (`ageRange`)
- Простой расчет совместимости по интересам
- Очередь в Redis для матчмейкинга
- Базовые API эндпоинты

### ❌ Что отсутствует:
- **Геолокация** - нет учета города/расстояния
- **Весовая система** - простой подсчет общих интересов
- **Метод `getMatchmakingUsers`** - отсутствует в User модели
- **Фильтрация по активности** - нет учета времени последнего онлайна
- **Машинное обучение** - нет рекомендаций на основе поведения

---

## 🎯 ТРЕБОВАНИЯ К АЛГОРИТМУ ПОДБОРА

### 📋 Критерии подбора:
1. **Возраст** - соответствие возрастному диапазону
2. **Город** - близость по геолокации
3. **Предпочтения** - совместимость по интересам
4. **Пол** - соответствие гендерным предпочтениям
5. **Активность** - время последнего онлайна
6. **Совместимость** - общий рейтинг совпадения

### 🎯 Цели алгоритма:
- **Точность** - высокое качество совпадений
- **Скорость** - быстрый поиск (до 2 секунд)
- **Масштабируемость** - работа с большим количеством пользователей
- **Справедливость** - равные шансы для всех пользователей

---

## 🔧 ПЛАН РЕАЛИЗАЦИИ

### 📋 Этап 1: Геолокация и база данных (1 день)

#### 1.1 Обновление схемы базы данных
```sql
-- Добавить поля геолокации
ALTER TABLE users ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE users ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE users ADD COLUMN search_radius INTEGER DEFAULT 50;
ALTER TABLE users ADD COLUMN last_online TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';

-- Создать индексы для быстрого поиска
CREATE INDEX idx_users_location ON users(latitude, longitude);
CREATE INDEX idx_users_age_gender ON users(age, gender);
CREATE INDEX idx_users_interests ON users USING GIN(interests);
CREATE INDEX idx_users_online ON users(last_online) WHERE is_online = true;
CREATE INDEX idx_users_search ON users(latitude, longitude, age, gender, is_online);

-- Добавить расширение для геопространственных вычислений
CREATE EXTENSION IF NOT EXISTS postgis;
```

#### 1.2 Создание утилит геолокации
```javascript
// backend/src/utils/geolocation.js
const axios = require('axios');

class GeolocationService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  }

  // Геокодинг адреса в координаты
  async geocodeAddress(address) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          address,
          key: this.apiKey
        }
      });

      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      }
      
      throw new Error('Address not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  // Расчет расстояния между двумя точками (формула гаверсинуса)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Радиус Земли в километрах
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Проверка, находится ли точка в радиусе
  isWithinRadius(lat1, lon1, lat2, lon2, radiusKm) {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radiusKm;
  }
}

module.exports = new GeolocationService();
```

### 📋 Этап 2: Система совместимости (1 день)

#### 2.1 Создание утилит совместимости
```javascript
// backend/src/utils/compatibility.js
const geolocationService = require('./geolocation');

class CompatibilityService {
  // Основная функция расчета совместимости
  calculateCompatibilityScore(user1, user2) {
    let totalScore = 0;
    let weights = 0;

    // Вес по интересам (40%)
    const interestScore = this.calculateInterestCompatibility(user1.interests, user2.interests);
    totalScore += interestScore * 0.4;
    weights += 0.4;

    // Вес по возрасту (25%)
    const ageScore = this.calculateAgeCompatibility(user1.age, user2.age);
    totalScore += ageScore * 0.25;
    weights += 0.25;

    // Вес по расстоянию (20%)
    const distanceScore = this.calculateDistanceCompatibility(user1, user2);
    totalScore += distanceScore * 0.2;
    weights += 0.2;

    // Вес по активности (15%)
    const activityScore = this.calculateActivityCompatibility(user1, user2);
    totalScore += activityScore * 0.15;
    weights += 0.15;

    return Math.round((totalScore / weights) * 100);
  }

  // Совместимость по интересам
  calculateInterestCompatibility(interests1, interests2) {
    if (!interests1 || !interests2 || interests1.length === 0 || interests2.length === 0) {
      return 0;
    }

    const commonInterests = interests1.filter(interest => 
      interests2.includes(interest)
    );

    const totalInterests = Math.max(interests1.length, interests2.length);
    const baseScore = commonInterests.length / totalInterests;

    // Бонус за большее количество общих интересов
    const bonus = Math.min(commonInterests.length * 0.1, 0.3);
    
    return Math.min(baseScore + bonus, 1.0);
  }

  // Совместимость по возрасту
  calculateAgeCompatibility(age1, age2) {
    const ageDiff = Math.abs(age1 - age2);
    
    if (ageDiff <= 2) return 1.0;
    if (ageDiff <= 5) return 0.9;
    if (ageDiff <= 10) return 0.7;
    if (ageDiff <= 15) return 0.5;
    if (ageDiff <= 20) return 0.3;
    return 0.1;
  }

  // Совместимость по расстоянию
  calculateDistanceCompatibility(user1, user2) {
    if (!user1.latitude || !user1.longitude || !user2.latitude || !user2.longitude) {
      return 0.5; // Нейтральный рейтинг если нет геолокации
    }

    const distance = geolocationService.calculateDistance(
      user1.latitude, user1.longitude,
      user2.latitude, user2.longitude
    );

    const maxDistance = Math.min(user1.search_radius || 50, user2.search_radius || 50);
    
    if (distance <= maxDistance * 0.2) return 1.0; // Очень близко
    if (distance <= maxDistance * 0.4) return 0.9;
    if (distance <= maxDistance * 0.6) return 0.7;
    if (distance <= maxDistance * 0.8) return 0.5;
    if (distance <= maxDistance) return 0.3;
    return 0.1; // Слишком далеко
  }

  // Совместимость по активности
  calculateActivityCompatibility(user1, user2) {
    const now = new Date();
    const lastOnline1 = new Date(user1.last_online || now);
    const lastOnline2 = new Date(user2.last_online || now);

    const hoursSinceOnline1 = (now - lastOnline1) / (1000 * 60 * 60);
    const hoursSinceOnline2 = (now - lastOnline2) / (1000 * 60 * 60);

    // Предпочитаем активных пользователей
    const activityScore1 = Math.max(0, 1 - (hoursSinceOnline1 / 24));
    const activityScore2 = Math.max(0, 1 - (hoursSinceOnline2 / 24));

    return (activityScore1 + activityScore2) / 2;
  }

  // Проверка базовой совместимости (быстрая проверка)
  isBasicCompatible(user1, user2) {
    // Проверка по полу
    if (user1.lookingFor && user1.lookingFor !== 'both' && user1.lookingFor !== user2.gender) {
      return false;
    }
    if (user2.lookingFor && user2.lookingFor !== 'both' && user2.lookingFor !== user1.gender) {
      return false;
    }

    // Проверка по возрасту
    if (user1.ageRange) {
      if (user2.age < user1.ageRange.min || user2.age > user1.ageRange.max) {
        return false;
      }
    }
    if (user2.ageRange) {
      if (user1.age < user2.ageRange.min || user1.age > user2.ageRange.max) {
        return false;
      }
    }

    return true;
  }
}

module.exports = new CompatibilityService();
```

### 📋 Этап 3: Метод getMatchmakingUsers (1 день)

#### 3.1 Реализация в User модели
```javascript
// backend/src/models/User.js - добавить метод
static async getMatchmakingUsers(currentUserId, preferences) {
  const {
    lookingFor,
    interests,
    ageRange,
    maxDistance = 50,
    limit = 20
  } = preferences;

  const currentUser = await this.findById(currentUserId);
  if (!currentUser) {
    throw new Error('User not found');
  }

  // Базовый запрос с геопространственными вычислениями
  let query = `
    SELECT 
      u.*,
      CASE 
        WHEN u.latitude IS NOT NULL AND u.longitude IS NOT NULL 
          AND $1 IS NOT NULL AND $2 IS NOT NULL
        THEN ST_Distance(
          ST_MakePoint(u.longitude, u.latitude)::geography,
          ST_MakePoint($1, $2)::geography
        ) / 1000
        ELSE NULL
      END as distance_km,
      CASE 
        WHEN u.interests && $3 THEN 
          array_length(array(
            SELECT unnest(u.interests) 
            INTERSECT 
            SELECT unnest($3)
          ), 1)::float / 
          GREATEST(array_length(u.interests, 1), array_length($3, 1))
        ELSE 0
      END as interest_overlap
    FROM users u
    WHERE u.id != $4
    AND u.is_online = true
    AND u.last_online >= NOW() - INTERVAL '30 minutes'
  `;

  const params = [
    currentUser.longitude,
    currentUser.latitude,
    interests,
    currentUserId
  ];
  let paramIndex = 5;

  // Фильтр по полу
  if (lookingFor && lookingFor !== 'both') {
    query += ` AND u.gender = $${paramIndex}`;
    params.push(lookingFor);
    paramIndex++;
  }

  // Фильтр по возрасту
  if (ageRange) {
    query += ` AND u.age BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
    params.push(ageRange.min, ageRange.max);
    paramIndex += 2;
  }

  // Фильтр по расстоянию (если есть геолокация)
  if (currentUser.latitude && currentUser.longitude) {
    query += ` AND ST_Distance(
      ST_MakePoint(u.longitude, u.latitude)::geography,
      ST_MakePoint($1, $2)::geography
    ) <= $${paramIndex} * 1000`;
    params.push(maxDistance);
    paramIndex++;
  }

  // Сортировка по совместимости и расстоянию
  query += `
    ORDER BY 
      interest_overlap DESC,
      distance_km ASC NULLS LAST,
      u.last_online DESC
    LIMIT $${paramIndex}
  `;
  
  params.push(limit);

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('getMatchmakingUsers error:', error);
    throw new Error('Failed to get matchmaking users');
  }
}

// Метод для обновления геолокации пользователя
static async updateLocation(userId, latitude, longitude) {
  try {
    const query = `
      UPDATE users 
      SET latitude = $2, longitude = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING id, latitude, longitude
    `;
    
    const result = await pool.query(query, [userId, latitude, longitude]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error updating user location: ${error.message}`);
  }
}

// Метод для обновления предпочтений поиска
static async updateSearchPreferences(userId, preferences) {
  try {
    const { searchRadius, ageRange, lookingFor } = preferences;
    
    const query = `
      UPDATE users 
      SET 
        search_radius = COALESCE($2, search_radius),
        preferences = COALESCE($3, preferences),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, search_radius, preferences
    `;
    
    const preferencesJson = JSON.stringify({
      ageRange,
      lookingFor,
      ...preferences
    });
    
    const result = await pool.query(query, [userId, searchRadius, preferencesJson]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error updating search preferences: ${error.message}`);
  }
}
```

### 📋 Этап 4: Обновление контроллера матчмейкинга (1 день)

#### 4.1 Улучшенный алгоритм поиска
```javascript
// backend/src/controllers/matchmakingController.js
const User = require('../models/User');
const redis = require('../config/redis');
const compatibilityService = require('../utils/compatibility');
const geolocationService = require('../utils/geolocation');

// Улучшенный поиск совпадений
const findMatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      lookingFor, 
      ageRange, 
      interests, 
      maxDistance = 50,
      limit = 5 
    } = req.body;

    // Получаем потенциальных совпадений из базы данных
    const potentialMatches = await User.getMatchmakingUsers(userId, {
      lookingFor,
      interests,
      ageRange,
      maxDistance,
      limit: 20 // Получаем больше для лучшего выбора
    });

    // Рассчитываем совместимость для каждого
    const matchesWithScore = potentialMatches.map(match => ({
      ...match,
      compatibility: compatibilityService.calculateCompatibilityScore(
        { ...req.user, interests, ageRange },
        match
      )
    }));

    // Сортируем по совместимости
    matchesWithScore.sort((a, b) => b.compatibility - a.compatibility);

    // Возвращаем топ совпадений
    const topMatches = matchesWithScore.slice(0, limit);

    res.json({
      matches: topMatches,
      totalFound: matchesWithScore.length,
      searchRadius: maxDistance,
      userLocation: {
        latitude: req.user.latitude,
        longitude: req.user.longitude
      }
    });
  } catch (error) {
    console.error('Find match error:', error);
    res.status(500).json({
      error: 'Ошибка при поиске совпадений',
      message: error.message
    });
  }
};

// Обновление геолокации пользователя
const updateLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, address } = req.body;

    let coords = { latitude, longitude };

    // Если передан адрес, геокодим его
    if (address && (!latitude || !longitude)) {
      coords = await geolocationService.geocodeAddress(address);
    }

    // Обновляем геолокацию пользователя
    const updatedUser = await User.updateLocation(userId, coords.latitude, coords.longitude);

    res.json({
      message: 'Геолокация обновлена',
      location: {
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      error: 'Ошибка при обновлении геолокации',
      message: error.message
    });
  }
};

// Обновление предпочтений поиска
const updateSearchPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { searchRadius, ageRange, lookingFor, interests } = req.body;

    const updatedUser = await User.updateSearchPreferences(userId, {
      searchRadius,
      ageRange,
      lookingFor,
      interests
    });

    res.json({
      message: 'Предпочтения поиска обновлены',
      preferences: updatedUser.preferences,
      searchRadius: updatedUser.search_radius
    });
  } catch (error) {
    console.error('Update search preferences error:', error);
    res.status(500).json({
      error: 'Ошибка при обновлении предпочтений',
      message: error.message
    });
  }
};

// Получение статистики поиска
const getSearchStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Получаем статистику по региону
    const user = await User.findById(userId);
    if (!user.latitude || !user.longitude) {
      return res.json({
        nearbyUsers: 0,
        totalOnline: 0,
        averageDistance: null
      });
    }

    // Подсчитываем пользователей в радиусе
    const nearbyUsers = await User.getMatchmakingUsers(userId, {
      maxDistance: user.search_radius || 50,
      limit: 1000
    });

    const totalOnline = await User.getStats();

    res.json({
      nearbyUsers: nearbyUsers.length,
      totalOnline: totalOnline.total_users,
      averageDistance: nearbyUsers.length > 0 
        ? nearbyUsers.reduce((sum, user) => sum + (user.distance_km || 0), 0) / nearbyUsers.length
        : null,
      searchRadius: user.search_radius || 50
    });
  } catch (error) {
    console.error('Get search stats error:', error);
    res.status(500).json({
      error: 'Ошибка при получении статистики',
      message: error.message
    });
  }
};

module.exports = {
  joinQueue,
  leaveQueue,
  findMatch,
  getQueueStatus,
  getOnlineUsers,
  updateLocation,
  updateSearchPreferences,
  getSearchStats
};
```

### 📋 Этап 5: Обновление роутов (0.5 дня)

#### 5.1 Новые эндпоинты
```javascript
// backend/src/routes/matchmaking.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { matchmakingValidation } = require('../middleware/validation');
const {
  joinQueue,
  leaveQueue,
  findMatch,
  getQueueStatus,
  getOnlineUsers,
  updateLocation,
  updateSearchPreferences,
  getSearchStats
} = require('../controllers/matchmakingController');

// Существующие роуты
router.post('/join', auth, matchmakingValidation, joinQueue);
router.post('/leave', auth, leaveQueue);
router.post('/find', auth, matchmakingValidation, findMatch);
router.get('/status', auth, getQueueStatus);
router.get('/online', auth, getOnlineUsers);

// Новые роуты для геолокации и предпочтений
router.post('/location', auth, updateLocation);
router.post('/preferences', auth, updateSearchPreferences);
router.get('/stats', auth, getSearchStats);

module.exports = router;
```

---

## 🧪 ТЕСТИРОВАНИЕ АЛГОРИТМА

### 📋 Unit тесты
```javascript
// backend/src/tests/matchmaking.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const compatibilityService = require('../utils/compatibility');

describe('Matchmaking Algorithm', () => {
  let testUser1, testUser2, testUser3;

  beforeEach(async () => {
    // Создаем тестовых пользователей
    testUser1 = await User.create({
      email: 'user1@test.com',
      password: 'password123',
      name: 'User 1',
      age: 25,
      gender: 'male',
      location: 'Moscow',
      interests: ['Музыка', 'Спорт', 'Путешествия'],
      latitude: 55.7558,
      longitude: 37.6176
    });

    testUser2 = await User.create({
      email: 'user2@test.com',
      password: 'password123',
      name: 'User 2',
      age: 23,
      gender: 'female',
      location: 'Moscow',
      interests: ['Музыка', 'Кино', 'Книги'],
      latitude: 55.7558,
      longitude: 37.6176
    });

    testUser3 = await User.create({
      email: 'user3@test.com',
      password: 'password123',
      name: 'User 3',
      age: 30,
      gender: 'female',
      location: 'Saint Petersburg',
      interests: ['Спорт', 'Путешествия'],
      latitude: 59.9311,
      longitude: 30.3609
    });
  });

  test('should find compatible matches based on interests', async () => {
    const response = await request(app)
      .post('/api/matchmaking/find')
      .set('Authorization', `Bearer ${testUser1.token}`)
      .send({
        lookingFor: 'female',
        ageRange: { min: 20, max: 30 },
        interests: ['Музыка', 'Спорт'],
        maxDistance: 100
      });

    expect(response.status).toBe(200);
    expect(response.body.matches).toHaveLength(2);
    expect(response.body.matches[0].compatibility).toBeGreaterThan(50);
  });

  test('should filter by distance correctly', async () => {
    const response = await request(app)
      .post('/api/matchmaking/find')
      .set('Authorization', `Bearer ${testUser1.token}`)
      .send({
        lookingFor: 'female',
        ageRange: { min: 20, max: 30 },
        interests: ['Музыка', 'Спорт'],
        maxDistance: 10 // Только Москва
      });

    expect(response.status).toBe(200);
    expect(response.body.matches).toHaveLength(1); // Только user2
    expect(response.body.matches[0].name).toBe('User 2');
  });
});
```

---

## 📊 МЕТРИКИ И МОНИТОРИНГ

### 📈 Ключевые метрики:
1. **Время поиска** - должно быть < 2 секунд
2. **Качество совпадений** - средний рейтинг совместимости
3. **Количество совпадений** - среднее количество найденных пользователей
4. **Географическое распределение** - среднее расстояние до совпадений

### 🔍 Мониторинг:
```javascript
// backend/src/utils/metrics.js - добавить метрики
const matchmakingDuration = new prometheus.Histogram({
  name: 'matchmaking_duration_seconds',
  help: 'Duration of matchmaking requests',
  labelNames: ['status']
});

const matchmakingCompatibility = new prometheus.Histogram({
  name: 'matchmaking_compatibility_score',
  help: 'Compatibility scores of matches',
  buckets: [0, 25, 50, 75, 90, 100]
});

const matchmakingDistance = new prometheus.Histogram({
  name: 'matchmaking_distance_km',
  help: 'Distance to matches in kilometers',
  buckets: [0, 5, 10, 25, 50, 100, 200]
});
```

---

## 🎯 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ

### ✅ После реализации:
- **Точность подбора:** 85%+ совместимость
- **Скорость поиска:** < 2 секунды
- **Географическая точность:** фильтрация по расстоянию
- **Масштабируемость:** поддержка 10,000+ пользователей

### 📊 Улучшения:
- **В 3 раза** более точные совпадения
- **В 2 раза** быстрее поиск
- **Геолокация** для точного подбора по местоположению
- **Весовая система** для лучшего качества совпадений

---

## 📝 ЗАКЛЮЧЕНИЕ

Данный план обеспечивает реализацию современного алгоритма подбора с учетом всех требований: возраста, города, предпочтений и гендера. Алгоритм будет масштабируемым, быстрым и точным.

**Время реализации:** 4-5 дней
**Сложность:** Средняя
**Приоритет:** Критично для функциональности приложения 