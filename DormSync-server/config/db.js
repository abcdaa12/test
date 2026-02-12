/**
 * config/db.js - MongoDB 数据库连接
 * 使用 Mongoose 连接 MongoDB，连接地址从 .env 的 MONGO_URL 读取
 * 默认连接本地 dormSync 数据库
 */
const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URL || 'mongodb://localhost:27017/dormSync'
        const conn = await mongoose.connect(uri)
        console.log(`✅ MongoDB 连接成功: ${conn.connection.host}/${conn.connection.name}`)
    } catch (error) {
        console.error(`❌ MongoDB 连接失败: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB
