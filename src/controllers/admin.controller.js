import { z } from 'zod'
import { query } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getOfficerRequests = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT
       go.id,
       go.employee_id,
       go.department,
       go.designation,
       go.district,
       go.office_address,
       go.id_card_url,
       go.verification_status,
       go.rejection_reason,
       go.created_at,
       u.id AS user_id,
       u.full_name,
       u.email,
       u.phone,
       u.account_status
     FROM government_officers go
     JOIN users u ON u.id = go.user_id
     WHERE go.verification_status = 'pending'
     ORDER BY go.created_at DESC`
  )

  res.json({
    success: true,
    requests: result.rows
  })
})

export const approveOfficer = asyncHandler(async (req, res) => {
  const { id } = req.params

  const officerResult = await query(
    'SELECT user_id FROM government_officers WHERE id = $1',
    [id]
  )

  if (officerResult.rowCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'Government officer request not found'
    })
  }

  const userId = officerResult.rows[0].user_id

  await query(
    `UPDATE government_officers
     SET verification_status = 'approved',
         reviewed_by = $1,
         reviewed_at = NOW(),
         rejection_reason = NULL
     WHERE id = $2`,
    [req.user.id, id]
  )

  await query(
    `UPDATE users
     SET account_status = 'active',
         updated_at = NOW()
     WHERE id = $1`,
    [userId]
  )

  res.json({
    success: true,
    message: 'Government officer approved successfully'
  })
})

export const rejectOfficer = asyncHandler(async (req, res) => {
  const schema = z.object({
    reason: z.string().min(2)
  })

  const { reason } = schema.parse(req.body)
  const { id } = req.params

  const officerResult = await query(
    'SELECT user_id FROM government_officers WHERE id = $1',
    [id]
  )

  if (officerResult.rowCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'Government officer request not found'
    })
  }

  const userId = officerResult.rows[0].user_id

  await query(
    `UPDATE government_officers
     SET verification_status = 'rejected',
         reviewed_by = $1,
         reviewed_at = NOW(),
         rejection_reason = $2
     WHERE id = $3`,
    [req.user.id, reason, id]
  )

  await query(
    `UPDATE users
     SET account_status = 'rejected',
         updated_at = NOW()
     WHERE id = $1`,
    [userId]
  )

  res.json({
    success: true,
    message: 'Government officer rejected successfully'
  })
})

export const adminStats = asyncHandler(async (req, res) => {
  const users = await query('SELECT role, COUNT(*)::int AS total FROM users GROUP BY role')
  const products = await query('SELECT COUNT(*)::int AS total FROM products')
  const procurements = await query('SELECT COUNT(*)::int AS total FROM procurements')
  const pendingOfficers = await query(
    "SELECT COUNT(*)::int AS total FROM government_officers WHERE verification_status = 'pending'"
  )

  res.json({
    success: true,
    stats: {
      users: users.rows,
      products: products.rows[0].total,
      procurements: procurements.rows[0].total,
      pending_officer_requests: pendingOfficers.rows[0].total
    }
  })
})
