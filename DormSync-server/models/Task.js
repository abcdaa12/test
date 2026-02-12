/**
 * models/Task.js - 事务模型
 * 记录宿舍内的事务安排（值日、采购等）
 */
const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    // 关联宿舍ID
    dormId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dorm', required: true },
    // 事务标题
    title: { type: String, required: [true, '事务标题不能为空'] },
    // 事务内容/描述
    content: { type: String, default: '' },
    // 执行人ID
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // 截止时间
    deadline: { type: Date, default: null },
    // 状态：undone-未完成 done-已完成
    status: { type: String, enum: ['undone', 'done'], default: 'undone' },
    // 创建时间
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Task', taskSchema)
