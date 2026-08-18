import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function hashOtp(otp) {
  return bcrypt.hash(otp, 10)
}

export async function compareOtp(otp, hash) {
  return bcrypt.compare(otp, hash)
}

export function otpExpiryDate() {
  return new Date(Date.now() + env.OTP_EXPIRES_MINUTES * 60 * 1000)
}
