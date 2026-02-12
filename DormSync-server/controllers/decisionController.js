/**
 * controllers/decisionController.js - 决策/投票业务逻辑
 * 接口：发起决策、查看宿舍所有决策
 */
const Decision = require('../models/Decision')

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
