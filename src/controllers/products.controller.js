import { z } from 'zod'
import { query } from '../config/db.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { env } from '../config/env.js'

const productSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1).default('kg'),
  price: z.coerce.number().positive(),
  district: z.string().min(2),
  description: z.string().optional()
})

export const getProducts = asyncHandler(async (req, res) => {
  const { search = '', district = '', category = '' } = req.query

  const result = await query(
    `SELECT
       p.*,
       u.full_name AS farmer_name
     FROM products p
     JOIN farmers f ON f.id = p.farmer_id
     JOIN users u ON u.id = f.user_id
     WHERE p.status = 'available'
       AND ($1 = '' OR LOWER(p.name) LIKE LOWER('%' || $1 || '%'))
       AND ($2 = '' OR LOWER(p.district) = LOWER($2))
       AND ($3 = '' OR LOWER(p.category) = LOWER($3))
     ORDER BY p.created_at DESC`,
    [search, district, category]
  )

  res.json({
    success: true,
    products: result.rows
  })
})

export const createProduct = asyncHandler(async (req, res) => {
  const data = productSchema.parse(req.body)

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

  const farmerId = farmerResult.rows[0].id
  const imageUrl = req.file ? `${env.UPLOAD_BASE_URL}/uploads/products/${req.file.filename}` : null

  const result = await query(
    `INSERT INTO products
     (farmer_id, name, category, quantity, unit, price, district, description, image_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'available')
     RETURNING *`,
    [
      farmerId,
      data.name,
      data.category,
      data.quantity,
      data.unit,
      data.price,
      data.district,
      data.description || null,
      imageUrl
    ]
  )

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product: result.rows[0]
  })
})

export const myProducts = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT p.*
     FROM products p
     JOIN farmers f ON f.id = p.farmer_id
     WHERE f.user_id = $1
     ORDER BY p.created_at DESC`,
    [req.user.id]
  )

  res.json({
    success: true,
    products: result.rows
  })
})
