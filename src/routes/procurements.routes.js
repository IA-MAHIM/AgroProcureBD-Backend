import { Router } from 'express'
import {
  getProcurements,
  createProcurement,
  getMyProcurements
} from '../controllers/procurements.controller.js'
import { getProcurementBids } from '../controllers/bids.controller.js'
import { auth } from '../middleware/auth.js'
import { allowRoles, requireActiveAccount } from '../middleware/role.js'

const router = Router()

router.get('/', getProcurements)
router.get('/my', auth, allowRoles('government'), requireActiveAccount, getMyProcurements)
router.post('/', auth, allowRoles('government'), requireActiveAccount, createProcurement)
router.get('/:procurementId/bids', auth, allowRoles('government'), requireActiveAccount, getProcurementBids)

export default router
