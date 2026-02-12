/**
 * middlewares/jwt.js - JWT 工具函数 + 接口权限验证中间件
 *
 * 导出：
 *   generateToken(payload) - 生成 JWT 令牌（有效期 7 天）
 *   verifyToken(token)     - 验证并解析 JWT 令牌
 *   authMiddleware          - Express 中间件，校验请求头中的 Bearer Token
 *                            验证通过后将 userId 和 openid 挂载到 req 上
 */
const jwt = require('jsonwebtoken')

/**
 * 生成 JWT 令牌
 * @param {Object} payload - 载荷，通常包含 { userId, openid }
 * @returns {string} JWT 令牌字符串
 */
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
}

/**
 * 验证并解析 JWT 令牌
 * @param {string} token - JWT 令牌字符串
 * @returns {Object} 解析后的载荷
 * @throws {Error} 令牌无效或已过期时抛出异常
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}

/**
 * 接口权限验证中间件
 * 从请求头 Authorization: Bearer <token> 中提取令牌并验证
 * 验证通过后将 userId 和 openid 挂载到 req 对象上，供后续接口使用
 */
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.json({ code: 401, msg: '未登录，请先登录', data: null })
        }

        const token = authHeader.split(' ')[1]
        const decoded = verifyToken(token)

        // 将用户信息挂载到 req 上，后续接口可直接使用
        req.userId = decoded.userId
        req.openid = decoded.openid

        next()
    } catch (err) {
        // 令牌过期
        if (err.name === 'TokenExpiredError') {
            return res.json({ code: 401, msg: '登录已过期，请重新登录', data: null })
        }
        // 令牌无效
        return res.json({ code: 401, msg: '无效的令牌，请重新登录', data: null })
    }
}

module.exports = { generateToken, verifyToken, authMiddleware }
