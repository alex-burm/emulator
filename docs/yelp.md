# Yelp Fusion API — Reference for Emulator

> Sources: docs.developer.yelp.com, scrapfly.io, public integration guides  
> API version: v3  
> Used as a template for emulator seed data

---

## Overview

**Base URL:** `https://api.yelp.com`  
**Version:** `/v3/...`  
**Auth:** API Key is passed as a Bearer token

### Required headers

```http
Authorization: Bearer {api_key}
```

### Limits

- Search results: max 50 per request, max 1000 via pagination (`offset`)
- Reviews: max 3 reviews per request (Yelp limit)
- Rate limit: 5000 requests/day on the free plan

---

## Businesses Search

### GET /v3/businesses/search

Search businesses by location and/or keyword.

**Query params:**

| Parameter | Type | Description |
|---|---|---|
| term | string | Search query ("pizza", "plumber") |
| location | string | Text location description ("San Francisco, CA") |
| latitude | float | Latitude (alternative to location) |
| longitude | float | Longitude (alternative to location) |
| radius | int | Search radius in meters (max: 40000) |
| categories | string | Comma-separated categories ("pizza,bars") |
| price | string | Price range ("1,2,3") — 1=$, 2=$$, 3=$$$, 4=$$$$ |
| open_now | boolean | Open now only |
| sort_by | string | best_match / rating / review_count / distance |
| limit | int | Number of results (default: 20, max: 50) |
| offset | int | Pagination offset (default: 0) |

**Example response (200):**
```json
{
  "businesses": [
    {
      "id": "QPOI0dYeAl3U8iPM_IYWnA",
      "alias": "golden-boy-pizza-san-francisco",
      "name": "Golden Boy Pizza",
      "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/abcdef/o.jpg",
      "is_closed": false,
      "url": "https://www.yelp.com/biz/golden-boy-pizza-san-francisco",
      "review_count": 1284,
      "categories": [
        { "alias": "pizza", "title": "Pizza" },
        { "alias": "italian", "title": "Italian" }
      ],
      "rating": 4.5,
      "coordinates": {
        "latitude": 37.7987,
        "longitude": -122.4075
      },
      "transactions": ["pickup", "delivery"],
      "price": "$$",
      "location": {
        "address1": "542 Green St",
        "address2": null,
        "address3": "",
        "city": "San Francisco",
        "zip_code": "94133",
        "country": "US",
        "state": "CA",
        "display_address": ["542 Green St", "San Francisco, CA 94133"]
      },
      "phone": "+14159829738",
      "display_phone": "(415) 982-9738",
      "distance": 1243.56
    },
    {
      "id": "ehUuSk5gPTCQmwS_ubgKRA",
      "alias": "tonys-pizza-napoletana-san-francisco",
      "name": "Tony's Pizza Napoletana",
      "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/xyz789/o.jpg",
      "is_closed": false,
      "url": "https://www.yelp.com/biz/tonys-pizza-napoletana-san-francisco",
      "review_count": 4201,
      "categories": [
        { "alias": "pizza", "title": "Pizza" }
      ],
      "rating": 4.0,
      "coordinates": {
        "latitude": 37.8001,
        "longitude": -122.4100
      },
      "transactions": [],
      "price": "$$$",
      "location": {
        "address1": "1570 Stockton St",
        "address2": null,
        "address3": "",
        "city": "San Francisco",
        "zip_code": "94133",
        "country": "US",
        "state": "CA",
        "display_address": ["1570 Stockton St", "San Francisco, CA 94133"]
      },
      "phone": "+14158350900",
      "display_phone": "(415) 835-0900",
      "distance": 1891.30
    }
  ],
  "total": 240,
  "region": {
    "center": {
      "latitude": 37.7987,
      "longitude": -122.4075
    }
  }
}
```

**Example empty result:**
```json
{
  "businesses": [],
  "total": 0,
  "region": {
    "center": {
      "latitude": 37.7987,
      "longitude": -122.4075
    }
  }
}
```

---

## Business Details

### GET /v3/businesses/:id

Detailed information for a specific business.

**Path params:** `id` — Yelp business ID or alias

**Example response (200):**
```json
{
  "id": "QPOI0dYeAl3U8iPM_IYWnA",
  "alias": "golden-boy-pizza-san-francisco",
  "name": "Golden Boy Pizza",
  "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/abcdef/o.jpg",
  "is_claimed": true,
  "is_closed": false,
  "url": "https://www.yelp.com/biz/golden-boy-pizza-san-francisco",
  "phone": "+14159829738",
  "display_phone": "(415) 982-9738",
  "review_count": 1284,
  "categories": [
    { "alias": "pizza", "title": "Pizza" },
    { "alias": "italian", "title": "Italian" }
  ],
  "rating": 4.5,
  "location": {
    "address1": "542 Green St",
    "address2": null,
    "address3": "",
    "city": "San Francisco",
    "zip_code": "94133",
    "country": "US",
    "state": "CA",
    "display_address": ["542 Green St", "San Francisco, CA 94133"],
    "cross_streets": "Jasper Pl & Vallejo St"
  },
  "coordinates": {
    "latitude": 37.7987,
    "longitude": -122.4075
  },
  "photos": [
    "https://s3-media3.fl.yelpcdn.com/bphoto/abcdef/o.jpg",
    "https://s3-media1.fl.yelpcdn.com/bphoto/ghijkl/o.jpg",
    "https://s3-media4.fl.yelpcdn.com/bphoto/mnopqr/o.jpg"
  ],
  "price": "$$",
  "hours": [
    {
      "open": [
        { "is_overnight": false, "start": "1100", "end": "2300", "day": 0 },
        { "is_overnight": false, "start": "1100", "end": "2300", "day": 1 },
        { "is_overnight": false, "start": "1100", "end": "2300", "day": 2 },
        { "is_overnight": false, "start": "1100", "end": "2300", "day": 3 },
        { "is_overnight": true,  "start": "1100", "end": "0200", "day": 4 },
        { "is_overnight": true,  "start": "1100", "end": "0200", "day": 5 },
        { "is_overnight": false, "start": "1100", "end": "2300", "day": 6 }
      ],
      "hours_type": "REGULAR",
      "is_open_now": true
    }
  ],
  "transactions": ["pickup", "delivery"],
  "special_hours": [],
  "attributes": {
    "outdoor_seating": false,
    "liked_by_vegetarians": false,
    "good_for_groups": true,
    "wheelchair_accessible": true
  }
}
```

---

## Reviews

### GET /v3/businesses/:id/reviews

Business reviews. Returns up to 3 reviews.

**Query params:**

| Parameter | Type | Description |
|---|---|---|
| locale | string | Review language (default: "en_US") |
| sort_by | string | yelp_sort (default) / newest / oldest / highest_rated / lowest_rated |

**Example response (200):**
```json
{
  "reviews": [
    {
      "id": "xAG4O7l-t1ubbwVAlPnDKg",
      "url": "https://www.yelp.com/biz/golden-boy-pizza-san-francisco?hrid=xAG4O7l-t1ubbwVAlPnDKg",
      "text": "Best late-night pizza in North Beach. The slices are huge and the crust is perfectly crispy. Lines can get long on weekends but it's worth the wait.",
      "rating": 5,
      "time_created": "2024-05-12 21:34:00",
      "user": {
        "id": "W8UK02IDdRS2GL_66fuq6w",
        "profile_url": "https://www.yelp.com/user_details?userid=W8UK02IDdRS2GL_66fuq6w",
        "image_url": "https://s3-media3.fl.yelpcdn.com/photo/abc/30s.jpg",
        "name": "Ella A."
      }
    },
    {
      "id": "pKtMT_Kg91NfVnFvN4ZQJA",
      "url": "https://www.yelp.com/biz/golden-boy-pizza-san-francisco?hrid=pKtMT_Kg91NfVnFvN4ZQJA",
      "text": "Classic North Beach spot. Cash only and the slices are sold by the piece. Great value for the price. The focaccia is amazing too.",
      "rating": 4,
      "time_created": "2024-04-28 19:12:00",
      "user": {
        "id": "aB3cD4eF5gH6iJ7kL8mN9o",
        "profile_url": "https://www.yelp.com/user_details?userid=aB3cD4eF5gH6iJ7kL8mN9o",
        "image_url": null,
        "name": "Marcus T."
      }
    },
    {
      "id": "zY9xW8vU7tS6rQ5pO4nM3l",
      "url": "https://www.yelp.com/biz/golden-boy-pizza-san-francisco?hrid=zY9xW8vU7tS6rQ5pO4nM3l",
      "text": "Iconic pizza joint. Nothing fancy but exactly what you need at 1am. The clam and garlic slice is a must-try.",
      "rating": 5,
      "time_created": "2024-03-15 01:05:00",
      "user": {
        "id": "qR1sT2uV3wX4yZ5aB6cD7e",
        "profile_url": "https://www.yelp.com/user_details?userid=qR1sT2uV3wX4yZ5aB6cD7e",
        "image_url": "https://s3-media1.fl.yelpcdn.com/photo/xyz/30s.jpg",
        "name": "Sophie K."
      }
    }
  ],
  "total": 1284,
  "possible_languages": ["en"]
}
```

---

## Categories

### GET /v3/categories

List all available Yelp categories.

**Query params:** `locale` (default: "en_US")

**Example response (200):**
```json
{
  "categories": [
    {
      "alias": "restaurants",
      "title": "Restaurants",
      "parent_aliases": [],
      "country_whitelist": [],
      "country_blacklist": []
    },
    {
      "alias": "pizza",
      "title": "Pizza",
      "parent_aliases": ["restaurants"],
      "country_whitelist": [],
      "country_blacklist": []
    },
    {
      "alias": "burgers",
      "title": "Burgers",
      "parent_aliases": ["restaurants"],
      "country_whitelist": [],
      "country_blacklist": []
    },
    {
      "alias": "homeservices",
      "title": "Home Services",
      "parent_aliases": [],
      "country_whitelist": [],
      "country_blacklist": []
    },
    {
      "alias": "plumbing",
      "title": "Plumbing",
      "parent_aliases": ["homeservices"],
      "country_whitelist": [],
      "country_blacklist": []
    }
  ]
}
```

---

## Autocomplete

### GET /v3/autocomplete

Search autocomplete suggestions.

**Query params:**

| Parameter | Type | Description |
|---|---|---|
| text | string | Search query |
| latitude | float | Latitude for geocontext |
| longitude | float | Longitude for geocontext |
| locale | string | Language (default: "en_US") |

**Example response (200):**
```json
{
  "terms": [
    { "text": "Pizza" },
    { "text": "Pizzeria" },
    { "text": "Pizza Delivery" }
  ],
  "businesses": [
    {
      "id": "QPOI0dYeAl3U8iPM_IYWnA",
      "name": "Golden Boy Pizza",
      "redirect_url": "https://www.yelp.com/biz/golden-boy-pizza-san-francisco"
    }
  ],
  "categories": [
    { "alias": "pizza", "title": "Pizza" }
  ]
}
```

---

## Common errors

### 400 Bad Request — missing location or coordinates
```json
{
  "error": {
    "code": "LOCATION_NOT_FOUND",
    "description": "Could not execute search, please specify a location or use latitude and longitude."
  }
}
```

### 401 Unauthorized — invalid API key
```json
{
  "error": {
    "code": "TOKEN_MISSING",
    "description": "An access token must be supplied in order to use this endpoint."
  }
}
```

### 404 Not Found — business does not exist
```json
{
  "error": {
    "code": "BUSINESS_NOT_FOUND",
    "description": "The requested business could not be found."
  }
}
```

### 429 Too Many Requests
```json
{
  "error": {
    "code": "TOO_MANY_REQUESTS_PER_SECOND",
    "description": "You have exceeded the queries-per-second limit for this endpoint. Try your request again."
  }
}
```

---

## Seed endpoint summary

| Method | Path | Description | Default Status |
|---|---|---|---|
| GET | /v3/businesses/search | Business search | 200 |
| GET | /v3/businesses/:id | Business by ID | 200 |
| GET | /v3/businesses/:id/reviews | Business reviews | 200 |
| GET | /v3/categories | Categories list | 200 |
| GET | /v3/autocomplete | Autocomplete | 200 |
