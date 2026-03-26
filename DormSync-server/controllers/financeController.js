/**
 * controllers/financeController.js - 财务管理业务逻辑
 * 接口：发起收款、查看财务记录、删除财务记录
 */
const Finance = require('../models/Finance')
const Dorm = require('../models/Dorm')
const User = require('../models/User')
const { createNotification } = require('./messageController')
const { sendFinanceNotify } = require('../utils/wxSubscribe')

/**
 * 发起收款
 * POST /api/finance/create
 */
exports.createFinance = async (req, res, next) => {
    try {
        const { dormId, title, amount, creatorId, payeeIds } = req.body
        if (!dormId || !title || amount == null || !creatorId) {
            return res.json({ code: 400, msg: '缺少必填参数', data: null })
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
        // 异步通知宿舍成员
        try {
            const dorm = await Dorm.findById(dormId)
            if (dorm) {
                const otherMembers = dorm.members.filter(id => id.toString() !== creatorId)
                await createNotification({
                    userIds: otherMembers,
                    type: 'finance',
                    content: `收款通知：${title} ¥${amount}`
                })
                // 微信推送
                const users = await User.find({ _id: { $in: otherMembers } }, 'openid')
                const openids = users.map(u => u.openid).filter(Boolean)
                sendFinanceNotify(openids, title, amount).catch(e => console.error(e))
            }
        } catch (e) { console.error('发送财务通知失败', e) }
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

/**
 * 删除财务记录
 * DELETE /api/finance/delete
 * Body: { financeId }
 */
exports.deleteFinance = async (req, res, next) => {
    try {
        const { financeId } = req.body
        if (!financeId) {
            return res.json({ code: 400, msg: '缺少参数 financeId', data: null })
        }
        const finance = await Finance.findByIdAndDelete(financeId)
        if (!finance) return res.json({ code: 404, msg: '记录不存在', data: null })
        res.json({ code: 200, msg: '删除成功', data: null })
    } catch (err) {
        next(err)
    }
}
