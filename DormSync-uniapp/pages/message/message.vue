<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<!-- 搜索 + 筛选 + 全部已读 -->
			<view class="top-bar">
				<view class="search-input-wrap">
					<text class="search-icon">🔍</text>
					<input class="search-input" v-model="searchText" :placeholder="t('message.search')" />
				</view>
				<view class="filter-btn" @tap="showFilter = true">
					<text class="filter-text">{{ t('message.filter') }}</text>
				</view>
			</view>

			<!-- 未读数 + 全部已读 -->
			<view v-if="unreadCount > 0" class="unread-bar">
				<text class="unread-text">{{ unreadCount }} {{ t('message.unreadMsg') }}</text>
				<text class="read-all-btn" @tap="markAllRead">{{ t('message.readAll') }}</text>
			</view>

			<!-- 筛选弹窗 -->
			<view v-if="showFilter" class="filter-mask" @tap="showFilter = false">
				<view class="filter-popup" @tap.stop>
					<view class="filter-group">
						<text class="filter-group-title">{{ t('message.byStatus') }}</text>
						<view class="filter-options">
							<text v-for="s in statusOptions" :key="s.value" :class="['filter-tag', filterStatus === s.value ? 'active' : '']" @tap="filterStatus = s.value">{{ s.label }}</text>
						</view>
					</view>
					<view class="filter-group">
						<text class="filter-group-title">{{ t('message.byType') }}</text>
						<view class="filter-options">
							<text v-for="t2 in typeOptions" :key="t2.value" :class="['filter-tag', filterType === t2.value ? 'active' : '']" @tap="filterType = t2.value">{{ t2.label }}</text>
						</view>
					</view>
					<button class="filter-confirm" @tap="showFilter = false">{{ t('message.confirm') }}</button>
				</view>
			</view>

			<!-- 消息列表 -->
			<scroll-view scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" style="height: calc(100vh - 280rpx);">
				<view v-if="filteredMessages.length === 0" class="empty-tip">
					<text>{{ t('message.noMessage') }}</text>
				</view>
				<view v-for="(msg, index) in filteredMessages" :key="msg._id || index"
					:class="['msg-item', msg.status === 'unread' ? 'msg-unread' : '']"
					@tap="onMsgTap(msg)">
					<view class="msg-icon-wrap" :class="'icon-' + msg.type">
						<text class="msg-icon">{{ typeIcon(msg.type) }}</text>
					</view>
					<view class="msg-body">
						<view class="msg-top">
							<text class="msg-type-label">{{ typeLabel(msg.type) }}</text>
							<text class="msg-time">{{ formatTime(msg.createTime) }}</text>
						</view>
						<text class="msg-content">{{ msg.content }}</text>
					</view>
					<view v-if="msg.status === 'unread'" class="unread-dot"></view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, put } from '@/utils/request'
import { t } from '@/utils/i18n'
import { isDark, applyNavBarTheme } from '@/utils/theme'

const searchText = ref('')
const showFilter = ref(false)
const refreshing = ref(false)
const filterStatus = ref('all')
const filterType = ref('all')
const messageList = ref([])

const statusOptions = computed(() => [
	{ label: t('message.all'), value: 'all' },
	{ label: t('message.unread'), value: 'unread' },
	{ label: t('message.read'), value: 'read' }
])
const typeOptions = computed(() => [
	{ label: t('message.all'), value: 'all' },
	{ label: t('message.voteType'), value: 'vote' },
	{ label: t('message.taskType'), value: 'task' },
	{ label: t('message.financeType'), value: 'finance' },
	{ label: t('message.dormType'), value: 'dorm' },
	{ label: t('message.announceType'), value: 'announce' }
])

const typeLabel = (type) => {
	const map = { vote: t('message.voteType'), task: t('message.taskType'), finance: t('message.financeType'), dorm: t('message.dormType'), announce: t('message.announceType') }
	return map[type] || type
}
const typeIcon = (type) => {
	const map = { vote: '🗳️', task: '📋', finance: '💰', dorm: '👥', announce: '📢' }
	return map[type] || '📢'
}

const formatTime = (val) => {
	if (!val) return ''
	const d = new Date(val)
	const now = new Date()
	const diff = now - d
	if (diff < 60000) return t('message.justNow')
	if (diff < 3600000) return Math.floor(diff / 60000) + t('message.minAgo')
	if (diff < 86400000) return Math.floor(diff / 3600000) + t('message.hourAgo')
	return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')}`
}

const unreadCount = computed(() => messageList.value.filter(m => m.status === 'unread').length)

const filteredMessages = computed(() => {
	return messageList.value.filter(msg => {
		if (searchText.value && !msg.content.includes(searchText.value)) return false
		if (filterStatus.value === 'unread' && msg.status !== 'unread') return false
		if (filterStatus.value === 'read' && msg.status !== 'read') return false
		if (filterType.value !== 'all' && msg.type !== filterType.value) return false
		return true
	})
})

const fetchMessages = async () => {
	try {
		const userId = uni.getStorageSync('userId')
		if (!userId) return
		const res = await get(`/api/message/list?userId=${userId}`)
		if (res.code === 200) messageList.value = res.data || []
	} catch (e) { console.error(e) }
}

// 点击消息：标记已读 + 跳转对应页面
const onMsgTap = async (msg) => {
	// 标记已读
	if (msg.status === 'unread') {
		try {
			await put('/api/message/update', { messageId: msg._id, status: 'read' })
			msg.status = 'read'
			updateBadge()
		} catch (e) { console.error(e) }
	}
	// 根据类型跳转
	const routeMap = {
		finance: '/pages/fee/fee',
		vote: '/pages/vote/vote',
		task: '/pages/schedule/schedule',
		dorm: '/pages/members/members',
		announce: '/pages/announce/announce'
	}
	const url = routeMap[msg.type]
	if (url) uni.navigateTo({ url })
}

// 全部已读
const markAllRead = async () => {
	try {
		const res = await put('/api/message/read-all', {})
		if (res.code === 200) {
			messageList.value.forEach(m => m.status = 'read')
			updateBadge()
			uni.showToast({ title: t('message.allRead'), icon: 'success' })
		}
	} catch (e) { console.error(e) }
}

const updateBadge = async () => {
	try {
		const userId = uni.getStorageSync('userId')
		if (!userId) return
		const res = await get(`/api/message/unread-count?userId=${userId}`)
		if (res.code === 200 && res.data) {
			const count = res.data.count || 0
			if (count > 0) {
				uni.setTabBarBadge({ index: 1, text: String(count > 99 ? '99+' : count) })
			} else {
				uni.removeTabBarBadge({ index: 1 })
			}
		}
	} catch (e) { console.error(e) }
}

const onRefresh = async () => { refreshing.value = true; await fetchMessages(); refreshing.value = false }

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('message.title') })
	fetchMessages()
	updateBadge()
})
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.container { padding: 24rpx; }

/* 顶部栏 */
.top-bar { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.search-input-wrap { flex: 1; display: flex; align-items: center; background: var(--bg-card); border-radius: 34rpx; padding: 12rpx 24rpx; border: 1rpx solid var(--border-color); }
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 26rpx; color: var(--text-primary); }
.filter-btn { background: var(--bg-card); border: 1rpx solid var(--color-primary); border-radius: 34rpx; padding: 12rpx 24rpx; }
.filter-text { color: var(--color-primary); font-size: 26rpx; }

/* 未读栏 */
.unread-bar { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 20rpx; background: #fff7e6; border-radius: 12rpx; margin-bottom: 16rpx; }
.dark-mode .unread-bar { background: #2a2000; }
.unread-text { font-size: 26rpx; color: #fa8c16; }
.read-all-btn { font-size: 26rpx; color: var(--color-primary); font-weight: 500; }

/* 筛选弹窗 */
.filter-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: flex-end; }
.filter-popup { background: var(--bg-card); width: 100%; border-radius: 24rpx 24rpx 0 0; padding: 40rpx 30rpx; }
.filter-group { margin-bottom: 32rpx; }
.filter-group-title { font-size: 28rpx; font-weight: bold; color: var(--text-primary); display: block; margin-bottom: 16rpx; }
.filter-options { display: flex; flex-wrap: wrap; gap: 16rpx; }
.filter-tag { padding: 12rpx 32rpx; border-radius: 40rpx; font-size: 26rpx; background: var(--bg-input); color: var(--text-secondary); }
.filter-tag.active { background: #e6f4ff; color: var(--color-primary); border: 1rpx solid var(--color-primary); }
.dark-mode .filter-tag.active { background: #1a2a3a; }
.filter-confirm { background: var(--color-primary); color: #fff; border-radius: 12rpx; font-size: 30rpx; height: 80rpx; line-height: 80rpx; margin-top: 16rpx; }

/* 消息条目 */
.msg-item {
	display: flex; align-items: center; padding: 24rpx 20rpx;
	background: var(--bg-card); border-radius: 12rpx; margin-bottom: 12rpx;
	position: relative;
}
.msg-item:active { opacity: 0.8; }
.msg-unread { border-left: 6rpx solid var(--color-primary); }
.msg-icon-wrap {
	width: 72rpx; height: 72rpx; border-radius: 50%;
	display: flex; align-items: center; justify-content: center;
	margin-right: 20rpx; flex-shrink: 0;
}
.icon-vote { background: #e6f4ff; }
.icon-task { background: #f6ffed; }
.icon-finance { background: #fff7e6; }
.icon-dorm { background: #f0f5ff; }
.icon-announce { background: #fff1f0; }
.dark-mode .icon-vote { background: #1a2a3a; }
.dark-mode .icon-task { background: #1a2a1a; }
.dark-mode .icon-finance { background: #2a2a1a; }
.dark-mode .icon-dorm { background: #1a1a2a; }
.dark-mode .icon-announce { background: #2a1a1a; }
.msg-icon { font-size: 36rpx; }
.msg-body { flex: 1; overflow: hidden; }
.msg-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.msg-type-label { font-size: 24rpx; color: var(--text-hint); }
.msg-time { font-size: 22rpx; color: var(--text-placeholder); }
.msg-content { font-size: 28rpx; color: var(--text-primary); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.unread-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: #ff4d4f; flex-shrink: 0; margin-left: 12rpx; }
.empty-tip { text-align: center; padding: 80rpx 0; color: var(--text-placeholder); font-size: 28rpx; }
</style>
