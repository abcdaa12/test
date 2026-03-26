<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<view class="header-section">
				<text class="header-icon">🏠</text>
				<text class="header-title">{{ t('dorm.setupTitle') }}</text>
				<text class="header-desc">{{ t('dorm.setupDesc') }}</text>
			</view>

			<!-- 模式切换 -->
			<view class="tab-bar">
				<view :class="['tab-item', mode === 'create' ? 'active' : '']" @tap="mode = 'create'">
					<text>{{ t('dorm.createTab') }}</text>
				</view>
				<view :class="['tab-item', mode === 'join' ? 'active' : '']" @tap="mode = 'join'">
					<text>{{ t('dorm.joinTab') }}</text>
				</view>
			</view>

			<!-- 创建宿舍 -->
			<view v-if="mode === 'create'" class="form-card">
				<text class="form-tip">{{ t('dorm.createTip') }}</text>
				<input
					class="form-input"
					v-model="dormNumber"
					:placeholder="t('dorm.dormNumberPh')"
					maxlength="20"
				/>
				<button class="submit-btn" :loading="loading" @tap="handleCreate">
					{{ t('dorm.createBtn') }}
				</button>
			</view>

			<!-- 加入宿舍 -->
			<view v-if="mode === 'join'" class="form-card">
				<text class="form-tip">{{ t('dorm.joinTip') }}</text>
				<input
					class="form-input"
					v-model="dormNumber"
					:placeholder="t('dorm.dormNumberPh')"
					maxlength="20"
				/>
				<button class="submit-btn" :loading="loading" @tap="handleJoin">
					{{ t('dorm.joinBtn') }}
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { post } from '../../utils/request.js'
import { getLocalUserInfo } from '../../utils/auth.js'
import { t } from '../../utils/i18n.js'
import { isDark, applyNavBarTheme } from '../../utils/theme.js'

const mode = ref('create')
const dormNumber = ref('')
const loading = ref(false)

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('dorm.setupTitle') })

	// 检查是否有分享带来的邀请宿舍号
	const inviteDorm = uni.getStorageSync('inviteDormNumber')
	if (inviteDorm) {
		mode.value = 'join'
		dormNumber.value = inviteDorm
		// 用完即清
		uni.removeStorageSync('inviteDormNumber')
	}
})

/** 创建宿舍 */
const handleCreate = async () => {
	if (!dormNumber.value.trim()) {
		uni.showToast({ title: t('dorm.dormNumberRequired'), icon: 'none' })
		return
	}
	loading.value = true
	try {
		const res = await post('/api/dorm/create', { dormNumber: dormNumber.value.trim() })
		if (res.code === 200) {
			saveDormInfo(res.data)
			uni.showToast({ title: t('dorm.createSuccess'), icon: 'success' })
			setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 500)
		} else {
			uni.showToast({ title: res.msg || t('dorm.createFail'), icon: 'none' })
		}
	} catch (e) {
		console.error('创建宿舍失败', e)
	} finally {
		loading.value = false
	}
}

/** 加入宿舍 */
const handleJoin = async () => {
	if (!dormNumber.value.trim()) {
		uni.showToast({ title: t('dorm.dormNumberRequired'), icon: 'none' })
		return
	}
	loading.value = true
	try {
		const res = await post('/api/dorm/join', { dormNumber: dormNumber.value.trim() })
		if (res.code === 200) {
			saveDormInfo(res.data)
			uni.showToast({ title: t('dorm.joinSuccess'), icon: 'success' })
			setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 500)
		} else {
			uni.showToast({ title: res.msg || t('dorm.joinFail'), icon: 'none' })
		}
	} catch (e) {
		console.error('加入宿舍失败', e)
	} finally {
		loading.value = false
	}
}

/** 保存宿舍信息到本地 */
const saveDormInfo = (data) => {
	const info = getLocalUserInfo()
	info.dormId = data.dormId
	info.dormNumber = data.dormNumber
	uni.setStorageSync('userInfo', info)
}
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.container { padding: 40rpx 24rpx; }
.header-section { display: flex; flex-direction: column; align-items: center; padding: 60rpx 0 40rpx; }
.header-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.header-title { font-size: 36rpx; font-weight: bold; color: var(--text-primary); margin-bottom: 12rpx; }
.header-desc { font-size: 26rpx; color: var(--text-secondary); }
.tab-bar { display: flex; background: var(--bg-card); border-radius: 16rpx; overflow: hidden; margin-bottom: 32rpx; }
.tab-item { flex: 1; text-align: center; padding: 24rpx 0; font-size: 28rpx; color: var(--text-secondary); }
.tab-item.active { background: var(--color-primary); color: #fff; border-radius: 16rpx; }
.form-card { background: var(--bg-card); border-radius: 16rpx; padding: 32rpx 24rpx; }
.form-tip { font-size: 26rpx; color: var(--text-hint); display: block; margin-bottom: 24rpx; }
.form-input {
	width: 100%; height: 88rpx; background: var(--bg-input, #f5f5f5);
	border-radius: 12rpx; padding: 0 24rpx; font-size: 30rpx;
	color: var(--text-primary); margin-bottom: 32rpx; box-sizing: border-box;
}
.submit-btn {
	width: 100%; height: 88rpx; line-height: 88rpx;
	background-color: var(--color-primary); color: #fff;
	font-size: 32rpx; border-radius: 16rpx; border: none;
}
.submit-btn::after { border: none; }

.dark-mode {
	--bg-page: #121212; --bg-card: #1e1e1e; --bg-input: #2a2a2a;
	--bg-hover: #2a2a2a; --text-primary: #e0e0e0; --text-secondary: #aaaaaa;
	--text-placeholder: #666666; --text-hint: #888888; --border-color: #333333;
	--border-light: #2a2a2a; --color-primary: #5b9bf5;
}
</style>
