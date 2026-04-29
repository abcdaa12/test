// 测试脚本：模拟室友发送 WebSocket 推送消息
const io = require('socket.io-client')
// 连接到本地 WebSocket 服务端
const socket = io('http://localhost:3000')

socket.on('connect', () => {
    console.log('测试脚本已连接到服务器')
    
    // 你当前登录的用户 ID
    // 我们可以直接通过服务器的接口或直接发送消息到指定的房间
    // 但更简单的做法是直接调用一下创建财务的接口，让后端去推
})
