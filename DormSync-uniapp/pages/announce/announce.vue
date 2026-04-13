<template>
	<view :class="['container', isDark ? 'dark-mode' : '']">
		<!-- 发布公告 -->
		<button class="btn-primary" @tap="showForm = !showForm">
			{{ showForm ? t('announce.hideForm') : '+ ' + t('announce.create') }}
		</button>

		<view v-if="showForm" class="card form-card">
			<view class="form-title">{{ t('announce.create') }}</view>
			<input class="input" v-model="form.title" :placeholder="t('announce.titlePh')" />
			<textarea class="textarea" v-model="form.content" :placeholder="t('announce.contentPh')" :maxlength="500" />
			<button class="btn-primary" @tap="submitAnnounce">{{ t('announce.publish') }}</button>
		</view>

		<view class="section-title">{{ t('announce.list') }}</view>
		<scroll-view scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" style="height: calc(100vh - 400rpx);">
			<view v-if="announceList.length === 0" class="empty-tip">
				<text>{{ t('announce.noAnnounce') }}</text>
			</view>
			<view v-for="(item, index) in announceList" :key="item._id || index" class="card announce-item" @tap="showDetail(item)">
				<view class="announce-header">
					<text class="announce-title">{{ item.title }}</text>
					<text class="announce-read">{{ item.readCount }}/{{ item.totalMembers }} {{ t('announce.read') }}</text>
				</view>
				<text class="announce-preview">{{ (item.content || '').slice(0, 50) }}{{ item.content && item.content.length > 50 ? '...' : '' }}</text>
				<view class="announce-footer">
					<text class="announce-creator">{{ item.creatorName }}</text>
					<text class="announce-time">{{ formatTime(item.createdAt) }}</text>
				</view>
			</view>
		</scroll-view>

		<!-- 公告详情弹窗 -->
		<view v-if="detailVisible" class="modal-mask" @tap="detailVisible = false">
			<view class="modal-content" @tap.stop>
				<view class="modal-header">
					<text class="modal-title">{{ detailItem.title }}</text>
					<text class="modal-close" @tap="detailVisible = false">✕</text>
				</view>
				<text class="detail-content">{{ detailItem.content || t('announce.noContent') }}</text>
				<view class="detail-meta">
					<text class="detail-creator">{{ t('announce.publisher') }}：{{ detailItem.creatorId?.nickname || '' }}</text>
					<text class="detail-time">{{ formatFull(detailItem.createdAt) }}</text>
				</view>
				<view class="detail-divider"></view>
				<view class="detail-read-section">
					<text class="detail-read-title">{{ t('announce.readStatus') }}（{{ (detailItem.readBy || []).length }}{{ t('announce.people') }}）</text>
					<view class="read-list">
						<text v-for="u in (detailItem.readBy || [])" :key="u._id" class="read-name">{{ u.nickname }}</text>
					</view>
				</view>
				<view class="detail-actions">
					<text class="delete-link" @tap="deleteAnnounce(detailItem)">{{ t('announce.delete') }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post, put, del } from '@/utils/request'
import { t } from '@/utils/i18n'
import { isDark, applyNavBarTheme } from '@/utils/theme'
import { getLocalUserInfo } from '@/utils/auth'

const showForm = ref(false)
const refreshing = ref(false)
const form = reactive({ title: '', content: '' })
const announceList = ref([])
const detailVisible = ref(false)
const detailItem = ref({})

const formatTime = (val) => val ? new Date(val).toISOString().slice(0, 10) : ''
const formatFull = (val) => val ? new Date(val).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : ''

const fetchList = async () => {
	const userInfo = getLocalUserInfo()
	if (!userInfo.dormId) return
	try {
		const res = await get(`/api/announce/list?dormId=${userInfo.dormId}`)
		if (res.code === 200) announceList.value = res.data || []
	} catch (e) { console.error(e) }
}

const submitAnnounce = async () => {
	if (!form.title.trim()) { uni.showToast({ title: t('announce.titleRequired'), icon: 'none' }); return }
	const userInfo = getLocalUserInfo()
	try {
		const res = await post('/api/announce/create', { dormId: userInfo.dormId, title: form.title, content: form.content })
		if (res.code === 200) {
			uni.showToast({ title: t('announce.published'), icon: 'success' })
			form.title = ''; form.content = ''; showForm.value = false
			fetchList()
		}
	} catch (e) { console.error(e) }
}

const showDetail = async (item) => {
	try {
		const res = await get(`/api/announce/detail?announceId=${item._id}`)
		if (res.code === 200 && res.data) {
			detailItem.value = res.data
			detailVisible.value = true
			// 标记已读
			await put('/api/announce/read', { announceId: item._id })
			fetchList()
		}
	} catch (e) { console.error(e) }
}

const deleteAnnounce = (item) => {
	uni.showModal({
		title: t('announce.deleteTitle'), content: t('announce.deleteConfirm'),
		success: async (res) => {
			if (!res.confirm) return
			try {
				const r = await del('/api/announce/delete', { announceId: item._id })
				if (r.code === 200) {
					uni.showToast({ title: t('announce.deleted'), icon: 'success' })
					detailVisible.value = false
					fetchList()
				}
			} catch (e) { console.error(e) }
		}
	})
}

const onRefresh = async () => { refreshing.value = true; await fetchList(); refreshing.value = false }

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('announce.title') })
	fetchList()
})
</script>

<style scoped>
.container { min-height: 100vh; background-color: var(--bg-page); padding: 24rpx; }
.form-card { margin-top: 24rpx; }
.form-title { font-size: 32rpx; font-weight: bold; margin-bottom: 24rpx; color: var(--text-primary); }
.textarea { width: 100%; height: 200rpx; background: var(--bg-input); border: 1rpx solid var(--border-color); border-radius: 12rpx; padding: 16rpx; font-size: 28rpx; color: var(--text-primary); margin-bottom: 20rpx; box-sizing: border-box; }
.section-title { font-size: 30rpx; font-weight: bold; margin: 32rpx 0 16rpx; color: var(--text-primary); }
.empty-tip { text-align: center; padding: 80rpx 0; color: var(--text-placeholder); font-size: 28rpx; }

.announce-item { margin-bottom: 16rpx; }
.announce-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.announce-title { font-size: 30rpx; font-weight: bold; color: var(--text-primary); flex: 1; }
.announce-read { font-size: 22rpx; color: var(--color-primary); background: #e6f4ff; padding: 4rpx 16rpx; border-radius: 20rpx; flex-shrink: 0; }
.dark-mode .announce-read { background: #1a2a3a; }
.announce-preview { font-size: 26rpx; color: var(--text-secondary); display: block; margin-bottom: 12rpx; line-height: 1.5; }
.announce-footer { display: flex; justify-content: space-between; }
.announce-creator { font-size: 22rpx; color: var(--text-hint); }
.announce-time { font-size: 22rpx; color: var(--text-placeholder); }

/* 弹窗 */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-content { width: 88%; background: var(--bg-card, #fff); border-radius: 20rpx; padding: 36rpx 32rpx; max-height: 80vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.modal-title { font-size: 34rpx; font-weight: bold; color: var(--text-primary); flex: 1; }
.modal-close { font-size: 36rpx; color: var(--text-hint); padding: 8rpx 16rpx; }
.detail-content { font-size: 28rpx; color: var(--text-primary); line-height: 1.8; display: block; margin-bottom: 20rpx; }
.detail-meta { display: flex; justify-content: space-between; margin-bottom: 16rpx; }
.detail-creator { font-size: 24rpx; color: var(--text-hint); }
.detail-time { font-size: 24rpx; color: var(--text-placeholder); }
.detail-divider { height: 1rpx; background: var(--border-light); margin: 16rpx 0; }
.detail-read-section { margin-bottom: 20rpx; }
.detail-read-title { font-size: 26rpx; color: var(--text-secondary); display: block; margin-bottom: 12rpx; }
.read-list { display: flex; flex-wrap: wrap; gap: 12rpx; }
.read-name { font-size: 24rpx; color: var(--color-primary); background: #e6f4ff; padding: 6rpx 20rpx; border-radius: 20rpx; }
.dark-mode .read-name { background: #1a2a3a; }
.detail-actions { text-align: center; padding-top: 16rpx; }
.delete-link { font-size: 26rpx; color: #ff4d4f; }
</style>
