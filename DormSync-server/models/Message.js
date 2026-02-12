/**
 * models/Message.js - 消息模型
 * 记录用户收到的各类通知消息
 */
const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    // 关联用户ID
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // 消息类型：vote-投票 task-事务 finance-财务 system-系统
    type: { type: String, enum: ['vote', 'task', 'finance', 'system'], required: true },
    // 消息内容
    content: { type: String, required: [true, '消息内容不能为空'] },
    // 状态：unread-未读 read-已读
    status: { type: String, enum: ['unread', 'read'], default: 'unread' },
    // 创建时间
    createTime: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Message', messageSchema)
