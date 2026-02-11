<template>
	<!-- 更多页面：按模块分组展示功能入口 -->
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-title">更多功能</text>
		</view>

		<view class="container">
			<!-- 决策模块 -->
			<view class="module-group">
				<text class="module-title">🗳️ 决策模块</text>
				<view class="module-entries">
					<view class="entry-btn" @tap="goTo('/pages/vote/vote')">
						<text class="entry-icon">📝</text>
						<text class="entry-label">发起决策</text>
					</view>
					<view class="entry-btn" @tap="goTo('/pages/vote/vote')">
						<text class="entry-icon">📊</text>
						<text class="entry-label">查看决策</text>
					</view>
				</view>
			</view>

			<!-- 事务模块 -->
			<view class="module-group">
				<text class="module-title">📋 事务模块</text>
				<view class="module-entries">
					<view class="entry-btn" @tap="goTo('/pages/schedule/schedule')">
						<text class="entry-icon">➕</text>
						<text class="entry-label">创建事务</text>
					</view>
					<view class="entry-btn" @tap="goTo('/pages/schedule/schedule')">
						<text class="entry-icon">📅</text>
						<text class="entry-label">查看事务</text>
					</view>
				</view>
			</view>

			<!-- 成员管理 -->
			<view class="module-group">
				<text class="module-title">👥 成员管理</text>
				<view class="module-entries">
					<view class="entry-btn" @tap="handleEntry('查看成员')">
						<text class="entry-icon">👤</text>
						<text class="entry-label">查看成员</text>
					</view>
					<view class="entry-btn" @tap="handleEntry('宿舍长选举')">
						<text class="entry-icon">🏆</text>
						<text class="entry-label">宿舍长选举</text>
					</view>
					<view class="entry-btn" @tap="handleEntry('离开宿舍')">
						<text class="entry-icon">🚪</text>
						<text class="entry-label">离开宿舍</text>
					</view>
					<view class="entry-btn" @tap="handleEntry('邀请新成员')">
						<text class="entry-icon">✉️</text>
						<text class="entry-label">邀请新成员</text>
					</view>
				</view>
			</view>

			<!-- 财务管理 -->
			<view class="module-group">
				<text class="module-title">💰 财务管理</text>
				<view class="module-entries">
					<view class="entry-btn" @tap="goTo('/pages/fee/fee')">
						<text class="entry-icon">💳</text>
						<text class="entry-label">发起收款</text>
					</view>
					<view class="entry-btn" @tap="goTo('/pages/fee/fee')">
						<text class="entry-icon">📑</text>
						<text class="entry-label">查看记录</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
/**
 * 更多页面
 * - 按模块分组展示功能入口
 * - 模块：决策、事务、成员管理、财务管理
 * - 每个入口按钮可跳转到对应功能页面
 */

/**
 * 跳转到指定页面
 * @param {string} url - 目标页面路径
 */
const goTo = (url) => {
	uni.navigateTo({ url })
}

/**
 * 处理功能入口点击（暂未开发的页面用 toast 提示）
 * @param {string} name - 功能名称
 */
const handleEntry = (name) => {
	uni.showToast({ title: `${name}功能开发中`, icon: 'none' })
}
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

/* 模块分组 */
.module-group {
	margin-bottom: 32rpx;
}
.module-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 16rpx;
	padding-left: 8rpx;
}

/* 入口按钮网格 */
.module-entries {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

/* 单个入口按钮 */
.entry-btn {
	background-color: #fff;
	border: 1rpx solid #eeeeee;
	border-radius: 5px;
	padding: 15rpx 24rpx;
	display: flex;
	align-items: center;
	gap: 12rpx;
	min-width: 280rpx;
	flex: 1;
}
.entry-btn:active {
	background-color: #f5f5f5;
}
.entry-icon {
	font-size: 36rpx;
}
.entry-label {
	font-size: 28rpx;
	color: #333;
}
</style>
