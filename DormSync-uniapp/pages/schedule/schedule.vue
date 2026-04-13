<template>
	<view :class="['container', isDark ? 'dark-mode' : '']">
		<!-- 月份切换 -->
		<view class="month-nav">
			<text class="nav-arrow" @tap="changeMonth(-1)">◀</text>
			<text class="month-label">{{ currentYear }}.{{ String(currentMonth + 1).padStart(2, '0') }}</text>
			<text class="nav-arrow" @tap="changeMonth(1)">▶</text>
		</view>

		<!-- 星期头 -->
		<view class="weekday-row">
			<text v-for="(w, i) in weekHeaders" :key="i" class="weekday-cell">{{ w }}</text>
		</view>

		<!-- 日历格子 -->
		<view class="calendar-grid">
			<view v-for="(day, i) in calendarDays" :key="i"
				:class="['day-cell', day.isToday ? 'today' : '', day.isOtherMonth ? 'other-month' : '', day.person ? 'has-duty' : '', day.isPreview ? 'preview-duty' : '']"
				@tap="day.dateStr && onDayTap(day)">
				<text class="day-num">{{ day.day || '' }}</text>
				<text v-if="day.person" :class="['day-person', day.isPreview ? 'preview-text' : '']">{{ day.person }}</text>
			</view>
		</view>

		<!-- AI 排班区域 -->
		<view class="ai-section">
			<view class="ai-header">
				<text class="ai-title">🤖 {{ t('schedule.aiTitle') }}</text>
			</view>
			<view class="ai-input-row">
				<input class="ai-input" v-model="aiPrompt" :placeholder="t('schedule.aiPh')" @confirm="callAI" />
				<view class="ai-btn" @tap="callAI">
					<text class="ai-btn-text">{{ aiLoading ? '...' : t('schedule.aiBtn') }}</text>
				</view>
			</view>
			<view class="ai-tips">
				<text class="ai-tip-title">{{ t('schedule.aiTipTitle') }}</text>
				<text class="ai-tip" @tap="aiPrompt = t('schedule.aiEx1')">💡 {{ t('schedule.aiEx1') }}</text>
				<text class="ai-tip" @tap="aiPrompt = t('schedule.aiEx2')">💡 {{ t('schedule.aiEx2') }}</text>
				<text class="ai-tip" @tap="aiPrompt = t('schedule.aiEx3')">💡 {{ t('schedule.aiEx3') }}</text>
			</view>
		</view>

		<!-- AI 生成结果操作栏 -->
		<view v-if="aiResult.length > 0" class="ai-result">
			<view class="result-header">
				<text class="result-title">📋 {{ t('schedule.aiResult') }}（{{ aiResult.length }}{{ t('schedule.days') }}）</text>
			</view>
			<text class="result-hint">{{ t('schedule.previewHint') }}</text>
			<view class="result-actions">
				<button class="btn-save" @tap="saveAIResult">{{ t('schedule.saveSchedule') }}</button>
				<text class="btn-cancel" @tap="aiResult = []">{{ t('schedule.discard') }}</text>
			</view>
		</view>

		<!-- 当日详情弹窗 -->
		<view v-if="dayDetailVisible" class="modal-mask" @tap="dayDetailVisible = false">
			<view class="modal-content" @tap.stop>
				<view class="modal-header">
					<text class="modal-title">{{ selectedDay.dateStr }} {{ selectedDay.weekday }}</text>
					<text class="modal-close" @tap="dayDetailVisible = false">✕</text>
				</view>
				<view class="detail-info">
					<text v-if="selectedDay.person" class="detail-person">🧹 {{ t('schedule.dutyPerson') }}：{{ selectedDay.person }}</text>
					<text v-else class="detail-empty">{{ t('schedule.noDuty') }}</text>
				</view>
				<view class="detail-divider"></view>
				<text class="detail-edit-title">{{ t('schedule.editDuty') }}</text>
				<view class="member-pick-list">
					<view v-for="m in members" :key="m._id" class="member-pick-item" @tap="assignDuty(selectedDay, m)">
						<text>{{ m.nickname }}</text>
					</view>
					<view class="member-pick-item clear-item" @tap="clearDuty(selectedDay)">
						<text>{{ t('schedule.clearDuty') }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request'
import { t } from '@/utils/i18n'
import { isDark, applyNavBarTheme } from '@/utils/theme'
import { getLocalUserInfo } from '@/utils/auth'

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const scheduleItems = ref([])
const members = ref([])
const aiPrompt = ref('')
const aiLoading = ref(false)
const aiResult = ref([])
const dayDetailVisible = ref(false)
const selectedDay = ref({})

const weekHeaders = computed(() => [
	t('schedule.sun'), t('schedule.mon'), t('schedule.tue'), t('schedule.wed'),
	t('schedule.thu'), t('schedule.fri'), t('schedule.sat')
])

const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 生成日历格子（合并已保存排班 + AI预览）
const calendarDays = computed(() => {
	const year = currentYear.value
	const month = currentMonth.value
	const firstDay = new Date(year, month, 1).getDay()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const today = new Date()
	const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

	// AI 预览数据转 map
	const previewMap = {}
	aiResult.value.forEach(item => { previewMap[item.date] = item.personName })

	const cells = []
	// 上月补位
	const prevDays = new Date(year, month, 0).getDate()
	for (let i = firstDay - 1; i >= 0; i--) {
		cells.push({ day: prevDays - i, isOtherMonth: true, dateStr: '', person: '' })
	}
	// 本月
	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
		const saved = scheduleItems.value.find(s => s.date === dateStr)
		const previewName = previewMap[dateStr]
		cells.push({
			day: d, isOtherMonth: false, dateStr,
			isToday: dateStr === todayStr,
			person: previewName || (saved ? saved.personName : ''),
			isPreview: !!previewName && !saved,
			weekday: weekdayNames[new Date(year, month, d).getDay()]
		})
	}
	// 下月补位
	const remain = 42 - cells.length
	for (let i = 1; i <= remain; i++) {
		cells.push({ day: i, isOtherMonth: true, dateStr: '', person: '' })
	}
	return cells
})

const changeMonth = (delta) => {
	let m = currentMonth.value + delta
	let y = currentYear.value
	if (m < 0) { m = 11; y-- }
	if (m > 11) { m = 0; y++ }
	currentMonth.value = m
	currentYear.value = y
	fetchSchedule()
}

const onDayTap = (day) => {
	selectedDay.value = day
	dayDetailVisible.value = true
}

// 手动指定某天的值日人
const assignDuty = (day, member) => {
	// 如果有 AI 预览结果，修改预览
	const previewIdx = aiResult.value.findIndex(i => i.date === day.dateStr)
	if (previewIdx >= 0) {
		aiResult.value[previewIdx].personName = member.nickname
		aiResult.value[previewIdx].personId = member._id
	} else if (aiResult.value.length > 0) {
		// AI 预览模式下，添加新的一天
		aiResult.value.push({ date: day.dateStr, weekday: day.weekday, personName: member.nickname, personId: member._id })
	} else {
		// 没有 AI 预览，直接修改已保存的排班
		const idx = scheduleItems.value.findIndex(i => i.date === day.dateStr)
		if (idx >= 0) {
			scheduleItems.value[idx].personName = member.nickname
			scheduleItems.value[idx].personId = member._id
		} else {
			scheduleItems.value.push({ date: day.dateStr, weekday: day.weekday, personName: member.nickname, personId: member._id })
		}
	}
	dayDetailVisible.value = false
}

// 清除某天的排班
const clearDuty = (day) => {
	const previewIdx = aiResult.value.findIndex(i => i.date === day.dateStr)
	if (previewIdx >= 0) {
		aiResult.value.splice(previewIdx, 1)
	} else {
		const idx = scheduleItems.value.findIndex(i => i.date === day.dateStr)
		if (idx >= 0) scheduleItems.value.splice(idx, 1)
	}
	dayDetailVisible.value = false
}

const fetchMembers = async () => {
	const userInfo = getLocalUserInfo()
	if (!userInfo.dormId) return
	try {
		const res = await get(`/api/dorm/members?dormId=${userInfo.dormId}`)
		if (res.code === 200) members.value = res.data || []
	} catch (e) { console.error(e) }
}

const fetchSchedule = async () => {
	const userInfo = getLocalUserInfo()
	if (!userInfo.dormId) return
	try {
		const res = await get(`/api/schedule/current?dormId=${userInfo.dormId}`)
		const currentItems = (res.code === 200 && res.data) ? (res.data.items || []) : []

		// 加载历史排班合并显示
		const hRes = await get(`/api/schedule/history?dormId=${userInfo.dormId}`)
		const historyItems = []
		if (hRes.code === 200 && hRes.data) {
			hRes.data.forEach(h => { if (h.items) historyItems.push(...h.items) })
		}

		// 先放历史，再放最新，最新的覆盖旧的
		const map = {}
		historyItems.forEach(item => { map[item.date] = item })
		currentItems.forEach(item => { map[item.date] = item })
		scheduleItems.value = Object.values(map)
	} catch (e) { console.error(e) }
}

const callAI = async () => {
	if (!aiPrompt.value.trim() || aiLoading.value) return
	const userInfo = getLocalUserInfo()
	if (!userInfo.dormId) return
	aiLoading.value = true
	try {
		const startDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-01`
		const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
		const res = await post('/api/schedule/ai-generate', {
			dormId: userInfo.dormId,
			prompt: aiPrompt.value.trim(),
			startDate,
			days: daysInMonth
		})
		if (res.code === 200 && res.data) {
			aiResult.value = res.data.items || []
			uni.showToast({ title: t('schedule.aiSuccess'), icon: 'success' })
		} else {
			uni.showToast({ title: res.msg || t('schedule.aiFail'), icon: 'none' })
		}
	} catch (e) {
		console.error(e)
		uni.showToast({ title: t('schedule.aiFail'), icon: 'none' })
	} finally { aiLoading.value = false }
}

const saveAIResult = async () => {
	const userInfo = getLocalUserInfo()
	if (!userInfo.dormId || aiResult.value.length === 0) return
	const items = aiResult.value
	const weekLabel = `${items[0].date} ~ ${items[items.length - 1].date}`
	try {
		const res = await post('/api/schedule/create', {
			dormId: userInfo.dormId, weekLabel, cycle: 'weekly', items
		})
		if (res.code === 200) {
			uni.showToast({ title: t('schedule.saved'), icon: 'success' })
			aiResult.value = []
			aiPrompt.value = ''
			fetchSchedule()
		}
	} catch (e) { console.error(e) }
}

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('schedule.title') })
	fetchMembers().then(() => fetchSchedule())
})
</script>

<style scoped>
.container { min-height: 100vh; background-color: var(--bg-page); padding: 24rpx; }

/* 月份导航 */
.month-nav { display: flex; justify-content: center; align-items: center; gap: 40rpx; margin-bottom: 20rpx; }
.nav-arrow { font-size: 32rpx; color: var(--color-primary); padding: 12rpx 20rpx; }
.month-label { font-size: 34rpx; font-weight: bold; color: var(--text-primary); }

/* 星期头 */
.weekday-row { display: flex; }
.weekday-cell { flex: 1; text-align: center; font-size: 24rpx; color: var(--text-hint); padding: 12rpx 0; }

/* 日历格子 */
.calendar-grid { display: flex; flex-wrap: wrap; }
.day-cell {
	width: 14.285%; box-sizing: border-box; min-height: 100rpx;
	display: flex; flex-direction: column; align-items: center;
	padding: 8rpx 4rpx; border: 1rpx solid var(--border-light);
}
.day-cell.other-month { opacity: 0.3; }
.day-cell.today { background-color: #e3f2fd; }
.dark-mode .day-cell.today { background-color: #0d47a1; }
.day-cell.has-duty { background-color: #f1f8e9; }
.dark-mode .day-cell.has-duty { background-color: #1a2a1a; }
.day-cell.preview-duty { background-color: #f1f8e9; }
.dark-mode .day-cell.preview-duty { background-color: #1a2a1a; }
.day-num { font-size: 24rpx; color: var(--text-primary); }
.day-person { font-size: 18rpx; color: var(--color-primary); margin-top: 4rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 90rpx; }
.preview-text { color: var(--color-primary); }

/* AI 区域 */
.ai-section { margin-top: 32rpx; background: var(--bg-card); border-radius: 16rpx; padding: 28rpx 24rpx; }
.ai-header { margin-bottom: 20rpx; }
.ai-title { font-size: 30rpx; font-weight: bold; color: var(--text-primary); }
.ai-input-row { display: flex; gap: 12rpx; margin-bottom: 16rpx; }
.ai-input {
	flex: 1; height: 72rpx; border: 1rpx solid var(--border-color);
	border-radius: 12rpx; padding: 0 20rpx; font-size: 26rpx;
	color: var(--text-primary); background: var(--bg-input);
}
.ai-btn {
	height: 72rpx; padding: 0 28rpx; background: linear-gradient(135deg, #667eea, #764ba2);
	border-radius: 12rpx; display: flex; align-items: center;
}
.ai-btn-text { color: #fff; font-size: 26rpx; white-space: nowrap; }
.ai-tips { margin-top: 8rpx; }
.ai-tip-title { font-size: 22rpx; color: var(--text-hint); display: block; margin-bottom: 8rpx; }
.ai-tip { font-size: 24rpx; color: var(--color-primary); display: block; padding: 8rpx 0; }

/* AI 结果 */
.ai-result { margin-top: 24rpx; background: var(--bg-card); border-radius: 16rpx; padding: 24rpx; border: 2rpx solid var(--color-primary); }
.result-header { margin-bottom: 16rpx; }
.result-title { font-size: 28rpx; font-weight: bold; color: var(--text-primary); }
.result-hint { font-size: 24rpx; color: var(--text-hint); margin-bottom: 16rpx; }
.result-item { display: flex; justify-content: space-between; padding: 14rpx 0; border-bottom: 1rpx solid var(--border-light); }
.result-item:last-child { border-bottom: none; }
.result-date { font-size: 26rpx; color: var(--text-secondary); }
.result-person { font-size: 26rpx; color: var(--color-primary); font-weight: bold; }
.result-actions { display: flex; align-items: center; gap: 24rpx; margin-top: 20rpx; }
.btn-save {
	flex: 1; height: 76rpx; line-height: 76rpx; background: var(--color-primary);
	color: #fff; border-radius: 12rpx; font-size: 28rpx; border: none;
}
.btn-save::after { border: none; }
.btn-cancel { font-size: 26rpx; color: var(--text-hint); padding: 0 16rpx; }

/* 弹窗 */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-content { width: 80%; background: var(--bg-card, #fff); border-radius: 20rpx; padding: 36rpx 32rpx; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.modal-title { font-size: 34rpx; font-weight: bold; color: var(--text-primary); }
.modal-close { font-size: 36rpx; color: var(--text-hint); padding: 8rpx 16rpx; }
.detail-info { text-align: center; padding: 20rpx 0; }
.detail-weekday { font-size: 28rpx; color: var(--text-secondary); display: block; margin-bottom: 16rpx; }
.detail-person { font-size: 32rpx; color: var(--color-primary); font-weight: bold; }
.detail-empty { font-size: 28rpx; color: var(--text-placeholder); }
.detail-divider { height: 1rpx; background: var(--border-light); margin: 20rpx 0; }
.detail-edit-title { font-size: 26rpx; color: var(--text-secondary); display: block; margin-bottom: 16rpx; }
.member-pick-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.member-pick-item {
	padding: 16rpx 28rpx; background: var(--bg-input); border-radius: 12rpx;
	font-size: 26rpx; color: var(--text-primary);
}
.member-pick-item:active { background: var(--color-primary); color: #fff; }
.clear-item { color: #ff4d4f; background: #fff1f0; }
.dark-mode .clear-item { background: #2a1010; }
</style>
