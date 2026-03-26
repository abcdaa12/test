<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<view class="section-title">{{ t('members.title') }} ({{ memberList.length }})</view>
			<view v-for="(m, i) in memberList" :key="m._id || i" class="card member-item">
				<view class="member-info">
					<image v-if="m.avatar" class="member-avatar" :src="m.avatar" mode="aspectFill" />
					<view v-else class="member-avatar-placeholder">{{ (m.nickname || '?')[0] }}</view>
					<view class="member-detail">
						<text class="member-name">{{ m.nickname || t('mine.defaultSign') }}</text>
						<text class="member-role">{{ m.role === 'leader' ? '🏆 ' + t('members.leader') : t('members.member') }}</text>
					</view>
				</view>
				<text v-if="m.phone" class="member-phone">{{ m.phone }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '@/utils/request'
import { t } from '@/utils/i18n'
import { isDark, applyNavBarTheme } from '@/utils/theme'
import { getLocalUserInfo } from '@/utils/auth'

const memberList = ref([])

const fetchMembers = async () => {
	try {
		const userInfo = getLocalUserInfo()
		if (!userInfo.dormId) return
		const res = await get(`/api/dorm/members?dormId=${userInfo.dormId}`)
		if (res.code === 200) memberList.value = res.data || []
	} catch (e) { console.error('获取成员失败', e) }
}

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('members.title') })
	fetchMembers()
})
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.container { padding: 24rpx; }
.section-title { font-size: 30rpx; font-weight: bold; margin-bottom: 24rpx; color: var(--text-primary); }
.member-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx; margin-bottom: 16rpx; }
.member-info { display: flex; align-items: center; gap: 20rpx; }
.member-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; }
.member-avatar-placeholder { width: 80rpx; height: 80rpx; border-radius: 50%; background-color: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 32rpx; }
.member-detail { display: flex; flex-direction: column; }
.member-name { font-size: 30rpx; color: var(--text-primary); font-weight: bold; }
.member-role { font-size: 24rpx; color: var(--text-hint); margin-top: 4rpx; }
.member-phone { font-size: 24rpx; color: var(--text-secondary); }
</style>
