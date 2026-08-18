import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { query } from '../config/db.js'

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required'
      })
    }

    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, env.JWT_SECRET)

    const result = await query(
      `SELECT id, full_name, email, phone, role, email_verified, account_status
       FROM users
       WHERE id = $1`,
      [decoded.id]
    )

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token user'
      })
    }

    req.user = result.rows[0]
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    })
  }
}
