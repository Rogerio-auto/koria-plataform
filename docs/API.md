# KorIA Platform — API Documentation

## Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://api.koriastudio.com/api/v1
```

## Authentication

- **Type:** Bearer JWT Token
- **Header:** `Authorization: Bearer <token>`
- **Public endpoints:** Briefing submit, Upload portal (token-based), Health check
- **Protected endpoints:** Dashboard, Analytics, Leads CRUD

## Endpoints Overview

### Health
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Login with email/password |
| POST | `/auth/refresh` | Yes | Refresh JWT token |
| GET | `/auth/me` | Yes | Get current user info |

### Leads
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/leads` | Yes | List leads (paginated, filterable) |
| GET | `/leads/:id` | Yes | Get lead by ID |
| PATCH | `/leads/:id` | Yes | Update lead |
| GET | `/leads/:id/qualification` | Yes | Get lead qualification data |

### Briefing
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/briefing/:leadId` | No | Get briefing form config |
| POST | `/briefing/submit` | No | Submit briefing form |
| POST | `/briefing/upload-logo` | No | Upload logo file |

### Uploads
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/uploads/validate/:token` | No | Validate upload token & get work order info |
| POST | `/uploads/files` | No | Upload files (multipart) |
| GET | `/uploads/work-order/:id/assets` | Yes | List assets of a work order |

### Analytics
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/analytics/overview` | Yes | Dashboard overview metrics |
| GET | `/analytics/funnel` | Yes | Lead funnel data |
| GET | `/analytics/revenue` | Yes | Revenue metrics |
| GET | `/analytics/ai-costs` | Yes | AI execution costs |
| GET | `/analytics/errors` | Yes | System errors summary |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | Yes | List products with prices |
| GET | `/products/:id` | Yes | Get product details |

### Work Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/work-orders` | Yes | List work orders (paginated) |
| GET | `/work-orders/:id` | Yes | Get work order details |
| PATCH | `/work-orders/:id` | Yes | Update work order |
| GET | `/work-orders/:id/assets` | Yes | List work order assets |

### Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/payments` | Yes | List payment intents |
| GET | `/payments/:id` | Yes | Get payment details |
| POST | `/payments/webhooks/stripe` | No* | Stripe webhook handler |
| POST | `/payments/webhooks/wise` | No* | Wise webhook handler |

> *Webhook endpoints validate signatures instead of JWT

## Error Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Pagination

Query parameters for paginated endpoints:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort order (asc/desc) |

Response format:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

> Full OpenAPI/Swagger documentation will be available at `/api/v1/docs` when the API is running.
