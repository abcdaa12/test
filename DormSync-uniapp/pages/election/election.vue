<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<view class="section-title">{{ t('election.title') }}</view>
			<text class="desc">{{ t('election.desc') }}</text>
			<view v-for="(m, i) in memberList" :key="m._id || i" class="card member-item" @tap="electMember(m)">
				<view class="member-info">
					<view class="member-avatar-placeholder">{{ (m.nickname || '?')[0] }}</view>
					<view class="member-detail">
						<text class="member-name">{{ m.nickname }}</text>
						<text class="member-role">{{ m.role === 'leader' ? '🏆 ' + t('members.leader') : t('members.member') }}</text>
					</view>
				</view>
				<text v-if="m.role === 'leader'" class="current-tag">{{ t('election.current') }}</text>
				<text v-else class="elect-btn">{{ t('election.elect') }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request'
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
	} catch (e) { console.error(e) }
}

const electMember = (m) => {
	if (m.role === 'leader') return
	uni.showModal({
		title: t('election.confirmTitle'),
		content: `${t('election.confirmMsg')} ${m.nickname}？`,
		success: async (res) => {
			if (!res.confirm) return
			try {
				const userInfo = getLocalUserInfo()
				const r = await post('/api/dorm/elect', { dormId: userInfo.dormId, userId: m._id })
				if (r.code === 200) {
					uni.showToast({ title: t('election.success'), icon: 'success' })
					fetchMembers()
				} else {
					uni.showToast({ title: r.msg, icon: 'none' })
				}
			} catch (e) { console.error(e) }
		}
	})
}

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('election.title') })
	fetchMembers()
})
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.container { padding: 24rpx; }
.section-title { font-size: 30rpx; font-weight: bold; margin-bottom: 12rpx; color: var(--text-primary); }
.desc { font-size: 26rpx; color: var(--text-hint); display: block; margin-bottom: 24rpx; }
.member-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx; margin-bottom: 16rpx; }
.member-info { display: flex; align-items: center; gap: 20rpx; }
.member-avatar-placeholder { width: 80rpx; height: 80rpx; border-radius: 50%; background-color: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 32rpx; }
.member-detail { display: flex; flex-direction: column; }
.member-name { font-size: 30rpx; color: var(--text-primary); font-weight: bold; }
.member-role { font-size: 24rpx; color: var(--text-hint); margin-top: 4rpx; }
.current-tag { font-size: 24rpx; color: #fa8c16; }
.elect-btn { font-size: 26rpx; color: var(--color-primary); }
</style>
