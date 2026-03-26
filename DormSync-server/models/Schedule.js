/**
 * models/Schedule.js - 排班模型
 * 记录宿舍值日排班信息
 */
const mongoose = require('mongoose')

const scheduleSchema = new mongoose.Schema({
    dormId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dorm', required: true },
    weekLabel: { type: String, required: true },
    cycle: { type: String, enum: ['weekly', 'daily'], default: 'weekly' },
    items: [{
        date: { type: String, required: true },
        weekday: { type: String, required: true },
        personId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        personName: { type: String, default: '' }
    }],
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Schedule', scheduleSchema)
