/**
 * routes/todo.js - 待办事项路由
 * 前缀：/api/todo
 */
const express = require('express')
const router = express.Router()
const todoController = require('../controllers/todoController')
const { authMiddleware } = require('../middlewares/jwt')

router.get('/list', authMiddleware, todoController.getTodoList)
router.post('/create', authMiddleware, todoController.createTodo)
router.put('/done', authMiddleware, todoController.doneTodo)
router.delete('/delete', authMiddleware, todoController.deleteTodo)

module.exports = router
