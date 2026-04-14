# API Emulator

HTTP API emulator for third-party providers (ServiceTitan, Yelp, and custom/default templates).

## What It Does

- Stores provider endpoint templates.
- Creates local projects with unique public hash.
- Applies per-project conditional rules to endpoint behavior.
- Serves emulated responses from wildcard route:
  - `/emulate/{projectHash}/{providerPath...}`

The emulator supports:

- JSON and non-JSON responses.
- Custom status codes and headers.
- Empty body responses.
- Simulated delays.
- Dynamic token placeholders in response payloads.

## Technology (Current Implementation)

- NestJS
- TypeORM
- MySQL
- CQRS (`@nestjs/cqrs`)
- Vue 3 CDN frontend in `public/`

Architecture is documented to be portable to other backend stacks in [ARCHITECTURE.md](/Users/yandex/ProjectsLocal/freeagency/emulator/ARCHITECTURE.md).

## Local Setup

## 1. Install

```bash
npm install
```

## 2. Configure environment

Create `.env` (or copy from `.env.example`):

```dotenv
APP_PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=secret
DB_NAME=emulator
```

## 3. Run migrations

```bash
npm run migration:run
```

## 4. Start app

```bash
npm run start:dev
```

Frontend:

- `http://localhost:3000/`

Management API base:

- `http://localhost:3000/api`

Emulation API base:

- `http://localhost:3000/emulate`

## Useful Scripts

```bash
npm run start
npm run start:dev
npm run build
npm run migration:generate -- src/migrations/<Name>
npm run migration:run
npm run migration:revert
```

## API Overview

## Catalog

- `GET /api/providers`
- `GET /api/providers/:id/endpoints`

## Workspace / Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `DELETE /api/projects/:id`

## Workspace / Rules

- `GET /api/projects/:id/rules`
- `POST /api/projects/:id/rules`
- `PUT /api/projects/:id/rules/:ruleId`
- `DELETE /api/projects/:id/rules/:ruleId`

## Emulation Runtime

- `ALL /emulate/:hash`
- `ALL /emulate/:hash/*path`

## Response Envelopes

Management endpoints (`/api/...`):

- Success:

```json
{
    "data": {},
    "meta": {}
}
```

- Error:

```json
{
    "error": {
        "statusCode": 404,
        "message": "...",
        "path": "/api/...",
        "timestamp": "2026-04-14T00:00:00.000Z"
    }
}
```

Emulation endpoints (`/emulate/...`):

- Raw status/body/headers are returned directly (no envelope).

## Rule Engine Summary

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

First matched enabled rule is applied.
If no rule matches, endpoint default response is returned.

## Dynamic Template Tokens

Supported in endpoint `defaultResponse` and rule `actionResponse` string values:

- `{{uuid}}`
- `{{timestamp}}`
- `{{integer}}`

## Seed Data

Current provider seed packs:

- ServiceTitan
- Yelp
- Default Provider (format variability examples)

Seed behavior:

- Idempotent on startup.
- Sync mode adds missing providers/endpoints when DB already has data.

## Defining Non-JSON / Empty / Timeout-Style Responses

Use endpoint defaults or rule action payloads with explicit headers/status.

Examples:

- Plain text:

```json
{
    "defaultStatus": 200,
    "defaultHeaders": {
        "Content-Type": "text/plain; charset=utf-8"
    },
    "defaultResponse": "pong"
}
```

- XML:

```json
{
    "defaultStatus": 200,
    "defaultHeaders": {
        "Content-Type": "application/xml; charset=utf-8"
    },
    "defaultResponse": "<?xml version=\"1.0\"?><root><ok>true</ok></root>"
}
```

- Empty body:

```json
{
    "defaultStatus": 204,
    "defaultHeaders": {
        "Content-Type": "text/plain; charset=utf-8"
    },
    "defaultResponse": null
}
```

- Timeout-style behavior:

- Set rule `actionDelayMs` (for latency simulation), optionally with `actionStatus=504` and a plain text body.

## Porting to Another Backend Stack

Use these files as canonical references:

- [ARCHITECTURE.md](/Users/yandex/ProjectsLocal/freeagency/emulator/ARCHITECTURE.md)
- [PLAN.md](/Users/yandex/ProjectsLocal/freeagency/emulator/PLAN.md)
- [AGENTS.md](/Users/yandex/ProjectsLocal/freeagency/emulator/AGENTS.md)

Porting objective:

- Preserve external contract and runtime behavior.
- Replace framework/ORM/runtime implementation details only.
