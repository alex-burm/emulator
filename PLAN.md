# API Emulator — Development Plan

> Each phase must end in a working, testable state.
> Start the next phase only after verifying the previous one.

---

## Phase 1 — Foundation
**Goal:** the app starts, DB connection works, core infrastructure is ready.

- [x] Install dependencies:
  `@nestjs/typeorm`, `typeorm`, `mysql2`, `@nestjs/config`,
  `class-validator`, `class-transformer`, `@nestjs/cqrs`, `@nestjs/serve-static`
- [x] `.env` + `.env.example` (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, APP_PORT)
- [x] `@nestjs/config` connected in `AppModule` (`isGlobal: true`)
- [x] `typeorm.config.ts` in `shared/infrastructure/database/` (`synchronize: false`, migrations path)
- [x] `package.json` scripts: `migration:generate`, `migration:run`, `migration:revert`
- [x] Global `/api` prefix in `main.ts`
- [x] `GlobalExceptionFilter` registered globally
- [x] `ResponseEnvelopeInterceptor` registered globally (wraps responses into `{ data, meta }`)
- [x] Remove starter defaults (`app.controller.ts`, `app.service.ts`, `app.controller.spec.ts`)

**Validation:** `npm run start:dev` starts without errors, DB is connected, `GET /api` → 404.

---

## Phase 2 — DB Schema
**Goal:** all 4 tables are created via migration and match architecture.

- [x] ORM entities (inside corresponding BC, `domain/`):
  - [x] `provider.entity.ts`
  - [x] `provider-endpoint.entity.ts`
  - [x] `project.entity.ts`
  - [x] `endpoint-rule.entity.ts`
- [x] All entities added to `typeorm.config.ts` (`entities: [...]`)
- [x] `npm run migration:generate -- src/migrations/InitSchema`
- [x] Review generated migration file
- [x] `npm run migration:run`
- [x] Verify tables in DB (all 4 created with required columns and indexes)

**Validation:** tables `providers`, `provider_endpoints`, `projects`, `endpoint_rules` exist in DB.

---

## Phase 3 — Catalog BC
**Goal:** `GET /api/providers` returns ServiceTitan and Yelp with endpoints.

- [x] Domain:
  - [x] `provider.entity.ts`
  - [x] `provider-endpoint.entity.ts`
  - [x] Use unified entities in `domain` directly with TypeORM (no domain/persistence entity duplication)
- [x] Infrastructure:
  - [x] `provider.repository.ts`
  - [x] `seed/catalog-seed.service.ts` (via `OnModuleInit`, idempotent)
  - [x] `seed/servicetitan.seed.ts` (10 endpoints with realistic default responses)
  - [x] `seed/yelp.seed.ts` (5 endpoints with realistic default responses)
- [x] Application:
  - [x] `queries/list-providers.query.ts` + `handlers/list-providers.handler.ts`
  - [x] `queries/get-provider-with-endpoints.query.ts` + `handlers/get-provider-with-endpoints.handler.ts`
- [x] Presentation:
  - [x] `catalog.controller.ts` (`GET /api/providers`, `GET /api/providers/:id/endpoints`)
  - [x] `dto/provider.response.dto.ts`
  - [x] `dto/provider-endpoint.response.dto.ts`
- [x] `catalog.module.ts` registered in `AppModule`

**Validation:** `GET /api/providers` → 2 providers. `GET /api/providers/1/endpoints` → 10 ST endpoints.

---

## Phase 4 — Workspace BC
**Goal:** full CRUD for projects and rules, persisted in DB.

- [x] Domain:
  - [x] `project.entity.ts` (no `ProjectAggregate` at this stage)
  - [x] `endpoint-rule.entity.ts`
  - [x] `value-objects/project-hash.vo.ts` (`crypto.randomBytes(6).toString('hex')`)
  - [x] `value-objects/rule-condition.vo.ts`
- [x] Infrastructure:
  - [x] `persistence/project.repository.ts`
  - [x] `persistence/endpoint-rule.repository.ts`
- [x] Commands + Handlers:
  - [x] `create-project` (generates hash, validates provider)
  - [x] `delete-project` (cascade deletes endpoint rules)
  - [x] `upsert-endpoint-rule` (validates endpoint belongs to project provider)
  - [x] `delete-endpoint-rule`
- [x] Queries + Handlers:
  - [x] `list-projects` (with provider name)
  - [x] `get-project-detail` (project + all provider endpoints + per-endpoint rules)
- [x] Presentation:
  - [x] `projects.controller.ts` (`GET /api/projects`, `POST`, `GET /:id`, `DELETE /:id`)
  - [x] `endpoint-rules.controller.ts` (`GET /api/projects/:id/rules`, `POST`, `PUT /:ruleId`, `DELETE /:ruleId`)
  - [x] DTOs: `create-project.dto.ts`, `project.response.dto.ts`, `upsert-endpoint-rule.dto.ts`, `endpoint-rule.response.dto.ts`
- [x] `workspace.module.ts` registered in `AppModule`

**Validation:** create project, add 3 rules with different conditions, get details, delete rule.

---

## Phase 5 — Emulation BC
**Goal:** `/emulate/{hash}/...` returns emulated responses with rules applied.

- [x] Domain services:
  - [x] `path-matcher.service.ts` (segment matching with `:param` wildcards)
  - [x] `rule-evaluator.service.ts` (operators: `eq`, `contains`, `exists`, `not_exists`, `regex`; sources: `query_param`, `body_field`, `header`, `path_param`, `none`)
  - [x] `response-builder.service.ts` (default / override / randomized structure)
- [x] Application:
  - [x] `emulate.use-case.ts` (orchestrates: hash → project → endpoints → match → rules → evaluate → build → respond)
- [x] Presentation:
  - [x] `emulation.controller.ts` (wildcard route `/emulate/:hash/*path`, parses request context and delegates to `emulate.use-case.ts`)
- [x] `emulation.module.ts` registered and connected in `AppModule`

**Validation:**
- unknown hash → 404
- unknown provider endpoint path → 404
- no rules → provider default response
- rule with `condition_source=none` → always matches
- rule with `query_param status eq pending` → matches with `?status=pending`
- `action_delay_ms=2000` → response delayed by ~2 seconds
- `action_random=true` → same structure, randomized values

---

## Phase 6 — Frontend ✅
**Goal:** manage projects/rules from browser without Postman.

- [x] `@nestjs/serve-static` connected in `AppModule` (`public/`, exclude `/api/*`, `/emulate/*`)
- [x] `public/index.html` — Vue 3 CDN SPA:
  - [x] `projects-list` state:
    - list all projects (name, provider, hash, date)
    - `Create Project` button → modal (name + provider select)
    - click project → `project-detail`
  - [x] `project-detail` state:
    - header: name, provider, emulation base URL to copy
    - provider endpoints table (method + path pattern, accordion)
    - per-endpoint rules list (label, condition, action, tags)
    - `Add Rule` button per endpoint → modal
    - `← Projects` back button
  - [x] `RuleModal`:
    - fields: `name`, `priority`
    - condition: `conditionSource`, `conditionKey`, `conditionOperator`, `conditionValue`
    - action: `actionDelayMs`, `actionStatus`, `actionResponse` (JSON textarea), `actionRandom`
    - `isEnabled`
    - buttons: `Save` / `Cancel` / `Delete` (in edit mode)
  - [x] Ready-to-use URL rendering with `{param}` for `:param`
  - [x] Toast notifications (success / error)
  - [x] Empty states and loading spinner

**Validation:** complete browser flow for project/rule management.

---

## Phase 7 — Finalization
**Goal:** project is ready for usage and handover.

- [ ] Emulation edge cases:
  - [ ] invalid hash → 404 with clear message
  - [ ] no matched endpoint → 404 including method and path
  - [ ] all rules disabled → fallback to provider default
  - [ ] invalid JSON in `action_response` → fallback to default
- [ ] `AGENTS.md` reflects real paths, patterns, and conventions from code
- [ ] `README.md` includes run instructions and provider extension guide

---

## Implementation Order Per Phase

Always move from inner to outer layers:

```text
domain (core logic) → infrastructure (DB) → application (use cases) → presentation (HTTP)
```

Domain layer must never import from infrastructure.
The project uses a unified entity model: entity stays in `domain` and is used by TypeORM directly, without duplication in infrastructure.
