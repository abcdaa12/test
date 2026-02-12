/**
 * models/Todo.js - 待办事项模型
 * 记录用户的待办事项（投票/事务/财务类型）
 */
const mongoose = require('mongoose')

const todoSchema = new mongoose.Schema({
    // 关联用户ID
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // 待办类型：vote-投票 task-事务 finance-财务
    type: { type: String, enum: ['vote', 'task', 'finance'], required: true },
    // 关联记录ID（对应投票/事务/财务的具体记录，用于跳转）
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    // 待办内容
    content: { type: String, required: [true, '待办内容不能为空'] },
    // 状态：undone-未完成 done-已完成
    status: { type: String, enum: ['undone', 'done'], default: 'undone' },
    // 创建时间
    createTime: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Todo', todoSchema)
