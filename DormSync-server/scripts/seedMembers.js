/**
 * 模拟成员数据初始化脚本
 * 运行方式：node scripts/seedMembers.js
 * 功能：创建模拟宿舍成员并加入当前宿舍
 */
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Dorm = require('../models/Dorm')

const mockMembers = [
    { nickname: '张三', signature: '早睡早起身体好', phone: '13800000001', class: '计算机2301' },
    { nickname: '李四', signature: '代码改变世界', phone: '13800000002', class: '计算机2301' },
    { nickname: '王五', signature: '今天也要加油鸭', phone: '13800000003', class: '计算机2302' }
]

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log('✅ 数据库连接成功')

        // 找到第一个宿舍（你创建的那个）
        const dorm = await Dorm.findOne().sort({ createdAt: 1 })
        if (!dorm) {
            console.log('❌ 没有找到宿舍，请先创建一个宿舍')
            process.exit(1)
        }
        console.log(`📍 找到宿舍：${dorm.dormNumber} (${dorm._id})`)

        for (const m of mockMembers) {
            // 检查是否已存在（按手机号判断）
            let user = await User.findOne({ phone: m.phone })
            if (user) {
                console.log(`⏭️  ${m.nickname} 已存在，跳过`)
            } else {
                user = await User.create({
                    openid: `mock_${m.phone}`,
                    nickname: m.nickname,
                    signature: m.signature,
                    phone: m.phone,
                    class: m.class,
                    dormId: dorm._id,
                    role: 'member'
                })
                console.log(`✅ 创建成员：${m.nickname}`)
            }

            // 确保加入宿舍
            if (!dorm.members.map(id => id.toString()).includes(user._id.toString())) {
                dorm.members.push(user._id)
                console.log(`➕ ${m.nickname} 加入宿舍`)
            }
        }

        await dorm.save()
        console.log(`\n🎉 完成！宿舍 ${dorm.dormNumber} 现在有 ${dorm.members.length} 个成员`)

        // 显示所有成员
        const allMembers = await User.find({ dormId: dorm._id }, 'nickname phone role')
        allMembers.forEach(u => console.log(`   - ${u.nickname} (${u.phone || '宿舍长'}) [${u.role}]`))

    } catch (err) {
        console.error('❌ 出错了:', err.message)
    } finally {
        await mongoose.disconnect()
        process.exit(0)
    }
}

seed()
