/**
 * models/Finance.js - 财务模型
 * 记录宿舍内的收款/分摊信息
 */
const mongoose = require('mongoose')

const financeSchema = new mongoose.Schema({
    // 关联宿舍ID
    dormId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dorm', required: true },
    // 收款标题
    title: { type: String, required: [true, '收款标题不能为空'] },
    // 金额（元）
    amount: { type: Number, required: [true, '金额不能为空'] },
    // 创建者/发起人ID
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // 付款人ID数组
    payeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // 状态：unpaid-未收款 paid-已收款
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    // 创建时间
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Finance', financeSchema)
