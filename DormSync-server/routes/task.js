/**
 * routes/task.js - 事务管理路由
 * 前缀：/api/task
 * 所有接口需要鉴权
 */
const express = require('express')
const router = express.Router()
const taskController = require('../controllers/taskController')
const { authMiddleware } = require('../middlewares/jwt')

// 创建事务（需要鉴权）
router.post('/create', authMiddleware, taskController.createTask)

// 查看宿舍所有事务（需要鉴权）
router.get('/list', authMiddleware, taskController.getTaskList)

module.exports = router
