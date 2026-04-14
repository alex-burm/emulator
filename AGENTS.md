# AGENTS.md

## Scope

This file defines project-level implementation rules for contributors and coding agents.

## Core Principles

- Keep architecture explicit and portable across backend stacks.
- Prefer simple, deterministic behavior over framework magic.
- Preserve bounded context boundaries: `catalog`, `workspace`, `emulation`.
- Keep business logic in domain/application, never in transport glue.

## Layering Rules

Use layers per bounded context:

- `domain`
- `application`
- `infrastructure`
- `presentation`

Allowed dependency direction:

- `domain` -> no dependencies on app/framework/infrastructure.
- `application` -> may depend on `domain` contracts and models.
- `infrastructure` -> may depend on `domain` and `application` contracts.
- `presentation` -> may depend on `application`.

Forbidden:

- `application` importing `presentation`.
- Business decision logic in middleware/filters/interceptors/controllers.

## Domain Model Rules

- Domain entities live in `domain/entity` (or `domain` when the context is still small).
- Repository contracts are declared in domain (`domain/repository` or `domain/repositories`).
- Repository implementations live in `infrastructure/persistence`.
- For current project scope, do not introduce aggregate roots preemptively.
- Add Value Objects only when they enforce invariants or behavior.
- Keep each enum/type/value object in its own file.

## CQRS Rules

Use explicit split:

- `application/command/<command-name>/...`
- `application/query/<query-name>/...`

Inside each command/query folder:

- `*.command.ts` or `*.query.ts`
- `*.handler.ts`
- `*.result.ts` (or `*.dto.ts` if needed)

Additional rules:

- One handler per file.
- A command may return a minimal operation result.
- A query returns read models/results only.
- Do not mix command DTOs with query DTOs.

## Presentation Rules

- Use `presentation/http` for HTTP adapters.
- Emulation entrypoint must be a wildcard controller (`/emulate/:hash/*path`), not middleware.
- If HTTP contract equals query result, return query result directly (no extra mapping layer).
- Keep transport-specific validation/parsing in presentation.

## Logging and DI

- Use DI for logger and services.
- Do not instantiate logger manually with `new Logger(...)` inside services.

## Persistence Rules

- Entity file naming: `*.entity.ts`.
- Do not use `*.orm-entity.ts` suffix.
- Do not duplicate `domain entity` and `persistence entity` for 1:1 CRUD models.
- Configure TypeORM entity discovery via glob patterns, not long manual entity arrays.

## Formatting and Style

- Use 4-space indentation in TypeScript and docs examples.
- Keep ASCII by default.
- Keep files in English.
- Keep comments concise and only where logic is non-obvious.
