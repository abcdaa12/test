<template>
	<!-- 排班管理页：排班日历 + 一键生成 -->
	<view class="container">
		<!-- 操作区 -->
		<view class="card action-card">
			<view class="form-title">排班设置</view>
			<view class="setting-row">
				<text class="setting-label">排班周期</text>
				<picker :range="cycleOptions" @change="onCycleChange" :value="cycleIndex">
					<view class="picker-value">{{ cycleOptions[cycleIndex] }} ▾</view>
				</picker>
			</view>
			<view class="setting-row">
				<text class="setting-label">参与成员</text>
				<text class="setting-value">{{ members.join('、') }}</text>
			</view>
			<button class="btn-primary" @tap="generateSchedule">🔄 一键生成排班表</button>
		</view>

		<!-- 当前周排班展示 -->
		<view class="section-title">
			{{ currentWeekLabel }} 排班表
		</view>
		<view v-if="scheduleList.length === 0" class="empty-tip">
			<text>暂无排班，请点击上方按钮生成</text>
		</view>
		<view v-for="(item, index) in scheduleList" :key="index" class="card schedule-item">
			<view class="schedule-row">
				<text class="schedule-date">{{ item.date }}</text>
				<text class="schedule-weekday">{{ item.weekday }}</text>
				<text class="schedule-person">{{ item.person }}</text>
			</view>
		</view>

		<!-- 排班历史 -->
		<view v-if="historyList.length > 0">
			<view class="section-title">历史排班</view>
			<view v-for="(week, wi) in historyList" :key="wi" class="card">
				<view class="history-title">{{ week.label }}</view>
				<view
					v-for="(item, si) in week.items"
					:key="si"
					class="schedule-row history-row"
				>
					<text class="schedule-date">{{ item.date }}</text>
					<text class="schedule-weekday">{{ item.weekday }}</text>
					<text class="schedule-person">{{ item.person }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
/**
 * 排班管理页
 * - 一键生成排班表（按周轮换）
 * - 展示当前周和历史排班
 */
import { ref, computed, onMounted } from 'vue'
import { get, post } from '@/utils/request'

// 宿舍成员
const members = ref(['张三', '李四', '王五', '赵六'])

// 排班周期选项
const cycleOptions = ['按周排班', '按天轮换']
const cycleIndex = ref(0)

// 当前周排班
const scheduleList = ref([])

// 历史排班
const historyList = ref([])

// 星期映射
const weekdayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/**
 * 当前周标签
 */
const currentWeekLabel = computed(() => {
	const now = new Date()
	const monday = new Date(now)
	const day = now.getDay() || 7
	monday.setDate(now.getDate() - day + 1)
	const sunday = new Date(monday)
	sunday.setDate(monday.getDate() + 6)
	return `${formatDate(monday)} ~ ${formatDate(sunday)}`
})

/**
 * 格式化日期为 MM-DD
 */
const formatDate = (date) => {
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${m}-${d}`
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
const formatFullDate = (date) => {
	const y = date.getFullYear()
	return `${y}-${formatDate(date)}`
}

/**
 * 切换排班周期
 */
const onCycleChange = (e) => {
	cycleIndex.value = Number(e.detail.value)
}

/**
 * 一键生成排班表
 * 按成员数量轮换分配到本周每一天
 */
const generateSchedule = () => {
	const now = new Date()
	const day = now.getDay() || 7
	const monday = new Date(now)
	monday.setDate(now.getDate() - day + 1)

	const list = []
	for (let i = 0; i < 7; i++) {
		const d = new Date(monday)
		d.setDate(monday.getDate() + i)
		list.push({
			date: formatFullDate(d),
			weekday: weekdayMap[d.getDay()],
			person: members.value[i % members.value.length]
		})
	}

	// 如果已有排班，存入历史
	if (scheduleList.value.length > 0) {
		historyList.value.unshift({
			label: currentWeekLabel.value,
			items: [...scheduleList.value]
		})
	}

	scheduleList.value = list

	// TODO: 调用后端接口保存排班
	// await post('/api/schedule', { items: list })

	uni.showToast({ title: '排班已生成', icon: 'success' })
}

onMounted(async () => {
	try {
		// TODO: 从后端获取排班数据
		// const res = await get('/api/schedule/current')
		// scheduleList.value = res.data
	} catch (e) {
		console.log('获取排班数据失败', e)
	}
})
</script>

<style scoped>
/* 操作卡片 */
.action-card {
	margin-bottom: 24rpx;
}
.form-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 24rpx;
	color: #333;
}
.setting-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}
.setting-label {
	font-size: 28rpx;
	color: #666;
}
.setting-value {
	font-size: 26rpx;
	color: #999;
}
.picker-value {
	font-size: 28rpx;
	color: #4A90D9;
}

/* 分区标题 */
.section-title {
	font-size: 30rpx;
	font-weight: bold;
	margin: 32rpx 0 16rpx;
	color: #333;
}

/* 空状态 */
.empty-tip {
	text-align: center;
	padding: 60rpx 0;
	color: #ccc;
	font-size: 28rpx;
}

/* 排班行 */
.schedule-row {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}
.schedule-row:last-child {
	border-bottom: none;
}
.schedule-date {
	width: 200rpx;
	font-size: 26rpx;
	color: #333;
}
.schedule-weekday {
	width: 120rpx;
	font-size: 26rpx;
	color: #888;
	text-align: center;
}
.schedule-person {
	flex: 1;
	font-size: 30rpx;
	color: #4A90D9;
	font-weight: bold;
	text-align: right;
}

/* 历史排班 */
.history-title {
	font-size: 26rpx;
	color: #999;
	margin-bottom: 12rpx;
}
.history-row {
	opacity: 0.7;
}
</style>
