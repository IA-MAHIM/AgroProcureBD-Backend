import { Router } from 'express'

import authRoutes from './auth.routes.js'
import adminRoutes from './admin.routes.js'
import productRoutes from './products.routes.js'
import procurementRoutes from './procurements.routes.js'
import bidRoutes from './bids.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
router.use('/products', productRoutes)
router.use('/procurements', procurementRoutes)
router.use('/bids', bidRoutes)

export default router
