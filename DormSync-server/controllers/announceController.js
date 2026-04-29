/**
 * controllers/announceController.js - 公告管理
 */
const Announce = require('../models/Announce')
const Dorm = require('../models/Dorm')
const { createNotification } = require('./messageController')

/**
 * 创建公告
 * POST /api/announce/create
 * Body: { dormId, title, content }
 */
exports.createAnnounce = async (req, res, next) => {
    try {
        const userId = req.userId
        const { dormId, title, content } = req.body
        if (!dormId || !title) {
            return res.json({ code: 400, msg: '缺少参数', data: null })
        }
        const announce = await Announce.create({ dormId, title, content: content || '', creatorId: userId, readBy: [userId] })
        res.json({ code: 200, msg: '公告发布成功', data: announce })

        // 通知宿舍其他成员
        try {
            const dorm = await Dorm.findById(dormId)
            if (dorm) {
                const others = dorm.members.filter(id => id.toString() !== userId)
                await createNotification({
                    userIds: others,
                    type: 'announce',
                    content: `新公告：${title}`
                })
            }
        } catch (e) { console.error('公告通知失败', e) }
    } catch (err) { next(err) }
}

/**
 * 获取公告列表 (支持 limit 参数，用于首页跑马灯)
 * GET /api/announce/list?dormId=xxx&limit=3
 */
exports.getAnnounceList = async (req, res, next) => {
    try {
        const { dormId, limit } = req.query
        if (!dormId) return res.json({ code: 400, msg: '缺少参数 dormId', data: null })

        let query = Announce.find({ dormId })
            .populate('creatorId', 'nickname')
            .sort({ createdAt: -1 })
            
        if (limit) {
            query = query.limit(parseInt(limit))
        }

        const list = await query

        // 获取宿舍总人数
        const dorm = await Dorm.findById(dormId)
        const totalMembers = dorm ? dorm.members.length : 0

        const result = list.map(a => ({
            _id: a._id,
            title: a.title,
            content: a.content,
            creatorName: a.creatorId?.nickname || '',
            readCount: a.readBy.length,
            totalMembers,
            createdAt: a.createdAt
        }))

        res.json({ code: 200, msg: '查询成功', data: result })
    } catch (err) { next(err) }
}

/**
 * 标记公告已读
 * PUT /api/announce/read
 * Body: { announceId }
 */
exports.markRead = async (req, res, next) => {
    try {
        const userId = req.userId
        const { announceId } = req.body
        if (!announceId) return res.json({ code: 400, msg: '缺少参数', data: null })

        await Announce.findByIdAndUpdate(announceId, { $addToSet: { readBy: userId } })
        res.json({ code: 200, msg: '已读', data: null })
    } catch (err) { next(err) }
}

/**
 * 删除公告
 * DELETE /api/announce/delete
 * Body: { announceId }
 */
exports.deleteAnnounce = async (req, res, next) => {
    try {
        const { announceId } = req.body
        if (!announceId) return res.json({ code: 400, msg: '缺少参数', data: null })

        await Announce.findByIdAndDelete(announceId)
        res.json({ code: 200, msg: '删除成功', data: null })
    } catch (err) { next(err) }
}

/**
 * 获取公告详情（含已读人员列表）
 * GET /api/announce/detail?announceId=xxx
 */
exports.getAnnounceDetail = async (req, res, next) => {
    try {
        const { announceId } = req.query
        if (!announceId) return res.json({ code: 400, msg: '缺少参数', data: null })

        const announce = await Announce.findById(announceId)
            .populate('creatorId', 'nickname')
            .populate('readBy', 'nickname')

        if (!announce) return res.json({ code: 404, msg: '公告不存在', data: null })

        res.json({ code: 200, msg: '查询成功', data: announce })
    } catch (err) { next(err) }
}
