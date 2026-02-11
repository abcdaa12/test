/**
 * models/Dorm.js - 宿舍数据模型
 * 存储宿舍基本信息及成员列表
 */
const mongoose = require('mongoose')

const dormSchema = new mongoose.Schema({
    // 宿舍编号（如 "301"）
    dormNo: { type: String, required: true, unique: true },
    // 楼栋
    building: { type: String, required: true },
    // 宿舍成员列表
    members: [{ type: String }],
    // 宿舍长
    leader: { type: String, default: '' },
    // 创建时间
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Dorm', dormSchema)
