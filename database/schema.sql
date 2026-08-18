DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS procurements CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS government_officers CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS buyers CASCADE;
DROP TABLE IF EXISTS email_otps CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('farmer', 'buyer', 'government', 'admin')),
  email_verified BOOLEAN NOT NULL DEFAULT false,
  account_status VARCHAR(40) NOT NULL DEFAULT 'pending_email'
    CHECK (account_status IN ('pending_email', 'pending_admin', 'active', 'rejected', 'blocked')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE email_otps (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE buyers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  district VARCHAR(80),
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE farmers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  district VARCHAR(80),
  address TEXT,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE government_officers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(80) NOT NULL,
  department VARCHAR(150) NOT NULL,
  designation VARCHAR(150) NOT NULL,
  district VARCHAR(80) NOT NULL,
  office_address TEXT,
  id_card_url TEXT NOT NULL,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by BIGINT REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  farmer_id BIGINT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity >= 0),
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  district VARCHAR(80) NOT NULL,
  description TEXT,
  image_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'hidden', 'sold_out')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE procurements (
  id BIGSERIAL PRIMARY KEY,
  officer_id BIGINT NOT NULL REFERENCES government_officers(id) ON DELETE CASCADE,
  product_name VARCHAR(120) NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL DEFAULT 'kg',
  max_budget NUMERIC(14, 2) NOT NULL CHECK (max_budget > 0),
  district VARCHAR(80) NOT NULL,
  deadline DATE NOT NULL,
  description TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'awarded', 'cancelled', 'completed')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bids (
  id BIGSERIAL PRIMARY KEY,
  procurement_id BIGINT NOT NULL REFERENCES procurements(id) ON DELETE CASCADE,
  farmer_id BIGINT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  offered_price NUMERIC(12, 2) NOT NULL CHECK (offered_price > 0),
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  delivery_date DATE NOT NULL,
  note TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (procurement_id, farmer_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_district ON products(district);
CREATE INDEX idx_procurements_status ON procurements(status);
CREATE INDEX idx_bids_procurement_id ON bids(procurement_id);
