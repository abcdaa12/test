/**
 * controllers/feeController.js - 费用管理业务逻辑
 * 包含：查询费用列表、新增费用、修改付款状态
 */
const Fee = require('../models/Fee')

/**
 * 查询费用列表
 * GET /api/fee/list?dormId=xxx
 */
exports.getFeeList = async (req, res, next) => {
    try {
        const { dormId } = req.query
        const query = dormId ? { dormId } : {}
        const list = await Fee.find(query).sort({ createdAt: -1 })
        res.json({ code: 0, message: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}

/**
 * 新增费用
 * POST /api/fee
 * Body: { dormId, title, amount, payer, perPerson, remark }
 */
exports.addFee = async (req, res, next) => {
    try {
        const { dormId, title, amount, payer, perPerson, remark } = req.body

        if (!dormId || !title || amount == null || !payer) {
            return res.status(400).json({ code: 1, message: '缺少必填字段（dormId/title/amount/payer）' })
        }

        const fee = await Fee.create({
            dormId, title, amount, payer,
            perPerson: perPerson || 0,
            remark: remark || ''
        })

        res.status(201).json({ code: 0, message: '费用添加成功', data: fee })
    } catch (err) {
        next(err)
    }
}

/**
 * 修改付款状态
 * PUT /api/fee/:id/status
 * Body: { status: 'paid' | 'pending' }
 */
exports.updateFeeStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!['pending', 'paid'].includes(status)) {
            return res.status(400).json({ code: 1, message: 'status 值无效，应为 pending 或 paid' })
        }

        const fee = await Fee.findByIdAndUpdate(id, { status }, { new: true })
        if (!fee) {
            return res.status(404).json({ code: 1, message: '费用记录不存在' })
        }

        res.json({ code: 0, message: '状态更新成功', data: fee })
    } catch (err) {
        next(err)
    }
}
