# API Emulator — Architecture Knowledge Base

> Status: partially implemented
> Last updated: 2026-04-14

---

## Current Implementation Status

- Phase 1 (foundation): completed.
- Phase 2 (DB schema + migrations): completed.
- Phase 3 (Catalog BC): completed.
- Phase 4 (Workspace BC): completed.
- Phase 5 (Emulation BC): completed.
- Phase 6 (Frontend): completed.
- Phase 7: in progress.

Currently working endpoints:
- `GET /api/providers`
- `GET /api/providers/:id/endpoints`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/projects/:id/rules`
- `POST /api/projects/:id/rules`
- `PUT /api/projects/:id/rules/:ruleId`
- `DELETE /api/projects/:id/rules/:ruleId`
- `ALL /emulate/:hash/*path`

---

## Project Purpose

The service emulates external APIs (ServiceTitan, Yelp, etc.).

Base emulation route:
`/emulate/{project-hash}/{...provider-path}`

Example:
`GET /emulate/a3f9c2/v2/tenant/123/appointments?status=pending`

---

## Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 |
| CQRS | `@nestjs/cqrs` |
| ORM | TypeORM |
| Database | MySQL |
| Migrations | TypeORM migrations (`synchronize: false`) |
| Config | `@nestjs/config` |
| Validation | `class-validator` + `class-transformer` |

---

## Architecture Rules (Current)

- Module layers: `domain` → `application` → `infrastructure` → `presentation`.
- `application` must not import `presentation`.
- Repository contracts are declared in `domain/repositories`; implementations are in `infrastructure/persistence`.
- `application` injects repositories via domain ports (DI tokens), not concrete TypeORM classes.
- Entity files are in `domain` and used directly by TypeORM.
- For 1:1 CRUD, avoid duplicate `domain entity` and `persistence entity` models.
- CQRS structure:
  - `application/queries/<query-name>/...`
  - `application/commands/<command-name>/...`
- One handler per file.

---

## Bounded Contexts

### 1) Catalog BC

**Responsibility:** provider registry and provider endpoint templates (seed + read-only queries).

**Implemented:**
- idempotent ServiceTitan and Yelp seed on startup
- `ListProvidersQuery`
- `GetProviderWithEndpointsQuery`
- HTTP controller for reading catalog data

### 2) Workspace BC

**Responsibility:** projects, hash, and project-specific endpoint rules.

**Status:** implemented (project/rule CRUD, query/command handlers, HTTP controllers).

### 3) Emulation BC

**Responsibility:** handle `ALL /emulate/:hash/*path`, select endpoint, apply rules, build response.

**Status:** implemented.
**Approach:** `presentation/http` wildcard controller + use case, no middleware business logic.

---

## Current File Structure

```text
src/
├── bounded-contexts/
│   ├── catalog/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── workspace/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── emulation/
│       ├── domain/
│       ├── application/
│       └── presentation/
├── migrations/
├── shared/
├── app.module.ts
└── main.ts
```

---

## Database (Current)

Created tables:
- `providers`
- `provider_endpoints`
- `projects`
- `endpoint_rules`
- `migrations`

Key notes:
- FKs and indexes are applied by migration `1776113869684-InitSchema.ts`.
- Composite index exists on `endpoint_rules(project_id, provider_endpoint_id, priority)`.

---

## Current Catalog Data Flow

### `GET /api/providers`

1. `CatalogController` sends `ListProvidersQuery` via `QueryBus`.
2. `ListProvidersHandler` reads via `ProviderRepository.findAll()`.
3. Result returns as `ListProvidersResultItem[]`.
4. `ResponseEnvelopeInterceptor` wraps into `{ data, meta }`.

### `GET /api/providers/:id/endpoints`

1. `CatalogController` sends `GetProviderWithEndpointsQuery`.
2. `GetProviderWithEndpointsHandler` calls `ProviderRepository.findByIdWithEndpoints()`.
3. If provider is missing, throws `NotFoundException`.
4. Result returns as `GetProviderWithEndpointsResult`.
5. `ResponseEnvelopeInterceptor` wraps into `{ data, meta }`.

---

## Migrations

Scripts:

```json
{
  "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/shared/infrastructure/database/typeorm.config.ts",
  "migration:run": "typeorm-ts-node-commonjs migration:run -d src/shared/infrastructure/database/typeorm.config.ts",
  "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/shared/infrastructure/database/typeorm.config.ts"
}
```

`typeorm.config.ts` uses entity glob discovery in `domain/**`.

---

## Auth Emulation (Auth Endpoints)

### Approach

Provider auth endpoints (for example, `POST /connect/token` for ServiceTitan) are regular `provider_endpoint` seed records.
No new tables and no special middleware are required.
Runtime flow: `EmulationController` → `EmulateUseCase` → `PathMatcher` / `RuleEvaluator` / `ResponseBuilder`.

Subsequent token validation is intentionally not implemented.
The emulator is stateless and responds based on rules.

### Marking auth endpoints

`is_auth_endpoint: boolean` on `ProviderEndpoint` is UI metadata only.
It allows visual separation of auth routes from business routes.

### Dynamic token via templates

`ResponseBuilder` supports template placeholders in `default_response` / `action_response`:

| Placeholder | Result |
|---|---|
| `{{uuid}}` | `crypto.randomUUID()` |
| `{{timestamp}}` | current ISO timestamp |
| `{{integer}}` | random integer 1–9999 |

ServiceTitan auth endpoint example in seed:

```json
{
  "method": "POST",
  "path_pattern": "/connect/token",
  "is_auth_endpoint": true,
  "default_status": 200,
  "default_response": {
    "access_token": "{{uuid}}",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
}
```

Each `POST /emulate/a3f9c2/connect/token` call returns a fresh UUID.
Client behavior remains production-like.

### Testing invalid token scenario

Implemented via a regular `EndpointRule`, for example:

```text
condition_source:   header
condition_key:      authorization
condition_operator: not_exists
action_status:      401
action_response:    { "error": "Unauthorized", "message": "Bearer token is missing" }
priority:           1
```

### `auth_config` on Provider

Used as UI metadata only, not runtime logic.

### Yelp and providers without OAuth

For API-key providers like Yelp, no auth endpoint is required.
Key is passed statically via headers, and `auth_config` documents this for the UI.

---

## Next Steps

1. Complete Phase 7 edge-case hardening and regression checks.
2. Finalize `README.md` with runbook and provider extension flow.
3. Do final documentation pass for full code/document parity.
