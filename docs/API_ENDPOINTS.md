# AgroProcureBD Backend API Endpoints

Base URL locally:

```text
http://localhost:5000/api
```

## Authentication

### Register

```http
POST /api/auth/register
Content-Type: multipart/form-data
```

Fields:

```text
full_name
email
phone
password
role = farmer | buyer | government
district
address
employee_id       required for government
department        required for government
designation       required for government
office_address    optional for government
id_card           required file for government
```

### Verify OTP

```http
POST /api/auth/verify-otp
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Resend OTP

```http
POST /api/auth/resend-otp
```

```json
{
  "email": "user@example.com"
}
```

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "user@example.com",
  "password": "password",
  "role": "farmer"
}
```

## Products

```http
GET /api/products
POST /api/products
GET /api/products/my
```

## Procurement

```http
GET /api/procurements
POST /api/procurements
GET /api/procurements/my
GET /api/procurements/:procurementId/bids
```

## Bids

```http
POST /api/bids
GET /api/bids/my
PATCH /api/bids/:id/accept
```

## Admin

```http
GET /api/admin/stats
GET /api/admin/officer-requests
PATCH /api/admin/officer-requests/:id/approve
PATCH /api/admin/officer-requests/:id/reject
```
