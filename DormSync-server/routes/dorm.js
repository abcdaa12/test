/**
 * routes/dorm.js - 宿舍相关路由
 * 前缀：/api/dorm
 * 所有接口需要鉴权
 */
const express = require('express')
const router = express.Router()
const dormController = require('../controllers/dormController')
const { authMiddleware } = require('../middlewares/jwt')

// 获取宿舍信息（需要鉴权）
router.get('/info', authMiddleware, dormController.getDormInfo)

// 查看宿舍成员（需要鉴权）
router.get('/members', authMiddleware, dormController.getDormMembers)

// 宿舍长选举（需要鉴权）
router.post('/elect', authMiddleware, dormController.electLeader)

// 离开宿舍（需要鉴权）
router.post('/leave', authMiddleware, dormController.leaveDorm)

// 邀请新成员（需要鉴权）
router.post('/invite', authMiddleware, dormController.inviteMember)

module.exports = router
