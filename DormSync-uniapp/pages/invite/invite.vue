<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<view class="header-section">
				<text class="header-icon">✉️</text>
				<text class="header-title">{{ t('invite.title') }}</text>
				<text class="header-desc">{{ t('invite.desc') }}</text>
			</view>

			<!-- 方式一：分享小程序卡片（推荐） -->
			<view class="form-card share-card">
				<text class="form-label">🔗 {{ t('invite.shareTitle') }}</text>
				<text class="share-desc">{{ t('invite.shareDesc') }}</text>
				<button class="share-btn" open-type="share">
					{{ t('invite.shareBtn') }}
				</button>
			</view>

			<!-- 方式二：手机号邀请 -->
			<view class="form-card">
				<text class="form-label">📱 {{ t('invite.phoneLabel') }}</text>
				<input
					class="form-input"
					v-model="phone"
					type="number"
					:placeholder="t('invite.phonePh')"
					maxlength="11"
				/>
				<button class="submit-btn" :loading="loading" @tap="handleInvite">
					{{ t('invite.btn') }}
				</button>
			</view>

			<!-- 宿舍号展示 -->
			<view class="info-card">
				<text class="info-label">{{ t('invite.dormLabel') }}</text>
				<text class="info-value">{{ dormNumber }}</text>
				<text class="info-tip">{{ t('invite.dormTip') }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { post, get } from '@/utils/request'
import { getLocalUserInfo } from '@/utils/auth'
import { t } from '@/utils/i18n'
import { isDark, applyNavBarTheme } from '@/utils/theme'

const phone = ref('')
const loading = ref(false)
const dormNumber = ref('')

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('invite.title') })
	fetchDormNumber()
})

const fetchDormNumber = async () => {
	const info = getLocalUserInfo()
	if (!info.dormId) return
	try {
		const res = await get(`/api/dorm/info?dormId=${info.dormId}`)
		if (res.code === 200 && res.data) {
			dormNumber.value = res.data.dormNumber || ''
			// 同步到本地缓存
			info.dormNumber = dormNumber.value
			uni.setStorageSync('userInfo', info)
		}
	} catch (e) {
		dormNumber.value = info.dormNumber || ''
	}
}

// 微信分享小程序卡片
onShareAppMessage(() => {
	const info = getLocalUserInfo()
	return {
		title: t('invite.shareCardTitle') + ' ' + dormNumber.value,
		path: `/pages/login/login?dormNumber=${encodeURIComponent(dormNumber.value)}`,
		imageUrl: '/static/logo.png'
	}
})

const handleInvite = async () => {
	if (!phone.value.trim()) {
		uni.showToast({ title: t('invite.phoneRequired'), icon: 'none' }); return
	}
	if (phone.value.trim().length !== 11) {
		uni.showToast({ title: t('invite.phoneInvalid'), icon: 'none' }); return
	}
	const info = getLocalUserInfo()
	if (!info.dormId) {
		uni.showToast({ title: t('dorm.noDorm'), icon: 'none' }); return
	}
	loading.value = true
	try {
		const res = await post('/api/dorm/invite', { dormId: info.dormId, phone: phone.value.trim() })
		if (res.code === 200) {
			uni.showToast({ title: `${t('invite.success')}${res.data?.nickname ? ' (' + res.data.nickname + ')' : ''}`, icon: 'success' })
			phone.value = ''
		} else {
			uni.showToast({ title: res.msg || t('invite.fail'), icon: 'none' })
		}
	} catch (e) { console.error('邀请失败', e) }
	finally { loading.value = false }
}
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.container { padding: 40rpx 24rpx; }
.header-section { display: flex; flex-direction: column; align-items: center; padding: 40rpx 0 32rpx; }
.header-icon { font-size: 72rpx; margin-bottom: 16rpx; }
.header-title { font-size: 34rpx; font-weight: bold; color: var(--text-primary); margin-bottom: 10rpx; }
.header-desc { font-size: 26rpx; color: var(--text-secondary); text-align: center; padding: 0 40rpx; }
.form-card { background: var(--bg-card); border-radius: 16rpx; padding: 32rpx 24rpx; margin-bottom: 24rpx; }
.form-label { font-size: 28rpx; color: var(--text-primary); font-weight: bold; display: block; margin-bottom: 16rpx; }
.form-input {
	width: 100%; height: 88rpx; background: var(--bg-input, #f5f5f5);
	border-radius: 12rpx; padding: 0 24rpx; font-size: 30rpx;
	color: var(--text-primary); margin-bottom: 28rpx; box-sizing: border-box;
}
.submit-btn {
	width: 100%; height: 88rpx; line-height: 88rpx;
	background-color: var(--color-primary); color: #fff;
	font-size: 32rpx; border-radius: 16rpx; border: none;
}
.submit-btn::after { border: none; }
.share-card { border: 2rpx dashed var(--color-primary); }
.share-desc { font-size: 26rpx; color: var(--text-hint); display: block; margin-bottom: 20rpx; }
.share-btn {
	width: 100%; height: 88rpx; line-height: 88rpx;
	background-color: #07c160; color: #fff;
	font-size: 32rpx; border-radius: 16rpx; border: none;
}
.share-btn::after { border: none; }
.info-card { background: var(--bg-card); border-radius: 16rpx; padding: 28rpx 24rpx; }
.info-label { font-size: 26rpx; color: var(--text-hint); display: block; margin-bottom: 8rpx; }
.info-value { font-size: 36rpx; font-weight: bold; color: var(--color-primary); display: block; margin-bottom: 8rpx; }
.info-tip { font-size: 24rpx; color: var(--text-placeholder); display: block; }
</style>
