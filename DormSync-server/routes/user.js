/**
 * routes/user.js - 用户相关路由
 * 前缀：/api/user
 *
 * /login   - 无需鉴权（登录入口）
 * /info    - 需要鉴权（从令牌解析 userId）
 * /update  - 需要鉴权
 */
const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const userController = require('../controllers/userController')
const { authMiddleware } = require('../middlewares/jwt')

// 头像上传配置
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.png'
        cb(null, `avatar_${Date.now()}${ext}`)
    }
})
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } })

// 微信登录（无需鉴权）
router.post('/login', userController.login)

// 获取用户个人信息（需要鉴权）
router.get('/info', authMiddleware, userController.getUserInfo)

// 修改用户个人信息（需要鉴权）
router.put('/update', authMiddleware, userController.updateUserInfo)

// 上传头像
router.post('/upload-avatar', upload.single('file'), userController.uploadAvatar)

module.exports = router
