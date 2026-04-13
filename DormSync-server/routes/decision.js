/**
 * routes/decision.js - 决策/投票路由
 * 前缀：/api/decision
 * 所有接口需要鉴权
 */
const express = require('express')
const router = express.Router()
const decisionController = require('../controllers/decisionController')
const { authMiddleware } = require('../middlewares/jwt')

// 发起决策（需要鉴权）
router.post('/create', authMiddleware, decisionController.createDecision)

// 投票（需要鉴权）
router.post('/vote', authMiddleware, decisionController.castVote)

// 查看宿舍所有决策（需要鉴权）
router.get('/list', authMiddleware, decisionController.getDecisionList)

// 删除决策（需要鉴权）
router.delete('/delete', authMiddleware, decisionController.deleteDecision)

// 编辑决策（需要鉴权）
router.put('/update', authMiddleware, decisionController.updateDecision)

module.exports = router
