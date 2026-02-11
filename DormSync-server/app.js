/**
 * app.js - DormSync 后端入口文件
 * 职责：加载环境变量、连接数据库、挂载中间件和路由、启动 HTTP 服务
 */
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const errorHandler = require('./middlewares/errorHandler')

// 1. 加载 .env 环境变量
dotenv.config()

// 2. 创建 Express 应用
const app = express()

// 3. 全局中间件
app.use(cors())                         // 跨域支持
app.use(express.json())                 // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true }))  // 解析 URL 编码请求体

// 4. 挂载业务路由（统一前缀 /api）
app.use('/api/fee', require('./routes/fee'))
app.use('/api/vote', require('./routes/vote'))
app.use('/api/schedule', require('./routes/schedule'))

// 5. 健康检查接口
app.get('/', (req, res) => {
    res.json({ code: 0, message: 'DormSync API 服务运行中 🚀' })
})

// 6. 全局错误处理（必须放在路由之后）
app.use(errorHandler)

// 7. 连接数据库并启动服务
const PORT = process.env.PORT || 3000

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 DormSync 服务已启动: http://localhost:${PORT}`)
    })
})
