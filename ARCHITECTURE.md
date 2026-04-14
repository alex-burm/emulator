# API Emulator Architecture

> Last updated: 2026-04-14
> Status: active implementation baseline + portability spec

## 1. Purpose

The service emulates third-party HTTP APIs (for example ServiceTitan, Yelp, and internal/default providers) without calling real upstreams.

Primary use cases:

- Develop and test integrations offline.
- Reproduce upstream contract behavior (status codes, headers, body formats, delays).
- Simulate happy-path and failure-path scenarios through configurable rules.

Core emulation route:

- `/emulate/{projectHash}/{providerPath...}`

Example:

- `GET /emulate/a3f9c2/v2/tenant/123/appointments?pageSize=1`

## 2. Bounded Contexts

### Catalog

Responsibility:

- Provider registry.
- Provider endpoint templates.
- Seed-driven source for available external API shapes.

Owns:

- `Provider`
- `ProviderEndpoint`

### Workspace

Responsibility:

- User projects and stable project hash.
- Per-project endpoint rules overriding provider defaults.

Owns:

- `Project`
- `EndpointRule`
- Rule condition value objects/enums.

### Emulation

Responsibility:

- Runtime request resolution by project hash + method + path.
- Rule evaluation.
- Final HTTP response construction and return.

Owns:

- Matching/evaluation/build services.
- Emulate use case.

## 3. Layering and Dependency Direction

Each bounded context follows:

- `domain`
- `application`
- `infrastructure`
- `presentation`

Dependency rules:

- `domain` is independent.
- `application` depends on domain contracts/models only.
- `infrastructure` implements domain/application contracts.
- `presentation` calls application and handles transport concerns.

Hard rule:

- `application` never imports `presentation`.

## 4. Domain Model (Current)

### Catalog

- `Provider` (slug, name, auth metadata, base URL, defaults)
- `ProviderEndpoint` (method, path pattern, default status/body/headers)

### Workspace

- `Project` (name, providerId, hash)
- `EndpointRule` (condition + action)
- `ProjectHash` VO (hash generation/format)
- `RuleConditionSource` enum
- `RuleConditionOperator` enum
- `RuleCondition` VO for rule validation consistency

### Emulation

Domain services:

- `PathMatcherService`
- `RuleEvaluatorService`
- `ResponseBuilderService`

## 5. Persistence and Schema

Current relational schema tables:

- `providers`
- `provider_endpoints`
- `projects`
- `endpoint_rules`
- `migrations`

Important constraints/indexes:

- `projects.hash` unique.
- FK: `provider_endpoints.provider_id -> providers.id`.
- FK: `projects.provider_id -> providers.id`.
- FK: `endpoint_rules.project_id -> projects.id`.
- FK: `endpoint_rules.provider_endpoint_id -> provider_endpoints.id`.
- Index on `(project_id, provider_endpoint_id, priority)` for rule retrieval order.

Portability rule:

- Keep table/column semantics stable across backend stacks.
- Changing ORM or framework must not change external API contract.

## 6. Transport Contracts

## 6.1 Management API (`/api/...`)

Global behavior:

- Validation enabled.
- Success envelope:
  - `{ "data": ..., "meta": {} }`
- Error envelope:
  - `{ "error": { "statusCode", "message", "path", "timestamp" } }`

Main endpoints:

- `GET /api/providers`
- `GET /api/providers/:id/endpoints`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/projects/:id/rules`
- `POST /api/projects/:id/rules`
- `PUT /api/projects/:id/rules/:ruleId`
- `DELETE /api/projects/:id/rules/:ruleId`

## 6.2 Emulation API (`/emulate/...`)

Route(s):

- `ALL /emulate/:hash`
- `ALL /emulate/:hash/*path`

Behavior:

- No success envelope wrapper.
- Returns raw status/body/headers from emulation engine.
- Supports JSON and non-JSON responses (`text/plain`, `application/xml`, `text/html`, empty body, etc).

## 7. Emulation Runtime Algorithm

Input:

- project hash
- HTTP method
- request path
- query/body/headers

Steps:

1. Load `Project` by hash.
2. Load provider endpoints by `project.providerId`.
3. Normalize incoming path.
4. Find first endpoint with matching method and matching path pattern.
5. Load project rules for `(projectId, providerEndpointId)` ordered by priority/order.
6. Evaluate rules sequentially and select first matched enabled rule.
7. If matched rule has delay, wait `actionDelayMs`.
8. Build response:
   - status: `rule.actionStatus` or `endpoint.defaultStatus`
   - body: `rule.actionResponse` (if provided) or `endpoint.defaultResponse`
   - headers: `endpoint.defaultHeaders` (fallback JSON header)
9. Apply template tokens in string values (`{{uuid}}`, `{{timestamp}}`, `{{integer}}`).
10. If `actionRandom=true`, randomize values while preserving shape.
11. Return final response to controller and then to HTTP client.

## 8. Rule Evaluation Semantics

Condition sources:

- `none`
- `query_param`
- `body_field`
- `header`
- `path_param`

Condition operators:

- `eq`
- `contains`
- `exists`
- `not_exists`
- `regex`

Evaluation notes:

- Disabled rule is always ignored.
- `none` means unconditional match.
- Missing key/operator for non-`none` condition means no match.
- Body/query nested field access supports dot-path (`a.b.c`).
- Header lookup is case-insensitive (`lowercase`).
- Invalid regex pattern is treated as no match.

## 9. Seed Strategy

Seed model:

- Providers and endpoints are defined in code as static seed documents.
- Seed is idempotent.
- If DB is not empty, sync mode adds missing providers/endpoints without dropping user data.

Current seed packs:

- `servicetitan`
- `yelp`
- `default` (response variability examples: plain, xml, html, empty, timeout style)

## 10. Portability Blueprint (Language/Framework Agnostic)

To rebuild this backend in another stack:

1. Preserve bounded contexts and use cases, not Nest-specific modules.
2. Recreate the same relational schema and constraints.
3. Keep the same HTTP contract and payload envelopes.
4. Implement equivalent request validation.
5. Implement equivalent wildcard emulation route semantics.
6. Preserve deterministic rule evaluation order.
7. Preserve token templating and randomization behavior.
8. Preserve seed idempotency and sync behavior.

Mapping guide:

- Nest controller -> HTTP handler/router in target framework.
- CQRS handlers -> use case/application services.
- Repository interfaces -> ports/contracts.
- TypeORM repositories -> adapter implementations for target ORM/driver.
- Global filters/interceptors -> middleware/hooks that produce same output shape.

## 11. ADR-Style Decisions (Current)

- Unified entity model is accepted for current CRUD scope (no duplicated domain/persistence entities).
- `ProjectAggregate` is intentionally deferred until real cross-rule transactional invariants appear.
- Emulation business logic lives in use case/domain services, not middleware.
- Query results can be returned directly by controllers when transport contract is identical.

## 12. Extension Rules

When adding a provider:

1. Add provider metadata and endpoints in seed file.
2. Keep realistic default headers and response shapes.
3. Add auth endpoint only when provider actually requires one.
4. Use `isAuthEndpoint` as UI metadata only.
5. Do not add runtime token persistence unless a real scenario demands it.

When adding new rule semantics:

1. Extend source/operator enum.
2. Extend evaluator service with deterministic behavior.
3. Add tests for success/failure edge cases.
4. Keep backward compatibility for existing rules.

## 13. Non-Goals (Current Stage)

- Full OAuth lifecycle/token store.
- Multi-tenant auth/access model.
- Event sourcing.
- Distributed consistency patterns.

These are postponed intentionally to keep emulator behavior fast and deterministic.
