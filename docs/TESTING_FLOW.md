# Testing Flow

## 1. Register Buyer

POST `/api/auth/register`

Body as form-data:

```text
full_name = Test Buyer
email = buyer@example.com
phone = 01700000000
password = Buyer12345
role = buyer
district = Dhaka
address = Uttara
```

## 2. Verify OTP

If Brevo is not set, check backend terminal. OTP will be printed there.

POST `/api/auth/verify-otp`

```json
{
  "email": "buyer@example.com",
  "otp": "123456"
}
```

## 3. Login Buyer

POST `/api/auth/login`

```json
{
  "email": "buyer@example.com",
  "password": "Buyer12345",
  "role": "buyer"
}
```

## 4. Register Government Officer

Use form-data and upload `id_card` file.

After OTP verification, account status will be `pending_admin`.

## 5. Admin Approves Government Officer

Login as admin and call:

```http
PATCH /api/admin/officer-requests/:id/approve
```

## 6. Farmer Adds Product

Register and verify farmer first. Then login as farmer and call:

```http
POST /api/products
```

## 7. Government Officer Posts Procurement

After approval, login as government officer and call:

```http
POST /api/procurements
```

## 8. Farmer Submits Bid

Login as farmer and call:

```http
POST /api/bids
```
