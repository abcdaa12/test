<template>
	<view :class="['container', isDark ? 'dark-mode' : '']">
		<button class="btn-primary" @tap="showForm = !showForm">
			{{ showForm ? t('fee.hideForm') : '+ ' + t('fee.toggleForm') }}
		</button>

		<view v-if="showForm" class="card form-card">
			<view class="form-title">{{ t('fee.formTitle') }}</view>
			<input class="input" v-model="form.title" :placeholder="t('fee.namePh')" />
			<input class="input" v-model="form.amount" type="digit" :placeholder="t('fee.amountPh')" />
			<picker :range="memberNames" @change="onPayerChange" :value="payerIndex">
				<view class="input picker-input">
					{{ payerIndex >= 0 ? memberNames[payerIndex] : t('fee.payerPh') }}
				</view>
			</picker>
			<input class="input" v-model="form.remark" :placeholder="t('fee.remarkPh')" />
			<button class="btn-primary" @tap="submitFee">{{ t('fee.submit') }}</button>
		</view>

		<view class="section-title">{{ t('fee.record') }}</view>
		<scroll-view scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" style="height: calc(100vh - 400rpx);">
			<view v-if="feeList.length === 0" class="empty-tip">
				<text>{{ t('fee.noRecord') }}</text>
			</view>
			<view v-for="(item, index) in feeList" :key="item._id || index" class="fee-item-wrap">
				<view class="card fee-item" @touchstart="onTouchStart($event, index)" @touchmove="onTouchMove($event, index)" @touchend="onTouchEnd(index)" :style="{ transform: 'translateX(' + (item._offsetX || 0) + 'rpx)' }">
					<view class="fee-header">
						<text class="fee-title">{{ item.title }}</text>
						<text class="fee-amount">¥{{ item.amount }}</text>
					</view>
					<view class="fee-detail">
						<text>{{ t('fee.payer') }}：{{ item.creatorName || '' }}</text>
						<text>{{ t('fee.perPerson') }}：¥{{ item.perPerson || '' }}</text>
					</view>
					<text class="fee-time">{{ formatTime(item.createdAt) }}</text>
				</view>
				<view class="fee-actions">
					<view class="action-btn delete-btn" @tap="deleteFee(item)">
						<text>{{ t('fee.delete') }}</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post, del } from '@/utils/request'
import { t } from '@/utils/i18n'
import { isDark, applyNavBarTheme } from '@/utils/theme'
import { getLocalUserInfo } from '@/utils/auth'

const showForm = ref(false)
const refreshing = ref(false)
const members = ref([])
const memberNames = computed(() => members.value.map(m => m.nickname))
const payerIndex = ref(-1)
const form = reactive({ title: '', amount: '', remark: '' })
const feeList = ref([])

const formatTime = (t) => t ? new Date(t).toISOString().slice(0, 10) : ''
const onPayerChange = (e) => { payerIndex.value = Number(e.detail.value) }

let startX = 0
const onTouchStart = (e, index) => { startX = e.touches[0].clientX }
const onTouchMove = (e, index) => {
	const diff = e.touches[0].clientX - startX
	feeList.value[index]._offsetX = diff < 0 ? Math.max(diff * 2, -160) : 0
}
const onTouchEnd = (index) => {
	const item = feeList.value[index]
	item._offsetX = (item._offsetX || 0) < -80 ? -160 : 0
}

const fetchMembers = async () => {
	try {
		const userInfo = getLocalUserInfo()
		if (!userInfo.dormId) return
		const res = await get(`/api/dorm/members?dormId=${userInfo.dormId}`)
		if (res.code === 200) members.value = res.data || []
	} catch (e) { console.error(e) }
}

const fetchList = async () => {
	try {
		const userInfo = getLocalUserInfo()
		if (!userInfo.dormId) return
		const res = await get(`/api/finance/list?dormId=${userInfo.dormId}`)
		if (res.code === 200) {
			feeList.value = (res.data || []).map(item => ({
				...item, _offsetX: 0,
				creatorName: item.creatorId?.nickname || '',
				perPerson: members.value.length > 0 ? (item.amount / members.value.length).toFixed(2) : item.amount
			}))
		}
	} catch (e) { console.error(e) }
}

const submitFee = async () => {
	if (!form.title || !form.amount) {
		uni.showToast({ title: t('fee.fillAll'), icon: 'none' }); return
	}
	const amount = parseFloat(form.amount)
	if (isNaN(amount) || amount <= 0) {
		uni.showToast({ title: t('fee.invalidAmount'), icon: 'none' }); return
	}
	if (payerIndex.value < 0) {
		uni.showToast({ title: t('fee.payerPh'), icon: 'none' }); return
	}
	const userInfo = getLocalUserInfo()
	try {
		const res = await post('/api/finance/create', {
			dormId: userInfo.dormId, title: form.title, amount,
			creatorId: members.value[payerIndex.value]._id,
			payeeIds: members.value.map(m => m._id)
		})
		if (res.code === 200) {
			uni.showToast({ title: t('fee.added'), icon: 'success' })
			form.title = ''; form.amount = ''; form.remark = ''; payerIndex.value = -1
			showForm.value = false
			fetchList()
		} else {
			uni.showToast({ title: res.msg || t('fee.fillAll'), icon: 'none' })
		}
	} catch (e) { uni.showToast({ title: t('fee.fillAll'), icon: 'none' }) }
}

const deleteFee = async (item) => {
	uni.showModal({
		title: t('fee.deleteTitle'),
		content: t('fee.deleteConfirm'),
		success: async (res) => {
			if (!res.confirm) return
			try {
				const r = await del('/api/finance/delete', { financeId: item._id })
				if (r.code === 200) {
					uni.showToast({ title: t('fee.deleted'), icon: 'success' })
					fetchList()
				}
			} catch (e) { console.error(e) }
		}
	})
}

const onRefresh = async () => { refreshing.value = true; await fetchList(); refreshing.value = false }

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('fee.title') })
	fetchMembers().then(() => fetchList())
})
</script>

<style scoped>
.container { min-height: 100vh; background-color: var(--bg-page); padding: 24rpx; }
.form-card { margin-top: 24rpx; }
.form-title { font-size: 32rpx; font-weight: bold; margin-bottom: 24rpx; color: var(--text-primary); }
.picker-input { color: var(--text-secondary); }
.section-title { font-size: 30rpx; font-weight: bold; margin: 32rpx 0 16rpx; color: var(--text-primary); }
.empty-tip { text-align: center; padding: 60rpx 0; color: var(--text-placeholder); font-size: 28rpx; }
.fee-item-wrap { position: relative; overflow: hidden; margin-bottom: 16rpx; border-radius: 12rpx; }
.fee-item { position: relative; z-index: 2; transition: transform 0.15s ease; }
.fee-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.fee-title { font-size: 30rpx; font-weight: bold; color: var(--text-primary); }
.fee-amount { font-size: 34rpx; color: #e74c3c; font-weight: bold; }
.fee-detail { display: flex; justify-content: space-between; font-size: 26rpx; color: var(--text-secondary); margin-bottom: 8rpx; }
.fee-time { font-size: 22rpx; color: var(--text-placeholder); display: block; text-align: right; }
.fee-actions { position: absolute; right: 0; top: 0; bottom: 0; display: flex; z-index: 1; }
.action-btn { display: flex; align-items: center; justify-content: center; width: 160rpx; color: #fff; font-size: 24rpx; }
.delete-btn { background-color: #ff4d4f; border-radius: 0 12rpx 12rpx 0; }
</style>
