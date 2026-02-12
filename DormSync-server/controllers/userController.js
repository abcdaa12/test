/**
 * controllers/userController.js - 用户相关业务逻辑
 * 接口：微信登录、获取用户信息、修改用户信息
 */
const axios = require('axios')
const User = require('../models/User')
const { generateToken } = require('../middlewares/jwt')

/**
 * 微信登录
 * POST /api/user/login
 * Body: { code }
 *
 * 流程：
 *   1. 用 code + AppID + AppSecret 调用微信 jscode2session 接口获取 openid
 *   2. 根据 openid 查找用户，不存在则自动创建新用户
 *   3. 生成 JWT 令牌（有效期 7 天），返回令牌 + 用户信息
 */
exports.login = async (req, res, next) => {
    try {
        const { code } = req.body
        if (!code) {
            return res.json({ code: 400, msg: '缺少参数 code', data: null })
        }

        // ---- 第一步：调用微信接口获取 openid ----
        const wxUrl = 'https://api.weixin.qq.com/sns/jscode2session'
        let openid
        try {
            const wxRes = await axios.get(wxUrl, {
                params: {
                    appid: process.env.WX_APPID,
                    secret: process.env.WX_SECRET,
                    js_code: code,
                    grant_type: 'authorization_code'
                }
            })

            if (wxRes.data.errcode) {
                return res.json({
                    code: 500,
                    msg: `微信登录失败: ${wxRes.data.errmsg}`,
                    data: null
                })
            }

            openid = wxRes.data.openid
        } catch (wxErr) {
            return res.json({
                code: 500,
                msg: '调用微信接口失败，请稍后重试',
                data: null
            })
        }

        // ---- 第二步：查找或创建用户 ----
        let user = await User.findOne({ openid })
        if (!user) {
            // 新用户，自动创建（默认昵称 "宿舍成员"，默认头像）
            user = await User.create({
                openid,
                nickname: '宿舍成员',
                avatar: '',
                signature: '',
                role: 'member'
            })
        }

        // ---- 第三步：生成 JWT 令牌 ----
        const token = generateToken({
            userId: user._id.toString(),
            openid: user.openid
        })

        res.json({
            code: 200,
            msg: '登录成功',
            data: {
                token,
                userInfo: {
                    _id: user._id,
                    openid: user.openid,
                    nickname: user.nickname,
                    avatar: user.avatar,
                    signature: user.signature,
                    phone: user.phone,
                    class: user.class,
                    dormId: user.dormId,
                    role: user.role
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

/**
 * 获取用户个人信息
 * GET /api/user/info
 * 优先从令牌中获取 userId（req.userId），也兼容 query 参数传入
 */
exports.getUserInfo = async (req, res, next) => {
    try {
        // 优先使用令牌中的 userId，兼容 query 传参
        const userId = req.userId || req.query.userId
        if (!userId) {
            return res.json({ code: 400, msg: '缺少参数 userId', data: null })
        }

        const user = await User.findById(userId).populate('dormId', 'dormNumber')
        if (!user) {
            return res.json({ code: 404, msg: '用户不存在', data: null })
        }

        res.json({ code: 200, msg: '查询成功', data: user })
    } catch (err) {
        next(err)
    }
}

/**
 * 修改用户个人信息
 * PUT /api/user/update
 * Body: { avatar?, nickname?, signature?, phone?, class? }
 * userId 自动从令牌中获取，也兼容 body 传入
 */
exports.updateUserInfo = async (req, res, next) => {
    try {
        const userId = req.userId || req.body.userId
        if (!userId) {
            return res.json({ code: 400, msg: '缺少参数 userId', data: null })
        }

        const { avatar, nickname, signature, phone, class: className } = req.body

        // 构建更新对象，只更新传入的字段
        const updateData = {}
        if (avatar !== undefined) updateData.avatar = avatar
        if (nickname !== undefined) updateData.nickname = nickname
        if (signature !== undefined) updateData.signature = signature
        if (phone !== undefined) updateData.phone = phone
        if (className !== undefined) updateData.class = className

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
        if (!user) {
            return res.json({ code: 404, msg: '用户不存在', data: null })
        }

        res.json({ code: 200, msg: '修改成功', data: user })
    } catch (err) {
        next(err)
    }
}

/**
 * 上传头像
 * POST /api/user/upload-avatar
 * FormData: file
 */
exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.json({ code: 400, msg: '请选择图片', data: null })
        }
        // 返回可访问的图片 URL
        const avatarUrl = `/uploads/${req.file.filename}`
        res.json({ code: 200, msg: '上传成功', data: { url: avatarUrl } })
    } catch (err) {
        next(err)
    }
}
