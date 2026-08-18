-- Default admin account
-- Email: admin@agroprocurebd.com
-- Password: Admin12345

INSERT INTO users
(full_name, email, phone, password_hash, role, email_verified, account_status)
VALUES
(
  'System Admin',
  'admin@agroprocurebd.com',
  '01000000000',
  '$2a$12$IWHeVOtyn41lDXl96xvZLOIWsEv.8XzuJBLOM2wBevjdiQD6jiUbe',
  'admin',
  true,
  'active'
)
ON CONFLICT (email) DO NOTHING;
