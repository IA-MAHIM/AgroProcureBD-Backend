import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { query } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { createToken } from '../utils/token.js'
import { generateOtp, hashOtp, compareOtp, otpExpiryDate } from '../utils/otp.js'
import { sendOtpEmail } from '../utils/email.js'
import { env } from '../config/env.js'

const registerSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
  role: z.enum(['farmer', 'buyer', 'government']),
  district: z.string().min(2).optional(),
  address: z.string().optional(),
  employee_id: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  office_address: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['farmer', 'buyer', 'government', 'admin'])
})

export const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.parse(req.body)
  const {
    full_name,
    email,
    phone,
    password,
    role,
    district,
    address,
    employee_id,
    department,
    designation,
    office_address
  } = parsed

  if (role === 'government') {
    if (!employee_id || !department || !designation || !district) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, department, designation, and district are required for government officer registration'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Government ID card upload is required'
      })
    }
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
  if (existing.rowCount > 0) {
    return res.status(409).json({
      success: false,
      message: 'Email is already registered'
    })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const userResult = await query(
    `INSERT INTO users (full_name, email, phone, password_hash, role, email_verified, account_status)
     VALUES ($1, $2, $3, $4, $5, false, 'pending_email')
     RETURNING id, full_name, email, phone, role, email_verified, account_status`,
    [full_name, email.toLowerCase(), phone, passwordHash, role]
  )

  const user = userResult.rows[0]

  if (role === 'farmer') {
    await query(
      `INSERT INTO farmers (user_id, district, address, verification_status)
       VALUES ($1, $2, $3, 'pending')`,
      [user.id, district || null, address || null]
    )
  }

  if (role === 'buyer') {
    await query(
      `INSERT INTO buyers (user_id, district, address)
       VALUES ($1, $2, $3)`,
      [user.id, district || null, address || null]
    )
  }

  if (role === 'government') {
    const idCardUrl = `${env.UPLOAD_BASE_URL}/uploads/govt-ids/${req.file.filename}`

    await query(
      `INSERT INTO government_officers
       (user_id, employee_id, department, designation, district, office_address, id_card_url, verification_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
      [user.id, employee_id, department, designation, district, office_address || null, idCardUrl]
    )
  }

  const otp = generateOtp()
  const otpHash = await hashOtp(otp)

  await query(
    `INSERT INTO email_otps (email, otp_hash, expires_at, is_used)
     VALUES ($1, $2, $3, false)`,
    [email.toLowerCase(), otpHash, otpExpiryDate()]
  )

  await sendOtpEmail(email.toLowerCase(), otp)

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email with OTP.',
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      account_status: user.account_status
    }
  })
})

export const verifyOtp = asyncHandler(async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    otp: z.string().length(6)
  })

  const { email, otp } = schema.parse(req.body)

  const otpResult = await query(
    `SELECT id, otp_hash, expires_at, is_used
     FROM email_otps
     WHERE email = $1 AND is_used = false
     ORDER BY created_at DESC
     LIMIT 1`,
    [email.toLowerCase()]
  )

  if (otpResult.rowCount === 0) {
    return res.status(400).json({
      success: false,
      message: 'No active OTP found. Please request a new OTP.'
    })
  }

  const otpRecord = otpResult.rows[0]

  if (new Date(otpRecord.expires_at) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'OTP has expired'
    })
  }

  const matched = await compareOtp(otp, otpRecord.otp_hash)
  if (!matched) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP'
    })
  }

  await query('UPDATE email_otps SET is_used = true WHERE id = $1', [otpRecord.id])

  const userResult = await query(
    'SELECT id, role FROM users WHERE email = $1',
    [email.toLowerCase()]
  )

  if (userResult.rowCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  const user = userResult.rows[0]
  const nextStatus = user.role === 'government' ? 'pending_admin' : 'active'

  await query(
    `UPDATE users
     SET email_verified = true, account_status = $1, updated_at = NOW()
     WHERE email = $2`,
    [nextStatus, email.toLowerCase()]
  )

  res.json({
    success: true,
    message: user.role === 'government'
      ? 'Email verified. Your account is waiting for admin approval.'
      : 'Email verified. Your account is active.'
  })
})

export const resendOtp = asyncHandler(async (req, res) => {
  const schema = z.object({
    email: z.string().email()
  })

  const { email } = schema.parse(req.body)

  const user = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
  if (user.rowCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    })
  }

  await query(
    `UPDATE email_otps
     SET is_used = true
     WHERE email = $1 AND is_used = false`,
    [email.toLowerCase()]
  )

  const otp = generateOtp()
  const otpHash = await hashOtp(otp)

  await query(
    `INSERT INTO email_otps (email, otp_hash, expires_at, is_used)
     VALUES ($1, $2, $3, false)`,
    [email.toLowerCase(), otpHash, otpExpiryDate()]
  )

  await sendOtpEmail(email.toLowerCase(), otp)

  res.json({
    success: true,
    message: 'New OTP sent successfully'
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = loginSchema.parse(req.body)

  const result = await query(
    `SELECT id, full_name, email, phone, password_hash, role, email_verified, account_status
     FROM users
     WHERE email = $1 AND role = $2`,
    [email.toLowerCase(), role]
  )

  if (result.rowCount === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid login credentials'
    })
  }

  const user = result.rows[0]

  const passwordMatched = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatched) {
    return res.status(401).json({
      success: false,
      message: 'Invalid login credentials'
    })
  }

  if (!user.email_verified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email first'
    })
  }

  if (user.account_status !== 'active') {
    return res.status(403).json({
      success: false,
      message: `Account is not active. Current status: ${user.account_status}`
    })
  }

  const token = createToken(user)

  delete user.password_hash

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user
  })
})

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  })
})
