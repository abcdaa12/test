<template>
	<!-- 费用管理页：费用列表 + 发起新费用 -->
	<view class="container">
		<!-- 发起新费用按钮 -->
		<button class="btn-primary" @tap="showForm = !showForm">
			{{ showForm ? '收起表单' : '+ 发起新费用' }}
		</button>

		<!-- 新费用表单 -->
		<view v-if="showForm" class="card form-card">
			<view class="form-title">发起新费用</view>
			<input
				class="input"
				v-model="form.title"
				placeholder="费用名称（如：电费）"
			/>
			<input
				class="input"
				v-model="form.amount"
				type="digit"
				placeholder="金额（元）"
			/>
			<input
				class="input"
				v-model="form.payer"
				placeholder="付款人"
			/>
			<input
				class="input"
				v-model="form.remark"
				placeholder="备注（选填）"
			/>
			<button class="btn-primary" @tap="submitFee">提交费用</button>
		</view>

		<!-- 费用列表 -->
		<view class="section-title">费用记录</view>
		<view v-if="feeList.length === 0" class="empty-tip">
			<text>暂无费用记录</text>
		</view>
		<view v-for="(item, index) in feeList" :key="index" class="card fee-item">
			<view class="fee-header">
				<text class="fee-title">{{ item.title }}</text>
				<text class="fee-amount">¥{{ item.amount }}</text>
			</view>
			<view class="fee-detail">
				<text>付款人：{{ item.payer }}</text>
				<text>人均：¥{{ item.perPerson }}</text>
			</view>
			<text v-if="item.remark" class="fee-remark">备注：{{ item.remark }}</text>
			<text class="fee-time">{{ item.createTime }}</text>
		</view>
	</view>
</template>

<script setup>
/**
 * 费用管理页
 * - 展示费用列表
 * - 发起新费用（本地模拟 + 接口预留）
 */
import { ref, reactive, onMounted } from 'vue'
import { get, post } from '@/utils/request'

// 控制表单显示
const showForm = ref(false)

// 宿舍人数（用于计算人均）
const memberCount = 4

// 新费用表单数据
const form = reactive({
	title: '',
	amount: '',
	payer: '',
	remark: ''
})

// 费用列表
const feeList = ref([
	{
		title: '6月电费',
		amount: '120.00',
		payer: '张三',
		perPerson: '30.00',
		remark: '',
		createTime: '2025-06-01'
	},
	{
		title: '桶装水',
		amount: '40.00',
		payer: '李四',
		perPerson: '10.00',
		remark: '农夫山泉 5桶',
		createTime: '2025-06-03'
	}
])

/**
 * 提交新费用
 */
const submitFee = async () => {
	// 表单校验
	if (!form.title || !form.amount || !form.payer) {
		uni.showToast({ title: '请填写完整信息', icon: 'none' })
		return
	}

	const amount = parseFloat(form.amount)
	if (isNaN(amount) || amount <= 0) {
		uni.showToast({ title: '请输入有效金额', icon: 'none' })
		return
	}

	// 构造费用对象
	const newFee = {
		title: form.title,
		amount: amount.toFixed(2),
		payer: form.payer,
		perPerson: (amount / memberCount).toFixed(2),
		remark: form.remark,
		createTime: new Date().toISOString().slice(0, 10)
	}

	// TODO: 调用后端接口
	// await post('/api/fee', newFee)

	// 本地添加到列表顶部
	feeList.value.unshift(newFee)

	// 重置表单
	form.title = ''
	form.amount = ''
	form.payer = ''
	form.remark = ''
	showForm.value = false

	uni.showToast({ title: '费用已添加', icon: 'success' })
}

/**
 * 页面加载时获取费用列表（预留接口）
 */
onMounted(async () => {
	try {
		// TODO: 从后端获取费用列表
		// const res = await get('/api/fee/list')
		// feeList.value = res.data
	} catch (e) {
		console.log('获取费用列表失败', e)
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

/* 分区标题 */
.section-title {
	font-size: 30rpx;
	font-weight: bold;
	margin: 32rpx 0 16rpx;
	color: #333;
}

/* 空状态提示 */
.empty-tip {
	text-align: center;
	padding: 60rpx 0;
	color: #ccc;
	font-size: 28rpx;
}

/* 费用条目 */
.fee-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}
.fee-title {
	font-size: 30rpx;
	font-weight: bold;
}
.fee-amount {
	font-size: 34rpx;
	color: #e74c3c;
	font-weight: bold;
}
.fee-detail {
	display: flex;
	justify-content: space-between;
	font-size: 26rpx;
	color: #666;
	margin-bottom: 8rpx;
}
.fee-remark {
	font-size: 24rpx;
	color: #999;
	display: block;
	margin-bottom: 8rpx;
}
.fee-time {
	font-size: 22rpx;
	color: #bbb;
	display: block;
	text-align: right;
}
</style>
