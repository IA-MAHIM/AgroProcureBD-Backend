import { Router } from 'express'
import {
  getOfficerRequests,
  approveOfficer,
  rejectOfficer,
  adminStats
} from '../controllers/admin.controller.js'
import { auth } from '../middleware/auth.js'
import { allowRoles, requireActiveAccount } from '../middleware/role.js'

const router = Router()

router.use(auth, allowRoles('admin'), requireActiveAccount)

router.get('/stats', adminStats)
router.get('/officer-requests', getOfficerRequests)
router.patch('/officer-requests/:id/approve', approveOfficer)
router.patch('/officer-requests/:id/reject', rejectOfficer)

export default router
