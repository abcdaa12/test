/**
 * routes/vote.js - 投票管理路由
 * 前缀：/api/vote
 */
const express = require('express')
const router = express.Router()
const voteController = require('../controllers/voteController')

// 查询投票列表
router.get('/list', voteController.getVoteList)

// 新增投票
router.post('/', voteController.addVote)

// 投票表决
router.put('/:id/cast', voteController.castVote)

module.exports = router
