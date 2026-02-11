/**
 * controllers/voteController.js - 投票管理业务逻辑
 * 包含：查询投票列表、新增投票、投票表决
 */
const Vote = require('../models/Vote')

/**
 * 查询投票列表
 * GET /api/vote/list?dormId=xxx
 */
exports.getVoteList = async (req, res, next) => {
    try {
        const { dormId } = req.query
        const query = dormId ? { dormId } : {}
        const list = await Vote.find(query).sort({ createdAt: -1 })
        res.json({ code: 0, message: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}

/**
 * 新增投票
 * POST /api/vote
 * Body: { dormId, title, options: [{ label }], creator }
 */
exports.addVote = async (req, res, next) => {
    try {
        const { dormId, title, options, creator } = req.body

        if (!dormId || !title || !options || options.length < 2) {
            return res.status(400).json({ code: 1, message: '缺少必填字段或选项少于2个' })
        }

        // 初始化每个选项的票数为 0
        const formattedOptions = options.map(opt => ({
            label: typeof opt === 'string' ? opt : opt.label,
            count: 0
        }))

        const vote = await Vote.create({
            dormId, title,
            options: formattedOptions,
            creator: creator || '',
            status: 'active'
        })

        res.status(201).json({ code: 0, message: '投票创建成功', data: vote })
    } catch (err) {
        next(err)
    }
}

/**
 * 投票表决（给某选项 +1）
 * PUT /api/vote/:id/cast
 * Body: { optionIndex: 0 }
 */
exports.castVote = async (req, res, next) => {
    try {
        const { id } = req.params
        const { optionIndex } = req.body

        const vote = await Vote.findById(id)
        if (!vote) {
            return res.status(404).json({ code: 1, message: '投票不存在' })
        }
        if (vote.status !== 'active') {
            return res.status(400).json({ code: 1, message: '投票已结束，无法投票' })
        }
        if (optionIndex == null || optionIndex < 0 || optionIndex >= vote.options.length) {
            return res.status(400).json({ code: 1, message: '选项索引无效' })
        }

        // 对应选项票数 +1
        vote.options[optionIndex].count += 1
        await vote.save()

        res.json({ code: 0, message: '投票成功', data: vote })
    } catch (err) {
        next(err)
    }
}
