/**
 * controllers/financeController.js - 财务管理业务逻辑
 * 接口：发起收款、查看财务记录
 */
const Finance = require('../models/Finance')

/**
 * 发起收款
 * POST /api/finance/create
 * Body: { dormId, title, amount, creatorId, payeeIds }
 */
exports.createFinance = async (req, res, next) => {
    try {
        const { dormId, title, amount, creatorId, payeeIds } = req.body

        if (!dormId || !title || amount == null || !creatorId) {
            return res.json({ code: 400, msg: '缺少必填参数（dormId/title/amount/creatorId）', data: null })
        }

        if (amount <= 0) {
            return res.json({ code: 400, msg: '金额必须大于0', data: null })
        }

        const finance = await Finance.create({
            dormId, title, amount, creatorId,
            payeeIds: payeeIds || [],
            status: 'unpaid'
        })

        res.json({ code: 200, msg: '收款发起成功', data: finance })
    } catch (err) {
        next(err)
    }
}

/**
 * 查看宿舍财务记录
 * GET /api/finance/list?dormId=xxx
 */
exports.getFinanceList = async (req, res, next) => {
    try {
        const { dormId } = req.query
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null })
        }

        const list = await Finance.find({ dormId })
            .populate('creatorId', 'nickname avatar')
            .populate('payeeIds', 'nickname avatar')
            .sort({ createdAt: -1 })

        res.json({ code: 200, msg: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}
