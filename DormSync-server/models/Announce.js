/**
 * models/Announce.js - 公告模型
 */
const mongoose = require('mongoose')

const announceSchema = new mongoose.Schema({
    dormId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dorm', required: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // 已读用户列表
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Announce', announceSchema)
