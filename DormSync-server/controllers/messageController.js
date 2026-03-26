/**
 * controllers/messageController.js - 消息相关业务逻辑
 * 接口：获取消息列表、修改消息状态、搜索消息
 */
const Message = require('../models/Message')

/**
 * 获取用户所有消息（支持按 status/type 筛选）
 * GET /api/message/list?status=unread&type=vote
 * userId 优先从令牌中获取（req.userId），也兼容 query 参数传入
 */
exports.getMessageList = async (req, res, next) => {
    try {
        const userId = req.userId || req.query.userId
        const { status, type } = req.query
        if (!userId) {
            return res.json({ code: 400, msg: '缺少参数 userId', data: null })
        }

        // 构建查询条件
        const query = { userId }
        if (status && status !== 'all') query.status = status
        if (type && type !== 'all') query.type = type

        const list = await Message.find(query).sort({ createTime: -1 })

        res.json({ code: 200, msg: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}

/**
 * 修改消息状态（标记已读等）
 * PUT /api/message/update
 * Body: { messageId, status }
 */
exports.updateMessage = async (req, res, next) => {
    try {
        const { messageId, status } = req.body
        if (!messageId || !status) {
            return res.json({ code: 400, msg: '缺少参数 messageId 或 status', data: null })
        }

        if (!['unread', 'read'].includes(status)) {
            return res.json({ code: 400, msg: 'status 值无效，应为 unread 或 read', data: null })
        }

        const message = await Message.findByIdAndUpdate(messageId, { status }, { new: true })
        if (!message) {
            return res.json({ code: 404, msg: '消息不存在', data: null })
        }

        res.json({ code: 200, msg: '状态更新成功', data: message })
    } catch (err) {
        next(err)
    }
}

/**
 * 搜索消息（按关键词模糊匹配消息内容）
 * GET /api/message/search?keyword=电费
 * userId 优先从令牌中获取（req.userId），也兼容 query 参数传入
 */
exports.searchMessage = async (req, res, next) => {
    try {
        const userId = req.userId || req.query.userId
        const { keyword } = req.query
        if (!userId || !keyword) {
            return res.json({ code: 400, msg: '缺少参数 userId 或 keyword', data: null })
        }

        // 使用正则进行模糊搜索
        const list = await Message.find({
            userId,
            content: { $regex: keyword, $options: 'i' }
        }).sort({ createTime: -1 })

        res.json({ code: 200, msg: '搜索成功', data: list })
    } catch (err) {
        next(err)
    }
}

/**
 * 删除消息
 * DELETE /api/message/delete
 * Body: { messageId }
 */
exports.deleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.body
        if (!messageId) {
            return res.json({ code: 400, msg: '缺少参数 messageId', data: null })
        }

        const message = await Message.findByIdAndDelete(messageId)
        if (!message) {
            return res.json({ code: 404, msg: '消息不存在', data: null })
        }

        res.json({ code: 200, msg: '删除成功', data: null })
    } catch (err) {
        next(err)
    }
}

/**
 * 批量创建消息（内部调用，给宿舍成员发通知）
 */
exports.createNotification = async ({ userIds, type, content }) => {
    try {
        const messages = userIds.map(userId => ({
            userId,
            type,
            content,
            status: 'unread'
        }))
        await Message.insertMany(messages)
    } catch (err) {
        console.error('创建通知失败', err)
    }
}

/**
 * 获取未读消息数量
 * GET /api/message/unread-count
 */
exports.getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.userId || req.query.userId
        if (!userId) {
            return res.json({ code: 400, msg: '缺少参数 userId', data: null })
        }
        const count = await Message.countDocuments({ userId, status: 'unread' })
        res.json({ code: 200, msg: '查询成功', data: { count } })
    } catch (err) {
        next(err)
    }
}
