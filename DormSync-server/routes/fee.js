/**
 * routes/fee.js - 费用管理路由
 * 前缀：/api/fee
 */
const express = require('express')
const router = express.Router()
const feeController = require('../controllers/feeController')

// 查询费用列表
router.get('/list', feeController.getFeeList)

// 新增费用
router.post('/', feeController.addFee)

// 修改付款状态
router.put('/:id/status', feeController.updateFeeStatus)

module.exports = router
