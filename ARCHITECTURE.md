# API Emulator — Architecture Knowledge Base

> Статус: согласована, не реализована  
> Дата: 2026-04-13

---

## Суть проекта

Сервис для эмуляции поведения внешних API (ServiceTitan, Yelp и др.).  
Позволяет создать проект, привязать его к провайдеру и настроить поведение каждого эндпоинта:
задержку, кастомный ответ, рандомный ответ, разные ответы в зависимости от параметров запроса.

Все эмулируемые запросы идут через единый catch-all URL:
```
/emulate/{project-hash}/{...provider-path}
```

Пример:
```
GET /emulate/a3f9c2/v2/tenant/123/appointments?status=pending
```

---

## Стек

| Слой | Технология |
|---|---|
| Framework | NestJS 11 |
| CQRS | @nestjs/cqrs (CommandBus, QueryBus) |
| ORM | TypeORM |
| БД | MySQL |
| Миграции | TypeORM migrations (synchronize: false с самого начала) |
| Валидация | class-validator + class-transformer |
| Конфиг | @nestjs/config (.env) |
| Фронтенд | Vue 3 CDN (один public/index.html, без сборки) |
| Статика | @nestjs/serve-static |

---

## Bounded Contexts

Проект разделён на три изолированных контекста (BC). Каждый — отдельный NestJS-модуль
со своими слоями: domain / application / infrastructure / interface.

### 1. Catalog BC — справочник провайдеров

**Ответственность:** хранит определения провайдеров и шаблоны их эндпоинтов.
Данные создаются только через seed, в runtime не изменяются.

**Содержит:**
- `Provider` — агрегат (slug, name, auth_type, base_url, default_headers)
- `ProviderEndpoint` — дочерняя сущность (method, path_pattern, default_response, default_status)
- `AuthConfig` — value object (тип авторизации + метаданные для документации)

**Queries (только чтение):**
- `ListProvidersQuery` → список всех провайдеров
- `GetProviderWithEndpointsQuery(providerId)` → провайдер + его эндпоинты

**Seed:** при старте, если таблица `providers` пуста — заполняется из seed-файлов.

---

### 2. Workspace BC — проекты и правила поведения

**Ответственность:** управляет пользовательскими проектами и правилами эмуляции.

**Содержит:**
- `Project` — агрегат (name, hash, provider_id)
- `EndpointRule` — дочерняя сущность агрегата Project (условие + действие)
- `ProjectHash` — value object (генерация 12-символьного hex через crypto.randomBytes)
- `RuleCondition` — value object (condition_source, key, operator, value)

**Commands:**
- `CreateProjectCommand(name, providerId)`
- `DeleteProjectCommand(projectId)`
- `UpsertEndpointRuleCommand(projectId, providerEndpointId, ruleData)`
- `DeleteEndpointRuleCommand(ruleId)`

**Queries:**
- `ListProjectsQuery` → список проектов с именем провайдера
- `GetProjectDetailQuery(projectId)` → проект + все эндпоинты провайдера + правила для них

---

### 3. Emulation BC — движок эмуляции

**Ответственность:** принимает реальный HTTP-запрос и возвращает эмулированный ответ.
Это не CRUD — это единственный Use Case.

**Domain Services (чистая логика, без зависимостей от БД):**
- `PathMatcher` — сопоставляет URL с паттерном (`/v2/tenant/:id/jobs` vs `/v2/tenant/123/jobs`)
- `RuleEvaluator` — выбирает подходящее правило по условию и приоритету
- `ResponseBuilder` — собирает финальный ответ (дефолт / override / рандом)

**Application:**
- `EmulateUseCase` — оркестрирует весь поток (см. ниже)

**Interface:**
- `EmulatorMiddleware` — NestJS Middleware, перехватывает все `/emulate/**` запросы

---

## Структура файлов

```
src/
├── bounded-contexts/
│   ├── catalog/
│   │   ├── domain/
│   │   │   ├── provider.aggregate.ts
│   │   │   ├── provider-endpoint.entity.ts
│   │   │   └── value-objects/
│   │   │       └── auth-config.vo.ts
│   │   ├── application/
│   │   │   ├── queries/
│   │   │   │   ├── list-providers.query.ts
│   │   │   │   └── get-provider-with-endpoints.query.ts
│   │   │   └── handlers/
│   │   │       ├── list-providers.handler.ts
│   │   │       └── get-provider-with-endpoints.handler.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   ├── provider.orm-entity.ts
│   │   │   │   ├── provider-endpoint.orm-entity.ts
│   │   │   │   └── provider.repository.ts
│   │   │   └── seed/
│   │   │       ├── catalog-seed.service.ts
│   │   │       ├── servicetitan.seed.ts
│   │   │       └── yelp.seed.ts
│   │   ├── interface/
│   │   │   └── http/
│   │   │       ├── catalog.controller.ts
│   │   │       └── dto/
│   │   │           ├── provider.response.dto.ts
│   │   │           └── provider-endpoint.response.dto.ts
│   │   └── catalog.module.ts
│   │
│   ├── workspace/
│   │   ├── domain/
│   │   │   ├── project.aggregate.ts
│   │   │   ├── endpoint-rule.entity.ts
│   │   │   └── value-objects/
│   │   │       ├── project-hash.vo.ts
│   │   │       └── rule-condition.vo.ts
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── create-project.command.ts
│   │   │   │   ├── delete-project.command.ts
│   │   │   │   ├── upsert-endpoint-rule.command.ts
│   │   │   │   └── delete-endpoint-rule.command.ts
│   │   │   ├── queries/
│   │   │   │   ├── list-projects.query.ts
│   │   │   │   └── get-project-detail.query.ts
│   │   │   └── handlers/
│   │   │       ├── create-project.handler.ts
│   │   │       ├── delete-project.handler.ts
│   │   │       ├── upsert-endpoint-rule.handler.ts
│   │   │       ├── delete-endpoint-rule.handler.ts
│   │   │       ├── list-projects.handler.ts
│   │   │       └── get-project-detail.handler.ts
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │       ├── project.orm-entity.ts
│   │   │       ├── endpoint-rule.orm-entity.ts
│   │   │       └── project.repository.ts
│   │   ├── interface/
│   │   │   └── http/
│   │   │       ├── projects.controller.ts
│   │   │       ├── endpoint-rules.controller.ts
│   │   │       └── dto/
│   │   │           ├── create-project.dto.ts
│   │   │           ├── project.response.dto.ts
│   │   │           ├── upsert-endpoint-rule.dto.ts
│   │   │           └── endpoint-rule.response.dto.ts
│   │   └── workspace.module.ts
│   │
│   └── emulation/
│       ├── domain/
│       │   └── services/
│       │       ├── path-matcher.service.ts
│       │       ├── rule-evaluator.service.ts
│       │       └── response-builder.service.ts
│       ├── application/
│       │   └── emulate.use-case.ts
│       ├── interface/
│       │   └── http/
│       │       └── emulator.middleware.ts
│       └── emulation.module.ts
│
├── shared/
│   ├── infrastructure/
│   │   └── database/
│   │       ├── typeorm.config.ts
│   │       └── base.repository.interface.ts
│   └── presentation/
│       ├── filters/
│       │   └── global-exception.filter.ts
│       └── interceptors/
│           └── response-envelope.interceptor.ts
│
├── migrations/
│   └── (генерируются через npm run migration:generate)
│
├── app.module.ts
└── main.ts

public/
└── index.html   ← Vue 3 CDN SPA
```

---

## База данных

### Таблица: `providers`

Заполняется только seed-ом. В runtime — только чтение.

| Колонка | Тип | Описание |
|---|---|---|
| id | INT PK AUTO | — |
| slug | VARCHAR(64) UNIQUE | servicetitan, yelp |
| name | VARCHAR(128) | Отображаемое имя |
| description | TEXT NULL | — |
| auth_type | VARCHAR(32) | bearer / api_key / oauth2 / none |
| base_url | VARCHAR(255) NULL | Реальный URL сервиса (для документации) |
| default_headers | JSON NULL | Заголовки, которые провайдер ожидает |
| auth_config | JSON NULL | Метаданные авторизации (endpoint, scopes...) |
| created_at | DATETIME | — |

### Таблица: `provider_endpoints`

Шаблоны эндпоинтов провайдера. Только seed, только чтение.

| Колонка | Тип | Описание |
|---|---|---|
| id | INT PK AUTO | — |
| provider_id | INT FK → providers | — |
| method | VARCHAR(8) | GET / POST / PUT / PATCH / DELETE |
| path_pattern | VARCHAR(512) | /v2/tenant/:tenantId/appointments/:id |
| description | VARCHAR(255) NULL | — |
| default_status | INT | 200 |
| default_response | JSON NULL | Дефолтный ответ провайдера |
| default_headers | JSON NULL | Content-Type и др. |
| created_at | DATETIME | — |

### Таблица: `projects`

Пользовательские рабочие пространства.

| Колонка | Тип | Описание |
|---|---|---|
| id | INT PK AUTO | — |
| name | VARCHAR(128) | Имя проекта |
| hash | VARCHAR(12) UNIQUE | Уникальный URL-идентификатор (hex, crypto) |
| provider_id | INT FK → providers | Привязанный провайдер |
| created_at | DATETIME | — |

### Таблица: `endpoint_rules`

Правила поведения эндпоинта в рамках проекта. Несколько правил на один эндпоинт,
эмулятор выбирает первое совпавшее по `priority`.

| Колонка | Тип | Описание |
|---|---|---|
| id | INT PK AUTO | — |
| project_id | INT FK → projects | — |
| provider_endpoint_id | INT FK → provider_endpoints | — |
| name | VARCHAR(128) | Метка для UI ("Пустой список", "500 ошибка") |
| priority | INT | Порядок проверки (1 — первый) |
| condition_source | ENUM | none / query_param / body_field / header / path_param |
| condition_key | VARCHAR(128) NULL | Имя параметра ('status', 'X-Token') |
| condition_operator | ENUM NULL | eq / contains / exists / not_exists / regex |
| condition_value | VARCHAR(512) NULL | Значение для сравнения |
| action_delay_ms | INT | Задержка перед ответом в мс (0 = без задержки) |
| action_status | INT NULL | Переопределить HTTP status (null = дефолт эндпоинта) |
| action_response | JSON NULL | Тело ответа (null = дефолт эндпоинта провайдера) |
| action_random | BOOLEAN | Если true — рандомизировать структуру дефолтного ответа |
| is_enabled | BOOLEAN | Отключить правило без удаления |
| created_at | DATETIME | — |

**Индексы:**
- `(project_id, provider_endpoint_id, priority)` — для быстрого поиска правил при эмуляции

---

## REST API

Глобальный префикс: `/api`

### Catalog (только GET)

```
GET  /api/providers                          → список провайдеров
GET  /api/providers/:id/endpoints            → эндпоинты провайдера
```

### Workspace

```
GET    /api/projects                         → список проектов
POST   /api/projects                         → создать проект
GET    /api/projects/:id                     → проект + эндпоинты провайдера + все правила
DELETE /api/projects/:id                     → удалить проект (каскад на endpoint_rules)

GET    /api/projects/:id/rules               → все правила проекта
POST   /api/projects/:id/rules               → создать правило
PUT    /api/projects/:id/rules/:ruleId       → обновить правило
DELETE /api/projects/:id/rules/:ruleId       → удалить правило
```

### Emulator (catch-all, без /api префикса)

```
ALL  /emulate/:hash/*                        → эмуляция запроса
```

---

## Поток данных: создание проекта

```
POST /api/projects  { name: "My ST Test", providerId: 1 }
  │
  ▼
projects.controller.ts
  – валидирует CreateProjectDto (class-validator)
  – CommandBus.execute(new CreateProjectCommand("My ST Test", 1))
  │
  ▼
create-project.handler.ts
  1. ProviderRepository.exists(1) → проверяет провайдер
  2. ProjectHash.generate() → crypto.randomBytes(6).toString('hex') → "a3f9c2"
  3. Project.create(name, providerId, hash) → domain объект
  4. ProjectRepository.save(project)
  5. return ProjectResponseDto
  │
  ▼
project.repository.ts
  – маппит domain Project → ProjectOrmEntity
  – TypeORM .save()
  │
  ▼
HTTP 201 { data: { id: 1, name: "My ST Test", hash: "a3f9c2", provider: {...} } }
```

---

## Поток данных: создание правила эндпоинта

```
POST /api/projects/1/rules
{
  "providerEndpointId": 5,
  "name": "Пустой список при status=pending",
  "priority": 1,
  "conditionSource": "query_param",
  "conditionKey": "status",
  "conditionOperator": "eq",
  "conditionValue": "pending",
  "actionStatus": 200,
  "actionResponse": { "data": [], "total": 0 },
  "actionDelayMs": 0,
  "actionRandom": false,
  "isEnabled": true
}
  │
  ▼
endpoint-rules.controller.ts
  – валидирует UpsertEndpointRuleDto
  – CommandBus.execute(new UpsertEndpointRuleCommand(projectId=1, dto))
  │
  ▼
upsert-endpoint-rule.handler.ts
  1. ProjectRepository.findById(1) → проверяет проект
  2. Проверяет что providerEndpointId принадлежит провайдеру проекта
  3. EndpointRuleRepository.save(rule)
  │
  ▼
HTTP 201 { data: { id: 3, name: "...", priority: 1, condition: {...}, action: {...} } }
```

---

## Поток данных: эмуляция запроса

```
GET /emulate/a3f9c2/v2/tenant/123/appointments?status=pending
  │
  ▼
EmulatorMiddleware (перехватывает всё на /emulate/**)
  – разбирает URL:
      hash      = "a3f9c2"
      method    = "GET"
      path      = "/v2/tenant/123/appointments"
      query     = { status: "pending" }
  – EmulateUseCase.execute({ hash, method, path, query, headers, body })
  │
  ▼
EmulateUseCase
  │
  ├─ 1. ProjectRepository.findByHash("a3f9c2")
  │       → Project { id: 1, providerId: 1 }
  │
  ├─ 2. ProviderRepository.findEndpointsByProvider(1)
  │       → [ ProviderEndpoint{ id:5, method:"GET",
  │             pathPattern:"/v2/tenant/:tenantId/appointments" }, ... ]
  │
  ├─ 3. PathMatcher.match("GET", "/v2/tenant/123/appointments", endpoints)
  │       → ProviderEndpoint { id: 5, defaultResponse: {...}, defaultStatus: 200 }
  │
  ├─ 4. EndpointRuleRepository.findByProjectAndEndpoint(projectId=1, endpointId=5)
  │       → [
  │           Rule { priority:1, conditionSource:"query_param",
  │                  conditionKey:"status", conditionOperator:"eq",
  │                  conditionValue:"error", actionStatus:500, ... },
  │           Rule { priority:2, conditionSource:"query_param",
  │                  conditionKey:"status", conditionOperator:"eq",
  │                  conditionValue:"pending", actionResponse:{data:[],total:0}, ... },
  │           Rule { priority:3, conditionSource:"none", actionResponse:null, ... }
  │         ]
  │
  ├─ 5. RuleEvaluator.evaluate(rules, request)
  │       – Rule priority=1: status eq error → "pending" ≠ "error" → skip
  │       – Rule priority=2: status eq pending → "pending" = "pending" → MATCH
  │       → Rule { actionStatus:200, actionResponse:{data:[],total:0}, actionDelayMs:0 }
  │
  ├─ 6. ResponseBuilder.build(matchedRule, providerEndpoint)
  │       → EmulationResult {
  │           delayMs: 0,
  │           statusCode: 200,
  │           headers: { "Content-Type": "application/json" },
  │           body: { data: [], total: 0 }
  │         }
  │
  └─ 7. await sleep(0) → res.status(200).json({ data: [], total: 0 })
```

---

## PathMatcher — алгоритм

Сопоставляет реальный URL с паттерном провайдера.
Метод и количество сегментов должны совпадать. Сегменты начинающиеся с `:` — wildcards.

```
pattern: /v2/tenant/:tenantId/appointments/:id
url:     /v2/tenant/123/appointments/456

split('/') = ['', 'v2', 'tenant', ':tenantId', 'appointments', ':id']
           = ['', 'v2', 'tenant', '123',       'appointments', '456']

сравниваем попарно:
  '' == ''          ✓
  'v2' == 'v2'      ✓
  'tenant' == 'tenant' ✓
  ':tenantId' → wildcard ✓
  'appointments' == 'appointments' ✓
  ':id' → wildcard ✓
→ MATCH
```

---

## RuleEvaluator — операторы условий

| Оператор | Логика |
|---|---|
| `eq` | значение параметра === condition_value |
| `contains` | значение содержит condition_value |
| `exists` | параметр присутствует в запросе (любое значение) |
| `not_exists` | параметр отсутствует |
| `regex` | значение соответствует RegExp(condition_value) |
| `none` (condition_source=none) | всегда совпадает — catch-all правило |

Источники параметров (`condition_source`):
- `query_param` → из `req.query`
- `body_field` → из `req.body` (dot-notation: `customer.status`)
- `header` → из `req.headers`
- `path_param` → из распарсенных сегментов URL (`:tenantId` → `123`)
- `none` → безусловное правило (используется как дефолт)

---

## ResponseBuilder — рандомизация

Если `action_random = true` — рекурсивно обходит структуру `default_response`
и заменяет значения случайными того же типа:

```
string  → Math.random().toString(36).slice(2)   // "k7x2mq9"
number  → Math.floor(Math.random() * 10000)      // 4821
boolean → Math.random() > 0.5                    // true/false
array   → каждый элемент рандомизируется
object  → каждое поле рандомизируется рекурсивно
null    → остаётся null
```

---

## Миграции

`synchronize: false` с самого начала.

Конфигурация TypeORM вынесена в отдельный файл (`typeorm.config.ts`) и доступна
как через `AppModule` (runtime), так и через TypeORM CLI (миграции).

Скрипты в `package.json`:

```json
{
  "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/shared/infrastructure/database/typeorm.config.ts",
  "migration:run":      "typeorm-ts-node-commonjs migration:run      -d src/shared/infrastructure/database/typeorm.config.ts",
  "migration:revert":   "typeorm-ts-node-commonjs migration:revert   -d src/shared/infrastructure/database/typeorm.config.ts",
  "seed":               "ts-node src/bounded-contexts/catalog/infrastructure/seed/catalog-seed.service.ts"
}
```

Workflow:
```bash
# 1. Изменил энтити → генерируем миграцию
npm run migration:generate -- src/migrations/AddEndpointRules

# 2. Смотрим сгенерированный файл, проверяем

# 3. Применяем
npm run migration:run

# 4. Откат если нужно
npm run migration:revert
```

Seed запускается автоматически при старте приложения через `CatalogSeedService.onModuleInit()`,
но только если таблица `providers` пуста (идемпотентно).

---

## Seed: ServiceTitan

**Slug:** `servicetitan`  
**Auth:** Bearer token (Authorization: Bearer {token})  
**Base URL:** `https://api.servicetitan.io`

| Метод | Паттерн | Описание |
|---|---|---|
| GET | /v2/tenant/:tenantId/appointments | Список записей |
| GET | /v2/tenant/:tenantId/appointments/:id | Запись по ID |
| POST | /v2/tenant/:tenantId/appointments | Создать запись |
| PUT | /v2/tenant/:tenantId/appointments/:id | Обновить запись |
| GET | /v2/tenant/:tenantId/customers | Список клиентов |
| GET | /v2/tenant/:tenantId/customers/:id | Клиент по ID |
| POST | /v2/tenant/:tenantId/customers | Создать клиента |
| GET | /v2/tenant/:tenantId/jobs | Список работ |
| GET | /v2/tenant/:tenantId/jobs/:id | Работа по ID |
| GET | /v2/tenant/:tenantId/technicians | Список техников |

---

## Seed: Yelp

**Slug:** `yelp`  
**Auth:** API Key (Authorization: Bearer {api_key})  
**Base URL:** `https://api.yelp.com`

| Метод | Паттерн | Описание |
|---|---|---|
| GET | /v3/businesses/search | Поиск бизнесов |
| GET | /v3/businesses/:id | Бизнес по ID |
| GET | /v3/businesses/:id/reviews | Отзывы бизнеса |
| GET | /v3/categories | Список категорий |
| GET | /v3/autocomplete | Автодополнение поиска |

---

## Фронтенд (Vue 3 CDN)

Один файл `public/index.html`. Никакой сборки, никаких node_modules на фронте.

**Состояния SPA:**
- `projects-list` — список всех проектов + кнопка "Создать проект"
- `project-detail` — выбранный проект:
  - Шапка: имя, провайдер, base URL для копирования (`/emulate/{hash}/`)
  - Таблица всех эндпоинтов провайдера
  - Для каждого — список правил с метками (иконки: таймер, кастом, рандом, условие)
  - Кнопка "Добавить правило" → модал

**Модал `RuleModal`:**
- Поля: name, priority, conditionSource (select), conditionKey, conditionOperator, conditionValue
- Поля действия: actionDelayMs, actionStatus, actionResponse (textarea JSON), actionRandom (toggle)
- isEnabled toggle
- Кнопки: Сохранить / Отмена / Удалить (если правило уже существует)

**Отображение URL для тестирования:**
При открытии проекта — показывается база URL эмулятора и конкретные URL всех эндпоинтов
(с подстановкой `{param}` вместо `:param`), которые можно скопировать для Postman/curl.

---

## Что вне scope (v1)

- Аутентификация пользователей
- Изоляция проектов по пользователям
- Лог входящих запросов
- Валидация тела запроса на соответствие схеме провайдера
- WebSocket-эмуляция
- Импорт/экспорт конфигурации проекта
