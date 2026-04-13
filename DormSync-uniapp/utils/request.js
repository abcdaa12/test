/**
 * request.js - 统一网络请求封装
 * 基于 uni.request 封装，包含请求/响应拦截、错误提示
 * 基础地址：http://localhost:3000
 */

// 后端接口基础地址
export const BASE_URL = 'http://192.168.5.5:3000'

// 请求超时时间（毫秒）
const TIMEOUT = 60000

/**
 * 封装的请求方法
 * @param {Object} options - 请求配置
 * @param {string} options.url - 接口路径（不含基础地址）
 * @param {string} options.method - 请求方法，默认 GET
 * @param {Object} options.data - 请求参数
 * @param {Object} options.header - 自定义请求头
 * @returns {Promise} 返回 Promise 对象
 */
const request = (options = {}) => {
    return new Promise((resolve, reject) => {
        // ========== 请求拦截 ==========
        // 合并默认请求头
        const header = {
            'Content-Type': 'application/json',
            ...options.header
        }

        // 从本地存储获取 token，自动附加到请求头
        const token = uni.getStorageSync('token')
        if (token) {
            header['Authorization'] = `Bearer ${token}`
        }

        // 发起请求
        uni.request({
            url: BASE_URL + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header,
            timeout: TIMEOUT,
            success: (res) => {
                // ========== 响应拦截 ==========
                const { statusCode, data } = res

                if (statusCode >= 200 && statusCode < 300) {
                    // 请求成功，返回数据
                    resolve(data)
                } else if (statusCode === 401) {
                    // 令牌过期或无效，清除本地登录态并提示重新登录
                    uni.removeStorageSync('token')
                    uni.removeStorageSync('userInfo')
                    uni.removeStorageSync('userId')
                    uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
                    // 延迟跳转到"我的"页面触发重新登录
                    setTimeout(() => {
                        uni.switchTab({ url: '/pages/mine/mine' })
                    }, 1500)
                    reject(res)
                } else {
                    // 其他错误
                    uni.showToast({
                        title: data.message || '请求失败',
                        icon: 'none'
                    })
                    reject(res)
                }
            },
            fail: (err) => {
                // 网络错误处理
                uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
                reject(err)
            }
        })
    })
}

// 导出便捷方法
export const get = (url, data) => request({ url, method: 'GET', data })
export const post = (url, data) => request({ url, method: 'POST', data })
export const put = (url, data) => request({ url, method: 'PUT', data })
export const del = (url, data) => request({ url, method: 'DELETE', data })

export default request
