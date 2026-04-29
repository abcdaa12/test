/**
 * controllers/scheduleController.js - 排班管理业务逻辑
 */
const Schedule = require('../models/Schedule')
const Dorm = require('../models/Dorm')
const User = require('../models/User')
const { createNotification } = require('./messageController')

/**
 * 生成/保存排班
 * POST /api/schedule/create
 * Body: { dormId, weekLabel, cycle, items: [{ date, weekday, personId, personName }] }
 */
exports.createSchedule = async (req, res, next) => {
    try {
        const { dormId, weekLabel, cycle, items } = req.body
        
        // 核心修复：允许 items 为空数组（代表清空了所有排班）
        if (!dormId || !weekLabel || !Array.isArray(items)) {
            return res.json({ code: 400, msg: '缺少必填参数', data: null })
        }

        const schedule = await Schedule.create({ dormId, weekLabel, cycle: cycle || 'weekly', items })
        res.json({ code: 200, msg: '排班更新成功', data: schedule })

        // 异步通知：给明天值日的人发提醒
        try {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`

            const tomorrowItems = items.filter(i => i.date === tomorrowStr)
            if (tomorrowItems.length > 0) {
                const personIds = tomorrowItems.map(i => i.personId).filter(Boolean)
                await createNotification({
                    userIds: personIds,
                    type: 'task',
                    content: `明天（${tomorrowStr}）轮到你值日，请按时完成`
                })
            }
        } catch (e) { console.error('排班通知失败', e) }
    } catch (err) {
        next(err)
    }
}

/**
 * 获取当前排班（所有有效的排班记录合并）
 * GET /api/schedule/current?dormId=xxx
 */
exports.getCurrentSchedule = async (req, res, next) => {
    try {
        const { dormId } = req.query
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null })
        }

        // 获取最新的一条全量记录即可，因为我们现在是全量覆盖保存的
        const schedule = await Schedule.findOne({ dormId }).sort({ _id: -1 })
        
        // 如果连一条记录都没有，返回空数组
        if (!schedule) {
             return res.json({ code: 200, msg: '查询成功', data: { items: [] } })
        }

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

        const list = await Schedule.find({ dormId }).sort({ _id: -1 }).skip(1).limit(10)
        res.json({ code: 200, msg: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}

const axios = require('axios')

/**
 * AI 智能排班
 * POST /api/schedule/ai-generate
 * Body: { dormId, prompt, startDate, days }
 * prompt: 用户自然语言描述的排班需求
 * startDate: 排班起始日期 (YYYY-MM-DD)
 * days: 排班天数，默认7
 */
exports.aiGenerate = async (req, res, next) => {
    try {
        const { dormId, prompt, startDate, days } = req.body
        if (!dormId || !prompt) {
            return res.json({ code: 400, msg: '缺少参数 dormId 或 prompt', data: null })
        }

        // 获取宿舍成员
        const dorm = await Dorm.findById(dormId).populate('members', 'nickname _id')
        if (!dorm || !dorm.members.length) {
            return res.json({ code: 400, msg: '宿舍不存在或没有成员', data: null })
        }

        const memberList = dorm.members.map(m => ({ id: m._id.toString(), name: m.nickname }))
        const memberNames = memberList.map(m => m.name).join('、')
        const numDays = days || 7
        const start = startDate || new Date().toISOString().slice(0, 10)

        // 生成日期列表
        const dateList = []
        const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        for (let i = 0; i < numDays; i++) {
            const d = new Date(start)
            d.setDate(d.getDate() + i)
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            dateList.push({ date: dateStr, weekday: weekdayNames[d.getDay()] })
        }

        // 查询已有排班数据 (由于 AI 可能会全盘重写，所以我们要获取当月的完整排班，供其参考)
        const currentMonthStart = `${start.substring(0, 7)}-01`
        const existingSchedules = await Schedule.find({ dormId }).sort({ _id: -1 }).limit(1)
        const existingMap = {}
        if (existingSchedules.length > 0) {
            existingSchedules[0].items.forEach(item => {
                if (item && item.date && !existingMap[item.date]) {
                    existingMap[item.date] = item.personName
                }
            })
        }
        
        // 提取当月已有排班
        const existingInfo = Object.keys(existingMap)
            .filter(d => d.startsWith(start.substring(0, 7))) // 只传当月给AI参考，免得太多
            .map(d => `${d}: ${existingMap[d]}`)
        
        const existingText = existingInfo.length > 0
            ? `\n\n当前本月已有排班如下（请务必将这些记录原样包含在返回结果中，除非用户明确要求修改或删除某天）：\n${existingInfo.join('\n')}`
            : ''

        const systemPrompt = `你是一个宿舍排班助手。根据用户的需求，为宿舍成员生成合理的排班表。

宿舍成员：${memberNames}
排班日期范围：${start} 起，共 ${numDays} 天
日期列表：${dateList.map(d => `${d.date}(${d.weekday})`).join('、')}${existingText}

请严格按照以下 JSON 格式返回排班结果，不要返回任何其他内容：
[
  { "date": "YYYY-MM-DD", "weekday": "周X", "personName": "成员姓名" },
  ...
]

注意：
1. personName 必须是上述成员中的某一个，不能编造名字
2. 每天最多安排一个人
3. 如果用户明确要求删除/清空/取消某天或某些天的排班，请不要在返回的 JSON 数组中包含这些日期
4. 如果某天不需要排班（如用户要求跳过周末、节假日等），则不要包含该天的记录
5. 尽量公平分配，每人次数接近
6. 充分考虑用户提出的特殊要求（如某人某天没空、换班、跳过某些日期等）
7. 只返回需要排班的日期，不需要排班的日期直接省略
8. 【特别注意】：如果用户只是要求修改或删除某几天的排班，请务必保留其他日期已有的排班记录（即把不需要修改的 existing 记录一并放在 JSON 中返回）`

        // 调用 DeepSeek API
        const aiRes = await axios.post('https://api.deepseek.com/chat/completions', {
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2000
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        })

        const aiContent = aiRes.data.choices[0].message.content.trim()

        // 提取 JSON（AI 可能返回 markdown 代码块）
        let jsonStr = aiContent
        const jsonMatch = aiContent.match(/\[[\s\S]*\]/)
        if (jsonMatch) jsonStr = jsonMatch[0]

        const aiItems = JSON.parse(jsonStr)

        // 映射 personId
        const items = aiItems.map(item => {
            const member = memberList.find(m => m.name === item.personName)
            return {
                date: item.date,
                weekday: item.weekday,
                personId: member ? member.id : null,
                personName: item.personName
            }
        })

        res.json({ code: 200, msg: 'AI 排班生成成功', data: { items, weekLabel: `${dateList[0].date} ~ ${dateList[dateList.length - 1].date}` } })
    } catch (err) {
        console.error('AI 排班失败:', err.message)
        if (err.response) console.error('AI 响应:', err.response.data)
        res.json({ code: 500, msg: 'AI 排班失败，请稍后重试', data: null })
    }
}
