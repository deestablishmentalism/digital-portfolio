import express from 'express'
import {getPersonalInfo, updatePersonalInfo, uploadProfilePicture} from '../controllers/personalInfoController.js'

const router = express.Router()

router.get('/', getPersonalInfo)
router.put('/', updatePersonalInfo)
router.put('/profile', uploadProfilePicture)

export default router