# AGENTS.md

## General Rules

- When using Docker commands, do not run containers in the background (do not use `-d`).
- For modules, use layers: `domain`, `application`, `infrastructure`, `presentation`.
- Use DI for logging (`constructor(private readonly logger: Logger)`); do not create `new Logger(...)` inside services.

## Domain and Value Objects

- Keep Value Objects only in `domain/value-objects/` of the corresponding bounded context.
- Introduce a Value Object only when it has invariants/behavior, not just as a field wrapper.
- For CRUD scenarios with 1:1 structure, use the same entity in `domain` and TypeORM directly (no duplicate entities and no extra entity ↔ entity mapping).
- Do not introduce Aggregate preemptively: add it only when real cross-entity invariants and operations appear under a single consistency boundary.
- Declare repository contracts (ports) in `domain/repositories`.
- `application` depends on repository ports, not infrastructure implementations.

## CQRS Structure

- Use structure:
  - `application/queries/<query-name>/`
  - `application/commands/<command-name>/`
- Inside a query/command folder keep only related files:
  - `*.query.ts` / `*.command.ts`
  - `*.handler.ts`
  - `*.result.ts` / `*.dto.ts` (when needed)
- One handler = one file.
- Put helper types/structures (`enum`/`type`/`class`) in separate files next to the specific command/query.
- `application` must not import `presentation`.
- If HTTP contract matches a query result, return the query result directly from the controller without extra mapping.
- For emulation entry, use a `presentation/http` controller with wildcard route; do not place business logic in middleware.

## Persistence and Naming

- ORM entities are named as `*.entity.ts` (without `orm-entity` suffix).
- Entity files are placed in `domain/` of each bounded context.
- `infrastructure/persistence` contains repositories/adapters, not duplicate entities.
- For TypeORM discovery, use glob paths in `typeorm.config.ts` without manually listing all entities.
