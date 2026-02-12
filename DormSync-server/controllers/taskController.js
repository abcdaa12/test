/**
 * controllers/taskController.js - 事务管理业务逻辑
 * 接口：创建事务、查看宿舍所有事务
 */
const Task = require('../models/Task')

/**
 * 创建事务
 * POST /api/task/create
 * Body: { dormId, title, content, assigneeId, deadline }
 */
exports.createTask = async (req, res, next) => {
    try {
        const { dormId, title, content, assigneeId, deadline } = req.body

        if (!dormId || !title || !assigneeId) {
            return res.json({ code: 400, msg: '缺少必填参数（dormId/title/assigneeId）', data: null })
        }

        const task = await Task.create({
            dormId, title,
            content: content || '',
            assigneeId,
            deadline: deadline || null,
            status: 'undone'
        })

        res.json({ code: 200, msg: '事务创建成功', data: task })
    } catch (err) {
        next(err)
    }
}

/**
 * 查看宿舍所有事务
 * GET /api/task/list?dormId=xxx
 */
exports.getTaskList = async (req, res, next) => {
    try {
        const { dormId } = req.query
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null })
        }

        const list = await Task.find({ dormId })
            .populate('assigneeId', 'nickname avatar')
            .sort({ createdAt: -1 })

        res.json({ code: 200, msg: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}
