/**
 * middlewares/errorHandler.js - 全局错误处理中间件
 * 捕获所有未处理的异常，返回统一格式的错误响应
 */
const errorHandler = (err, req, res, _next) => {
    console.error('❌ 服务器错误:', err.message)

    // Mongoose 验证错误
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({ code: 1, message: '数据验证失败', errors: messages })
    }

    // Mongoose CastError（无效的 ObjectId）
    if (err.name === 'CastError') {
        return res.status(400).json({ code: 1, message: '无效的ID格式' })
    }

    // 默认 500 错误
    res.status(err.status || 500).json({
        code: 1,
        message: err.message || '服务器内部错误'
    })
}

module.exports = errorHandler
