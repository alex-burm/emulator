# AGENTS.md

## Общие правила

- При использовании Docker-команд не запускать контейнеры в фоне (`-d` не использовать).
- Для модулей использовать слои: `domain`, `application`, `infrastructure`, `presentation`.
- Логирование делать через DI (`constructor(private readonly logger: Logger)`); не создавать `new Logger(...)` внутри сервисов.

## Domain и Value Objects

- Value Objects размещаются только в `domain/value-objects/` соответствующего bounded context.
- Value Object вводим только когда есть инварианты/поведение, а не как обертку над полями.
- Для CRUD-сценариев, где структура 1:1, использовать одну и ту же entity в `domain` и TypeORM напрямую (без дублирования сущностей и без дополнительного маппинга entity ↔ entity).
- Контракты репозиториев (порты) объявлять в `domain/repositories`.
- `application` зависит от портов репозиториев, а не от инфраструктурных реализаций.

## CQRS структура

- Использовать структуру:
  - `application/queries/<query-name>/`
  - `application/commands/<command-name>/`
- Внутри папки query/command держать только связанные с ней файлы:
  - `*.query.ts` / `*.command.ts`
  - `*.handler.ts`
  - `*.result.ts` / `*.dto.ts` (при необходимости)
- Один handler = один файл.
- Вспомогательные типы/структуры (enum/type/class) размещать по отдельным файлам рядом с конкретной command/query.
- `application` не импортирует `presentation`.
- Если HTTP-контракт совпадает с `query result`, возвращать результат query из контроллера напрямую без лишнего маппинга.

## Persistence и именование

- ORM-сущности именуются в формате `*.entity.ts` (без суффикса `orm-entity`).
- Entity-файлы лежат в `domain/` каждого bounded context.
- В `infrastructure/persistence` лежат репозитории/адаптеры, а не дублирующие entity.
- Для TypeORM discovery использовать glob-пути в `typeorm.config.ts`, без ручного перечисления всех сущностей.
