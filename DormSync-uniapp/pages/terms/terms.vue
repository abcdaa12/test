<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<view class="section" v-for="(section, i) in sections" :key="i">
				<text class="section-title">{{ t(section.title) }}</text>
				<text class="section-content">{{ t(section.content) }}</text>
			</view>

			<view class="footer">
				<text class="footer-text">{{ t('terms.updateDate') }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { t } from '../../utils/i18n.js'
import { isDark, applyNavBarTheme } from '../../utils/theme.js'

const sections = [
	{ title: 'terms.section1Title', content: 'terms.section1Content' },
	{ title: 'terms.section2Title', content: 'terms.section2Content' },
	{ title: 'terms.section3Title', content: 'terms.section3Content' },
	{ title: 'terms.section4Title', content: 'terms.section4Content' },
	{ title: 'terms.section5Title', content: 'terms.section5Content' }
]

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('terms.title') })
})
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.container { padding: 32rpx; }
.section {
	background: var(--bg-card); border-radius: 16rpx; padding: 28rpx;
	margin-bottom: 24rpx; box-shadow: var(--shadow-card);
}
.section-title {
	font-size: 30rpx; font-weight: bold; color: var(--text-primary);
	display: block; margin-bottom: 16rpx;
}
.section-content { font-size: 26rpx; color: var(--text-secondary); line-height: 1.8; display: block; }
.footer { text-align: center; padding: 40rpx 0; }
.footer-text { font-size: 22rpx; color: var(--text-hint); }
</style>
