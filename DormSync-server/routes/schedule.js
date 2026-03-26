const express = require('express')
const router = express.Router()
const scheduleController = require('../controllers/scheduleController')
const { authMiddleware } = require('../middlewares/jwt')

router.post('/create', authMiddleware, scheduleController.createSchedule)
router.get('/current', authMiddleware, scheduleController.getCurrentSchedule)
router.get('/history', authMiddleware, scheduleController.getScheduleHistory)

module.exports = router
