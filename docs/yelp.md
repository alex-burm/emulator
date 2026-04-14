# Yelp Provider Reference (for Emulator Seeding)

> Last updated: 2026-04-14
> Purpose: define Yelp-like route and payload patterns used by emulator seed.

## Official API Areas to Check

When refreshing seed payloads, verify against Yelp Fusion docs:

- Businesses search
- Business details
- Business reviews
- Business match
- Events (if enabled in your scenario)

## Auth Model

- Auth type: API key bearer token
- Required header:

```http
Authorization: Bearer {api_key}
```

In emulator:

- No dynamic token exchange endpoint is required for Yelp.
- Auth behavior is usually simulated with rules on `authorization` header presence/shape.

## Typical Pagination/Result Behavior

Yelp responses are not always wrapped in the same pagination model as ServiceTitan.
Common list/search response uses:

```json
{
    "businesses": [],
    "total": 0,
    "region": {
        "center": {
            "latitude": 0,
            "longitude": 0
        }
    }
}
```

## Payload Quality Rules for Seed Updates

- Preserve Yelp field names and casing.
- Keep `id` as string where Yelp uses string IDs.
- Keep `rating`, `review_count`, `coordinates`, and `location` object shapes realistic.
- Keep reviews list short (Yelp commonly limits returned review count).

## Emulator-Specific Notes

- Route matching supports path params (`:id`) and query filters.
- Error cases are configured with endpoint rules (for example 401, 429, 500).
- You can simulate throttling by combining:
  - rule condition (header/query marker)
  - `actionStatus=429`
  - optional `actionDelayMs`

## Current Role in Project

Yelp provider is a realistic non-OAuth template used to validate:

- API-key style integrations
- list/detail response handling
- per-project rule override behavior
