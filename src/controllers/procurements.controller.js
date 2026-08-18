import { z } from 'zod'
import { query } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const procurementSchema = z.object({
  product_name: z.string().min(2),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1).default('kg'),
  max_budget: z.coerce.number().positive(),
  district: z.string().min(2),
  deadline: z.string().min(4),
  description: z.string().optional()
})

export const getProcurements = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT
       pr.*,
       u.full_name AS officer_name,
       go.department
     FROM procurements pr
     JOIN government_officers go ON go.id = pr.officer_id
     JOIN users u ON u.id = go.user_id
     WHERE pr.status IN ('open', 'closed')
     ORDER BY pr.created_at DESC`
  )

  res.json({
    success: true,
    procurements: result.rows
  })
})

export const createProcurement = asyncHandler(async (req, res) => {
  const data = procurementSchema.parse(req.body)

  const officerResult = await query(
    `SELECT go.id
     FROM government_officers go
     JOIN users u ON u.id = go.user_id
     WHERE go.user_id = $1
       AND go.verification_status = 'approved'
       AND u.account_status = 'active'`,
    [req.user.id]
  )

  if (officerResult.rowCount === 0) {
    return res.status(403).json({
      success: false,
      message: 'Only approved government officers can post procurement requests'
    })
  }

  const officerId = officerResult.rows[0].id

  const result = await query(
    `INSERT INTO procurements
     (officer_id, product_name, quantity, unit, max_budget, district, deadline, description, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
     RETURNING *`,
    [
      officerId,
      data.product_name,
      data.quantity,
      data.unit,
      data.max_budget,
      data.district,
      data.deadline,
      data.description || null
    ]
  )

  res.status(201).json({
    success: true,
    message: 'Procurement request created successfully',
    procurement: result.rows[0]
  })
})

export const getMyProcurements = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT pr.*
     FROM procurements pr
     JOIN government_officers go ON go.id = pr.officer_id
     WHERE go.user_id = $1
     ORDER BY pr.created_at DESC`,
    [req.user.id]
  )

  res.json({
    success: true,
    procurements: result.rows
  })
})
