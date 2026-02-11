/**
 * routes/schedule.js - 排班管理路由
 * 前缀：/api/schedule
 */
const express = require('express')
const router = express.Router()
const scheduleController = require('../controllers/scheduleController')

// 查询排班表
router.get('/list', scheduleController.getScheduleList)

// 生成随机排班表
router.post('/generate', scheduleController.generateSchedule)

// 修改排班信息
router.put('/:id', scheduleController.updateSchedule)

module.exports = router
