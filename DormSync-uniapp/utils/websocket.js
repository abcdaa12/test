/**
 * websocket.js - 封装全局 WebSocket 连接管理
 * 基于微信小程序原生的 uni.connectSocket 实现
 */
import { BASE_URL } from './request'

let socketTask = null
let isConnected = false
let reconnectTimer = null
let pingTimer = null
let isConnecting = false // 新增：防止并发连接

export const connectWebSocket = (userId) => {
    if (!userId) return
    if (isConnected || isConnecting) return // 防止同时发起多个连接

    isConnecting = true
    console.log('🔄 正在建立 WebSocket 连接...')

    // Socket.io 默认路径是 /socket.io/?EIO=4&transport=websocket
    const wsUrl = BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/socket.io/?EIO=4&transport=websocket'

    socketTask = uni.connectSocket({
        url: wsUrl,
        success: () => console.log('✅ connectSocket 调用成功'),
        fail: (err) => {
            console.error('❌ connectSocket 调用失败', err)
            isConnecting = false
        }
    })

    socketTask.onOpen(() => {
        console.log('✅ WebSocket 连接已打开')
        isConnected = true
        isConnecting = false
        
        // 1. Engine.IO 握手后，必须发送一次 "40" 表示连接到默认的 Namespace (socket.io 协议)
        socketTask.send({ data: '40' })

        // 2. 发送自定义的 register 事件绑定 userId
        const registerMessage = `42["register","${userId}"]`
        socketTask.send({ data: registerMessage })

        // 3. 开启心跳机制 (Engine.IO v4 需要客户端每隔 25 秒发一次 '3' ping)
        startHeartbeat()
    })

    socketTask.onMessage((res) => {
        const data = res.data
        // console.log('收到 WebSocket 原始消息:', data)
        
        // 收到服务器的 '2' (ping) 或 '3' (pong)，无需处理，只要不断开就行
        if (data === '2' || data === '3') return

        // 解析 Socket.io 的消息格式 42["event_name", data]
        if (typeof data === 'string' && data.startsWith('42[')) {
            try {
                const parsed = JSON.parse(data.slice(2))
                const eventName = parsed[0]
                const eventData = parsed[1]

                if (eventName === 'new_message') {
                    handleNewMessage(eventData)
                }
            } catch (e) {
                console.error('解析 WebSocket 消息失败', e)
            }
        }
    })

    socketTask.onClose(() => {
        console.log('❌ WebSocket 连接已关闭')
        isConnected = false
        isConnecting = false
        stopHeartbeat()
        scheduleReconnect(userId)
    })

    socketTask.onError((err) => {
        console.error('⚠️ WebSocket 发生错误', err)
        isConnected = false
        isConnecting = false
        stopHeartbeat()
    })
}

// 维持 Socket.io (Engine.IO) 的心跳
const startHeartbeat = () => {
    stopHeartbeat()
    pingTimer = setInterval(() => {
        if (isConnected && socketTask) {
            // 发送 '3' 代表 Engine.IO 的 ping包
            socketTask.send({ data: '3' })
        }
    }, 20000) // 每 20 秒发一次心跳
}

const stopHeartbeat = () => {
    if (pingTimer) {
        clearInterval(pingTimer)
        pingTimer = null
    }
}

// 处理新消息提醒
const handleNewMessage = (msg) => {
    // 1. 全局震动提醒
    uni.vibrateShort()

    // 2. 全局顶部通知弹窗
    uni.showToast({
        title: msg.content || '您有一条新通知',
        icon: 'none',
        duration: 3000
    })

    // 3. 更新 TabBar 小红点
    // 这里简单粗暴地向后端拉取最新未读数量并更新
    const userId = uni.getStorageSync('userId')
    if (userId) {
        uni.request({
            url: `${BASE_URL}/api/message/unread-count?userId=${userId}`,
            header: { 'Authorization': `Bearer ${uni.getStorageSync('token')}` },
            success: (res) => {
                if (res.data && res.data.code === 200 && res.data.data) {
                    const count = res.data.data.count
                    if (count > 0) {
                        try {
                            uni.setTabBarBadge({
                                index: 1, // pages.json 中配置的消息 Tab 是第 2 个 (索引 1)
                                text: String(count > 99 ? '99+' : count)
                            })
                        } catch (e) {
                            // 非 TabBar 页面可能会抛出异常，忽略即可
                        }
                    }
                }
            }
        })
    }
}

// 断线重连机制
const scheduleReconnect = (userId) => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => {
        console.log('🔄 尝试重新连接 WebSocket...')
        connectWebSocket(userId)
    }, 5000) // 5秒后重连
}

export const closeWebSocket = () => {
    if (socketTask) {
        socketTask.close()
        socketTask = null
    }
    if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
    }
    isConnected = false
}