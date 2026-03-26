/**
 * controllers/scheduleController.js - 排班管理业务逻辑
 */
const Schedule = require('../models/Schedule')
const Dorm = require('../models/Dorm')
const User = require('../models/User')
const { createNotification } = require('./messageController')
const { sendDutyReminder } = require('../utils/wxSubscribe')

/**
 * 生成/保存排班
 * POST /api/schedule/create
 * Body: { dormId, weekLabel, cycle, items: [{ date, weekday, personId, personName }] }
 */
exports.createSchedule = async (req, res, next) => {
    try {
        const { dormId, weekLabel, cycle, items } = req.body
        if (!dormId || !weekLabel || !items || !items.length) {
            return res.json({ code: 400, msg: '缺少必填参数', data: null })
        }

        const schedule = await Schedule.create({ dormId, weekLabel, cycle: cycle || 'weekly', items })
        res.json({ code: 200, msg: '排班创建成功', data: schedule })

        // 异步通知：给明天值日的人发提醒
        try {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`

            const tomorrowItems = items.filter(i => i.date === tomorrowStr)
            if (tomorrowItems.length > 0) {
                // 站内通知
                const personIds = tomorrowItems.map(i => i.personId).filter(Boolean)
                await createNotification({
                    userIds: personIds,
                    type: 'task',
                    content: `明天（${tomorrowStr}）轮到你值日，请按时完成`
                })
                // 微信推送
                const users = await User.find({ _id: { $in: personIds } }, 'openid nickname')
                const pushList = tomorrowItems.map(item => {
                    const u = users.find(u => u._id.toString() === item.personId)
                    return u ? { openid: u.openid, personName: item.personName, date: item.date, weekday: item.weekday } : null
                }).filter(Boolean)
                sendDutyReminder(pushList).catch(e => console.error(e))
            }
        } catch (e) { console.error('排班通知失败', e) }
    } catch (err) {
        next(err)
    }
}

/**
 * 获取当前排班（最新一条）
 * GET /api/schedule/current?dormId=xxx
 */
exports.getCurrentSchedule = async (req, res, next) => {
    try {
        const { dormId } = req.query
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null })
        }

        const schedule = await Schedule.findOne({ dormId }).sort({ createdAt: -1 })
        res.json({ code: 200, msg: '查询成功', data: schedule })
    } catch (err) {
        next(err)
    }
}

/**
 * 获取历史排班
 * GET /api/schedule/history?dormId=xxx
 */
exports.getScheduleHistory = async (req, res, next) => {
    try {
        const { dormId } = req.query
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null })
        }

        const list = await Schedule.find({ dormId }).sort({ createdAt: -1 }).skip(1).limit(10)
        res.json({ code: 200, msg: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}
