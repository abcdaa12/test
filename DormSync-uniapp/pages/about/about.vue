<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<view class="logo-section">
				<image class="logo" src="/static/logo.png" mode="aspectFit" />
				<text class="app-name">DormSync</text>
				<text class="app-version">v1.0.0</text>
			</view>

			<view class="info-card">
				<text class="card-title">{{ t('about.appIntro') }}</text>
				<text class="card-content">{{ t('about.appDesc') }}</text>
			</view>

			<view class="info-card">
				<text class="card-title">{{ t('about.features') }}</text>
				<view class="feature-list">
					<view class="feature-item" v-for="(item, i) in featureKeys" :key="i">
						<text class="feature-icon">{{ item.icon }}</text>
						<text class="feature-text">{{ t(item.key) }}</text>
					</view>
				</view>
			</view>

			<view class="info-card">
				<text class="card-title">{{ t('about.contact') }}</text>
				<text class="card-content">{{ t('about.contactInfo') }}</text>
			</view>

			<view class="footer">
				<text class="footer-text">{{ t('about.copyright') }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { t } from '../../utils/i18n.js'
import { isDark, applyNavBarTheme } from '../../utils/theme.js'

const featureKeys = [
	{ icon: '📋', key: 'about.featureTodo' },
	{ icon: '💰', key: 'about.featureFee' },
	{ icon: '🗳️', key: 'about.featureVote' },
	{ icon: '📅', key: 'about.featureSchedule' },
	{ icon: '💬', key: 'about.featureMessage' },
	{ icon: '👥', key: 'about.featureMember' }
]

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('about.title') })
})
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.container { padding: 32rpx; }
.logo-section {
	display: flex; flex-direction: column; align-items: center;
	padding: 60rpx 0 40rpx;
}
.logo { width: 140rpx; height: 140rpx; border-radius: 28rpx; margin-bottom: 20rpx; }
.app-name { font-size: 40rpx; font-weight: bold; color: var(--text-primary); margin-bottom: 8rpx; }
.app-version { font-size: 24rpx; color: var(--text-hint); }
.info-card {
	background: var(--bg-card); border-radius: 16rpx; padding: 28rpx;
	margin-bottom: 24rpx; box-shadow: var(--shadow-card);
}
.card-title {
	font-size: 30rpx; font-weight: bold; color: var(--text-primary);
	display: block; margin-bottom: 16rpx;
}
.card-content { font-size: 26rpx; color: var(--text-secondary); line-height: 1.8; display: block; }
.feature-list { display: flex; flex-direction: column; gap: 16rpx; }
.feature-item { display: flex; align-items: center; gap: 16rpx; }
.feature-icon { font-size: 32rpx; }
.feature-text { font-size: 26rpx; color: var(--text-secondary); }
.footer { text-align: center; padding: 40rpx 0; }
.footer-text { font-size: 22rpx; color: var(--text-hint); }
</style>
