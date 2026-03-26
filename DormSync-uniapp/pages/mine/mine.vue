<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<!-- 顶部用户卡片 -->
		<view class="user-header">
			<view class="avatar-wrap">
				<image v-if="userInfo.avatarUrl" class="avatar-img" :src="userInfo.avatarUrl" mode="aspectFill" />
				<text v-else class="avatar-icon">👤</text>
			</view>
			<view class="user-info">
				<text class="user-name">{{ userInfo.nickname || t('mine.defaultSign') }}</text>
				<text class="user-sign">{{ userInfo.signature || t('mine.defaultSign') }}</text>
			</view>
		</view>

		<view class="container">
			<view v-if="!loggedIn" class="login-card">
				<text class="login-tip">{{ t('mine.notLogged') }}</text>
				<button class="btn-login" @tap="handleLogin">{{ t('mine.wxLogin') }}</button>
			</view>

			<view v-else>
				<view class="menu-card">
					<view class="menu-item" @click="goProfile">
						<text class="menu-icon">👤</text>
						<text class="menu-text">{{ t('mine.profile') }}</text>
						<text class="menu-arrow">›</text>
					</view>
				</view>

				<view class="menu-card">
					<view class="menu-item" @click="goPage('/pages/language/language')">
						<text class="menu-icon">🌐</text>
						<text class="menu-text">{{ t('mine.language') }}</text>
						<text class="menu-arrow">›</text>
					</view>
					<view class="menu-item" @click="toggleDarkMode">
						<text class="menu-icon">🌙</text>
						<text class="menu-text">{{ t('mine.darkMode') }}</text>
						<switch :checked="isDark" color="#1677FF" style="transform: scale(0.7);" />
					</view>
				</view>

				<view class="menu-card">
					<view class="menu-item" @click="goPage('/pages/about/about')">
						<text class="menu-icon">ℹ️</text>
						<text class="menu-text">{{ t('mine.about') }}</text>
						<text class="menu-arrow">›</text>
					</view>
					<view class="menu-item" @click="goPage('/pages/terms/terms')">
						<text class="menu-icon">📄</text>
						<text class="menu-text">{{ t('mine.terms') }}</text>
						<text class="menu-arrow">›</text>
					</view>
				</view>

				<view class="logout-btn" @click="logout">
					<text class="logout-text">{{ t('mine.logout') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { wxLogin, isLoggedIn, getLocalUserInfo, clearAuth } from '../../utils/auth.js'
import { t } from '../../utils/i18n.js'
import { isDark, toggleDark, applyNavBarTheme } from '../../utils/theme.js'

const loggedIn = ref(false)
const userInfo = reactive({ nickname: '', avatarUrl: '', signature: '' })

const loadUserInfo = () => {
	loggedIn.value = isLoggedIn()
	if (loggedIn.value) {
		const info = getLocalUserInfo()
		userInfo.nickname = info.nickname || ''
		userInfo.avatarUrl = info.avatarUrl || ''
		userInfo.signature = info.signature || ''
	}
}

const handleLogin = async () => {
	try {
		await wxLogin()
		loadUserInfo()
		uni.showToast({ title: t('mine.loginSuccess'), icon: 'success' })
	} catch (err) { console.error(err) }
}

const goProfile = () => {
	if (loggedIn.value) uni.navigateTo({ url: '/pages/profile-edit/profile-edit' })
}
const goPage = (url) => uni.navigateTo({ url })

const toggleDarkMode = () => {
	toggleDark()
	uni.showToast({ title: isDark.value ? t('mine.darkOn') : t('mine.darkOff'), icon: 'none' })
}

const logout = () => {
	uni.showModal({
		title: t('mine.tip'),
		content: t('mine.logoutConfirm'),
		success: (res) => {
			if (res.confirm) {
				clearAuth()
				loggedIn.value = false
				userInfo.nickname = ''
				userInfo.avatarUrl = ''
				userInfo.signature = ''
				uni.showToast({ title: t('mine.logoutDone'), icon: 'none' })
			}
		}
	})
}

onShow(() => {
	applyNavBarTheme()
	loadUserInfo()
	uni.setNavigationBarTitle({ title: t('tab.mine') })
})
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.user-header {
	background: linear-gradient(135deg, #1677FF, #4A9FFF);
	padding: 50rpx 30rpx 40rpx; display: flex; align-items: center;
}
.avatar-wrap {
	width: 120rpx; height: 120rpx; border-radius: 50%;
	background: rgba(255,255,255,0.3); overflow: hidden;
	display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.avatar-img { width: 120rpx; height: 120rpx; border-radius: 50%; }
.avatar-icon { font-size: 60rpx; }
.user-info { flex: 1; margin-left: 24rpx; }
.user-name { font-size: 34rpx; font-weight: bold; color: #fff; display: block; margin-bottom: 8rpx; }
.user-sign { font-size: 24rpx; color: rgba(255,255,255,0.8); display: block; }
.container { padding: 24rpx; }
.login-card {
	background: var(--bg-card); border-radius: 16rpx; padding: 48rpx 32rpx;
	text-align: center; box-shadow: var(--shadow-card);
}
.login-tip { font-size: 28rpx; color: var(--text-hint); display: block; margin-bottom: 32rpx; }
.btn-login { background-color: var(--color-primary); color: #fff; border-radius: 12rpx; font-size: 30rpx; height: 80rpx; line-height: 80rpx; }
.menu-card {
	background: var(--bg-card); border-radius: 16rpx; overflow: hidden;
	margin-bottom: 24rpx; box-shadow: var(--shadow-card);
}
.menu-item {
	display: flex; align-items: center; padding: 30rpx 24rpx;
	border-bottom: 1rpx solid var(--border-light);
}
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background-color: var(--bg-hover); }
.menu-icon { font-size: 36rpx; margin-right: 20rpx; flex-shrink: 0; }
.menu-text { flex: 1; font-size: 30rpx; color: var(--text-primary); }
.menu-arrow { font-size: 30rpx; color: var(--text-hint); }
.logout-btn {
	margin-top: 40rpx; background: var(--bg-card); border-radius: 16rpx;
	padding: 28rpx; text-align: center; box-shadow: var(--shadow-card);
}
.logout-btn:active { background-color: #fff5f5; }
.logout-text { font-size: 30rpx; color: #ff4d4f; }
</style>
