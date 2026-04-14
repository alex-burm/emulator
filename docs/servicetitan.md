# ServiceTitan Provider Reference (for Emulator Seeding)

> Last updated: 2026-04-14
> Purpose: define reference payloads and route shapes used by the emulator seed.

## Official API Areas to Check in ServiceTitan Docs

When updating seeded payloads, use these sections in ServiceTitan documentation:

- Identity / OAuth:
  - token endpoint (`/connect/token`)
- Settings API:
  - tenant employees endpoint (`/settings/v2/tenant/{tenant}/employees`)
- JPM API:
  - appointments (`/jpm/v2/tenant/{tenant}/appointments` and by id)
- CRM / Customers API:
  - customers list and details
- Jobs API:
  - jobs list and details
- Invoices API:
  - invoices list and details

Note:

- ServiceTitan docs may expose endpoints under product-specific prefixes (`/jpm`, `/crm`, etc).
- Emulator seed may normalize route templates for consistency in a test scenario.

## Auth Model

- Auth type: OAuth2 Client Credentials
- Typical token endpoint:
  - `POST /connect/token`
- Typical request body format:
  - `application/x-www-form-urlencoded`
  - `grant_type=client_credentials`

Seed behavior in emulator:

- Token response is mocked.
- `access_token` can be dynamic via `{{uuid}}` template.
- Token persistence/validation is intentionally out of scope.

## Canonical Paginated Shape Used in Seed

```json
{
    "page": 1,
    "pageSize": 50,
    "hasMore": false,
    "totalCount": 1,
    "data": []
}
```

## Seeded ServiceTitan Routes (Current)

- `POST /connect/token`
- `GET /settings/v2/tenant/:tenantId/employees`
- `GET /v2/tenant/:tenantId/appointments`
- `GET /v2/tenant/:tenantId/appointments/:id`
- `GET /v2/tenant/:tenantId/jobs`
- `GET /v2/tenant/:tenantId/jobs/:id`
- `GET /v2/tenant/:tenantId/customers`
- `GET /v2/tenant/:tenantId/customers/:id`
- `GET /v2/tenant/:tenantId/technicians`
- `GET /v2/tenant/:tenantId/invoices`
- `GET /v2/tenant/:tenantId/invoices/:id`
- `POST /v2/tenant/:tenantId/jobs/:id/cancel`

## Payload Quality Rules for Seed Updates

- Keep field names as close as possible to official docs.
- Keep realistic data types (`id` numeric, datetime string, booleans as booleans).
- Keep list endpoints paginated.
- Keep detail endpoints as single-object responses.
- For uncertain fields, prefer conservative placeholders over invented deep structures.

## Emulator-Specific Notes

- Route matching supports `:tenantId` and other path params.
- Rules can target query/body/header/path values.
- Response content-type can be overridden by endpoint headers.
- Scenario failures (401/404/500/504) are generated via endpoint rules, not hardcoded logic.
