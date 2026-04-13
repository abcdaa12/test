<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<view class="module-group">
				<text class="module-title">🗳️ {{ t('more.decision') }}</text>
				<view class="module-entries">
					<view class="entry-btn" @tap="goTo('/pages/vote/vote')">
						<text class="entry-icon">🗳️</text>
						<text class="entry-label">{{ t('more.decision') }}</text>
					</view>
				</view>
			</view>

			<view class="module-group">
				<text class="module-title">📅 {{ t('more.task') }}</text>
				<view class="module-entries">
					<view class="entry-btn" @tap="goTo('/pages/schedule/schedule')">
						<text class="entry-icon">📅</text>
						<text class="entry-label">{{ t('more.task') }}</text>
					</view>
				</view>
			</view>

			<view class="module-group">
				<text class="module-title">💰 {{ t('more.finance') }}</text>
				<view class="module-entries">
					<view class="entry-btn" @tap="goTo('/pages/fee/fee')">
						<text class="entry-icon">💰</text>
						<text class="entry-label">{{ t('more.finance') }}</text>
					</view>
				</view>
			</view>

			<view class="module-group">
				<text class="module-title">📢 {{ t('more.announcement') }}</text>
				<view class="module-entries">
					<view class="entry-btn" @tap="goTo('/pages/announce/announce')">
						<text class="entry-icon">📢</text>
						<text class="entry-label">{{ t('more.announceManage') }}</text>
					</view>
				</view>
			</view>

			<view class="module-group">
				<text class="module-title">👥 {{ t('more.member') }}</text>
				<view class="module-entries">
					<view class="entry-btn" @tap="goTo('/pages/members/members')">
						<text class="entry-icon">👤</text>
						<text class="entry-label">{{ t('more.viewMember') }}</text>
					</view>
					<view class="entry-btn" @tap="goTo('/pages/election/election')">
						<text class="entry-icon">🏆</text>
						<text class="entry-label">{{ t('more.election') }}</text>
					</view>
					<view class="entry-btn" @tap="goTo('/pages/invite/invite')">
						<text class="entry-icon">✉️</text>
						<text class="entry-label">{{ t('more.invite') }}</text>
					</view>
					<view class="entry-btn leave-btn" @tap="handleLeave">
						<text class="entry-icon">🚪</text>
						<text class="entry-label">{{ t('more.leave') }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post, put } from '@/utils/request'
import { t } from '@/utils/i18n'
import { isDark, applyNavBarTheme } from '@/utils/theme'
import { getLocalUserInfo, clearAuth } from '@/utils/auth'

const goTo = (url) => { uni.navigateTo({ url }) }

const handleLeave = () => {
	uni.showModal({
		title: t('more.leaveTitle'),
		content: t('more.leaveConfirm'),
		success: async (res) => {
			if (!res.confirm) return
			try {
				const userInfo = getLocalUserInfo()
				const r = await post('/api/dorm/leave', { dormId: userInfo.dormId, userId: userInfo._id })
				if (r.code === 200) {
					// 更新本地缓存
					const info = getLocalUserInfo()
					info.dormId = ''
					info.role = 'member'
					uni.setStorageSync('userInfo', info)
					uni.showToast({ title: t('more.leaveSuccess'), icon: 'success' })
					setTimeout(() => {
						uni.redirectTo({ url: '/pages/dorm-setup/dorm-setup' })
					}, 1000)
				} else {
					uni.showToast({ title: r.msg, icon: 'none' })
				}
			} catch (e) { console.error(e) }
		}
	})
}

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('more.title') })
})
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.container { padding: 24rpx; }
.module-group { margin-bottom: 32rpx; }
.module-title { font-size: 30rpx; font-weight: bold; color: var(--text-primary); display: block; margin-bottom: 16rpx; padding-left: 8rpx; }
.module-entries { display: flex; flex-wrap: wrap; gap: 16rpx; }
.entry-btn { background-color: var(--bg-card); border: 1rpx solid var(--border-color); border-radius: 5px; padding: 15rpx 24rpx; display: flex; align-items: center; gap: 12rpx; min-width: 280rpx; flex: 1; }
.entry-btn:active { background-color: var(--bg-hover); }
.entry-icon { font-size: 36rpx; }
.entry-label { font-size: 28rpx; color: var(--text-primary); }
.leave-btn .entry-label { color: #ff4d4f; }
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: center; justify-content: center; }
.modal-content { background-color: var(--bg-card); width: 80%; border-radius: 16rpx; padding: 40rpx; }
.modal-title { font-size: 32rpx; font-weight: bold; color: var(--text-primary); margin-bottom: 24rpx; }
.notice-textarea { width: 100%; height: 200rpx; border: 1rpx solid var(--border-color); border-radius: 8rpx; padding: 16rpx; font-size: 28rpx; color: var(--text-primary); background-color: var(--bg-input); margin-bottom: 24rpx; }
</style>
