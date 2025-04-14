# API Documentation

This document provides detailed information about the S.H.I.E.L.D. Operations Request Portal API endpoints.

## Base URL

```
http://localhost:8000
```

## Authentication

All endpoints except `/auth/login` and `/auth/register` require JWT authentication.

### Headers

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string",
  "full_name": "string"
}

Response 200:
{
  "message": "User registered successfully",
  "user_id": "string"
}

Response 400:
{
  "detail": "Username already exists"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response 200:
{
  "access_token": "string",
  "token_type": "bearer"
}

Response 401:
{
  "detail": "Invalid credentials"
}
```

### Mission Management

#### Submit Mission Request
```http
POST /missions/submit
Content-Type: application/json
Authorization: Bearer <token>

{
  "mission_type": "string",
  "details": {
    "drone_id": "string",
    "operation_area": "string",
    "payload": "string"
  }
}

Response 200:
{
  "message": "Mission request submitted successfully",
  "mission_id": "string"
}

Response 400:
{
  "detail": "Invalid mission details"
}
```

#### Get Mission List
```http
GET /missions?type=string&status=string
Authorization: Bearer <token>

Response 200:
{
  "missions": [
    {
      "id": "string",
      "type": "string",
      "details": {
        "drone_id": "string",
        "operation_area": "string",
        "payload": "string"
      },
      "status": "string",
      "created_at": "string",
      "updated_at": "string"
    }
  ]
}
```

#### Get Mission by ID
```http
GET /missions/{mission_id}
Authorization: Bearer <token>

Response 200:
{
  "id": "string",
  "type": "string",
  "details": {
    "drone_id": "string",
    "operation_area": "string",
    "payload": "string"
  },
  "status": "string",
  "created_at": "string",
  "updated_at": "string"
}

Response 404:
{
  "detail": "Mission not found"
}
```

#### Update Mission
```http
PUT /missions/{mission_type}/{mission_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "details": {
    "drone_id": "string",
    "operation_area": "string",
    "payload": "string"
  }
}

Response 200:
{
  "message": "Mission updated successfully",
  "mission": {
    "id": "string",
    "type": "string",
    "details": {
      "drone_id": "string",
      "operation_area": "string",
      "payload": "string"
    },
    "status": "string",
    "updated_at": "string"
  }
}

Response 404:
{
  "detail": "Mission not found"
}
```

#### Delete Mission
```http
DELETE /missions/{mission_type}/{mission_id}
Authorization: Bearer <token>

Response 200:
{
  "message": "Mission deleted successfully"
}

Response 404:
{
  "detail": "Mission not found"
}
```

### User Management

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>

Response 200:
{
  "username": "string",
  "email": "string",
  "full_name": "string",
  "created_at": "string",
  "last_login": "string"
}
```

#### Update User Profile
```http
PUT /users/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "email": "string",
  "full_name": "string"
}

Response 200:
{
  "message": "Profile updated successfully",
  "user": {
    "username": "string",
    "email": "string",
    "full_name": "string",
    "updated_at": "string"
  }
}
```

#### Toggle 2FA
```http
POST /users/toggle-2fa
Authorization: Bearer <token>

Response 200:
{
  "message": "2FA status updated",
  "enabled": boolean
}
```

### Security Metrics

#### Get Security Metrics
```http
GET /security/metrics
Authorization: Bearer <token>

Response 200:
{
  "total_missions": integer,
  "active_missions": integer,
  "completed_missions": integer,
  "mission_success_rate": float,
  "average_completion_time": string
}
```

## Error Responses

### Common Error Formats

#### Authentication Error
```http
Response 401:
{
  "detail": "Could not validate credentials"
}
```

#### Permission Error
```http
Response 403:
{
  "detail": "Not enough permissions"
}
```

#### Validation Error
```http
Response 422:
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

#### Server Error
```http
Response 500:
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Rate limit headers included in response:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

## Data Models

### Mission
```json
{
  "id": "string",
  "type": "string",
  "details": {
    "drone_id": "string",
    "operation_area": "string",
    "payload": "string"
  },
  "status": "string",
  "created_at": "string",
  "updated_at": "string",
  "submitter": "string"
}
```

### User
```json
{
  "username": "string",
  "email": "string",
  "full_name": "string",
  "created_at": "string",
  "last_login": "string",
  "two_factor_enabled": boolean
}
```

### Security Metrics
```json
{
  "total_missions": "integer",
  "active_missions": "integer",
  "completed_missions": "integer",
  "mission_success_rate": "float",
  "average_completion_time": "string"
}
```

## Websocket Endpoints

### Mission Status Updates
```websocket
WS /ws/missions/{mission_id}

Message Format:
{
  "type": "status_update",
  "data": {
    "mission_id": "string",
    "status": "string",
    "timestamp": "string"
  }
}
```

## API Versioning

Current version: v1
Version header: `Accept: application/json; version=1.0`

## Best Practices

1. Always include the Authorization header for protected endpoints
2. Use appropriate HTTP methods for operations
3. Handle rate limiting appropriately
4. Implement proper error handling
5. Use pagination for list endpoints
6. Include appropriate content-type headers 