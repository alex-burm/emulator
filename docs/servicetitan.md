# ServiceTitan API — Reference for Emulator

> Источники: developer.servicetitan.io, GitHub-клиенты, публичные интеграционные гайды  
> Версия API: v2  
> Используется как шаблон для seed-данных эмулятора

---

## Обзор

**Base URL:** `https://api.servicetitan.io`  
**Версия:** `/v2/tenant/{tenantId}/...`  
**Auth:** OAuth2 Client Credentials → Bearer token

### Обязательные заголовки

```http
Authorization: Bearer {access_token}
ST-App-Key: {app_key}
Content-Type: application/json
```

### Получение токена

```
POST https://auth.servicetitan.io/connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={client_id}
&client_secret={client_secret}
```

**Ответ:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Общая структура paginated-ответа (list endpoints)

```json
{
  "page": 1,
  "pageSize": 50,
  "hasMore": false,
  "totalCount": 3,
  "data": [ ... ]
}
```

### Query-параметры для списков

| Параметр | Тип | Описание |
|---|---|---|
| page | number | Номер страницы (default: 1) |
| pageSize | number | Кол-во записей (default: 50, max: 500) |
| modifiedOnOrAfter | datetime | Фильтр по дате изменения |
| active | boolean | Только активные записи |

---

## Appointments

### GET /v2/tenant/:tenantId/appointments

Список записей на обслуживание.

**Query params:** `page`, `pageSize`, `jobId`, `startsOnOrAfter`, `startsOnOrBefore`, `status`

**Пример ответа:**
```json
{
  "page": 1,
  "pageSize": 50,
  "hasMore": false,
  "totalCount": 2,
  "data": [
    {
      "id": 10001,
      "jobId": 5001,
      "appointmentNumber": "A-10001",
      "start": "2024-06-15T09:00:00Z",
      "end": "2024-06-15T11:00:00Z",
      "arrivalWindowStart": "2024-06-15T08:30:00Z",
      "arrivalWindowEnd": "2024-06-15T10:00:00Z",
      "status": "Scheduled",
      "specialInstructions": "Call before arrival",
      "createdOn": "2024-06-10T14:22:00Z",
      "modifiedOn": "2024-06-10T14:22:00Z",
      "customerId": 2001,
      "unused": false
    },
    {
      "id": 10002,
      "jobId": 5002,
      "appointmentNumber": "A-10002",
      "start": "2024-06-15T13:00:00Z",
      "end": "2024-06-15T15:00:00Z",
      "arrivalWindowStart": "2024-06-15T13:00:00Z",
      "arrivalWindowEnd": "2024-06-15T14:30:00Z",
      "status": "Done",
      "specialInstructions": null,
      "createdOn": "2024-06-11T09:00:00Z",
      "modifiedOn": "2024-06-15T15:10:00Z",
      "customerId": 2002,
      "unused": false
    }
  ]
}
```

**Возможные значения `status`:** `Scheduled`, `Dispatched`, `Working`, `Done`, `Canceled`

---

### GET /v2/tenant/:tenantId/appointments/:id

Запись по ID.

**Пример ответа:**
```json
{
  "id": 10001,
  "jobId": 5001,
  "appointmentNumber": "A-10001",
  "start": "2024-06-15T09:00:00Z",
  "end": "2024-06-15T11:00:00Z",
  "arrivalWindowStart": "2024-06-15T08:30:00Z",
  "arrivalWindowEnd": "2024-06-15T10:00:00Z",
  "status": "Scheduled",
  "specialInstructions": "Call before arrival",
  "createdOn": "2024-06-10T14:22:00Z",
  "modifiedOn": "2024-06-10T14:22:00Z",
  "customerId": 2001,
  "unused": false
}
```

---

### POST /v2/tenant/:tenantId/appointments

Создать запись.

**Request body:**
```json
{
  "jobId": 5001,
  "start": "2024-06-20T10:00:00Z",
  "end": "2024-06-20T12:00:00Z",
  "arrivalWindowStart": "2024-06-20T09:30:00Z",
  "arrivalWindowEnd": "2024-06-20T11:00:00Z",
  "specialInstructions": "Pet on premises"
}
```

**Пример ответа (201):**
```json
{
  "id": 10003,
  "jobId": 5001,
  "appointmentNumber": "A-10003",
  "start": "2024-06-20T10:00:00Z",
  "end": "2024-06-20T12:00:00Z",
  "arrivalWindowStart": "2024-06-20T09:30:00Z",
  "arrivalWindowEnd": "2024-06-20T11:00:00Z",
  "status": "Scheduled",
  "specialInstructions": "Pet on premises",
  "createdOn": "2024-06-13T08:00:00Z",
  "modifiedOn": "2024-06-13T08:00:00Z",
  "customerId": 2001,
  "unused": false
}
```

---

### PUT /v2/tenant/:tenantId/appointments/:id

Обновить запись.

**Request body:**
```json
{
  "start": "2024-06-20T11:00:00Z",
  "end": "2024-06-20T13:00:00Z",
  "specialInstructions": "Updated instructions"
}
```

**Пример ответа (200):** та же структура что у GET /:id

---

## Customers

### GET /v2/tenant/:tenantId/customers

Список клиентов.

**Query params:** `page`, `pageSize`, `active`, `modifiedOnOrAfter`, `name`

**Пример ответа:**
```json
{
  "page": 1,
  "pageSize": 50,
  "hasMore": false,
  "totalCount": 2,
  "data": [
    {
      "id": 2001,
      "active": true,
      "name": "John Smith",
      "type": "Residential",
      "balance": 0.00,
      "doNotMail": false,
      "doNotService": false,
      "createdOn": "2023-01-15T10:00:00Z",
      "createdById": 101,
      "modifiedOn": "2024-05-20T09:30:00Z",
      "mergedToId": null,
      "externalData": null,
      "contacts": [
        {
          "id": 3001,
          "type": "Phone",
          "value": "+14155552671",
          "memo": "Mobile"
        },
        {
          "id": 3002,
          "type": "Email",
          "value": "john.smith@example.com",
          "memo": "Primary"
        }
      ],
      "locations": [
        {
          "id": 4001,
          "name": "Main Residence",
          "address": {
            "street": "123 Main St",
            "unit": null,
            "city": "San Jose",
            "state": "CA",
            "zip": "95101",
            "country": "USA"
          }
        }
      ],
      "customFields": []
    },
    {
      "id": 2002,
      "active": true,
      "name": "Acme Corp",
      "type": "Commercial",
      "balance": 1250.00,
      "doNotMail": false,
      "doNotService": false,
      "createdOn": "2023-03-10T11:00:00Z",
      "createdById": 101,
      "modifiedOn": "2024-06-01T14:00:00Z",
      "mergedToId": null,
      "externalData": null,
      "contacts": [
        {
          "id": 3003,
          "type": "Phone",
          "value": "+14085559900",
          "memo": "Office"
        }
      ],
      "locations": [
        {
          "id": 4002,
          "name": "HQ",
          "address": {
            "street": "500 Corporate Blvd",
            "unit": "Suite 200",
            "city": "San Francisco",
            "state": "CA",
            "zip": "94105",
            "country": "USA"
          }
        }
      ],
      "customFields": [
        { "name": "AccountManager", "value": "Jane Doe" }
      ]
    }
  ]
}
```

**Возможные значения `type`:** `Residential`, `Commercial`

---

### GET /v2/tenant/:tenantId/customers/:id

Клиент по ID.  
**Пример ответа:** один объект из массива `data` выше (без пагинации).

---

### POST /v2/tenant/:tenantId/customers

Создать клиента.

**Request body:**
```json
{
  "name": "New Customer",
  "type": "Residential",
  "doNotMail": false,
  "doNotService": false,
  "contacts": [
    { "type": "Phone", "value": "+14155550100", "memo": "Mobile" }
  ],
  "locations": [
    {
      "name": "Home",
      "address": {
        "street": "789 Oak Ave",
        "city": "Oakland",
        "state": "CA",
        "zip": "94601",
        "country": "USA"
      }
    }
  ]
}
```

**Пример ответа (201):** полный объект клиента с присвоенным `id`.

---

## Jobs

### GET /v2/tenant/:tenantId/jobs

Список работ.

**Query params:** `page`, `pageSize`, `status`, `customerId`, `locationId`, `completedOnOrAfter`, `completedOnOrBefore`, `createdOnOrAfter`

**Пример ответа:**
```json
{
  "page": 1,
  "pageSize": 50,
  "hasMore": false,
  "totalCount": 2,
  "data": [
    {
      "id": 5001,
      "jobNumber": "JOB-5001",
      "projectId": null,
      "customerId": 2001,
      "locationId": 4001,
      "jobStatus": "Scheduled",
      "completedOn": null,
      "businessUnitId": 1,
      "jobTypeId": 10,
      "priority": "Normal",
      "campaignId": null,
      "summary": "AC unit not cooling properly",
      "noCharge": false,
      "notificationsEnabled": true,
      "createdOn": "2024-06-10T14:00:00Z",
      "createdById": 101,
      "modifiedOn": "2024-06-10T14:20:00Z",
      "appointmentCount": 1,
      "firstAppointmentId": 10001,
      "lastAppointmentId": 10001,
      "recallForId": null,
      "warrantyId": null,
      "tagTypeIds": [5, 12],
      "customFields": [],
      "externalData": null
    },
    {
      "id": 5002,
      "jobNumber": "JOB-5002",
      "projectId": null,
      "customerId": 2002,
      "locationId": 4002,
      "jobStatus": "Completed",
      "completedOn": "2024-06-15T15:10:00Z",
      "businessUnitId": 1,
      "jobTypeId": 11,
      "priority": "Urgent",
      "campaignId": 3,
      "summary": "Plumbing leak in basement",
      "noCharge": false,
      "notificationsEnabled": true,
      "createdOn": "2024-06-11T08:00:00Z",
      "createdById": 102,
      "modifiedOn": "2024-06-15T15:15:00Z",
      "appointmentCount": 1,
      "firstAppointmentId": 10002,
      "lastAppointmentId": 10002,
      "recallForId": null,
      "warrantyId": null,
      "tagTypeIds": [],
      "customFields": [],
      "externalData": null
    }
  ]
}
```

**Возможные значения `jobStatus`:** `Scheduled`, `InProgress`, `Completed`, `Canceled`, `OnHold`  
**Возможные значения `priority`:** `Normal`, `High`, `Urgent`

---

### GET /v2/tenant/:tenantId/jobs/:id

Работа по ID.  
**Пример ответа:** один объект из массива `data` выше.

---

## Technicians

### GET /v2/tenant/:tenantId/technicians

Список техников.

**Query params:** `page`, `pageSize`, `active`, `businessUnitId`

**Пример ответа:**
```json
{
  "page": 1,
  "pageSize": 50,
  "hasMore": false,
  "totalCount": 2,
  "data": [
    {
      "id": 201,
      "name": "Mike Johnson",
      "employeeId": "EMP-201",
      "businessUnitId": 1,
      "active": true,
      "email": "mike.johnson@company.com",
      "phones": [
        { "type": "Mobile", "value": "+14085551234" }
      ],
      "modifiedOn": "2024-01-10T08:00:00Z"
    },
    {
      "id": 202,
      "name": "Sarah Lee",
      "employeeId": "EMP-202",
      "businessUnitId": 1,
      "active": true,
      "email": "sarah.lee@company.com",
      "phones": [
        { "type": "Mobile", "value": "+14085555678" }
      ],
      "modifiedOn": "2024-02-20T09:00:00Z"
    }
  ]
}
```

---

## Типичные ошибки

### 400 Bad Request
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "The 'jobId' field is required.",
  "traceId": "00-abc123-def456-00"
}
```

### 401 Unauthorized
```json
{
  "type": "https://tools.ietf.org/html/rfc7235#section-3.1",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Bearer token is missing or invalid.",
  "traceId": "00-abc123-def456-00"
}
```

### 404 Not Found
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "Appointment with id '99999' was not found.",
  "traceId": "00-abc123-def456-00"
}
```

### 429 Too Many Requests
```json
{
  "type": "https://tools.ietf.org/html/rfc6585#section-4",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit exceeded. Retry after 60 seconds.",
  "traceId": "00-abc123-def456-00"
}
```

---

## Сводка эндпоинтов для seed

| Метод | Путь | Описание | Default Status |
|---|---|---|---|
| GET | /v2/tenant/:tenantId/appointments | Список записей | 200 |
| GET | /v2/tenant/:tenantId/appointments/:id | Запись по ID | 200 |
| POST | /v2/tenant/:tenantId/appointments | Создать запись | 201 |
| PUT | /v2/tenant/:tenantId/appointments/:id | Обновить запись | 200 |
| GET | /v2/tenant/:tenantId/customers | Список клиентов | 200 |
| GET | /v2/tenant/:tenantId/customers/:id | Клиент по ID | 200 |
| POST | /v2/tenant/:tenantId/customers | Создать клиента | 201 |
| GET | /v2/tenant/:tenantId/jobs | Список работ | 200 |
| GET | /v2/tenant/:tenantId/jobs/:id | Работа по ID | 200 |
| GET | /v2/tenant/:tenantId/technicians | Список техников | 200 |
