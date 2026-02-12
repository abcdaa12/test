/**
 * middlewares/corsMiddleware.js - 跨域中间件
 * 开发阶段允许所有来源的请求，支持常用 HTTP 方法和自定义请求头
 */
const cors = require('cors')

const corsMiddleware = cors({
    // 开发阶段允许所有来源（生产环境应限制为具体域名）
    origin: '*',
    // 允许的 HTTP 方法
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // 允许的请求头
    allowedHeaders: ['Content-Type', 'Authorization'],
    // 预检请求缓存时间（秒）
    maxAge: 86400
})

module.exports = corsMiddleware
