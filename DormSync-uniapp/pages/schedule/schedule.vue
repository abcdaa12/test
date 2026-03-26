<template>
	<view :class="['container', isDark ? 'dark-mode' : '']">
		<view class="card action-card">
			<view class="form-title">{{ t('schedule.setting') }}</view>
			<view class="setting-row">
				<text class="setting-label">{{ t('schedule.cycle') }}</text>
				<picker :range="cycleOptions" @change="onCycleChange" :value="cycleIndex">
					<view class="picker-value">{{ cycleOptions[cycleIndex] }} ▾</view>
				</picker>
			</view>
			<view class="setting-row">
				<text class="setting-label">{{ t('schedule.members') }}</text>
				<text class="setting-value">{{ memberNames.join('、') || t('schedule.noMember') }}</text>
			</view>
			<button class="btn-primary" @tap="generateSchedule">🔄 {{ t('schedule.generate') }}</button>
		</view>

		<view class="section-title">{{ currentWeekLabel }} {{ t('schedule.table') }}</view>
		<scroll-view scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" style="height: calc(100vh - 500rpx);">
			<view v-if="scheduleList.length === 0" class="empty-tip">
				<text>{{ t('schedule.noSchedule') }}</text>
			</view>
			<view v-for="(item, index) in scheduleList" :key="index" class="card schedule-item">
				<view class="schedule-row">
					<text class="schedule-date">{{ item.date }}</text>
					<text class="schedule-weekday">{{ item.weekday }}</text>
					<text class="schedule-person">{{ item.personName }}</text>
				</view>
			</view>

			<view v-if="historyList.length > 0">
				<view class="section-title">{{ t('schedule.history') }}</view>
				<view v-for="(week, wi) in historyList" :key="wi" class="card">
					<view class="history-title">{{ week.weekLabel }}</view>
					<view v-for="(item, si) in week.items" :key="si" class="schedule-row history-row">
						<text class="schedule-date">{{ item.date }}</text>
						<text class="schedule-weekday">{{ item.weekday }}</text>
						<text class="schedule-person">{{ item.personName }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request'
import { t } from '@/utils/i18n'
import { isDark, applyNavBarTheme } from '@/utils/theme'
import { getLocalUserInfo } from '@/utils/auth'

const members = ref([])
const memberNames = computed(() => members.value.map(m => m.nickname))
const cycleOptions = computed(() => [t('schedule.weekly'), t('schedule.daily')])
const cycleIndex = ref(0)
const scheduleList = ref([])
const historyList = ref([])
const refreshing = ref(false)

const weekdayMap = computed(() => [
	t('schedule.sun'), t('schedule.mon'), t('schedule.tue'), t('schedule.wed'),
	t('schedule.thu'), t('schedule.fri'), t('schedule.sat')
])

const currentWeekLabel = computed(() => {
	const now = new Date()
	const monday = new Date(now)
	const day = now.getDay() || 7
	monday.setDate(now.getDate() - day + 1)
	const sunday = new Date(monday)
	sunday.setDate(monday.getDate() + 6)
	return `${formatDate(monday)} ~ ${formatDate(sunday)}`
})

const formatDate = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const formatFullDate = (d) => `${d.getFullYear()}-${formatDate(d)}`
const onCycleChange = (e) => { cycleIndex.value = Number(e.detail.value) }

const fetchMembers = async () => {
	try {
		const userInfo = getLocalUserInfo()
		if (!userInfo.dormId) return
		const res = await get(`/api/dorm/members?dormId=${userInfo.dormId}`)
		if (res.code === 200) members.value = res.data || []
	} catch (e) { console.error('获取成员失败', e) }
}

const fetchSchedule = async () => {
	try {
		const userInfo = getLocalUserInfo()
		if (!userInfo.dormId) return
		const res = await get(`/api/schedule/current?dormId=${userInfo.dormId}`)
		if (res.code === 200 && res.data) {
			scheduleList.value = res.data.items || []
		}
		const hRes = await get(`/api/schedule/history?dormId=${userInfo.dormId}`)
		if (hRes.code === 200) historyList.value = hRes.data || []
	} catch (e) { console.error('获取排班失败', e) }
}

const generateSchedule = async () => {
	if (members.value.length === 0) {
		uni.showToast({ title: t('schedule.noMember'), icon: 'none' }); return
	}
	const now = new Date()
	const day = now.getDay() || 7
	const monday = new Date(now)
	monday.setDate(now.getDate() - day + 1)

	const items = []
	for (let i = 0; i < 7; i++) {
		const d = new Date(monday)
		d.setDate(monday.getDate() + i)
		const member = members.value[i % members.value.length]
		items.push({
			date: formatFullDate(d),
			weekday: weekdayMap.value[d.getDay()],
			personId: member._id,
			personName: member.nickname
		})
	}

	const userInfo = getLocalUserInfo()
	try {
		const res = await post('/api/schedule/create', {
			dormId: userInfo.dormId,
			weekLabel: currentWeekLabel.value,
			cycle: cycleIndex.value === 0 ? 'weekly' : 'daily',
			items
		})
		if (res.code === 200) {
			uni.showToast({ title: t('schedule.generated'), icon: 'success' })
			fetchSchedule()
			// 请求值日提醒订阅授权
			requestDutySubscribe()
		}
	} catch (e) { console.error('生成排班失败', e) }
}

const onRefresh = async () => { refreshing.value = true; await fetchSchedule(); refreshing.value = false }

// 请求值日提醒订阅授权
const requestDutySubscribe = () => {
	// #ifdef MP-WEIXIN
	const tmplIds = ['YOUR_DUTY_REMINDER_TEMPLATE_ID'].filter(id => !id.startsWith('YOUR_'))
	if (tmplIds.length === 0) return
	uni.requestSubscribeMessage({
		tmplIds,
		success(res) { console.log('值日订阅授权:', res) },
		fail(err) { console.log('值日订阅取消:', err) }
	})
	// #endif
}

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('schedule.title') })
	fetchMembers().then(() => fetchSchedule())
})
</script>

<style scoped>
.container { min-height: 100vh; background-color: var(--bg-page); padding: 24rpx; }
.action-card { margin-bottom: 24rpx; }
.form-title { font-size: 32rpx; font-weight: bold; margin-bottom: 24rpx; color: var(--text-primary); }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid var(--border-light); }
.setting-label { font-size: 28rpx; color: var(--text-secondary); }
.setting-value { font-size: 26rpx; color: var(--text-hint); }
.picker-value { font-size: 28rpx; color: var(--color-primary); }
.section-title { font-size: 30rpx; font-weight: bold; margin: 32rpx 0 16rpx; color: var(--text-primary); }
.empty-tip { text-align: center; padding: 60rpx 0; color: var(--text-placeholder); font-size: 28rpx; }
.schedule-row { display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid var(--border-light); }
.schedule-row:last-child { border-bottom: none; }
.schedule-date { width: 200rpx; font-size: 26rpx; color: var(--text-primary); }
.schedule-weekday { width: 120rpx; font-size: 26rpx; color: var(--text-hint); text-align: center; }
.schedule-person { flex: 1; font-size: 30rpx; color: var(--color-primary); font-weight: bold; text-align: right; }
.history-title { font-size: 26rpx; color: var(--text-hint); margin-bottom: 12rpx; }
.history-row { opacity: 0.7; }
</style>
