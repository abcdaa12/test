/**
 * controllers/todoController.js - 待办事项业务逻辑
 * 接口：获取用户待办列表
 */
const Todo = require('../models/Todo')

/**
 * 获取当前用户待办列表（只返回未完成的待办）
 * GET /api/todo/list
 * userId 优先从令牌中获取（req.userId），也兼容 query 参数传入
 */
exports.getTodoList = async (req, res, next) => {
    try {
        // 优先使用令牌中的 userId
        const userId = req.userId || req.query.userId
        if (!userId) {
            return res.json({ code: 400, msg: '缺少参数 userId', data: null })
        }

        // 只查询未完成的待办，按创建时间倒序
        const list = await Todo.find({ userId, status: 'undone' }).sort({ createTime: -1 })

        res.json({ code: 200, msg: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}
