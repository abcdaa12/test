<template>
	<view class="login-page">
		<view class="login-content">
			<!-- Logo 区域 -->
			<view class="logo-section">
				<image class="logo" src="/static/logo.png" mode="aspectFit" />
				<text class="app-name">DormSync</text>
				<text class="app-desc">宿舍协同管理平台</text>
			</view>

			<!-- 登录按钮区域 -->
			<view class="login-section">
				<button class="login-btn" :loading="loading" @click="handleLogin">
					微信一键登录
				</button>
				<text class="login-tip">登录即表示同意《用户协议》和《隐私政策》</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { wxLogin, isLoggedIn } from '../../utils/auth'

const loading = ref(false)

// 每次显示页面时检查登录态，已登录直接跳首页
onShow(() => {
	if (isLoggedIn()) {
		goHome()
	}
})

/**
 * 跳转到首页（switchTab）
 */
const goHome = () => {
	uni.switchTab({ url: '/pages/index/index' })
}

/**
 * 点击登录
 */
const handleLogin = async () => {
	if (loading.value) return
	loading.value = true
	try {
		const userInfo = await wxLogin()
		uni.showToast({ title: '登录成功', icon: 'success' })
		setTimeout(() => {
			// 新用户（昵称还是默认值）跳转到个人信息设置页
			if (!userInfo.nickname || userInfo.nickname === '宿舍成员') {
				uni.redirectTo({ url: '/pages/profile-edit/profile-edit?first=1' })
			} else {
				goHome()
			}
		}, 500)
	} catch (e) {
		console.error('登录失败', e)
	} finally {
		loading.value = false
	}
}
</script>

<style scoped>
.login-page {
	min-height: 100vh;
	background: linear-gradient(180deg, #1677FF 0%, #4A9FFF 50%, #f5f5f5 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.login-content {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 60rpx;
}

.logo-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 120rpx;
}

.logo {
	width: 160rpx;
	height: 160rpx;
	margin-bottom: 30rpx;
	border-radius: 32rpx;
}

.app-name {
	font-size: 48rpx;
	font-weight: bold;
	color: #fff;
	margin-bottom: 12rpx;
}

.app-desc {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.8);
}

.login-section {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.login-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	background-color: #fff;
	color: #1677FF;
	font-size: 32rpx;
	font-weight: bold;
	border-radius: 44rpx;
	border: none;
	text-align: center;
}

.login-btn::after {
	border: none;
}

.login-tip {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.6);
	margin-top: 30rpx;
}
</style>
