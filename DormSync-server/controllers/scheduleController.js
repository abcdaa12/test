/**
 * controllers/scheduleController.js - 排班管理业务逻辑
 * 包含：查询排班表、生成随机排班、修改排班信息
 */
const Schedule = require('../models/Schedule')

// 星期映射
const weekdayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/**
 * 查询排班表
 * GET /api/schedule/list?dormId=xxx
 */
exports.getScheduleList = async (req, res, next) => {
    try {
        const { dormId } = req.query
        const query = dormId ? { dormId } : {}
        const list = await Schedule.find(query).sort({ createdAt: -1 })
        res.json({ code: 0, message: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}

/**
 * 生成随机排班表（按周，成员轮换）
 * POST /api/schedule/generate
 * Body: { dormId, members: ['张三','李四','王五','赵六'] }
 */
exports.generateSchedule = async (req, res, next) => {
    try {
        const { dormId, members } = req.body

        if (!dormId || !members || members.length === 0) {
            return res.status(400).json({ code: 1, message: '缺少 dormId 或 members' })
        }

        // 计算本周一的日期
        const now = new Date()
        const day = now.getDay() || 7
        const monday = new Date(now)
        monday.setDate(now.getDate() - day + 1)
        monday.setHours(0, 0, 0, 0)

        // 随机打乱成员顺序
        const shuffled = [...members].sort(() => Math.random() - 0.5)

        // 生成 7 天排班
        const items = []
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday)
            d.setDate(monday.getDate() + i)
            const yyyy = d.getFullYear()
            const mm = String(d.getMonth() + 1).padStart(2, '0')
            const dd = String(d.getDate()).padStart(2, '0')
            items.push({
                date: `${yyyy}-${mm}-${dd}`,
                weekday: weekdayMap[d.getDay()],
                person: shuffled[i % shuffled.length]
            })
        }

        // 周期标签
        const startMM = String(monday.getMonth() + 1).padStart(2, '0')
        const startDD = String(monday.getDate()).padStart(2, '0')
        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)
        const endMM = String(sunday.getMonth() + 1).padStart(2, '0')
        const endDD = String(sunday.getDate()).padStart(2, '0')
        const weekLabel = `${startMM}-${startDD} ~ ${endMM}-${endDD}`

        const schedule = await Schedule.create({ dormId, weekLabel, items })

        res.status(201).json({ code: 0, message: '排班生成成功', data: schedule })
    } catch (err) {
        next(err)
    }
}

/**
 * 修改排班信息（替换某天的负责人）
 * PUT /api/schedule/:id
 * Body: { date: '2025-06-10', person: '新负责人' }
 */
exports.updateSchedule = async (req, res, next) => {
    try {
        const { id } = req.params
        const { date, person } = req.body

        if (!date || !person) {
            return res.status(400).json({ code: 1, message: '缺少 date 或 person' })
        }

        const schedule = await Schedule.findById(id)
        if (!schedule) {
            return res.status(404).json({ code: 1, message: '排班记录不存在' })
        }

        // 找到对应日期并更新负责人
        const item = schedule.items.find(i => i.date === date)
        if (!item) {
            return res.status(404).json({ code: 1, message: `未找到日期 ${date} 的排班` })
        }

        item.person = person
        await schedule.save()

        res.json({ code: 0, message: '排班更新成功', data: schedule })
    } catch (err) {
        next(err)
    }
}
