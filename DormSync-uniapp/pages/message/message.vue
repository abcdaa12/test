<template>
	<!-- 消息页面：搜索、筛选、消息列表（支持左滑操作） -->
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-title">消息中心</text>
		</view>

		<view class="container">
			<!-- 顶部：搜索框 + 筛选按钮 -->
			<view class="search-bar">
				<view class="search-input-wrap">
					<text class="search-icon">🔍</text>
					<input
						class="search-input"
						v-model="searchText"
						placeholder="搜索消息"
						placeholder-style="color:#bbb"
					/>
				</view>
				<view class="filter-btn" @tap="showFilter = true">
					<text class="filter-text">筛选</text>
				</view>
			</view>

			<!-- 筛选弹窗 -->
			<view v-if="showFilter" class="filter-mask" @tap="showFilter = false">
				<view class="filter-popup" @tap.stop>
					<view class="filter-group">
						<text class="filter-group-title">按状态</text>
						<view class="filter-options">
							<text
								v-for="s in statusOptions"
								:key="s.value"
								:class="['filter-tag', filterStatus === s.value ? 'active' : '']"
								@tap="filterStatus = s.value"
							>{{ s.label }}</text>
						</view>
					</view>
					<view class="filter-group">
						<text class="filter-group-title">按类型</text>
						<view class="filter-options">
							<text
								v-for="t in typeOptions"
								:key="t.value"
								:class="['filter-tag', filterType === t.value ? 'active' : '']"
								@tap="filterType = t.value"
							>{{ t.label }}</text>
						</view>
					</view>
					<button class="filter-confirm" @tap="showFilter = false">确定</button>
				</view>
			</view>

			<!-- 消息列表 -->
			<view v-if="filteredMessages.length === 0" class="empty-tip">
				<text>暂无消息</text>
			</view>
			<view
				v-for="(msg, index) in filteredMessages"
				:key="index"
				class="msg-item-wrap"
			>
				<!-- 消息主体（支持左滑显示操作按钮） -->
				<view
					class="msg-item"
					@touchstart="onTouchStart($event, index)"
					@touchmove="onTouchMove($event, index)"
					@touchend="onTouchEnd(index)"
					:style="{ transform: 'translateX(' + (msg._offsetX || 0) + 'rpx)' }"
				>
					<view class="msg-left">
						<!-- 状态标识：未读标红 / 已读灰色 -->
						<text :class="['msg-status', msg.read ? 'read' : 'unread']">
							{{ msg.read ? '[已读]' : '[未读]' }}
						</text>
						<!-- 消息类型标签 -->
						<text :class="['msg-type', 'type-' + msg.type]">{{ msg.typeLabel }}</text>
					</view>
					<view class="msg-body">
						<text class="msg-content">{{ msg.content }}</text>
						<text class="msg-time">{{ msg.time }}</text>
					</view>
				</view>
				<!-- 左滑操作按钮（占位，无实际逻辑） -->
				<view class="msg-actions">
					<view class="action-btn mark-read" @tap="markRead(index)">
						<text>标记已读</text>
					</view>
					<view class="action-btn delete-btn" @tap="deleteMsg(index)">
						<text>删除</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
/**
 * 消息页面
 * - 顶部搜索框 + 筛选弹窗（按状态：未读/已读/全部，按类型：投票/事务/财务）
 * - 消息列表：状态 + 类型 + 内容 + 时间
 * - 左滑显示"标记已读/删除"按钮（占位交互）
 */
import { ref, computed } from 'vue'

// 搜索关键词
const searchText = ref('')

// 筛选弹窗控制
const showFilter = ref(false)

// 筛选条件
const filterStatus = ref('all')   // all / unread / read
const filterType = ref('all')     // all / vote / task / finance

// 状态筛选选项
const statusOptions = [
	{ label: '全部', value: 'all' },
	{ label: '未读', value: 'unread' },
	{ label: '已读', value: 'read' }
]

// 类型筛选选项
const typeOptions = [
	{ label: '全部', value: 'all' },
	{ label: '投票', value: 'vote' },
	{ label: '事务', value: 'task' },
	{ label: '财务', value: 'finance' }
]

// 消息列表（示例占位数据，后续从接口获取）
const messageList = ref([
	{ read: false, type: 'vote', typeLabel: '投票', content: '投票通知：请参与宿舍长选举', time: '2026-02-11' },
	{ read: false, type: 'task', typeLabel: '事务', content: '值日提醒：明天轮到你值日', time: '2026-02-11' },
	{ read: false, type: 'finance', typeLabel: '财务', content: '收款通知：6月电费120元待分摊', time: '2026-02-10' },
	{ read: true, type: 'vote', typeLabel: '投票', content: '投票结果：周末聚餐选定火锅', time: '2026-02-09' },
	{ read: true, type: 'task', typeLabel: '事务', content: '事务完成：卫生检查已通过', time: '2026-02-08' },
	{ read: true, type: 'finance', typeLabel: '财务', content: '缴费确认：5月水费已结清', time: '2026-02-07' }
])

/**
 * 根据搜索和筛选条件过滤消息
 */
const filteredMessages = computed(() => {
	return messageList.value.filter(msg => {
		// 搜索过滤
		if (searchText.value && !msg.content.includes(searchText.value)) return false
		// 状态过滤
		if (filterStatus.value === 'unread' && msg.read) return false
		if (filterStatus.value === 'read' && !msg.read) return false
		// 类型过滤
		if (filterType.value !== 'all' && msg.type !== filterType.value) return false
		return true
	})
})

// ========== 左滑手势处理 ==========
let startX = 0

const onTouchStart = (e, index) => {
	startX = e.touches[0].clientX
}

const onTouchMove = (e, index) => {
	const diff = e.touches[0].clientX - startX
	const msg = filteredMessages.value[index]
	if (diff < 0) {
		// 左滑，最大滑动 -200rpx
		msg._offsetX = Math.max(diff * 2, -200)
	} else {
		msg._offsetX = 0
	}
}

const onTouchEnd = (index) => {
	const msg = filteredMessages.value[index]
	// 滑动超过一半则保持展开，否则收回
	msg._offsetX = (msg._offsetX || 0) < -100 ? -200 : 0
}

/**
 * 标记已读（占位逻辑）
 */
const markRead = (index) => {
	filteredMessages.value[index].read = true
	filteredMessages.value[index]._offsetX = 0
	uni.showToast({ title: '已标记为已读', icon: 'none' })
}

/**
 * 删除消息（占位逻辑）
 */
const deleteMsg = (index) => {
	const msg = filteredMessages.value[index]
	const realIndex = messageList.value.indexOf(msg)
	if (realIndex > -1) {
		messageList.value.splice(realIndex, 1)
	}
	uni.showToast({ title: '已删除', icon: 'none' })
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

/* 搜索栏 */
.search-bar {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 24rpx;
}
.search-input-wrap {
	flex: 1;
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 40rpx;
	padding: 12rpx 24rpx;
	border: 1rpx solid #eee;
}
.search-icon {
	font-size: 28rpx;
	margin-right: 12rpx;
}
.search-input {
	flex: 1;
	font-size: 28rpx;
}
.filter-btn {
	background-color: #fff;
	border: 1rpx solid #1677FF;
	border-radius: 40rpx;
	padding: 12rpx 28rpx;
}
.filter-text {
	color: #1677FF;
	font-size: 26rpx;
}

/* 筛选弹窗 */
.filter-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.4);
	z-index: 100;
	display: flex;
	align-items: flex-end;
}
.filter-popup {
	background-color: #fff;
	width: 100%;
	border-radius: 24rpx 24rpx 0 0;
	padding: 40rpx 30rpx;
}
.filter-group {
	margin-bottom: 32rpx;
}
.filter-group-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 16rpx;
}
.filter-options {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}
.filter-tag {
	padding: 12rpx 32rpx;
	border-radius: 40rpx;
	font-size: 26rpx;
	background-color: #f5f5f5;
	color: #666;
}
.filter-tag.active {
	background-color: #e6f4ff;
	color: #1677FF;
	border: 1rpx solid #1677FF;
}
.filter-confirm {
	background-color: #1677FF;
	color: #fff;
	border-radius: 12rpx;
	font-size: 30rpx;
	height: 80rpx;
	line-height: 80rpx;
	margin-top: 16rpx;
}

/* 空状态 */
.empty-tip {
	text-align: center;
	padding: 80rpx 0;
	color: #ccc;
	font-size: 28rpx;
}

/* 消息条目容器 */
.msg-item-wrap {
	position: relative;
	overflow: hidden;
	margin-bottom: 16rpx;
	border-radius: 12rpx;
}

/* 消息主体 */
.msg-item {
	background-color: #fff;
	padding: 24rpx;
	position: relative;
	z-index: 2;
	transition: transform 0.15s ease;
	border-radius: 12rpx;
}
.msg-left {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 12rpx;
}
.msg-status {
	font-size: 24rpx;
	font-weight: bold;
}
.msg-status.unread {
	color: #ff4d4f;
}
.msg-status.read {
	color: #999;
}
.msg-type {
	font-size: 22rpx;
	padding: 4rpx 14rpx;
	border-radius: 20rpx;
}
.type-vote {
	background-color: #e6f4ff;
	color: #1677FF;
}
.type-task {
	background-color: #f6ffed;
	color: #52c41a;
}
.type-finance {
	background-color: #fff7e6;
	color: #fa8c16;
}
.msg-content {
	font-size: 28rpx;
	color: #333;
	display: block;
	margin-bottom: 8rpx;
}
.msg-time {
	font-size: 22rpx;
	color: #bbb;
}

/* 左滑操作按钮 */
.msg-actions {
	position: absolute;
	right: 0;
	top: 0;
	bottom: 0;
	display: flex;
	z-index: 1;
}
.action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 160rpx;
	color: #fff;
	font-size: 24rpx;
}
.mark-read {
	background-color: #1677FF;
}
.delete-btn {
	background-color: #ff4d4f;
}
</style>
