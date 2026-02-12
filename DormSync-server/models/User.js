/**
 * models/User.js - 用户模型
 * 存储用户个人信息，关联所属宿舍
 * openid 为微信登录唯一标识，作为用户身份凭证
 */
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    // 微信 openid（唯一标识，登录时写入）
    openid: { type: String, unique: true, sparse: true },
    // 头像地址
    avatar: { type: String, default: '' },
    // 昵称（新用户默认 "宿舍成员"）
    nickname: { type: String, default: '宿舍成员', trim: true },
    // 个性签名
    signature: { type: String, default: '' },
    // 电话
    phone: { type: String, default: '' },
    // 班级
    class: { type: String, default: '' },
    // 所属宿舍ID
    dormId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dorm', default: null },
    // 角色：member-普通成员 leader-宿舍长
    role: { type: String, enum: ['member', 'leader'], default: 'member' },
    // 创建时间
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)
