/**
 * controllers/todoController.js - 待办事项业务逻辑
 * 接口：获取用户待办列表、创建待办、完成待办、删除待办
 */
const Todo = require('../models/Todo')

/**
 * 获取当前用户待办列表（只返回未完成的待办）
 * GET /api/todo/list
 */
exports.getTodoList = async (req, res, next) => {
    try {
        const userId = req.userId || req.query.userId
        if (!userId) {
            return res.json({ code: 400, msg: '缺少参数 userId', data: null })
        }
        const list = await Todo.find({ userId, status: 'undone' }).sort({ createTime: -1 })
        res.json({ code: 200, msg: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}

/**
 * 创建待办
 * POST /api/todo/create
 * Body: { content, type? }
 */
exports.createTodo = async (req, res, next) => {
    try {
        const userId = req.userId
        const { content, type } = req.body
        if (!userId || !content) {
            return res.json({ code: 400, msg: '缺少参数', data: null })
        }
        const todo = await Todo.create({
            userId,
            content,
            type: type || 'task',
            status: 'undone'
        })
        res.json({ code: 200, msg: '创建成功', data: todo })
    } catch (err) {
        next(err)
    }
}

/**
 * 完成待办
 * PUT /api/todo/done
 * Body: { todoId }
 */
exports.doneTodo = async (req, res, next) => {
    try {
        const { todoId } = req.body
        if (!todoId) {
            return res.json({ code: 400, msg: '缺少参数 todoId', data: null })
        }
        const todo = await Todo.findByIdAndUpdate(todoId, { status: 'done' }, { new: true })
        if (!todo) return res.json({ code: 404, msg: '待办不存在', data: null })
        res.json({ code: 200, msg: '已完成', data: todo })
    } catch (err) {
        next(err)
    }
}

/**
 * 删除待办
 * DELETE /api/todo/delete
 * Body: { todoId }
 */
exports.deleteTodo = async (req, res, next) => {
    try {
        const { todoId } = req.body
        if (!todoId) {
            return res.json({ code: 400, msg: '缺少参数 todoId', data: null })
        }
        await Todo.findByIdAndDelete(todoId)
        res.json({ code: 200, msg: '删除成功', data: null })
    } catch (err) {
        next(err)
    }
}
