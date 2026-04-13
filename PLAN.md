# API Emulator — Development Plan

> Каждая фаза заканчивается работающим, тестируемым состоянием.
> Следующая фаза начинается только после проверки предыдущей.

---

## Фаза 1 — Фундамент
**Цель:** приложение запускается, БД подключается, базовая инфраструктура готова.

- [x] Установка зависимостей:
  `@nestjs/typeorm`, `typeorm`, `mysql2`, `@nestjs/config`,
  `class-validator`, `class-transformer`, `@nestjs/cqrs`, `@nestjs/serve-static`
- [x] `.env` + `.env.example` (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, APP_PORT)
- [x] `@nestjs/config` подключён в `AppModule` (isGlobal: true)
- [x] `typeorm.config.ts` в `shared/infrastructure/database/` (synchronize: false, путь к миграциям)
- [x] Скрипты в `package.json`: `migration:generate`, `migration:run`, `migration:revert`
- [x] Глобальный префикс `/api` в `main.ts`
- [x] `GlobalExceptionFilter` зарегистрирован глобально
- [x] `ResponseEnvelopeInterceptor` зарегистрирован глобально (оборачивает ответы в `{ data, meta }`)
- [x] Удалены дефолтные файлы стартера (`app.controller.ts`, `app.service.ts`, `app.controller.spec.ts`)

**Проверка:** `npm run start:dev` стартует без ошибок, БД подключена, `GET /api` → 404.

---

## Фаза 2 — Схема БД
**Цель:** все 4 таблицы созданы через миграцию, структура соответствует архитектуре.

- [x] ORM-энтити (в соответствующих BC, папка `domain/`):
  - [x] `provider.entity.ts`
  - [x] `provider-endpoint.entity.ts`
  - [x] `project.entity.ts`
  - [x] `endpoint-rule.entity.ts`
- [x] Все энтити добавлены в `typeorm.config.ts` (entities: [...])
- [x] `npm run migration:generate -- src/migrations/InitSchema`
- [x] Проверить сгенерированный файл миграции
- [x] `npm run migration:run`
- [x] Проверить таблицы в БД (все 4 созданы с нужными колонками и индексами)

**Проверка:** таблицы `providers`, `provider_endpoints`, `projects`, `endpoint_rules` существуют в БД.

---

## Фаза 3 — Catalog BC
**Цель:** `GET /api/providers` возвращает ServiceTitan и Yelp с их эндпоинтами.

- [x] Domain:
  - [x] `provider.entity.ts`
  - [x] `provider-endpoint.entity.ts`
  - [x] Используем единые entity в `domain` и TypeORM напрямую (без дублирования domain/persistence сущностей)
- [x] Infrastructure:
  - [x] `provider.repository.ts`
  - [x] `seed/catalog-seed.service.ts` (через `OnModuleInit`, идемпотентно)
  - [x] `seed/servicetitan.seed.ts` (10 эндпоинтов с реальными дефолтными ответами)
  - [x] `seed/yelp.seed.ts` (5 эндпоинтов с реальными дефолтными ответами)
- [x] Application:
  - [x] `queries/list-providers.query.ts` + `handlers/list-providers.handler.ts`
  - [x] `queries/get-provider-with-endpoints.query.ts` + `handlers/get-provider-with-endpoints.handler.ts`
- [x] Interface:
  - [x] `catalog.controller.ts` (`GET /api/providers`, `GET /api/providers/:id/endpoints`)
  - [x] `dto/provider.response.dto.ts`
  - [x] `dto/provider-endpoint.response.dto.ts`
- [x] `catalog.module.ts` зарегистрирован в `AppModule`

**Проверка:** `GET /api/providers` → список 2 провайдеров. `GET /api/providers/1/endpoints` → 10 эндпоинтов ST.

---

## Фаза 4 — Workspace BC
**Цель:** полный CRUD проектов и правил, всё персистируется в БД.

- [ ] Domain:
  - [ ] `project.aggregate.ts`
  - [ ] `endpoint-rule.entity.ts`
  - [ ] `value-objects/project-hash.vo.ts` (crypto.randomBytes(6).toString('hex'))
  - [ ] `value-objects/rule-condition.vo.ts`
- [ ] Infrastructure:
  - [ ] `persistence/project.repository.ts`
  - [ ] `persistence/endpoint-rule.repository.ts`
- [ ] Commands + Handlers:
  - [ ] `create-project` (генерирует hash, проверяет провайдер)
  - [ ] `delete-project` (каскад удаляет endpoint_rules)
  - [ ] `upsert-endpoint-rule` (проверяет принадлежность endpoint провайдеру проекта)
  - [ ] `delete-endpoint-rule`
- [ ] Queries + Handlers:
  - [ ] `list-projects` (с именем провайдера)
  - [ ] `get-project-detail` (проект + все эндпоинты провайдера + правила для каждого)
- [ ] Interface:
  - [ ] `projects.controller.ts` (`GET /api/projects`, `POST`, `GET /:id`, `DELETE /:id`)
  - [ ] `endpoint-rules.controller.ts` (`GET /api/projects/:id/rules`, `POST`, `PUT /:ruleId`, `DELETE /:ruleId`)
  - [ ] DTO: `create-project.dto.ts`, `project.response.dto.ts`, `upsert-endpoint-rule.dto.ts`, `endpoint-rule.response.dto.ts`
- [ ] `workspace.module.ts` зарегистрирован в `AppModule`

**Проверка:** через Postman — создать проект, добавить 3 правила с разными условиями, получить детали, удалить правило.

---

## Фаза 5 — Emulation BC
**Цель:** `/emulate/{hash}/...` возвращает эмулированный ответ с учётом правил.

- [ ] Domain Services:
  - [ ] `path-matcher.service.ts` (сегментное сопоставление с паттерном, wildcards `:param`)
  - [ ] `rule-evaluator.service.ts` (операторы: eq, contains, exists, not_exists, regex; источники: query_param, body_field, header, path_param, none)
  - [ ] `response-builder.service.ts` (дефолт / override / рандомизация структуры)
- [ ] Application:
  - [ ] `emulate.use-case.ts` (оркестрирует: hash → project → endpoints → match → rules → evaluate → build → respond)
- [ ] Interface:
  - [ ] `emulator.middleware.ts` (NestMiddleware на `/emulate/**`, парсит hash и provider-path из URL, обрабатывает delay через `await sleep()`)
- [ ] `emulation.module.ts` зарегистрирован, middleware подключён в `AppModule`

**Проверка:**
- Запрос к несуществующему hash → 404
- Запрос к несуществующему эндпоинту провайдера → 404
- Нет правил → дефолтный ответ провайдера
- Правило с `condition_source=none` → всегда срабатывает
- Правило с `query_param status eq pending` → срабатывает при `?status=pending`
- `action_delay_ms=2000` → ответ приходит через ~2 секунды
- `action_random=true` → структура ответа сохранена, значения случайные

---

## Фаза 6 — Фронтенд
**Цель:** через браузер можно управлять проектами и правилами без Postman.

- [ ] `@nestjs/serve-static` подключён в `AppModule` (root: `public/`)
- [ ] `public/index.html` — Vue 3 CDN SPA:
  - [ ] Состояние `projects-list`:
    - список всех проектов (имя, провайдер, hash, дата)
    - кнопка "Создать проект" → модал (name + select провайдера)
    - клик по проекту → переход в `project-detail`
  - [ ] Состояние `project-detail`:
    - шапка: имя, провайдер, base URL эмулятора для копирования
    - таблица эндпоинтов провайдера с методом и паттерном
    - для каждого эндпоинта — список его правил (метка, условие, действие)
    - кнопка "Добавить правило" для каждого эндпоинта → модал
    - кнопка "← Назад"
  - [ ] Модал `RuleModal`:
    - Поля: name, priority
    - Условие: conditionSource (select), conditionKey, conditionOperator (select), conditionValue
    - Действие: actionDelayMs, actionStatus, actionResponse (textarea JSON), actionRandom (toggle)
    - isEnabled (toggle)
    - Кнопки: Сохранить / Отмена / Удалить (если правило уже существует)
  - [ ] Отображение ready-to-use URL с подстановкой `{param}` вместо `:param`

**Проверка:** полный сценарий через браузер — создать проект ST, настроить правило, скопировать URL, проверить в Postman.

---

## Фаза 7 — Завершение
**Цель:** проект готов к использованию и передаче.

- [ ] Edge-cases в эмуляторе:
  - [ ] Невалидный hash → 404 с понятным сообщением
  - [ ] Нет совпавшего эндпоинта → 404 с методом и путём в сообщении
  - [ ] Все правила disabled → дефолтный ответ провайдера
  - [ ] `action_response` — невалидный JSON → fallback на дефолт
- [ ] `AGENTS.md` — реальные пути, паттерны, соглашения из кода
- [ ] `README.md` — как запустить, как добавить нового провайдера

---

## Порядок реализации внутри каждой фазы

Всегда от внутреннего к внешнему:

```
domain (чистая логика) → infrastructure (БД) → application (use cases) → presentation (HTTP)
```

Domain-слой никогда не импортирует из infrastructure.
В проекте используется единая модель сущности: entity лежит в `domain` и используется TypeORM напрямую без дублирования в infrastructure.
