<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<view class="search-bar">
				<view class="search-input-wrap">
					<text class="search-icon">🔍</text>
					<input class="search-input" v-model="searchText" :placeholder="t('message.search')" placeholder-style="color:#bbb" />
				</view>
				<view class="filter-btn" @tap="showFilter = true">
					<text class="filter-text">{{ t('message.filter') }}</text>
				</view>
			</view>

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

			<scroll-view scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" style="height: calc(100vh - 200rpx);">
				<view v-if="filteredMessages.length === 0" class="empty-tip">
					<text>{{ t('message.noMessage') }}</text>
				</view>
				<view v-for="(msg, index) in filteredMessages" :key="msg._id || index" class="msg-item-wrap">
					<view class="msg-item" @touchstart="onTouchStart($event, index)" @touchmove="onTouchMove($event, index)" @touchend="onTouchEnd(index)" :style="{ transform: 'translateX(' + (msg._offsetX || 0) + 'rpx)' }">
						<view class="msg-left">
							<text :class="['msg-status', msg.status === 'read' ? 'read' : 'unread']">
								{{ msg.status === 'read' ? '[' + t('message.readTag') + ']' : '[' + t('message.unreadTag') + ']' }}
							</text>
							<text :class="['msg-type', 'type-' + msg.type]">{{ typeLabel(msg.type) }}</text>
						</view>
						<view class="msg-body">
							<text class="msg-content">{{ msg.content }}</text>
							<text class="msg-time">{{ formatTime(msg.createTime) }}</text>
						</view>
					</view>
					<view class="msg-actions">
						<view class="action-btn mark-read" @tap="markRead(msg)"><text>{{ t('message.markRead') }}</text></view>
						<view class="action-btn delete-btn" @tap="deleteMsg(msg)"><text>{{ t('message.delete') }}</text></view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, put, del } from '@/utils/request'
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
	{ label: t('message.financeType'), value: 'finance' }
])

const typeLabel = (type) => {
	const map = { vote: t('message.voteType'), task: t('message.taskType'), finance: t('message.financeType'), system: '系统' }
	return map[type] || type
}

const formatTime = (t) => t ? new Date(t).toISOString().slice(0, 10) : ''

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
		if (res.code === 200) messageList.value = (res.data || []).map(m => ({ ...m, _offsetX: 0 }))
	} catch (e) { console.error('获取消息失败', e) }
}

let startX = 0
const onTouchStart = (e, index) => { startX = e.touches[0].clientX }
const onTouchMove = (e, index) => {
	const diff = e.touches[0].clientX - startX
	const msg = filteredMessages.value[index]
	msg._offsetX = diff < 0 ? Math.max(diff * 2, -200) : 0
}
const onTouchEnd = (index) => {
	const msg = filteredMessages.value[index]
	msg._offsetX = (msg._offsetX || 0) < -100 ? -200 : 0
}

const markRead = async (msg) => {
	try {
		const res = await put('/api/message/update', { messageId: msg._id, status: 'read' })
		if (res.code === 200) {
			msg.status = 'read'; msg._offsetX = 0
			uni.showToast({ title: t('message.markedRead'), icon: 'none' })
			updateBadge()
		}
	} catch (e) { console.error('标记已读失败', e) }
}

const deleteMsg = async (msg) => {
	try {
		const res = await del('/api/message/delete', { messageId: msg._id })
		if (res.code === 200) {
			const idx = messageList.value.findIndex(m => m._id === msg._id)
			if (idx > -1) messageList.value.splice(idx, 1)
			uni.showToast({ title: t('message.deleted'), icon: 'none' })
			updateBadge()
		}
	} catch (e) { console.error('删除消息失败', e) }
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
.search-bar { display: flex; align-items: center; gap: 16rpx; margin-bottom: 24rpx; }
.search-input-wrap { flex: 1; display: flex; align-items: center; background-color: var(--bg-card); border-radius: 40rpx; padding: 12rpx 24rpx; border: 1rpx solid var(--border-color); }
.search-icon { font-size: 28rpx; margin-right: 12rpx; }
.search-input { flex: 1; font-size: 28rpx; color: var(--text-primary); }
.filter-btn { background-color: var(--bg-card); border: 1rpx solid var(--color-primary); border-radius: 40rpx; padding: 12rpx 28rpx; }
.filter-text { color: var(--color-primary); font-size: 26rpx; }
.filter-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: flex-end; }
.filter-popup { background-color: var(--bg-card); width: 100%; border-radius: 24rpx 24rpx 0 0; padding: 40rpx 30rpx; }
.filter-group { margin-bottom: 32rpx; }
.filter-group-title { font-size: 28rpx; font-weight: bold; color: var(--text-primary); display: block; margin-bottom: 16rpx; }
.filter-options { display: flex; flex-wrap: wrap; gap: 16rpx; }
.filter-tag { padding: 12rpx 32rpx; border-radius: 40rpx; font-size: 26rpx; background-color: var(--bg-input); color: var(--text-secondary); }
.filter-tag.active { background-color: #e6f4ff; color: var(--color-primary); border: 1rpx solid var(--color-primary); }
.dark-mode .filter-tag.active { background-color: #1a2a3a; }
.filter-confirm { background-color: var(--color-primary); color: #fff; border-radius: 12rpx; font-size: 30rpx; height: 80rpx; line-height: 80rpx; margin-top: 16rpx; }
.empty-tip { text-align: center; padding: 80rpx 0; color: var(--text-placeholder); font-size: 28rpx; }
.msg-item-wrap { position: relative; overflow: hidden; margin-bottom: 16rpx; border-radius: 12rpx; }
.msg-item { background-color: var(--bg-card); padding: 24rpx; position: relative; z-index: 2; transition: transform 0.15s ease; border-radius: 12rpx; }
.msg-left { display: flex; align-items: center; gap: 12rpx; margin-bottom: 12rpx; }
.msg-status { font-size: 24rpx; font-weight: bold; }
.msg-status.unread { color: #ff4d4f; }
.msg-status.read { color: var(--text-hint); }
.msg-type { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 20rpx; }
.type-vote { background-color: #e6f4ff; color: #1677FF; }
.type-task { background-color: #f6ffed; color: #52c41a; }
.type-finance { background-color: #fff7e6; color: #fa8c16; }
.dark-mode .type-vote { background-color: #1a2a3a; }
.dark-mode .type-task { background-color: #1a2a1a; }
.dark-mode .type-finance { background-color: #2a2a1a; }
.msg-content { font-size: 28rpx; color: var(--text-primary); display: block; margin-bottom: 8rpx; }
.msg-time { font-size: 22rpx; color: var(--text-placeholder); }
.msg-actions { position: absolute; right: 0; top: 0; bottom: 0; display: flex; z-index: 1; }
.action-btn { display: flex; align-items: center; justify-content: center; width: 160rpx; color: #fff; font-size: 24rpx; }
.mark-read { background-color: #1677FF; }
.delete-btn { background-color: #ff4d4f; }
</style>
