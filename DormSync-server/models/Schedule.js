/**
 * models/Schedule.js - 排班数据模型
 * 记录宿舍值日/卫生排班信息
 */
const mongoose = require('mongoose')

const scheduleSchema = new mongoose.Schema({
    // 关联宿舍ID
    dormId: { type: String, required: true },
    // 排班周期标签（如 "06-09 ~ 06-15"）
    weekLabel: { type: String, default: '' },
    // 排班明细
    items: [{
        date: { type: String, required: true },     // 日期 YYYY-MM-DD
        weekday: { type: String, required: true },   // 星期
        person: { type: String, required: true }     // 负责人
    }],
    // 创建时间
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Schedule', scheduleSchema)
