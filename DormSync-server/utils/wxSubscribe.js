/**
 * utils/wxSubscribe.js - 微信订阅消息推送工具
 * 
 * 使用前需要在微信公众平台 (mp.weixin.qq.com) 配置订阅消息模板：
 * 1. 登录小程序后台 → 功能 → 订阅消息
 * 2. 选择/创建以下模板，获取 templateId 填入下方常量
 * 
 * 模板类型建议：
 * - TEMPLATE_DUTY_REMINDER: 值日提醒（如"任务提醒"类模板，包含：任务名称、时间、备注）
 * - TEMPLATE_DORM_ACTIVITY: 宿舍动态（如"活动通知"类模板，包含：活动名称、内容、时间）
 * - TEMPLATE_FINANCE:       费用通知（如"缴费提醒"类模板，包含：费用名称、金额、时间）
 */
const https = require('https')

// ========== 模板ID配置（请替换为你在微信后台申请的真实模板ID）==========
const TEMPLATE_DUTY_REMINDER = 'YOUR_DUTY_REMINDER_TEMPLATE_ID'   // 值日/排班提醒
const TEMPLATE_DORM_ACTIVITY = 'YOUR_DORM_ACTIVITY_TEMPLATE_ID'   // 宿舍动态（加入/退出/选举/公告）
const TEMPLATE_FINANCE = 'YOUR_FINANCE_TEMPLATE_ID'         // 费用通知
// ====================================================================

// access_token 缓存
let tokenCache = { token: '', expiresAt: 0 }

/**
 * 获取微信 access_token（自动缓存，有效期内不重复请求）
 */
async function getAccessToken() {
    if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
        return tokenCache.token
    }

    const appid = process.env.WX_APPID
    const secret = process.env.WX_SECRET

    return new Promise((resolve, reject) => {
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
        https.get(url, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try {
                    const json = JSON.parse(data)
                    if (json.access_token) {
                        tokenCache.token = json.access_token
                        // 提前5分钟过期，避免边界问题
                        tokenCache.expiresAt = Date.now() + (json.expires_in - 300) * 1000
                        resolve(json.access_token)
                    } else {
                        console.error('获取access_token失败:', json)
                        reject(new Error(json.errmsg || 'get access_token failed'))
                    }
                } catch (e) { reject(e) }
            })
        }).on('error', reject)
    })
}

/**
 * 发送订阅消息
 * @param {string} openid - 用户的 openid
 * @param {string} templateId - 模板ID
 * @param {object} data - 模板数据，格式 { key: { value: 'xxx' } }
 * @param {string} [page] - 点击消息跳转的页面路径
 */
async function sendSubscribeMessage(openid, templateId, data, page) {
    if (!openid || templateId.startsWith('YOUR_')) {
        console.warn('[wxSubscribe] 跳过发送：openid为空或模板ID未配置')
        return
    }

    try {
        const accessToken = await getAccessToken()
        const postData = JSON.stringify({
            touser: openid,
            template_id: templateId,
            page: page || '',
            data
        })

        return new Promise((resolve, reject) => {
            const req = https.request({
                hostname: 'api.weixin.qq.com',
                path: `/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, (res) => {
                let body = ''
                res.on('data', chunk => body += chunk)
                res.on('end', () => {
                    try {
                        const json = JSON.parse(body)
                        if (json.errcode === 0) {
                            console.log(`[wxSubscribe] 发送成功 -> ${openid}`)
                        } else {
                            // 43101 = 用户未订阅，属于正常情况
                            if (json.errcode !== 43101) {
                                console.warn(`[wxSubscribe] 发送失败:`, json)
                            }
                        }
                        resolve(json)
                    } catch (e) { reject(e) }
                })
            })
            req.on('error', reject)
            req.write(postData)
            req.end()
        })
    } catch (err) {
        console.error('[wxSubscribe] 发送异常:', err.message)
    }
}

/**
 * 批量发送值日提醒
 * @param {Array} users - [{ openid, personName, date, weekday }]
 */
async function sendDutyReminder(users) {
    for (const u of users) {
        if (!u.openid) continue
        await sendSubscribeMessage(u.openid, TEMPLATE_DUTY_REMINDER, {
            thing1: { value: `值日提醒：${u.personName}` },
            time2: { value: u.date },
            thing3: { value: `${u.weekday} 轮到你值日，请按时完成` }
        }, '/pages/schedule/schedule')
    }
}

/**
 * 批量发送宿舍动态通知
 * @param {Array} openids - 用户openid数组
 * @param {string} activityName - 动态名称（如"新成员加入"）
 * @param {string} content - 动态内容
 */
async function sendDormActivity(openids, activityName, content) {
    for (const openid of openids) {
        if (!openid) continue
        await sendSubscribeMessage(openid, TEMPLATE_DORM_ACTIVITY, {
            thing1: { value: activityName.slice(0, 20) },
            thing2: { value: content.slice(0, 20) },
            time3: { value: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) }
        }, '/pages/message/message')
    }
}

/**
 * 批量发送费用通知
 * @param {Array} openids - 用户openid数组
 * @param {string} title - 费用名称
 * @param {number} amount - 金额
 */
async function sendFinanceNotify(openids, title, amount) {
    for (const openid of openids) {
        if (!openid) continue
        await sendSubscribeMessage(openid, TEMPLATE_FINANCE, {
            thing1: { value: title.slice(0, 20) },
            amount2: { value: `¥${amount}` },
            time3: { value: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) }
        }, '/pages/fee/fee')
    }
}

module.exports = {
    TEMPLATE_DUTY_REMINDER,
    TEMPLATE_DORM_ACTIVITY,
    TEMPLATE_FINANCE,
    getAccessToken,
    sendSubscribeMessage,
    sendDutyReminder,
    sendDormActivity,
    sendFinanceNotify
}
