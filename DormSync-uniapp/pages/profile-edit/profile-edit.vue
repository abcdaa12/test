<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<view class="avatar-section">
				<button v-if="editing" class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<view class="avatar-wrap">
						<image v-if="form.avatar" class="avatar-img" :src="form.avatar" mode="aspectFill" />
						<text v-else class="avatar-icon">👤</text>
					</view>
					<text class="avatar-tip">{{ t('profile.changeAvatar') }}</text>
				</button>
				<view v-else class="avatar-wrap-view">
					<view class="avatar-wrap">
						<image v-if="form.avatar" class="avatar-img" :src="form.avatar" mode="aspectFill" />
						<text v-else class="avatar-icon">👤</text>
					</view>
				</view>
			</view>

			<view class="form-card">
				<view class="form-item">
					<text class="form-label">{{ t('profile.name') }}</text>
					<input v-if="editing" class="form-input" v-model="form.nickname" :placeholder="t('profile.namePh')" maxlength="20" />
					<text v-else class="form-value">{{ form.nickname || t('profile.notSet') }}</text>
				</view>
				<view class="form-item">
					<text class="form-label">{{ t('profile.signature') }}</text>
					<input v-if="editing" class="form-input" v-model="form.signature" :placeholder="t('profile.signaturePh')" maxlength="50" />
					<text v-else class="form-value">{{ form.signature || t('profile.notSet') }}</text>
				</view>
				<view class="form-item">
					<text class="form-label">{{ t('profile.phone') }}</text>
					<input v-if="editing" class="form-input" v-model="form.phone" :placeholder="t('profile.phonePh')" type="number" maxlength="11" />
					<text v-else class="form-value">{{ form.phone || t('profile.notSet') }}</text>
				</view>
				<view class="form-item">
					<text class="form-label">{{ t('profile.className') }}</text>
					<input v-if="editing" class="form-input" v-model="form.className" :placeholder="t('profile.classPh')" maxlength="30" />
					<text v-else class="form-value">{{ form.className || t('profile.notSet') }}</text>
				</view>
			</view>

			<button v-if="editing" class="save-btn" :loading="saving" @click="handleSave">{{ t('profile.save') }}</button>
			<button v-else class="edit-btn" @click="editing = true">{{ t('profile.edit') }}</button>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { put, BASE_URL } from '../../utils/request.js'
import { getLocalUserInfo } from '../../utils/auth.js'
import { t } from '../../utils/i18n.js'
import { isDark, applyNavBarTheme } from '../../utils/theme.js'

const saving = ref(false)
const editing = ref(false)
const isFirstSetup = ref(false)
const localAvatarPath = ref('')

const form = reactive({ avatar: '', nickname: '', signature: '', phone: '', className: '' })

onLoad((options) => {
	isFirstSetup.value = options.first === '1'
	if (isFirstSetup.value) editing.value = true
	const info = getLocalUserInfo()
	form.avatar = info.avatarUrl || ''
	form.nickname = info.nickname === '宿舍成员' ? '' : (info.nickname || '')
	form.signature = info.signature || ''
	form.phone = info.phone || ''
	form.className = info.className || info.class || ''
	uni.setNavigationBarTitle({ title: t('profile.title') })
})

onShow(() => {
	applyNavBarTheme()
})

const onChooseAvatar = (e) => {
	const url = e.detail.avatarUrl
	if (!url) return
	form.avatar = url
	localAvatarPath.value = url
}

const handleSave = async () => {
	if (!form.nickname.trim()) {
		uni.showToast({ title: t('profile.nameRequired'), icon: 'none' })
		return
	}
	saving.value = true
	try {
		let avatarForDB = ''
		if (localAvatarPath.value) {
			try { avatarForDB = await uploadAvatar(localAvatarPath.value) }
			catch (e) { console.error('头像上传失败', e) }
		}
		if (!avatarForDB) {
			const info = getLocalUserInfo()
			if (info.avatarServer) avatarForDB = info.avatarServer
		}
		const userId = uni.getStorageSync('userId')
		const res = await put('/api/user/update', {
			userId, avatar: avatarForDB,
			nickname: form.nickname.trim(), signature: form.signature.trim(),
			phone: form.phone.trim(), class: form.className.trim()
		})
		if (res.code === 200) {
			const info = getLocalUserInfo()
			uni.setStorageSync('userInfo', {
				...info,
				avatarUrl: localAvatarPath.value || form.avatar || info.avatarUrl,
				avatarServer: avatarForDB || info.avatarServer || '',
				nickname: form.nickname.trim(), signature: form.signature.trim(),
				phone: form.phone.trim(), className: form.className.trim()
			})
			uni.showToast({ title: t('profile.saveSuccess'), icon: 'success' })
			if (isFirstSetup.value) {
				setTimeout(() => {
					const info = getLocalUserInfo()
					if (!info.dormId) {
						uni.redirectTo({ url: '/pages/dorm-setup/dorm-setup' })
					} else {
						uni.switchTab({ url: '/pages/index/index' })
					}
				}, 500)
			} else {
				editing.value = false
			}
		}
	} catch (e) {
		console.error('保存失败', e)
		uni.showToast({ title: t('profile.saveFail'), icon: 'none' })
	} finally { saving.value = false }
}

const uploadAvatar = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: BASE_URL + '/api/user/upload-avatar', filePath, name: 'file',
			success: (r) => {
				try {
					const d = JSON.parse(r.data)
					if (d.code === 200) resolve(d.data.url)
					else reject(new Error('上传失败'))
				} catch (e) { reject(e) }
			},
			fail: reject
		})
	})
}
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.container { padding: 24rpx; }
.avatar-section { display: flex; flex-direction: column; align-items: center; padding: 40rpx 0; }
.avatar-btn { background: none; border: none; padding: 0; margin: 0; line-height: normal; display: flex; flex-direction: column; align-items: center; }
.avatar-btn::after { border: none; }
.avatar-wrap-view { display: flex; flex-direction: column; align-items: center; }
.avatar-wrap { width: 160rpx; height: 160rpx; border-radius: 50%; background-color: var(--bg-input); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.avatar-img { width: 160rpx; height: 160rpx; border-radius: 50%; }
.avatar-icon { font-size: 80rpx; }
.avatar-tip { font-size: 24rpx; color: var(--color-primary); margin-top: 16rpx; }
.form-card { background: var(--bg-card); border-radius: 16rpx; overflow: hidden; margin-bottom: 40rpx; }
.form-item { display: flex; align-items: center; padding: 28rpx 24rpx; border-bottom: 1rpx solid var(--border-light); }
.form-item:last-child { border-bottom: none; }
.form-label { font-size: 28rpx; color: var(--text-hint); width: 140rpx; flex-shrink: 0; }
.form-input { flex: 1; font-size: 28rpx; color: var(--text-primary); }
.form-value { flex: 1; font-size: 28rpx; color: var(--text-primary); }
.save-btn { width: 100%; height: 88rpx; line-height: 88rpx; background-color: var(--color-primary); color: #fff; font-size: 32rpx; border-radius: 16rpx; border: none; }
.save-btn::after { border: none; }
.edit-btn { width: 100%; height: 88rpx; line-height: 88rpx; background-color: var(--bg-card); color: var(--color-primary); font-size: 32rpx; border-radius: 16rpx; border: 2rpx solid var(--color-primary); }
.edit-btn::after { border: none; }
</style>
