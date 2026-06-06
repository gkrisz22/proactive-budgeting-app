# Proactive Budgeting — API Documentation

Base URL: `http://localhost:8000/api/v1`  
Interactive docs: `http://localhost:8000/api/v1/docs`

All endpoints except `/auth/register`, `/auth/login`, `/auth/refresh`, and `/health` require authentication.

Authentication is accepted in two ways (cookie auth is preferred for browser clients):

**Cookie (set automatically on login/refresh)**
```
Cookie: access_token=<jwt>
```

**Bearer token (for API clients)**
```
Authorization: Bearer <access_token>
```

---

## Authentication — `/auth`

### POST /auth/register
Create a new user account.

**Request body**
```json
{
  "email": "user@example.com",
  "password": "s3cr3t",
  "display_name": "Alice"    
}
```
`display_name` is optional. `password` must be between 8 and 72 bytes.

**Responses**

| Status | Meaning |
|--------|----------|
| 201 | User created. Returns `UserResponse`. |
| 422 | Email already registered or validation error. |

**UserResponse**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "Alice",
  "created_at": "2026-04-23T10:00:00Z"
}
```

---

### POST /auth/login
Authenticate and receive tokens.

**Request body**
```json
{ "email": "user@example.com", "password": "s3cr3t" }
```

**Responses**

| Status | Meaning |
|--------|---------|
| 200 | Authenticated. Returns `TokenResponse` and sets HttpOnly cookies. |
| 401 | Invalid credentials. |

**TokenResponse**
```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "bearer"
}
```

Also sets two **HttpOnly** cookies:
- `access_token` — expires in **30 minutes**
- `refresh_token` — expires in **7 days**; a SHA-256 hash is stored in the database

Browser clients should rely on cookies. API clients can use the tokens from the response body.

---

### POST /auth/refresh
Issue new tokens using a valid refresh token. The old token is immediately invalidated (rotation).

**Request body** (optional — omit if sending the `refresh_token` cookie)
```json
{ "refresh_token": "<jwt>" }
```

The refresh token is read from the request body if provided, otherwise from the `refresh_token` cookie.

**Responses**

| Status | Meaning |
|--------|---------|
| 200 | New `TokenResponse` with rotated tokens + updated cookies. |
| 401 | Invalid, expired, or already-rotated refresh token. |

---

### POST /auth/logout
Invalidate the current session.

No request body required. The refresh token is read from the `refresh_token` cookie (or `Authorization` header).

**Responses**

| Status | Meaning |
|--------|---------|
| 204 | Logged out. Cookies cleared, refresh token removed from database. |
| 401 | Not authenticated. |

---

### GET /auth/me
Return the currently authenticated user's profile.

**Responses**

| Status | Meaning |
|--------|---------|
| 200 | Returns `UserResponse`. |
| 401 | Not authenticated. |

---

### PATCH /auth/me
Update the currently authenticated user's profile.

**Request body** (all fields optional)
```json
{ "display_name": "Alice" }
```

**Responses**

| Status | Meaning |
|--------|---------|
| 200 | Updated `UserResponse`. |
| 401 | Not authenticated. |

---

## Budget Rules — `/rules`

Each rule defines a named budget category with a percentage of monthly income.  
All rules for a user must sum to exactly **100 %** after every create or update operation.

### GET /rules
List all budget rules for the authenticated user.

**Response** `200` — array of `BudgetRuleResponse`

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "label": "Needs",
    "percentage": 50.0,
    "monthly_income": 400000.0,
    "currency": "HUF",
    "created_at": "2026-04-23T10:00:00Z"
  }
]
```

---

### POST /rules
Create a new budget rule.

**Request body**
```json
{ "label": "Needs", "percentage": 50.0, "monthly_income": 400000, "currency": "HUF" }
```

**Responses**

| Status | Meaning |
|--------|---------|
| 201 | Rule created. Returns `BudgetRuleResponse`. |
| 422 | Validation error or percentages do not sum to 100. |

---

### PUT /rules/{rule_id}
Update an existing rule. Only provide fields you want to change.

**Request body** (all fields optional)
```json
{ "label": "Savings", "percentage": 20.0 }
```

**Responses**

| Status | Meaning |
|--------|---------|
| 200 | Updated `BudgetRuleResponse`. |
| 404 | Rule not found. |
| 422 | Percentages do not sum to 100 after update. |

---

### DELETE /rules/{rule_id}
Delete a budget rule.

**Responses**

| Status | Meaning |
|--------|---------|
| 204 | Deleted. |
| 404 | Rule not found. |

> **Note:** Deletion does not validate the remaining sum, allowing intermediate edit states.

---

## Categories — `/categories`

Categories are used to tag transactions and savings goals.  
They appear in the budget rule setup screen and the transaction entry screen.

### GET /categories
List all categories for the authenticated user.

**Response** `200` — array of `CategoryResponse`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Food",
    "icon": "🍔",
    "is_savings_goal": false,
    "monthly_target": null,
    "created_at": "2026-04-23T10:00:00Z"
  }
]
```

---

### POST /categories
Create a category.

**Request body**
```json
{ "name": "Vacation Fund", "icon": "✈️", "is_savings_goal": true, "monthly_target": 50000 }
```

**Response** `201` — `CategoryResponse`

---

### PUT /categories/{category_id}
Update a category (partial update supported).

**Response** `200` — updated `CategoryResponse`

---

### DELETE /categories/{category_id}
Delete a category. Transactions linked to this category will have `category_id` set to `null`.

**Response** `204`

---

## Transactions — `/transactions`

### GET /transactions
Paginated list of transactions, with optional filters.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int (≥1, default 1) | Page number |
| `page_size` | int (1–100, default 20) | Items per page |
| `category_id` | string (optional) | Filter by category |
| `date_from` | date (optional) | Filter from date (inclusive) `YYYY-MM-DD` |
| `date_to` | date (optional) | Filter to date (inclusive) `YYYY-MM-DD` |

**Response** `200`
```json
{
  "items": [ { "id": "uuid", "amount": 3500, "currency": "HUF", "description": "Lunch", "category_id": "uuid", "transaction_date": "2026-04-23", "user_id": "uuid", "created_at": "..." } ],
  "total": 42,
  "page": 1,
  "page_size": 20,
  "pages": 3
}
```

---

### POST /transactions
Record a new transaction.

**Request body**
```json
{ "amount": 3500, "currency": "HUF", "description": "Lunch", "category_id": "uuid", "transaction_date": "2026-04-23" }
```

`transaction_date` defaults to today if omitted.

**Response** `201` — `TransactionResponse`

---

### DELETE /transactions/{transaction_id}
Delete a transaction.

**Response** `204`

---

## Alerts — `/alerts`

Alerts are generated automatically by background jobs:
- **PACE_ELEVATED** — daily spend rate exceeds budget rate by >5 %
- **BREACH_PREDICTED** — projected month-end spend will exceed budget
- **EVENT_REMINDER** — an event is 14–28 days away

### GET /alerts
List all alerts for the authenticated user, newest first.

**Response** `200` — array of `AlertResponse`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "alert_type": "BREACH_PREDICTED",
    "message": "'Food' is projected to exceed budget by month end. Projected: 85000, Budget: 70000.",
    "is_read": false,
    "created_at": "2026-04-23T06:00:00Z"
  }
]
```

---

### PUT /alerts/{alert_id}/read
Mark an alert as read.

**Response** `200` — updated `AlertResponse`

---

## Events — `/events`

Upcoming named events with an estimated cost, used in safe-to-spend and alert calculations.

### GET /events
List all events for the user, sorted by date ascending.

**Response** `200` — array of `EventResponse`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Birthday party",
    "estimated_cost": 25000,
    "event_date": "2026-05-10",
    "category_id": "uuid",
    "created_at": "2026-04-23T10:00:00Z"
  }
]
```

---

### POST /events
Create a new event. `event_date` must be in the future.

**Request body**
```json
{ "name": "Birthday party", "estimated_cost": 25000, "event_date": "2026-05-10", "category_id": "uuid" }
```

**Responses**

| Status | Meaning |
|--------|---------|
| 201 | Event created. Returns `EventResponse`. |
| 422 | `event_date` is today or in the past, or cost ≤ 0. |

---

### PUT /events/{event_id}
Update an event (partial update supported).

**Response** `200` — updated `EventResponse`

---

### DELETE /events/{event_id}
Delete an event.

**Response** `204`

---

## Goals — `/goals`

Savings-goal progress for the current calendar month.

### GET /goals/progress
Returns progress for every category where `is_savings_goal = true` and `monthly_target` is set.

**Response** `200`
```json
{
  "goals": [
    {
      "category_id": "uuid",
      "category_name": "Vacation Fund",
      "monthly_target": 50000,
      "contributed": 25000,
      "progress_percentage": 50.0
    }
  ]
}
```

`contributed` is the sum of all transactions assigned to that category in the current calendar month.  
`progress_percentage` is capped at 100.

---

## Dashboard — `/dashboard`

### GET /dashboard/safe-to-spend
Calculate the safe-to-spend amount per day for the remainder of the month.

**Formula:**
```
safe_to_spend = (remaining_budget − upcoming_event_costs_this_month) ÷ remaining_days
```

Where:
- `remaining_budget` = sum over all non-savings categories of `max(0, category_budget − spent_this_month)`
- `upcoming_event_costs` = sum of `estimated_cost` for events with `event_date` between today and month-end
- `remaining_days` = calendar days left in the month including today (minimum 1)

**Response** `200`
```json
{
  "amount": 8500.50,
  "currency": "HUF",
  "remaining_days": 7,
  "remaining_budget": 59503.50,
  "upcoming_costs": 0.0
}
```

**Boundary cases:**

| Scenario | Behaviour |
|----------|-----------|
| No budget rules configured | Returns `amount: 0` |
| Month start, no spend | Full monthly budget ÷ days in month |
| Last day of month | `remaining_days = 1` |
| All budget spent | `amount ≤ 0` |
| Upcoming events exceed remaining budget | `amount` may be negative |

---

## Background Jobs

| Job | Trigger | Effect |
|-----|---------|--------|
| Pace alert check | Every 6 hours | Creates `BREACH_PREDICTED` or `PACE_ELEVATED` alerts; max 1 per category per type per day |
| Event reminder | Daily at 08:00 UTC | Creates `EVENT_REMINDER` alerts for events 14–28 days away; not re-sent if already issued |

---

## Common Error Responses

```json
{ "detail": "Could not validate credentials" }   // 401
{ "detail": "Rule not found" }                    // 404
{ "detail": "Email already registered" }          // 422
{ "detail": "Rule percentages must sum to 100. Current sum: 90.0" }  // 422
```

---

## Running the application

```bash
# Apply migrations
alembic upgrade head

# Start server (development)
uvicorn app.main:app --reload --port 8000

# Run tests
pytest tests/
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:Password1@db:5432/proactive_budgeting` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | `change-me-in-production-...` | **Change this in production** |
