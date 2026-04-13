# API Emulator — Architecture Knowledge Base

> Статус: частично реализована  
> Дата актуализации: 2026-04-13

---

## Текущий статус реализации

- Фаза 1 (фундамент): выполнена.
- Фаза 2 (схема БД + миграции): выполнена.
- Фаза 3 (Catalog BC): выполнена.
- Фазы 4-7: в работе/не начаты.

Реально работающие endpoint'ы сейчас:
- `GET /api/providers`
- `GET /api/providers/:id/endpoints`

---

## Суть проекта

Сервис эмулирует поведение внешних API (ServiceTitan, Yelp и др.).

Базовый маршрут эмуляции:
`/emulate/{project-hash}/{...provider-path}`

Пример:
`GET /emulate/a3f9c2/v2/tenant/123/appointments?status=pending`

---

## Стек

| Слой | Технология |
|---|---|
| Framework | NestJS 11 |
| CQRS | `@nestjs/cqrs` |
| ORM | TypeORM |
| БД | MySQL |
| Миграции | TypeORM migrations (`synchronize: false`) |
| Конфиг | `@nestjs/config` |
| Валидация | `class-validator` + `class-transformer` |

---

## Архитектурные правила (актуальные)

- Слои модуля: `domain` → `application` → `infrastructure` → `presentation`.
- `application` не импортирует `presentation`.
- Контракты репозиториев объявляются в `domain/repositories`, реализации находятся в `infrastructure/persistence`.
- `application` инжектит репозитории через доменные порты (DI token), а не через concrete TypeORM-классы.
- Entity-файлы лежат в `domain` и используются TypeORM напрямую.
- Для CRUD 1:1 не делаем дублирование `domain entity` и `persistence entity`.
- CQRS структура:
  - `application/queries/<query-name>/...`
  - `application/commands/<command-name>/...`
- Один handler = один файл.

---

## Bounded Contexts

### 1) Catalog BC

**Ответственность:** справочник провайдеров и их endpoint-шаблонов (seed + read-only запросы).

**Реализовано:**
- seed ServiceTitan и Yelp (идемпотентно при старте)
- `ListProvidersQuery`
- `GetProviderWithEndpointsQuery`
- HTTP контроллер для чтения каталога

### 2) Workspace BC

**Ответственность:** проекты, hash, правила endpoint'ов для конкретного проекта.

**Статус:** пока только domain-entity базы (из фазы 2), use-cases не реализованы.

### 3) Emulation BC

**Ответственность:** обработка `ALL /emulate/:hash/*`, выбор endpoint, применение правил, формирование ответа.

**Статус:** не реализован.

---

## Актуальная структура файлов

```text
src/
├── bounded-contexts/
│   ├── catalog/
│   │   ├── domain/
│   │   │   ├── provider.entity.ts
│   │   │   ├── provider-endpoint.entity.ts
│   │   │   └── repositories/
│   │   │       └── provider.repository.ts
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   └── .gitkeep
│   │   │   └── queries/
│   │   │       ├── list-providers/
│   │   │       │   ├── list-providers.query.ts
│   │   │       │   ├── list-providers.result.ts
│   │   │       │   └── list-providers.handler.ts
│   │   │       └── get-provider-with-endpoints/
│   │   │           ├── get-provider-with-endpoints.query.ts
│   │   │           ├── get-provider-with-endpoints.result.ts
│   │   │           └── get-provider-with-endpoints.handler.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   └── provider.repository.ts
│   │   │   └── seed/
│   │   │       ├── catalog-seed.service.ts
│   │   │       ├── catalog-seed.types.ts
│   │   │       ├── servicetitan.seed.ts
│   │   │       └── yelp.seed.ts
│   │   ├── presentation/
│   │   │   └── http/
│   │   │       ├── catalog.controller.ts
│   │   │       └── dto/
│   │   │           ├── provider.response.dto.ts
│   │   │           └── provider-endpoint.response.dto.ts
│   │   └── catalog.module.ts
│   │
│   └── workspace/
│       └── domain/
│           ├── project.entity.ts
│           └── endpoint-rule.entity.ts
│
├── migrations/
│   └── 1776113869684-InitSchema.ts
│
├── shared/
│   ├── infrastructure/database/typeorm.config.ts
│   └── presentation/
│       ├── filters/global-exception.filter.ts
│       └── interceptors/response-envelope.interceptor.ts
│
├── app.module.ts
└── main.ts
```

---

## База данных (актуально)

Созданы таблицы:
- `providers`
- `provider_endpoints`
- `projects`
- `endpoint_rules`
- `migrations`

Ключевые свойства:
- FK и индексы применены миграцией `1776113869684-InitSchema.ts`.
- Индекс на `endpoint_rules(project_id, provider_endpoint_id, priority)` присутствует.

---

## Текущий поток данных Catalog

### `GET /api/providers`

1. `CatalogController` отправляет `ListProvidersQuery` в `QueryBus`.
2. `ListProvidersHandler` читает данные через `ProviderRepository.findAll()`.
3. Результат возвращается как `ListProvidersResultItem[]`.
4. `ResponseEnvelopeInterceptor` оборачивает ответ в `{ data, meta }`.

### `GET /api/providers/:id/endpoints`

1. `CatalogController` отправляет `GetProviderWithEndpointsQuery`.
2. `GetProviderWithEndpointsHandler` вызывает `ProviderRepository.findByIdWithEndpoints()`.
3. При отсутствии провайдера кидается `NotFoundException`.
4. Результат возвращается как `GetProviderWithEndpointsResult`.
5. `ResponseEnvelopeInterceptor` оборачивает ответ в `{ data, meta }`.

---

## Миграции

Скрипты:

```json
{
  "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/shared/infrastructure/database/typeorm.config.ts",
  "migration:run": "typeorm-ts-node-commonjs migration:run -d src/shared/infrastructure/database/typeorm.config.ts",
  "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/shared/infrastructure/database/typeorm.config.ts"
}
```

`typeorm.config.ts` использует glob на entity в `domain/**`.

---

## Ближайшие шаги

1. Реализовать Workspace BC в том же CQRS-формате (`queries/<name>`, `commands/<name>`).
2. Добавить domain VO для Workspace (`project-hash`, `rule-condition`) с инвариантами.
3. Реализовать Emulation BC и middleware `/emulate/**`.
4. Добавить frontend слой (`public/index.html`) после стабилизации API.
