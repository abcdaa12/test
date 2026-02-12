/**
 * controllers/dormController.js - 宿舍相关业务逻辑
 * 接口：获取宿舍信息、查看成员、宿舍长选举、离开宿舍、邀请新成员
 */
const Dorm = require('../models/Dorm')
const User = require('../models/User')

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
        await User.findByIdAndUpdate(userId, { role: 'leader' })

        res.json({ code: 200, msg: '宿舍长选举成功', data: null })
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

        // 清除用户的宿舍关联，角色重置为普通成员
        await User.findByIdAndUpdate(userId, { dormId: null, role: 'member' })

        res.json({ code: 200, msg: '已离开宿舍', data: null })
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
