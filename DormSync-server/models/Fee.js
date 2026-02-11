/**
 * models/Fee.js - 费用数据模型
 * 记录宿舍公共费用（电费、水费、日用品等）
 */
const mongoose = require('mongoose')

const feeSchema = new mongoose.Schema({
    // 关联宿舍ID
    dormId: { type: String, required: true },
    // 费用名称（如 "6月电费"）
    title: { type: String, required: true },
    // 金额（元）
    amount: { type: Number, required: true },
    // 付款人
    payer: { type: String, required: true },
    // 人均金额
    perPerson: { type: Number, default: 0 },
    // 备注
    remark: { type: String, default: '' },
    // 付款状态：pending-待付款 paid-已付款
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    // 创建时间
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Fee', feeSchema)
