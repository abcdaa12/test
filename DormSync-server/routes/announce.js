const express = require('express')
const router = express.Router()
const announceController = require('../controllers/announceController')
const { authMiddleware } = require('../middlewares/jwt')

router.post('/create', authMiddleware, announceController.createAnnounce)
router.get('/list', authMiddleware, announceController.getAnnounceList)
router.get('/detail', authMiddleware, announceController.getAnnounceDetail)
router.put('/read', authMiddleware, announceController.markRead)
router.delete('/delete', authMiddleware, announceController.deleteAnnounce)

module.exports = router
