/**
 * routes/finance.js - 财务管理路由
 * 前缀：/api/finance
 * 所有接口需要鉴权
 */
const express = require('express')
const router = express.Router()
const financeController = require('../controllers/financeController')
const { authMiddleware } = require('../middlewares/jwt')

// 发起收款（需要鉴权）
router.post('/create', authMiddleware, financeController.createFinance)
router.get('/list', authMiddleware, financeController.getFinanceList)
router.delete('/delete', authMiddleware, financeController.deleteFinance)

module.exports = router
