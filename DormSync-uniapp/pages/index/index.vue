<template>
	<!-- 首页：宿舍信息、欢迎语、公告、待办事项 -->
	<view class="page">
		<view class="container">
			<!-- 顶部通栏：宿舍号 -->
			<view class="dorm-banner">
				<text class="dorm-number">🏠 {{ dormNo }} 宿舍</text>
			</view>

			<!-- 欢迎区：动态显示当前用户昵称 -->
			<view class="welcome-section">
				<text class="welcome-text">{{ nickname }}，你好！✨</text>
			</view>

			<!-- 宿舍公告区 -->
			<view class="notice-card">
				<view class="section-header">
					<text class="section-title">📢 宿舍公告</text>
				</view>
				<view class="notice-content">
					<!-- 占位符：公告内容，后续从接口获取 -->
					<text class="notice-text">{{ announcement }}</text>
				</view>
			</view>

			<!-- 待办事项区（仅显示未完成） -->
			<view class="todo-card">
				<view class="section-header">
					<text class="section-title">📋 我的待办</text>
				</view>
				<!-- 有待办时显示列表 -->
				<view v-if="todoList.length > 0" class="todo-list">
					<view
						v-for="(item, index) in todoList"
						:key="item._id || index"
						class="todo-item todo-item-clickable"
						@click="handleTodoClick(item)"
					>
						<text class="todo-status undone">[未完成]</text>
						<text class="todo-text">{{ item.content }}</text>
						<text class="todo-arrow">›</text>
					</view>
				</view>
				<!-- 无待办时显示空状态 -->
				<view v-else class="todo-empty">
					<text>暂无待办事项🎉</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
/**
 * 首页
 * - 使用原生导航栏，通过 uni.setNavigationBarTitle 动态修改标题
 * - 顶部通栏展示宿舍号
 * - 欢迎区动态显示当前用户昵称
 * - 宿舍公告区展示最新公告
 * - 待办事项区展示个人待办列表
 */
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get } from '../../utils/request.js'
import { isLoggedIn, getLocalUserInfo } from '../../utils/auth.js'

// 宿舍号（后续从接口/缓存获取）
const dormNo = ref('5号楼306')

// 当前用户昵称（从本地登录态读取，未登录时显示默认值）
const nickname = ref('宿舍成员')

// 宿舍公告内容（占位符，后续从接口获取）
const announcement = ref('本周三卫生检查，请各位同学提前做好清洁工作。')

// 待办事项列表（仅未完成）
const todoList = ref([])

// 待办类型 -> 跳转页面路径映射
const todoPageMap = {
	vote: '/pages/vote/vote',
	task: '/pages/schedule/schedule',
	finance: '/pages/fee/fee'
}

/**
 * 获取未完成待办列表
 */
const fetchTodoList = async () => {
	try {
		const userId = uni.getStorageSync('userId')
		// 有 userId 就带上，没有就不传（后端兼容处理）
		const url = userId ? `/api/todo/list?userId=${userId}` : '/api/todo/list'
		const res = await get(url)
		if (res.code === 200) {
			todoList.value = res.data || []
		}
	} catch (e) {
		console.error('获取待办列表失败', e)
	}
}

/**
 * 点击待办项，跳转到对应处理页面
 */
const handleTodoClick = (item) => {
	const path = todoPageMap[item.type]
	if (!path) return
	// 拼接跳转路径，带上关联ID
	const url = item.relatedId ? `${path}?id=${item.relatedId}` : path
	uni.navigateTo({
		url,
		fail: () => {
			// tabBar 页面用 switchTab（不支持传参，降级处理）
			uni.switchTab({ url: path })
		}
	})
}

/**
 * 页面显示时刷新数据（需先检查登录态）
 */
onShow(() => {
	if (!isLoggedIn()) {
		uni.redirectTo({ url: '/pages/login/login' })
		return
	}
	const userInfo = getLocalUserInfo()
	nickname.value = userInfo.nickname || '宿舍成员'

	uni.setNavigationBarTitle({
		title: `${dormNo.value} - 宿舍管理平台`
	})
	fetchTodoList()
})

onMounted(() => {
	if (isLoggedIn()) {
		fetchTodoList()
	}
})
</script>

<style scoped>
/* 页面容器 */
.page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

/* 内容区 */
.container {
	padding: 24rpx;
}

/* 顶部宿舍号通栏 */
.dorm-banner {
	background-color: #E6F7FF;
	border-radius: 10px;
	padding: 20rpx 30rpx;
	margin-bottom: 24rpx;
}
.dorm-number {
	font-size: 36rpx;
	font-weight: bold;
	color: #1677FF;
}

/* 欢迎区 */
.welcome-section {
	margin-bottom: 24rpx;
	padding: 0 8rpx;
}
.welcome-text {
	font-size: 30rpx;
	color: #333;
}

/* 公告卡片 */
.notice-card {
	background-color: #fff;
	border: 1rpx solid #eeeeee;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
}
.section-header {
	margin-bottom: 16rpx;
}
.section-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
}
.notice-text {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
}

/* 待办卡片 */
.todo-card {
	background-color: #fff;
	border: 1rpx solid #eeeeee;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
}
.todo-list {
	margin-top: 8rpx;
}
.todo-item {
	display: flex;
	align-items: center;
	padding: 18rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}
.todo-item-clickable {
	cursor: pointer;
}
.todo-item-clickable:active {
	background-color: #f0f0f0;
}
.todo-item:last-child {
	border-bottom: none;
}
.todo-status {
	font-size: 24rpx;
	margin-right: 12rpx;
	flex-shrink: 0;
}
.todo-status.undone {
	color: #fa541c;
}
.todo-status.done {
	color: #52c41a;
}
.todo-text {
	font-size: 28rpx;
	color: #333;
	flex: 1;
}
.todo-arrow {
	font-size: 32rpx;
	color: #ccc;
	margin-left: 12rpx;
	flex-shrink: 0;
}
.todo-empty {
	text-align: center;
	padding: 40rpx 0;
	color: #999;
	font-size: 28rpx;
}
</style>
