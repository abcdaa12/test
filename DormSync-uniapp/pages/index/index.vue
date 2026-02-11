<template>
	<!-- 首页：宿舍信息、欢迎语、公告、待办事项 -->
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-title">DormSync 宿舍协同</text>
		</view>

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

			<!-- 待办事项区 -->
			<view class="todo-card">
				<view class="section-header">
					<text class="section-title">📋 我的待办</text>
				</view>
				<!-- 有待办时显示列表 -->
				<view v-if="todoList.length > 0" class="todo-list">
					<view
						v-for="(item, index) in todoList"
						:key="index"
						class="todo-item"
					>
						<text :class="['todo-status', item.done ? 'done' : 'undone']">
							{{ item.done ? '[已完成]' : '[未完成]' }}
						</text>
						<text class="todo-text">{{ item.text }}</text>
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
 * - 顶部通栏展示宿舍号
 * - 欢迎区动态显示当前用户昵称
 * - 宿舍公告区展示最新公告
 * - 待办事项区展示个人待办列表
 */
import { ref } from 'vue'

// 宿舍号（后续从接口/缓存获取）
const dormNo = ref('5号楼306')

// 当前用户昵称（动态显示当前用户昵称，后续从登录态获取）
const nickname = ref('张三')

// 宿舍公告内容（占位符，后续从接口获取）
const announcement = ref('本周三卫生检查，请各位同学提前做好清洁工作。')

// 待办事项列表（占位内容，后续从接口获取）
const todoList = ref([
	{ text: '投票：宿舍长选举', done: false },
	{ text: '事务：本周值日安排确认', done: false },
	{ text: '财务：6月电费待缴纳', done: false },
	{ text: '投票：周末聚餐地点', done: true }
])
</script>

<style scoped>
/* 页面容器 */
.page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

/* 自定义导航栏 */
.nav-bar {
	background-color: #1677FF;
	padding: 60rpx 30rpx 24rpx;
	text-align: center;
}
.nav-title {
	color: #fff;
	font-size: 34rpx;
	font-weight: bold;
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
}
.todo-empty {
	text-align: center;
	padding: 40rpx 0;
	color: #999;
	font-size: 28rpx;
}
</style>
