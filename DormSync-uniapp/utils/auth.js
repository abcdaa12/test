/**
 * auth.js - 微信登录与用户认证工具
 */
import { post, BASE_URL } from './request'

const DEFAULT_USER_INFO = {
    nickname: '宿舍成员',
    avatarUrl: '',
    openid: ''
}

/**
 * 把服务器头像下载到本地永久文件
 * @param {string} serverPath - 服务器相对路径如 /uploads/avatar_xxx.jpg
 * @returns {Promise<string>} 本地永久文件路径
 */
const downloadAvatarToLocal = (serverPath) => {
    const url = serverPath.startsWith('http') ? serverPath : BASE_URL + serverPath
    return new Promise((resolve) => {
        uni.downloadFile({
            url,
            success: (res) => {
                if (res.statusCode === 200 && res.tempFilePath) {
                    resolve(res.tempFilePath)
                } else {
                    resolve('')
                }
            },
            fail: () => resolve('')
        })
    })
}

/**
 * 执行微信登录流程
 */
export const wxLogin = () => {
    return new Promise((resolve, reject) => {
        uni.login({
            provider: 'weixin',
            success: async (loginRes) => {
                if (!loginRes.code) {
                    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
                    reject(new Error('wx.login 未获取到 code'))
                    return
                }

                try {
                    const res = await post('/api/user/login', { code: loginRes.code })

                    if (res.code === 200 && res.data) {
                        const { token, userInfo } = res.data

                        // 如果数据库有头像，下载到本地
                        let avatarUrl = ''
                        if (userInfo.avatar) {
                            avatarUrl = await downloadAvatarToLocal(userInfo.avatar)
                        }

                        const finalUserInfo = {
                            _id: userInfo._id || '',
                            openid: userInfo.openid || '',
                            nickname: userInfo.nickname || DEFAULT_USER_INFO.nickname,
                            avatarUrl,
                            avatarServer: userInfo.avatar || '',
                            phone: userInfo.phone || '',
                            className: userInfo.class || '',
                            signature: userInfo.signature || ''
                        }

                        uni.setStorageSync('token', token)
                        uni.setStorageSync('userInfo', finalUserInfo)
                        uni.setStorageSync('userId', userInfo._id || '')

                        console.log('登录成功：', finalUserInfo.nickname, '头像:', avatarUrl)
                        resolve(finalUserInfo)
                    } else {
                        uni.showToast({ title: res.message || '登录失败', icon: 'none' })
                        reject(new Error(res.message || '后端返回异常'))
                    }
                } catch (err) {
                    console.error('登录接口调用失败：', err)
                    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
                    reject(err)
                }
            },
            fail: (err) => {
                console.error('wx.login 调用失败：', err)
                uni.showToast({ title: '登录失败，请重试', icon: 'none' })
                reject(err)
            }
        })
    })
}

export const isLoggedIn = () => {
    return !!uni.getStorageSync('token')
}

export const getLocalUserInfo = () => {
    return uni.getStorageSync('userInfo') || { ...DEFAULT_USER_INFO }
}

export const clearAuth = () => {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('userId')
}
