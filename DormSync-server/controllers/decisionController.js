/**
 * controllers/decisionController.js - 决策/投票业务逻辑
 * 接口：发起决策、查看宿舍所有决策
 */
const Decision = require('../models/Decision')
const Dorm = require('../models/Dorm')
const User = require('../models/User')
const { createNotification } = require('./messageController')
const { sendDormActivity } = require('../utils/wxSubscribe')

/**
 * 发起决策
 * POST /api/decision/create
 * Body: { dormId, title, options, deadline, creatorId }
 * options 格式：['选项A', '选项B'] 或 [{ label: '选项A' }]
 */
exports.createDecision = async (req, res, next) => {
    try {
        const { dormId, title, options, deadline, creatorId } = req.body

        if (!dormId || !title || !options || !deadline || !creatorId) {
            return res.json({ code: 400, msg: '缺少必填参数（dormId/title/options/deadline/creatorId）', data: null })
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.json({ code: 400, msg: '选项至少需要2个', data: null })
        }

        // 统一选项格式：支持字符串数组或对象数组
        const formattedOptions = options.map(opt => ({
            label: typeof opt === 'string' ? opt : opt.label,
            count: 0
        }))

        const decision = await Decision.create({
            dormId, title,
            options: formattedOptions,
            deadline,
            creatorId,
            status: 'active'
        })

        res.json({ code: 200, msg: '决策发起成功', data: decision })

        // 异步通知宿舍成员
        try {
            const dorm = await Dorm.findById(dormId)
            if (dorm) {
                const otherMembers = dorm.members.filter(id => id.toString() !== creatorId)
                await createNotification({
                    userIds: otherMembers,
                    type: 'vote',
                    content: `投票通知：${title}，请参与投票`
                })
                // 微信推送
                const users = await User.find({ _id: { $in: otherMembers } }, 'openid')
                const openids = users.map(u => u.openid).filter(Boolean)
                sendDormActivity(openids, '新投票', `${title}，请参与投票`).catch(e => console.error(e))
            }
        } catch (e) { console.error('发送投票通知失败', e) }
    } catch (err) {
        next(err)
    }
}

/**
 * 投票（防重复）
 * POST /api/decision/vote
 * Body: { decisionId, optionIndex }
 */
exports.castVote = async (req, res, next) => {
    try {
        const userId = req.userId
        const { decisionId, optionIndex } = req.body

        if (!decisionId || optionIndex == null) {
            return res.json({ code: 400, msg: '缺少参数 decisionId 或 optionIndex', data: null })
        }

        const decision = await Decision.findById(decisionId)
        if (!decision) {
            return res.json({ code: 404, msg: '投票不存在', data: null })
        }

        if (decision.status !== 'active') {
            return res.json({ code: 400, msg: '投票已结束', data: null })
        }

        if (new Date() > new Date(decision.deadline)) {
            decision.status = 'ended'
            await decision.save()
            return res.json({ code: 400, msg: '投票已过截止时间', data: null })
        }

        if (optionIndex < 0 || optionIndex >= decision.options.length) {
            return res.json({ code: 400, msg: '选项索引无效', data: null })
        }

        // 检查是否已投票
        const alreadyVoted = decision.voters.some(v => v.userId.toString() === userId)
        if (alreadyVoted) {
            return res.json({ code: 400, msg: '你已经投过票了', data: null })
        }

        decision.options[optionIndex].count += 1
        decision.voters.push({ userId, optionIndex })
        await decision.save()

        res.json({ code: 200, msg: '投票成功', data: decision })
    } catch (err) {
        next(err)
    }
}

/**
 * 查看宿舍所有决策
 * GET /api/decision/list?dormId=xxx
 */
exports.getDecisionList = async (req, res, next) => {
    try {
        const { dormId } = req.query
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null })
        }

        const list = await Decision.find({ dormId })
            .populate('creatorId', 'nickname avatar')
            .sort({ createdAt: -1 })

        res.json({ code: 200, msg: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}
