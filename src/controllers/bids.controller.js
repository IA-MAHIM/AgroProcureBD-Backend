import { z } from 'zod'
import { query } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const bidSchema = z.object({
  procurement_id: z.coerce.number().int().positive(),
  offered_price: z.coerce.number().positive(),
  quantity: z.coerce.number().positive(),
  delivery_date: z.string().min(4),
  note: z.string().optional()
})

export const submitBid = asyncHandler(async (req, res) => {
  const data = bidSchema.parse(req.body)

  const farmerResult = await query(
    'SELECT id FROM farmers WHERE user_id = $1',
    [req.user.id]
  )

  if (farmerResult.rowCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'Farmer profile not found'
    })
  }

  const procurement = await query(
    "SELECT id FROM procurements WHERE id = $1 AND status = 'open'",
    [data.procurement_id]
  )

  if (procurement.rowCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'Open procurement request not found'
    })
  }

  const result = await query(
    `INSERT INTO bids
     (procurement_id, farmer_id, offered_price, quantity, delivery_date, note, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'submitted')
     RETURNING *`,
    [
      data.procurement_id,
      farmerResult.rows[0].id,
      data.offered_price,
      data.quantity,
      data.delivery_date,
      data.note || null
    ]
  )

  res.status(201).json({
    success: true,
    message: 'Bid submitted successfully',
    bid: result.rows[0]
  })
})

export const getMyBids = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT b.*, pr.product_name, pr.district
     FROM bids b
     JOIN farmers f ON f.id = b.farmer_id
     JOIN procurements pr ON pr.id = b.procurement_id
     WHERE f.user_id = $1
     ORDER BY b.created_at DESC`,
    [req.user.id]
  )

  res.json({
    success: true,
    bids: result.rows
  })
})

export const getProcurementBids = asyncHandler(async (req, res) => {
  const { procurementId } = req.params

  const ownerCheck = await query(
    `SELECT pr.id
     FROM procurements pr
     JOIN government_officers go ON go.id = pr.officer_id
     WHERE pr.id = $1 AND go.user_id = $2`,
    [procurementId, req.user.id]
  )

  if (ownerCheck.rowCount === 0) {
    return res.status(403).json({
      success: false,
      message: 'You can view bids only for your own procurement request'
    })
  }

  const result = await query(
    `SELECT
       b.*,
       u.full_name AS farmer_name,
       f.district AS farmer_district
     FROM bids b
     JOIN farmers f ON f.id = b.farmer_id
     JOIN users u ON u.id = f.user_id
     WHERE b.procurement_id = $1
     ORDER BY b.offered_price ASC, b.delivery_date ASC`,
    [procurementId]
  )

  res.json({
    success: true,
    bids: result.rows
  })
})

export const acceptBid = asyncHandler(async (req, res) => {
  const { id } = req.params

  const bidResult = await query(
    `SELECT b.id, b.procurement_id
     FROM bids b
     JOIN procurements pr ON pr.id = b.procurement_id
     JOIN government_officers go ON go.id = pr.officer_id
     WHERE b.id = $1 AND go.user_id = $2`,
    [id, req.user.id]
  )

  if (bidResult.rowCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'Bid not found for your procurement request'
    })
  }

  const procurementId = bidResult.rows[0].procurement_id

  await query(
    "UPDATE bids SET status = 'rejected' WHERE procurement_id = $1 AND id <> $2",
    [procurementId, id]
  )

  await query(
    "UPDATE bids SET status = 'accepted' WHERE id = $1",
    [id]
  )

  await query(
    "UPDATE procurements SET status = 'awarded' WHERE id = $1",
    [procurementId]
  )

  res.json({
    success: true,
    message: 'Bid accepted successfully'
  })
})
