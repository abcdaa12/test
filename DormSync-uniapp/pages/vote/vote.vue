<template>
	<view :class="['container', isDark ? 'dark-mode' : '']">
		<button class="btn-primary" @tap="showForm = !showForm">
			{{ showForm ? t('vote.hideForm') : '+ ' + t('vote.toggleForm') }}
		</button>

		<view v-if="showForm" class="card form-card">
			<view class="form-title">{{ t('vote.formTitle') }}</view>
			<input class="input" v-model="form.title" :placeholder="t('vote.topicPh')" />
			<view v-for="(opt, idx) in form.options" :key="idx" class="option-row">
				<input class="input option-input" v-model="form.options[idx]" :placeholder="t('vote.optionPh') + ' ' + (idx + 1)" />
				<text v-if="form.options.length > 2" class="option-del" @tap="removeOption(idx)">✕</text>
			</view>
			<view class="option-actions">
				<text class="add-option" @tap="addOption">+ {{ t('vote.addOption') }}</text>
			</view>
			<view class="setting-row">
				<text class="setting-label">{{ t('vote.deadline') }}</text>
				<picker mode="date" :value="form.deadline" @change="onDeadlineChange">
					<view class="picker-value">{{ form.deadline || t('vote.selectDeadline') }} ▾</view>
				</picker>
			</view>
			<button class="btn-primary" @tap="submitVote">{{ t('vote.submit') }}</button>
		</view>

		<view class="section-title">{{ t('vote.list') }}</view>
		<scroll-view scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" style="height: calc(100vh - 400rpx);">
			<view v-if="voteList.length === 0" class="empty-tip">
				<text>{{ t('vote.noVote') }}</text>
			</view>
			<view v-for="(vote, index) in voteList" :key="vote._id || index" class="card vote-item">
				<view class="vote-header">
					<text class="vote-title">{{ vote.title }}</text>
					<text :class="['vote-status', vote.status === 'active' ? 'active' : 'ended']">
						{{ vote.status === 'active' ? t('vote.active') : t('vote.ended') }}
					</text>
				</view>
				<view v-if="vote.deadline" class="vote-deadline">
					<text>{{ t('vote.deadline') }}：{{ formatTime(vote.deadline) }}</text>
				</view>
				<view v-for="(opt, oi) in vote.options" :key="oi" class="vote-option" @tap="doVote(vote, oi)">
					<view class="option-bar">
						<view class="option-fill" :style="{ width: getPercent(vote, oi) + '%' }"></view>
					</view>
					<view class="option-info">
						<text>{{ opt.label }}</text>
						<text class="option-count">{{ opt.count }} {{ t('vote.ticket') }} ({{ getPercent(vote, oi) }}%)</text>
					</view>
				</view>
				<text class="vote-time">{{ formatTime(vote.createdAt) }}</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request'
import { t } from '@/utils/i18n'
import { isDark, applyNavBarTheme } from '@/utils/theme'
import { getLocalUserInfo } from '@/utils/auth'

const showForm = ref(false)
const refreshing = ref(false)
const form = reactive({ title: '', options: ['', ''], deadline: '' })
const voteList = ref([])

const formatTime = (t) => t ? new Date(t).toISOString().slice(0, 10) : ''

const addOption = () => {
	if (form.options.length >= 6) { uni.showToast({ title: t('vote.maxOption'), icon: 'none' }); return }
	form.options.push('')
}
const removeOption = (idx) => { form.options.splice(idx, 1) }
const onDeadlineChange = (e) => { form.deadline = e.detail.value }

const getPercent = (vote, oi) => {
	const total = vote.options.reduce((s, o) => s + o.count, 0)
	return total === 0 ? 0 : Math.round((vote.options[oi].count / total) * 100)
}

const fetchList = async () => {
	try {
		const userInfo = getLocalUserInfo()
		if (!userInfo.dormId) return
		const res = await get(`/api/decision/list?dormId=${userInfo.dormId}`)
		if (res.code === 200) voteList.value = res.data || []
	} catch (e) { console.error('获取投票列表失败', e) }
}

const doVote = async (vote, optIndex) => {
	if (vote.status !== 'active') {
		uni.showToast({ title: t('vote.voteEnded'), icon: 'none' }); return
	}
	try {
		const res = await post('/api/decision/vote', { decisionId: vote._id, optionIndex: optIndex })
		if (res.code === 200) {
			uni.showToast({ title: t('vote.voteSuccess'), icon: 'success' })
			fetchList()
		} else {
			uni.showToast({ title: res.msg || t('vote.voteEnded'), icon: 'none' })
		}
	} catch (e) { uni.showToast({ title: t('vote.voteEnded'), icon: 'none' }) }
}

const submitVote = async () => {
	if (!form.title) { uni.showToast({ title: t('vote.topicRequired'), icon: 'none' }); return }
	const validOptions = form.options.filter(o => o.trim() !== '')
	if (validOptions.length < 2) { uni.showToast({ title: t('vote.minOption'), icon: 'none' }); return }
	if (!form.deadline) { uni.showToast({ title: t('vote.selectDeadline'), icon: 'none' }); return }

	const userInfo = getLocalUserInfo()
	try {
		const res = await post('/api/decision/create', {
			dormId: userInfo.dormId,
			title: form.title,
			options: validOptions,
			deadline: form.deadline,
			creatorId: userInfo._id
		})
		if (res.code === 200) {
			uni.showToast({ title: t('vote.created'), icon: 'success' })
			form.title = ''; form.options = ['', '']; form.deadline = ''
			showForm.value = false
			fetchList()
			// 请求宿舍动态订阅授权
			requestVoteSubscribe()
		} else {
			uni.showToast({ title: res.msg, icon: 'none' })
		}
	} catch (e) { console.error('创建投票失败', e) }
}

const onRefresh = async () => { refreshing.value = true; await fetchList(); refreshing.value = false }

// 请求宿舍动态订阅授权
const requestVoteSubscribe = () => {
	// #ifdef MP-WEIXIN
	const tmplIds = ['YOUR_DORM_ACTIVITY_TEMPLATE_ID'].filter(id => !id.startsWith('YOUR_'))
	if (tmplIds.length === 0) return
	uni.requestSubscribeMessage({
		tmplIds,
		success(res) { console.log('投票订阅授权:', res) },
		fail(err) { console.log('投票订阅取消:', err) }
	})
	// #endif
}

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('vote.title') })
	fetchList()
})
</script>

<style scoped>
.container { min-height: 100vh; background-color: var(--bg-page); padding: 24rpx; }
.form-card { margin-top: 24rpx; }
.form-title { font-size: 32rpx; font-weight: bold; margin-bottom: 24rpx; color: var(--text-primary); }
.option-row { display: flex; align-items: center; gap: 12rpx; }
.option-input { flex: 1; }
.option-del { color: #e74c3c; font-size: 32rpx; padding: 8rpx 16rpx; margin-bottom: 20rpx; }
.option-actions { margin-bottom: 20rpx; }
.add-option { color: var(--color-primary); font-size: 28rpx; }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; margin-bottom: 20rpx; }
.setting-label { font-size: 28rpx; color: var(--text-secondary); }
.picker-value { font-size: 28rpx; color: var(--color-primary); }
.section-title { font-size: 30rpx; font-weight: bold; margin: 32rpx 0 16rpx; color: var(--text-primary); }
.empty-tip { text-align: center; padding: 60rpx 0; color: var(--text-placeholder); font-size: 28rpx; }
.vote-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.vote-title { font-size: 30rpx; font-weight: bold; color: var(--text-primary); }
.vote-status { font-size: 24rpx; padding: 4rpx 16rpx; border-radius: 20rpx; }
.vote-status.active { background-color: #e8f5e9; color: #4caf50; }
.vote-status.ended { background-color: var(--bg-input); color: var(--text-hint); }
.dark-mode .vote-status.active { background-color: #1a2a1a; }
.vote-deadline { font-size: 24rpx; color: var(--text-hint); margin-bottom: 12rpx; }
.vote-option { margin-bottom: 16rpx; position: relative; }
.option-bar { height: 48rpx; background-color: var(--bg-input); border-radius: 8rpx; overflow: hidden; }
.option-fill { height: 100%; background-color: var(--color-primary); border-radius: 8rpx; transition: width 0.3s; opacity: 0.2; }
.option-info { position: absolute; top: 0; left: 16rpx; right: 16rpx; height: 48rpx; display: flex; justify-content: space-between; align-items: center; font-size: 26rpx; color: var(--text-primary); }
.option-count { color: var(--text-secondary); font-size: 24rpx; }
.vote-time { font-size: 22rpx; color: var(--text-placeholder); display: block; text-align: right; margin-top: 8rpx; }
</style>
