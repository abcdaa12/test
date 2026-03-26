/**
 * routes/message.js - 消息相关路由
 * 前缀：/api/message
 * 所有接口需要鉴权，userId 从令牌中自动解析
 */
const express = require('express')
const router = express.Router()
const messageController = require('../controllers/messageController')
const { authMiddleware } = require('../middlewares/jwt')

// 获取用户消息列表（需要鉴权）
router.get('/list', authMiddleware, messageController.getMessageList)
router.get('/unread-count', authMiddleware, messageController.getUnreadCount)
router.put('/update', authMiddleware, messageController.updateMessage)

// 搜索消息（需要鉴权）
router.get('/search', authMiddleware, messageController.searchMessage)

// 删除消息（需要鉴权）
router.delete('/delete', authMiddleware, messageController.deleteMessage)

module.exports = router
