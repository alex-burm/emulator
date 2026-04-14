# API Emulator Implementation Plan

> Last updated: 2026-04-14
> This plan is framework-agnostic and intended as a direct build roadmap.

## Phase 1 - Foundation

Goal: bootable service with baseline cross-cutting concerns.

- [ ] Initialize backend project and dependency management.
- [ ] Configure environment loading (`APP_PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`).
- [ ] Configure relational DB connection with migrations enabled and auto-sync disabled.
- [ ] Add global request validation.
- [ ] Add global error contract:
  - `{ "error": { "statusCode", "message", "path", "timestamp" } }`
- [ ] Add global success envelope for management API:
  - `{ "data": ..., "meta": {} }`
- [ ] Exclude emulation endpoints from success envelope wrapping.

Validation:

- Service starts and connects to DB.
- Unknown management route returns 404.

## Phase 2 - Data Model and Schema

Goal: persistent model for providers, projects, and emulation rules.

- [ ] Implement entities:
  - `Provider`
  - `ProviderEndpoint`
  - `Project`
  - `EndpointRule`
- [ ] Add schema migration for all required tables and constraints.
- [ ] Add indexes for rule lookup performance:
  - `(project_id, provider_endpoint_id, priority)`
- [ ] Apply migration and verify schema.

Validation:

- Tables and constraints exist exactly as defined.

## Phase 3 - Catalog Context

Goal: provider registry + endpoint templates with seed bootstrap.

- [ ] Implement provider repository contract in domain.
- [ ] Implement persistence adapter in infrastructure.
- [ ] Implement idempotent seed runner.
- [ ] Add provider seed packs:
  - ServiceTitan
  - Yelp
  - Default provider (format variability examples)
- [ ] Implement use cases/queries:
  - list providers
  - get provider with endpoints
- [ ] Expose HTTP endpoints:
  - `GET /api/providers`
  - `GET /api/providers/:id/endpoints`

Validation:

- Provider list and endpoint templates are returned from seeded data.

## Phase 4 - Workspace Context

Goal: project and rule management.

- [ ] Implement `ProjectHash` value object.
- [ ] Implement rule condition enums/value object.
- [ ] Implement repository contracts:
  - project repository
  - endpoint rule repository
- [ ] Implement commands:
  - create project
  - rename project
  - delete project
  - upsert endpoint rule
  - delete endpoint rule
- [ ] Implement queries:
  - list projects
  - get project detail
  - list project rules
- [ ] Expose HTTP endpoints:
  - `GET /api/projects`
  - `POST /api/projects`
  - `GET /api/projects/:id`
  - `PATCH /api/projects/:id`
  - `DELETE /api/projects/:id`
  - `GET /api/projects/:id/rules`
  - `POST /api/projects/:id/rules`
  - `PUT /api/projects/:id/rules/:ruleId`
  - `DELETE /api/projects/:id/rules/:ruleId`

Validation:

- Full CRUD works and persists correctly.

## Phase 5 - Emulation Context

Goal: runtime emulation engine on wildcard route.

- [ ] Implement path matcher service (`:param` support).
- [ ] Implement rule evaluator service.
- [ ] Implement response builder service.
- [ ] Implement emulate use case orchestration:
  - project by hash
  - endpoint match by method/path
  - rule fetch + first-match evaluation
  - delay application
  - response assembly
- [ ] Expose wildcard HTTP endpoints:
  - `ALL /emulate/:hash`
  - `ALL /emulate/:hash/*path`

Validation:

- Unknown hash -> 404.
- Unknown endpoint path -> 404.
- No matched rule -> endpoint default response.
- Matched rule override works.

## Phase 6 - Response Variability Support

Goal: support realistic upstream response diversity.

- [ ] Ensure responses support:
  - JSON body
  - plain text body
  - XML body
  - HTML body
  - empty body (`null` / no content)
- [ ] Ensure per-endpoint headers are respected (including `Content-Type`).
- [ ] Ensure per-rule overrides can replace status/body.
- [ ] Implement delay simulation (`actionDelayMs`).
- [ ] Implement optional randomized payload mode preserving shape (`actionRandom`).
- [ ] Implement template tokens in string payloads:
  - `{{uuid}}`
  - `{{timestamp}}`
  - `{{integer}}`

Validation:

- Seeded default provider demonstrates all supported response styles.

## Phase 7 - Frontend Admin (Optional but Recommended)

Goal: manage projects and rules without API client tools.

- [ ] Serve static UI from backend host.
- [ ] Build project list/create/detail screens.
- [ ] Build per-endpoint rule CRUD UI.
- [ ] Add JSON editor/validation for rule action response.
- [ ] Add clear display of emulation base URL per project hash.

Validation:

- End-to-end project/rule management is usable in browser.

## Phase 8 - Quality and Hardening

Goal: production-grade reliability for emulator behavior.

- [ ] Add unit tests for:
  - path matcher
  - rule evaluator (all sources/operators)
  - response builder
- [ ] Add integration tests for management API contracts.
- [ ] Add integration tests for emulation scenarios (status/body/headers/delay).
- [ ] Add seed regression tests (idempotent + sync mode).
- [ ] Add logging and observability baseline.

Validation:

- Test suite covers core behavior and edge cases.

## Definition of Done

Implementation is complete when all points are true:

- [ ] Management API contract is stable and documented.
- [ ] Emulation runtime behaves deterministically by configured rules.
- [ ] Non-JSON and empty-body scenarios are supported.
- [ ] Seed bootstrap is idempotent and reproducible.
- [ ] Architecture boundaries are respected (`domain`, `application`, `infrastructure`, `presentation`).
