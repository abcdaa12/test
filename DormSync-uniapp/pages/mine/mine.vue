<template>
	<!-- 我的页面：个人信息、操作区 -->
	<view class="page">
		<!-- 顶部个人信息区（蓝色背景） -->
		<view class="profile-header">
			<!-- 头像 -->
			<view class="avatar-wrap">
				<text class="avatar-icon">👤</text>
			</view>
			<!-- 昵称 -->
			<text class="profile-name">{{ userInfo.nickname }}</text>
			<!-- 个性签名 -->
			<text class="profile-sign">{{ userInfo.signature }}</text>
		</view>

		<view class="container">
			<!-- 个人信息区 -->
			<view class="info-card">
				<view class="info-item" @tap="editField('phone')">
					<text class="info-icon">📱</text>
					<view class="info-content">
						<text class="info-label">电话</text>
						<text class="info-value">{{ userInfo.phone }}</text>
					</view>
					<!-- 点击修改提示 -->
					<text class="info-action">点击修改 ›</text>
				</view>
				<view class="info-item" @tap="editField('className')">
					<text class="info-icon">🎓</text>
					<view class="info-content">
						<text class="info-label">班级</text>
						<text class="info-value">{{ userInfo.className }}</text>
					</view>
					<!-- 点击修改提示 -->
					<text class="info-action">点击修改 ›</text>
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
</template>

<script setup>
/**
 * 我的页面
 * - 顶部：头像、昵称、个性签名（蓝色背景白色文字）
 * - 信息区：电话、班级（可点击修改）
 * - 操作区：修改个人信息、退出登录
 */
import { reactive } from 'vue'

// 用户信息（占位数据，后续从接口/缓存获取）
const userInfo = reactive({
	nickname: '张三',
	signature: '开心生活每一天',
	phone: '138XXXX1234',
	className: '计算机2201班'
})

/**
 * 点击修改某个字段（占位逻辑）
 * @param {string} field - 字段名
 */
const editField = (field) => {
	const labels = { phone: '电话', className: '班级' }
	uni.showToast({ title: `修改${labels[field]}功能开发中`, icon: 'none' })
}

/**
 * 修改个人信息（占位逻辑）
 */
const editProfile = () => {
	uni.showToast({ title: '修改个人信息功能开发中', icon: 'none' })
}

/**
 * 退出登录（占位逻辑）
 */
const logout = () => {
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				// TODO: 清除本地登录态，跳转登录页
				uni.removeStorageSync('token')
				uni.showToast({ title: '已退出登录', icon: 'none' })
			}
		}
	})
}
</script>

<style scoped>
/* 页面容器 */
.page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

/* 顶部个人信息区 */
.profile-header {
	background-color: #1677FF;
	padding: 80rpx 30rpx 50rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* 头像 */
.avatar-wrap {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20rpx;
}
.avatar-icon {
	font-size: 70rpx;
}

/* 昵称 */
.profile-name {
	color: #fff;
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
}

/* 个性签名 */
.profile-sign {
	color: rgba(255, 255, 255, 0.8);
	font-size: 26rpx;
}

/* 内容区 */
.container {
	padding: 24rpx;
	margin-top: -20rpx;
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
.info-action {
	font-size: 24rpx;
	color: #1677FF;
	flex-shrink: 0;
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
