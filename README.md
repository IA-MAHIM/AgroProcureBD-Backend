# AgroProcureBD Backend

Professional Node.js + Express + PostgreSQL backend for AgroProcureBD.

## Features included

- Registration for Farmer, Buyer, and Government Officer
- Government Officer ID card upload
- Email OTP generation and verification
- Password hashing
- JWT login
- Role-based access
- Admin approval for Government Officer
- Product APIs for Farmer
- Procurement APIs for Government Officer
- Bid APIs for Farmer
- PostgreSQL schema
- Default admin seed

## Technology

- Node.js
- Express.js
- PostgreSQL
- Neon database ready
- Brevo email OTP ready
- JWT authentication
- Multer file upload

## Setup

### 1. Install packages

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env`.

```bash
cp .env.example .env
```

Then update:

```text
DATABASE_URL
JWT_SECRET
BREVO_API_KEY
EMAIL_FROM
CLIENT_URL
UPLOAD_BASE_URL
```

### 3. Create database tables

After adding `DATABASE_URL`:

```bash
npm run db:schema
npm run db:seed
```

### 4. Start server

```bash
npm run dev
```

Server will run at:

```text
http://localhost:5000
```

## Default Admin

```text
Email: admin@agroprocurebd.com
Password: Admin12345
Role: admin
```

Change this password after first login in a real project.

## Important professional rule

Do not put database password, JWT secret, or Brevo API key inside React frontend.

Only the backend should connect with database and email service.
