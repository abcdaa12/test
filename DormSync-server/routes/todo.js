/**
 * routes/todo.js - 待办事项路由
 * 前缀：/api/todo
 * 所有接口需要鉴权，userId 从令牌中自动解析
 */
const express = require('express')
const router = express.Router()
const todoController = require('../controllers/todoController')
const { authMiddleware } = require('../middlewares/jwt')

// 获取用户待办列表（需要鉴权）
router.get('/list', authMiddleware, todoController.getTodoList)

module.exports = router
