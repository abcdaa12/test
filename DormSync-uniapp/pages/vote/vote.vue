<template>
	<!-- 投票管理页：投票列表 + 发起投票 -->
	<view class="container">
		<!-- 发起投票按钮 -->
		<button class="btn-primary" @tap="showForm = !showForm">
			{{ showForm ? '收起表单' : '+ 发起新投票' }}
		</button>

		<!-- 发起投票表单 -->
		<view v-if="showForm" class="card form-card">
			<view class="form-title">发起新投票</view>
			<input
				class="input"
				v-model="form.title"
				placeholder="投票主题（如：周末聚餐地点）"
			/>
			<!-- 动态选项输入 -->
			<view v-for="(opt, idx) in form.options" :key="idx" class="option-row">
				<input
					class="input option-input"
					v-model="form.options[idx]"
					:placeholder="'选项 ' + (idx + 1)"
				/>
				<text
					v-if="form.options.length > 2"
					class="option-del"
					@tap="removeOption(idx)"
				>✕</text>
			</view>
			<view class="option-actions">
				<text class="add-option" @tap="addOption">+ 添加选项</text>
			</view>
			<button class="btn-primary" @tap="submitVote">发起投票</button>
		</view>

		<!-- 投票列表 -->
		<view class="section-title">投票列表</view>
		<view v-if="voteList.length === 0" class="empty-tip">
			<text>暂无投票</text>
		</view>
		<view v-for="(vote, index) in voteList" :key="index" class="card vote-item">
			<view class="vote-header">
				<text class="vote-title">{{ vote.title }}</text>
				<text :class="['vote-status', vote.status === 'active' ? 'active' : 'ended']">
					{{ vote.status === 'active' ? '进行中' : '已结束' }}
				</text>
			</view>
			<!-- 选项及投票 -->
			<view
				v-for="(opt, oi) in vote.options"
				:key="oi"
				class="vote-option"
				@tap="doVote(index, oi)"
			>
				<view class="option-bar">
					<view class="option-fill" :style="{ width: getPercent(vote, oi) + '%' }"></view>
				</view>
				<view class="option-info">
					<text>{{ opt.label }}</text>
					<text class="option-count">{{ opt.count }} 票 ({{ getPercent(vote, oi) }}%)</text>
				</view>
			</view>
			<text class="vote-time">{{ vote.createTime }}</text>
		</view>
	</view>
</template>

<script setup>
/**
 * 投票管理页
 * - 展示投票列表，支持投票操作
 * - 发起新投票（含动态选项）
 */
import { ref, reactive, onMounted } from 'vue'
import { get, post } from '@/utils/request'

// 控制表单显示
const showForm = ref(false)

// 新投票表单
const form = reactive({
	title: '',
	options: ['', '']
})

// 投票列表（模拟数据）
const voteList = ref([
	{
		title: '周末聚餐选哪家？',
		status: 'active',
		options: [
			{ label: '火锅', count: 2 },
			{ label: '烧烤', count: 1 },
			{ label: '日料', count: 0 }
		],
		createTime: '2025-06-05'
	},
	{
		title: '空调温度设定',
		status: 'ended',
		options: [
			{ label: '24°C', count: 3 },
			{ label: '26°C', count: 1 }
		],
		createTime: '2025-05-28'
	}
])

/** 添加选项 */
const addOption = () => {
	if (form.options.length >= 6) {
		uni.showToast({ title: '最多6个选项', icon: 'none' })
		return
	}
	form.options.push('')
}

/** 删除选项 */
const removeOption = (idx) => {
	form.options.splice(idx, 1)
}

/**
 * 计算某选项的投票百分比
 */
const getPercent = (vote, optIndex) => {
	const total = vote.options.reduce((sum, o) => sum + o.count, 0)
	if (total === 0) return 0
	return Math.round((vote.options[optIndex].count / total) * 100)
}

/**
 * 投票操作
 */
const doVote = (voteIndex, optIndex) => {
	const vote = voteList.value[voteIndex]
	if (vote.status !== 'active') {
		uni.showToast({ title: '投票已结束', icon: 'none' })
		return
	}
	// TODO: 调用后端接口记录投票
	vote.options[optIndex].count++
	uni.showToast({ title: '投票成功', icon: 'success' })
}

/**
 * 提交新投票
 */
const submitVote = async () => {
	if (!form.title) {
		uni.showToast({ title: '请输入投票主题', icon: 'none' })
		return
	}
	const validOptions = form.options.filter(o => o.trim() !== '')
	if (validOptions.length < 2) {
		uni.showToast({ title: '至少需要2个有效选项', icon: 'none' })
		return
	}

	const newVote = {
		title: form.title,
		status: 'active',
		options: validOptions.map(label => ({ label, count: 0 })),
		createTime: new Date().toISOString().slice(0, 10)
	}

	// TODO: 调用后端接口
	// await post('/api/vote', newVote)

	voteList.value.unshift(newVote)

	// 重置表单
	form.title = ''
	form.options = ['', '']
	showForm.value = false

	uni.showToast({ title: '投票已发起', icon: 'success' })
}

onMounted(async () => {
	try {
		// TODO: 从后端获取投票列表
		// const res = await get('/api/vote/list')
		// voteList.value = res.data
	} catch (e) {
		console.log('获取投票列表失败', e)
	}
})
</script>

<style scoped>
/* 表单区域 */
.form-card {
	margin-top: 24rpx;
}
.form-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 24rpx;
	color: #333;
}

/* 选项输入行 */
.option-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}
.option-input {
	flex: 1;
}
.option-del {
	color: #e74c3c;
	font-size: 32rpx;
	padding: 8rpx 16rpx;
	margin-bottom: 20rpx;
}
.option-actions {
	margin-bottom: 20rpx;
}
.add-option {
	color: #4A90D9;
	font-size: 28rpx;
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

/* 投票条目 */
.vote-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}
.vote-title {
	font-size: 30rpx;
	font-weight: bold;
}
.vote-status {
	font-size: 24rpx;
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
}
.vote-status.active {
	background-color: #e8f5e9;
	color: #4caf50;
}
.vote-status.ended {
	background-color: #f5f5f5;
	color: #999;
}

/* 投票选项 */
.vote-option {
	margin-bottom: 16rpx;
	position: relative;
}
.option-bar {
	height: 48rpx;
	background-color: #f0f0f0;
	border-radius: 8rpx;
	overflow: hidden;
}
.option-fill {
	height: 100%;
	background-color: #4A90D9;
	border-radius: 8rpx;
	transition: width 0.3s;
	opacity: 0.2;
}
.option-info {
	position: absolute;
	top: 0;
	left: 16rpx;
	right: 16rpx;
	height: 48rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 26rpx;
}
.option-count {
	color: #666;
	font-size: 24rpx;
}
.vote-time {
	font-size: 22rpx;
	color: #bbb;
	display: block;
	text-align: right;
	margin-top: 8rpx;
}
</style>
