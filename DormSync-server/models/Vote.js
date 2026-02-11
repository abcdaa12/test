/**
 * models/Vote.js - 投票数据模型
 * 支持多选项投票，记录每个选项的票数
 */
const mongoose = require('mongoose')

const voteSchema = new mongoose.Schema({
    // 关联宿舍ID
    dormId: { type: String, required: true },
    // 投票主题
    title: { type: String, required: true },
    // 投票选项列表
    options: [{
        label: { type: String, required: true },
        count: { type: Number, default: 0 }
    }],
    // 投票状态：active-进行中 ended-已结束
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    // 发起人
    creator: { type: String, default: '' },
    // 创建时间
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Vote', voteSchema)
