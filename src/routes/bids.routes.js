import { Router } from 'express'
import { submitBid, getMyBids, acceptBid } from '../controllers/bids.controller.js'
import { auth } from '../middleware/auth.js'
import { allowRoles, requireActiveAccount } from '../middleware/role.js'

const router = Router()

router.post('/', auth, allowRoles('farmer'), requireActiveAccount, submitBid)
router.get('/my', auth, allowRoles('farmer'), requireActiveAccount, getMyBids)
router.patch('/:id/accept', auth, allowRoles('government'), requireActiveAccount, acceptBid)

export default router
