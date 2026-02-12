<template>
	<view class="page">
		<view class="container">
			<!-- 头像 -->
			<view class="avatar-section">
				<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<view class="avatar-wrap">
						<image v-if="form.avatar" class="avatar-img" :src="form.avatar" mode="aspectFill" />
						<text v-else class="avatar-icon">👤</text>
					</view>
					<text class="avatar-tip">点击更换头像</text>
				</button>
			</view>

			<!-- 表单 -->
			<view class="form-card">
				<view class="form-item">
					<text class="form-label">姓名</text>
					<input class="form-input" v-model="form.nickname" placeholder="请输入姓名" maxlength="20" />
				</view>
				<view class="form-item">
					<text class="form-label">个性签名</text>
					<input class="form-input" v-model="form.signature" placeholder="请输入个性签名" maxlength="50" />
				</view>
				<view class="form-item">
					<text class="form-label">电话</text>
					<input class="form-input" v-model="form.phone" placeholder="请输入手机号" type="number" maxlength="11" />
				</view>
				<view class="form-item">
					<text class="form-label">班级</text>
					<input class="form-input" v-model="form.className" placeholder="请输入班级" maxlength="30" />
				</view>
			</view>

			<button class="save-btn" :loading="saving" @click="handleSave">保存</button>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { put, BASE_URL } from '../../utils/request.js'
import { getLocalUserInfo } from '../../utils/auth.js'

const saving = ref(false)
const isFirstSetup = ref(false)
const localAvatarPath = ref('')

const form = reactive({
	avatar: '',
	nickname: '',
	signature: '',
	phone: '',
	className: ''
})

onLoad((options) => {
	isFirstSetup.value = options.first === '1'
	const info = getLocalUserInfo()
	form.avatar = info.avatarUrl || ''
	form.nickname = info.nickname === '宿舍成员' ? '' : (info.nickname || '')
	form.signature = info.signature || ''
	form.phone = info.phone || ''
	form.className = info.className || info.class || ''
})

/** 选择头像回调 */
const onChooseAvatar = (e) => {
	console.log('chooseAvatar 回调:', e.detail)
	const url = e.detail.avatarUrl
	if (!url) return
	form.avatar = url
	localAvatarPath.value = url
}

/** 保存个人信息 */
const handleSave = async () => {
	if (!form.nickname.trim()) {
		uni.showToast({ title: '请输入姓名', icon: 'none' })
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
			userId,
			avatar: avatarForDB,
			nickname: form.nickname.trim(),
			signature: form.signature.trim(),
			phone: form.phone.trim(),
			class: form.className.trim()
		})

		if (res.code === 200) {
			const info = getLocalUserInfo()
			const updated = {
				...info,
				avatarUrl: localAvatarPath.value || form.avatar || info.avatarUrl,
				avatarServer: avatarForDB || info.avatarServer || '',
				nickname: form.nickname.trim(),
				signature: form.signature.trim(),
				phone: form.phone.trim(),
				className: form.className.trim()
			}
			uni.setStorageSync('userInfo', updated)
			uni.showToast({ title: '保存成功', icon: 'success' })
			setTimeout(() => {
				if (isFirstSetup.value) uni.switchTab({ url: '/pages/index/index' })
				else uni.navigateBack()
			}, 500)
		}
	} catch (e) {
		console.error('保存失败', e)
		uni.showToast({ title: '保存失败', icon: 'none' })
	} finally {
		saving.value = false
	}
}

const uploadAvatar = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: BASE_URL + '/api/user/upload-avatar',
			filePath,
			name: 'file',
			success: (uploadRes) => {
				try {
					const data = JSON.parse(uploadRes.data)
					if (data.code === 200) resolve(data.data.url)
					else reject(new Error('上传失败'))
				} catch (e) { reject(e) }
			},
			fail: reject
		})
	})
}
</script>

<style scoped>
.page { min-height: 100vh; background-color: #f5f5f5; }
.container { padding: 24rpx; }
.avatar-section { display: flex; flex-direction: column; align-items: center; padding: 40rpx 0; }
.avatar-btn {
	background: none; border: none; padding: 0; margin: 0; line-height: normal;
	display: flex; flex-direction: column; align-items: center;
}
.avatar-btn::after { border: none; }
.avatar-wrap {
	width: 160rpx; height: 160rpx; border-radius: 50%; background-color: #e8e8e8;
	display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 16rpx;
}
.avatar-img { width: 160rpx; height: 160rpx; border-radius: 50%; }
.avatar-icon { font-size: 80rpx; }
.avatar-tip { font-size: 24rpx; color: #1677FF; }
.form-card { background-color: #fff; border-radius: 16rpx; overflow: hidden; margin-bottom: 40rpx; }
.form-item { display: flex; align-items: center; padding: 28rpx 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.form-item:last-child { border-bottom: none; }
.form-label { font-size: 28rpx; color: #333; width: 140rpx; flex-shrink: 0; }
.form-input { flex: 1; font-size: 28rpx; color: #333; }
.save-btn {
	width: 100%; height: 88rpx; line-height: 88rpx; background-color: #1677FF;
	color: #fff; font-size: 32rpx; border-radius: 16rpx; border: none;
}
.save-btn::after { border: none; }
</style>
