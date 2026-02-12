/**
 * middlewares/errorHandler.js - 全局错误处理中间件
 * 捕获所有未处理的异常，返回统一格式的错误响应
 * 响应格式：{ code: 500, msg: '错误提示', data: null }
 */
const errorHandler = (err, req, res, _next) => {
    console.error('❌ 服务器错误:', err.message)

    // Mongoose 数据验证错误
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({
            code: 400,
            msg: messages.join('；'),
            data: null
        })
    }

    // Mongoose CastError（无效的 ObjectId 等）
    if (err.name === 'CastError') {
        return res.status(400).json({
            code: 400,
            msg: '无效的ID格式',
            data: null
        })
    }

    // 默认 500 错误
    res.status(500).json({
        code: 500,
        msg: err.message || '服务器内部错误',
        data: null
    })
}

module.exports = errorHandler
