<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="lang-card">
			<view
				v-for="item in languages"
				:key="item.value"
				class="lang-item"
				@click="selectLang(item.value)"
			>
				<text class="lang-name">{{ item.label }}</text>
				<text v-if="current === item.value" class="lang-check">✓</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { currentLang, setLang, t } from '../../utils/i18n.js'
import { isDark, applyNavBarTheme } from '../../utils/theme.js'

const languages = [
	{ label: '简体中文', value: 'zh-CN' },
	{ label: 'English', value: 'en' },
	{ label: '한국어', value: 'ko' },
	{ label: '日本語', value: 'ja' }
]

const current = ref('zh-CN')

onLoad(() => {
	current.value = currentLang.value
})

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('language.title') })
})

const selectLang = (lang) => {
	current.value = lang
	setLang(lang)
	uni.setNavigationBarTitle({ title: t('language.title') })
	const name = languages.find(l => l.value === lang)?.label
	uni.showToast({ title: `${t('language.switched')} ${name}`, icon: 'success' })
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background-color: var(--bg-page, #f5f5f5);
	padding: 24rpx;
}
.lang-card {
	background: var(--bg-card, #fff);
	border-radius: 16rpx;
	overflow: hidden;
}
.lang-item {
	display: flex; align-items: center; justify-content: space-between;
	padding: 32rpx 28rpx;
	border-bottom: 1rpx solid var(--border-light, #f5f5f5);
}
.lang-item:last-child { border-bottom: none; }
.lang-item:active { background-color: var(--bg-hover, #f9f9f9); }
.lang-name { font-size: 30rpx; color: var(--text-primary, #333); }
.lang-check { font-size: 32rpx; color: var(--color-primary, #1677FF); font-weight: bold; }

/* 夜间模式 CSS 变量 */
.dark-mode {
	--bg-page: #121212;
	--bg-card: #1e1e1e;
	--bg-input: #2a2a2a;
	--bg-hover: #2a2a2a;
	--text-primary: #e0e0e0;
	--text-secondary: #aaaaaa;
	--text-placeholder: #666666;
	--text-hint: #888888;
	--border-color: #333333;
	--border-light: #2a2a2a;
	--shadow-card: 0 2rpx 12rpx rgba(0, 0, 0, 0.3);
	--color-primary: #5b9bf5;
}
</style>
