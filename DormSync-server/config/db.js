/**
 * config/db.js - MongoDB 数据库连接配置
 * 使用 Mongoose 连接 MongoDB，支持 .env 环境变量配置
 */
const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`✅ MongoDB 连接成功: ${conn.connection.host}`)
    } catch (error) {
        console.error(`❌ MongoDB 连接失败: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB
