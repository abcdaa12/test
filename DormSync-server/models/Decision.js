/**
 * models/Decision.js - 决策/投票模型
 * 记录宿舍内发起的投票决策
 */
const mongoose = require('mongoose')

const decisionSchema = new mongoose.Schema({
    // 关联宿舍ID
    dormId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dorm', required: true },
    // 决策标题
    title: { type: String, required: [true, '决策标题不能为空'] },
    // 选项数组，每个选项包含 label（选项文本）和 count（票数）
    options: [{
        label: { type: String, required: true },
        count: { type: Number, default: 0 }
    }],
    // 已投票用户记录（防止重复投票）
    voters: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        optionIndex: { type: Number }
    }],
    // 截止时间
    deadline: { type: Date, required: [true, '截止时间不能为空'] },
    // 创建者ID
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // 状态：active-进行中 ended-已结束
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
    // 是否匿名投票
    anonymous: { type: Boolean, default: false },
    // 创建时间
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Decision', decisionSchema)
