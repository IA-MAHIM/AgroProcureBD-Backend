import { Router } from 'express'
import { register, verifyOtp, resendOtp, login, me } from '../controllers/auth.controller.js'
import { auth } from '../middleware/auth.js'
import { govtIdUpload } from '../middleware/upload.js'

const router = Router()

router.post('/register', govtIdUpload.single('id_card'), register)
router.post('/verify-otp', verifyOtp)
router.post('/resend-otp', resendOtp)
router.post('/login', login)
router.get('/me', auth, me)

export default router
