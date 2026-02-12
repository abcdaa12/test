/**
 * models/Dorm.js - 宿舍模型
 * 存储宿舍基本信息、公告、成员列表
 */
const mongoose = require('mongoose')

const dormSchema = new mongoose.Schema({
    // 宿舍号（如 "5号楼306"）
    dormNumber: { type: String, required: [true, '宿舍号不能为空'], trim: true },
    // 宿舍公告
    notice: { type: String, default: '' },
    // 成员ID数组
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // 创建者ID
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // 创建时间
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Dorm', dormSchema)
