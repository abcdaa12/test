<template>
	<!-- 我的页面：个人信息、操作区 -->
	<view class="page">
		<!-- 顶部个人信息区（蓝色背景，紧接原生导航栏下方） -->
		<view class="profile-header">
			<!-- 头像：有 avatarUrl 时显示图片，否则显示默认图标 -->
			<view class="avatar-wrap">
				<image
					v-if="userInfo.avatarUrl"
					class="avatar-img"
					:src="userInfo.avatarUrl"
					mode="aspectFill"
				/>
				<text v-else class="avatar-icon">👤</text>
			</view>
			<!-- 昵称 -->
			<text class="profile-name">{{ userInfo.nickname }}</text>
			<!-- 个性签名 -->
			<text class="profile-sign">{{ userInfo.signature || '这个人很懒，什么都没写~' }}</text>
		</view>

		<view class="container">
			<!-- 未登录时显示登录按钮 -->
			<view v-if="!loggedIn" class="login-card">
				<text class="login-tip">您尚未登录，请先登录以使用完整功能</text>
				<button class="btn-login" @tap="handleLogin">微信一键登录</button>
			</view>

			<!-- 已登录时显示个人信息 -->
			<view v-else>
				<!-- 个人信息区 -->
				<view class="info-card">
					<view class="info-item">
						<text class="info-icon">📱</text>
						<view class="info-content">
							<text class="info-label">电话</text>
							<text class="info-value">{{ userInfo.phone || '未设置' }}</text>
						</view>
					</view>
					<view class="info-item">
						<text class="info-icon">🎓</text>
						<view class="info-content">
							<text class="info-label">班级</text>
							<text class="info-value">{{ userInfo.className || '未设置' }}</text>
						</view>
					</view>
				</view>

				<!-- 操作区 -->
				<view class="action-section">
					<view class="action-btn" @tap="editProfile">
						<text class="action-text">修改个人信息</text>
					</view>
					<view class="action-btn logout-btn" @tap="logout">
						<text class="action-text logout-text">退出登录</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
/**
 * 我的页面
 * - 自动从本地存储读取用户信息
 * - 未登录时显示登录按钮，点击触发微信登录
 * - 已登录时显示头像、昵称、个人信息
 * - 退出登录清除本地登录态
 */
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { wxLogin, isLoggedIn, getLocalUserInfo, clearAuth } from '../../utils/auth.js'

// 登录状态
const loggedIn = ref(false)

// 用户信息（响应式对象）
const userInfo = reactive({
	nickname: '宿舍成员',
	avatarUrl: '',
	signature: '',
	phone: '',
	className: ''
})

/**
 * 从本地存储加载用户信息
 */
const loadUserInfo = () => {
	loggedIn.value = isLoggedIn()
	if (loggedIn.value) {
		const info = getLocalUserInfo()
		userInfo.nickname = info.nickname || '宿舍成员'
		userInfo.avatarUrl = info.avatarUrl || ''
		userInfo.signature = info.signature || ''
		userInfo.phone = info.phone || ''
		userInfo.className = info.className || ''
	}
}

/**
 * 手动触发微信登录（未登录时点击按钮）
 */
const handleLogin = async () => {
	try {
		const info = await wxLogin()
		// 登录成功，刷新页面数据
		loadUserInfo()
		uni.showToast({ title: '登录成功', icon: 'success' })
	} catch (err) {
		console.error('手动登录失败：', err)
		// wxLogin 内部已有 toast 提示，此处不重复
	}
}

/** 修改个人信息 */
const editProfile = () => {
	uni.navigateTo({ url: '/pages/profile-edit/profile-edit' })
}

/** 退出登录 */
const logout = () => {
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				// 清除所有本地登录态
				clearAuth()
				// 重置页面状态
				loggedIn.value = false
				userInfo.nickname = '宿舍成员'
				userInfo.avatarUrl = ''
				userInfo.signature = ''
				userInfo.phone = ''
				userInfo.className = ''
				uni.showToast({ title: '已退出登录', icon: 'none' })
			}
		}
	})
}

/**
 * 每次页面显示时刷新用户信息
 * 处理场景：从其他页面返回、App.vue 自动登录完成后切到此页
 */
onShow(() => {
	loadUserInfo()
})
</script>

<style scoped>
.page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

/* 顶部个人信息区 */
.profile-header {
	background-color: #1677FF;
	padding: 40rpx 30rpx 50rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.avatar-wrap {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20rpx;
	overflow: hidden;
}
.avatar-img {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
}
.avatar-icon {
	font-size: 70rpx;
}
.profile-name {
	color: #fff;
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
}
.profile-sign {
	color: rgba(255, 255, 255, 0.8);
	font-size: 26rpx;
}

.container {
	padding: 24rpx;
	margin-top: -20rpx;
}

/* 未登录提示卡片 */
.login-card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 48rpx 32rpx;
	text-align: center;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}
.login-tip {
	font-size: 28rpx;
	color: #999;
	display: block;
	margin-bottom: 32rpx;
}
.btn-login {
	background-color: #1677FF;
	color: #fff;
	border-radius: 12rpx;
	font-size: 30rpx;
	height: 80rpx;
	line-height: 80rpx;
}

/* 信息卡片 */
.info-card {
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	margin-bottom: 32rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}
.info-item {
	display: flex;
	align-items: center;
	padding: 28rpx 24rpx;
	border-bottom: 1rpx solid #f5f5f5;
}
.info-item:last-child {
	border-bottom: none;
}
.info-icon {
	font-size: 36rpx;
	margin-right: 20rpx;
	flex-shrink: 0;
}
.info-content {
	flex: 1;
}
.info-label {
	font-size: 24rpx;
	color: #999;
	display: block;
	margin-bottom: 4rpx;
}
.info-value {
	font-size: 30rpx;
	color: #333;
}

/* 操作区 */
.action-section {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}
.action-btn {
	background-color: #fff;
	border: 2rpx solid #1677FF;
	border-radius: 12rpx;
	padding: 24rpx;
	text-align: center;
}
.action-btn:active {
	background-color: #f0f7ff;
}
.action-text {
	font-size: 30rpx;
	color: #1677FF;
}
.logout-btn {
	border-color: #ff4d4f;
}
.logout-text {
	color: #ff4d4f;
}
</style>
