/**
 * app.js - DormSync 宿舍管理平台后端入口
 * 职责：加载环境变量、连接数据库、挂载中间件和路由、启动 HTTP 服务
 */
const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const corsMiddleware = require('./middlewares/corsMiddleware')
const errorHandler = require('./middlewares/errorHandler')

// 1. 加载 .env 环境变量
dotenv.config()

// 2. 创建 Express 应用
const app = express()

// 3. 全局中间件
app.use(corsMiddleware)                          // 跨域支持
app.use(express.json())                          // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true }))  // 解析 URL 编码请求体
app.use('/uploads', express.static('uploads'))   // 静态文件服务（头像等）

// 4. 挂载业务路由（统一前缀 /api）
app.use('/api/user', require('./routes/user'))
app.use('/api/dorm', require('./routes/dorm'))
app.use('/api/todo', require('./routes/todo'))
app.use('/api/message', require('./routes/message'))
app.use('/api/decision', require('./routes/decision'))
app.use('/api/task', require('./routes/task'))
app.use('/api/finance', require('./routes/finance'))
app.use('/api/schedule', require('./routes/schedule'))
app.use('/api/announce', require('./routes/announce'))

// 5. 健康检查与测试推送接口
app.get('/', (req, res) => {
    res.json({ code: 200, msg: 'DormSync API 服务运行中 🚀', data: null })
})

app.get('/api/test-push', async (req, res) => {
    const { userId } = req.query
    if (!userId) return res.json({ code: 400, msg: '请提供 userId' })
    
    // 引入 Message 模型，将模拟数据真实入库
    const Message = require('./models/Message')
    try {
        const newMsg = await Message.create({
            userId: userId,
            type: 'finance',
            content: '室友发起了一笔电费收款 ¥50',
            status: 'unread'
        })

        // 调用 io 发送带有真实数据库 ID 的消息
        io.to(userId).emit('new_message', {
            _id: newMsg._id,
            type: newMsg.type,
            content: newMsg.content,
            createTime: newMsg.createTime
        })
        
        res.json({ code: 200, msg: '测试消息已入库并推送到用户: ' + userId })
    } catch (e) {
        console.error(e)
        res.json({ code: 500, msg: '模拟推送失败' })
    }
})

// 6. 全局错误处理（必须放在路由之后）
app.use(errorHandler)

// 7. 连接数据库并启动服务
const PORT = process.env.PORT || 3000
const http = require('http')
const { Server } = require('socket.io')

// 创建 HTTP 服务器和 WebSocket 服务器
const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' } // 允许所有跨域请求
})

// 将 io 实例挂载到 app 上，方便在控制器中调用
app.set('io', io)

// 监听 WebSocket 连接
io.on('connection', (socket) => {
    console.log('✅ 新的 WebSocket 连接已建立，ID:', socket.id)

    // 监听客户端发来的用户注册事件（绑定 socket 和 userId）
    socket.on('register', (userId) => {
        if (userId) {
            socket.join(userId) // 让该 socket 加入以 userId 命名的房间
            console.log(`👤 用户 ${userId} 成功连接 WebSocket`)
        }
    })

    socket.on('disconnect', () => {
        console.log('❌ WebSocket 连接已断开，ID:', socket.id)
    })
})

connectDB().then(() => {
    // 注意：这里使用 server.listen 而不是 app.listen
    server.listen(PORT, () => {
        console.log(`🚀 DormSync 服务端(含 WebSocket)已启动: http://localhost:${PORT}`)
    })
})
