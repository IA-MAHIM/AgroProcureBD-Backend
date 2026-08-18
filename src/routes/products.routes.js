import { Router } from 'express'
import { getProducts, createProduct, myProducts } from '../controllers/products.controller.js'
import { auth } from '../middleware/auth.js'
import { allowRoles, requireActiveAccount } from '../middleware/role.js'
import { productImageUpload } from '../middleware/upload.js'

const router = Router()

router.get('/', getProducts)

router.get('/my', auth, allowRoles('farmer'), requireActiveAccount, myProducts)
router.post('/', auth, allowRoles('farmer'), requireActiveAccount, productImageUpload.single('image'), createProduct)

export default router
