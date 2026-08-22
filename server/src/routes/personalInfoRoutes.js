import express from 'express'
import {getPersonalInfo, updatePersonalInfo, uploadProfilePicture} from '../controllers/personalInfoController.js'
import { requireAuth } from '../controllers/sessionAuth.js'
const router = express.Router()
//public endpoints
router.get('/', getPersonalInfo)
//authenticated endpoints
router.get("/admin", requireAuth, getPersonalInfo)
router.put('/', requireAuth, updatePersonalInfo)
router.put('/profile', requireAuth,uploadProfilePicture)

export default router