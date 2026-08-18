import dotenv from 'dotenv'

dotenv.config()

function required(name, fallback = null) {
  const value = process.env[name] || fallback
  if (value === null || value === undefined || value === '') {
    throw new Error(`${name} is required in environment variables`)
  }
  return value
}

export const env = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  OTP_EXPIRES_MINUTES: Number(process.env.OTP_EXPIRES_MINUTES || 5),
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@agroprocurebd.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'AgroProcureBD',
  UPLOAD_BASE_URL: process.env.UPLOAD_BASE_URL || `http://localhost:${process.env.PORT || 5000}`
}
