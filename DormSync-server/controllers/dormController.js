/**
 * controllers/dormController.js - 宿舍相关业务逻辑
 * 接口：获取宿舍信息、查看成员、宿舍长选举、离开宿舍、邀请新成员
 */
const Dorm = require('../models/Dorm')
const User = require('../models/User')
const { createNotification } = require('./messageController')

/**
 * 获取宿舍信息（宿舍号、公告）
 * GET /api/dorm/info?dormId=xxx
 */
exports.getDormInfo = async (req, res, next) => {
    try {
        const { dormId } = req.query
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null })
        }

        const dorm = await Dorm.findById(dormId)
        if (!dorm) {
            return res.json({ code: 404, msg: '宿舍不存在', data: null })
        }

        res.json({ code: 200, msg: '查询成功', data: dorm })
    } catch (err) {
        next(err)
    }
}

/**
 * 查看宿舍成员列表
 * GET /api/dorm/members?dormId=xxx
 */
exports.getDormMembers = async (req, res, next) => {
    try {
        const { dormId } = req.query
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null })
        }

        const dorm = await Dorm.findById(dormId).populate('members', 'nickname avatar phone role class')
        if (!dorm) {
            return res.json({ code: 404, msg: '宿舍不存在', data: null })
        }

        res.json({ code: 200, msg: '查询成功', data: dorm.members })
    } catch (err) {
        next(err)
    }
}

/**
 * 宿舍长选举（将指定用户设为宿舍长，原宿舍长降为普通成员）
 * POST /api/dorm/elect
 * Body: { dormId, userId }
 */
exports.electLeader = async (req, res, next) => {
    try {
        const { dormId, userId } = req.body
        if (!dormId || !userId) {
            return res.json({ code: 400, msg: '缺少参数 dormId 或 userId', data: null })
        }

        const dorm = await Dorm.findById(dormId)
        if (!dorm) {
            return res.json({ code: 404, msg: '宿舍不存在', data: null })
        }

        // 检查该用户是否是宿舍成员
        if (!dorm.members.map(id => id.toString()).includes(userId)) {
            return res.json({ code: 400, msg: '该用户不是本宿舍成员', data: null })
        }

        // 将原宿舍长降为普通成员
        await User.updateMany(
            { dormId: dormId, role: 'leader' },
            { role: 'member' }
        )

        // 将目标用户设为宿舍长
        const newLeader = await User.findByIdAndUpdate(userId, { role: 'leader' }, { new: true })

        res.json({ code: 200, msg: '宿舍长选举成功', data: null })

        // 异步通知：宿舍长变更
        try {
            const allMembers = dorm.members.map(id => id.toString())
            await createNotification({
                userIds: allMembers,
                type: 'dorm',
                content: `宿舍长已变更为 ${newLeader.nickname}`
            })
        } catch (e) { console.error('选举通知失败', e) }
    } catch (err) {
        next(err)
    }
}

/**
 * 离开宿舍
 * POST /api/dorm/leave
 * Body: { dormId, userId }
 */
exports.leaveDorm = async (req, res, next) => {
    try {
        const { dormId, userId } = req.body
        if (!dormId || !userId) {
            return res.json({ code: 400, msg: '缺少参数 dormId 或 userId', data: null })
        }

        // 从宿舍成员列表中移除
        await Dorm.findByIdAndUpdate(dormId, { $pull: { members: userId } })

        const leavingUser = await User.findById(userId)
        const leavingName = leavingUser ? leavingUser.nickname : '某成员'

        // 清除用户的宿舍关联，角色重置为普通成员
        await User.findByIdAndUpdate(userId, { dormId: null, role: 'member' })

        res.json({ code: 200, msg: '已离开宿舍', data: null })

        // 异步通知：成员退出
        try {
            const dorm = await Dorm.findById(dormId)
            if (dorm && dorm.members.length > 0) {
                const remainIds = dorm.members.map(id => id.toString())
                await createNotification({
                    userIds: remainIds,
                    type: 'dorm',
                    content: `${leavingName} 已离开宿舍`
                })
            }
        } catch (e) { console.error('退出通知失败', e) }
    } catch (err) {
        next(err)
    }
}

/**
 * 邀请新成员（通过手机号查找用户并加入宿舍）
 * POST /api/dorm/invite
 * Body: { dormId, phone }
 */
exports.inviteMember = async (req, res, next) => {
    try {
        const { dormId, phone } = req.body
        if (!dormId || !phone) {
            return res.json({ code: 400, msg: '缺少参数 dormId 或 phone', data: null })
        }

        // 根据手机号查找用户
        const user = await User.findOne({ phone })
        if (!user) {
            return res.json({ code: 404, msg: '未找到该手机号对应的用户', data: null })
        }

        // 检查用户是否已有宿舍
        if (user.dormId) {
            return res.json({ code: 400, msg: '该用户已加入其他宿舍', data: null })
        }

        // 将用户加入宿舍
        await Dorm.findByIdAndUpdate(dormId, { $addToSet: { members: user._id } })
        await User.findByIdAndUpdate(user._id, { dormId })

        res.json({ code: 200, msg: '邀请成功', data: { userId: user._id, nickname: user.nickname } })
    } catch (err) {
        next(err)
    }
}

/**
 * 创建宿舍
 * POST /api/dorm/create
 * Body: { dormNumber }
 * 创建者自动成为宿舍长
 */
exports.createDorm = async (req, res, next) => {
    try {
        const userId = req.userId
        const { dormNumber } = req.body
        if (!dormNumber) {
            return res.json({ code: 400, msg: '请输入宿舍号', data: null })
        }

        // 检查用户是否已有宿舍
        const user = await User.findById(userId)
        if (user.dormId) {
            return res.json({ code: 400, msg: '你已加入宿舍，无法重复创建', data: null })
        }

        // 检查宿舍号是否已存在
        const existing = await Dorm.findOne({ dormNumber: dormNumber.trim() })
        if (existing) {
            return res.json({ code: 400, msg: '该宿舍号已存在，请直接加入', data: null })
        }

        // 创建宿舍
        const dorm = await Dorm.create({
            dormNumber: dormNumber.trim(),
            notice: '',
            members: [userId],
            creator: userId
        })

        // 更新用户：关联宿舍 + 设为宿舍长
        await User.findByIdAndUpdate(userId, { dormId: dorm._id, role: 'leader' })

        res.json({ code: 200, msg: '宿舍创建成功', data: { dormId: dorm._id, dormNumber: dorm.dormNumber } })
    } catch (err) {
        next(err)
    }
}

/**
 * 通过宿舍号加入宿舍
 * POST /api/dorm/join
 * Body: { dormNumber }
 */
exports.joinDorm = async (req, res, next) => {
    try {
        const userId = req.userId
        const { dormNumber } = req.body
        if (!dormNumber) {
            return res.json({ code: 400, msg: '请输入宿舍号', data: null })
        }

        // 检查用户是否已有宿舍
        const user = await User.findById(userId)
        if (user.dormId) {
            return res.json({ code: 400, msg: '你已加入宿舍，无法重复加入', data: null })
        }

        // 查找宿舍
        const dorm = await Dorm.findOne({ dormNumber: dormNumber.trim() })
        if (!dorm) {
            return res.json({ code: 404, msg: '未找到该宿舍，请检查宿舍号', data: null })
        }

        // 加入宿舍
        await Dorm.findByIdAndUpdate(dorm._id, { $addToSet: { members: userId } })
        await User.findByIdAndUpdate(userId, { dormId: dorm._id, role: 'member' })

        res.json({ code: 200, msg: '加入宿舍成功', data: { dormId: dorm._id, dormNumber: dorm.dormNumber } })

        // 异步通知：新成员加入
        try {
            const existingMembers = dorm.members.map(id => id.toString())
            if (existingMembers.length > 0) {
                await createNotification({
                    userIds: existingMembers,
                    type: 'dorm',
                    content: `${user.nickname} 加入了宿舍`
                })
            }
        } catch (e) { console.error('加入通知失败', e) }
    } catch (err) {
        next(err)
    }
}

/**
 * 更新宿舍公告
 * PUT /api/dorm/notice
 * Body: { dormId, notice }
 */
exports.updateNotice = async (req, res, next) => {
    try {
        const { dormId, notice } = req.body
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null })
        }

        const dorm = await Dorm.findByIdAndUpdate(dormId, { notice: notice || '' }, { new: true })
        if (!dorm) {
            return res.json({ code: 404, msg: '宿舍不存在', data: null })
        }

        res.json({ code: 200, msg: '公告更新成功', data: dorm })

        // 异步通知：新公告
        try {
            const memberIds = dorm.members.map(id => id.toString())
            await createNotification({
                userIds: memberIds,
                type: 'announce',
                content: `宿舍公告已更新：${(notice || '').slice(0, 30)}`
            })
        } catch (e) { console.error('公告通知失败', e) }
    } catch (err) {
        next(err)
    }
}
