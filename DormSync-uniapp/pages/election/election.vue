<template>
	<view :class="['page', isDark ? 'dark-mode' : '']">
		<view class="container">
			<!-- 当前宿舍长 -->
			<view class="current-leader-card">
				<text class="card-label">{{ t('election.current') }}</text>
				<text class="leader-name">🏆 {{ currentLeader }}</text>
			</view>

			<!-- 选举方式切换 -->
			<view class="mode-tabs">
				<view :class="['mode-tab', mode === 'assign' ? 'active' : '']" @tap="mode = 'assign'">
					<text>{{ t('election.modeAssign') }}</text>
				</view>
				<view :class="['mode-tab', mode === 'lottery' ? 'active' : '']" @tap="mode = 'lottery'">
					<text>{{ t('election.modeLottery') }}</text>
				</view>
				<view :class="['mode-tab', mode === 'vote' ? 'active' : '']" @tap="mode = 'vote'">
					<text>{{ t('election.modeVote') }}</text>
				</view>
			</view>

			<!-- 模式1：直接指定 -->
			<view v-if="mode === 'assign'">
				<text class="mode-desc">{{ t('election.assignDesc') }}</text>
				<view v-for="(m, i) in memberList" :key="m._id || i" class="card member-item" @tap="electMember(m)">
					<view class="member-info">
						<view class="avatar-circle">{{ (m.nickname || '?')[0] }}</view>
						<text class="member-name">{{ m.nickname }}</text>
					</view>
					<text v-if="m.role === 'leader'" class="current-tag">{{ t('election.currentTag') }}</text>
					<text v-else class="elect-btn">{{ t('election.elect') }}</text>
				</view>
			</view>

			<!-- 模式2：随机抽签 -->
			<view v-if="mode === 'lottery'" class="lottery-section">
				<text class="mode-desc">{{ t('election.lotteryDesc') }}</text>
				<view class="lottery-display">
					<text class="lottery-name" :class="{ spinning: lotteryRunning }">{{ lotteryName }}</text>
				</view>
				<button v-if="!lotteryResult" class="btn-lottery" @tap="startLottery" :disabled="lotteryRunning">
					{{ lotteryRunning ? t('election.drawing') : t('election.startDraw') }}
				</button>
				<view v-if="lotteryResult" class="lottery-result">
					<text class="result-text">🎉 {{ t('election.drawResult') }}：{{ lotteryResult }}</text>
					<button class="btn-primary" @tap="confirmLottery">{{ t('election.confirmResult') }}</button>
					<text class="redraw-btn" @tap="resetLottery">{{ t('election.redraw') }}</text>
				</view>
			</view>

			<!-- 模式3：匿名投票 -->
			<view v-if="mode === 'vote'" class="vote-section">
				<text class="mode-desc">{{ t('election.voteDesc') }}</text>
				<view v-if="!hasVoted && !voteEnded" class="vote-list">
					<text class="vote-tip">{{ t('election.voteTip') }}</text>
					<view v-for="(m, i) in memberList" :key="m._id || i" class="card vote-item" @tap="castElectionVote(m)">
						<view class="member-info">
							<view class="avatar-circle">{{ (m.nickname || '?')[0] }}</view>
							<text class="member-name">{{ m.nickname }}</text>
						</view>
						<text class="vote-btn">{{ t('election.voteFor') }}</text>
					</view>
				</view>
				<view v-if="hasVoted || voteEnded" class="vote-results">
					<text class="result-title">{{ t('election.voteResult') }}</text>
					<view v-for="(r, i) in voteResults" :key="i" class="result-row">
						<view class="result-info">
							<view class="avatar-circle small">{{ (r.name || '?')[0] }}</view>
							<text class="result-name">{{ r.name }}</text>
						</view>
						<view class="result-bar-wrap">
							<view class="result-bar" :style="{ width: r.percent + '%' }"></view>
						</view>
						<text class="result-count">{{ r.count }} {{ t('vote.ticket') }}</text>
					</view>
					<view v-if="voteEnded && winner" class="winner-section">
						<text class="winner-text">🏆 {{ t('election.winner') }}：{{ winner }}</text>
						<text v-if="isTie" class="tie-text">{{ t('election.tieNote') }}</text>
						<button class="btn-primary" @tap="confirmVoteWinner">{{ t('election.confirmResult') }}</button>
					</view>
					<view v-if="!voteEnded" class="waiting-tip">
						<text>{{ t('election.waitingVotes') }}（{{ totalVotes }}/{{ memberList.length }}）</text>
					</view>
					<button v-if="!voteEnded && totalVotes > 0" class="btn-end-vote" @tap="endVote">{{ t('election.endVote') }}</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request'
import { t } from '@/utils/i18n'
import { isDark, applyNavBarTheme } from '@/utils/theme'
import { getLocalUserInfo } from '@/utils/auth'

const mode = ref('assign')
const memberList = ref([])
const currentLeader = computed(() => {
	const leader = memberList.value.find(m => m.role === 'leader')
	return leader ? leader.nickname : '-'
})
const nonLeaderMembers = computed(() => memberList.value.filter(m => m.role !== 'leader'))

// 抽签相关
const lotteryRunning = ref(false)
const lotteryName = ref('?')
const lotteryResult = ref('')
let lotteryTimer = null

// 投票相关
const electionVotes = ref({}) // { odId: count }
const hasVoted = ref(false)
const voteEnded = ref(false)
const winner = ref('')
const isTie = ref(false)

const totalVotes = computed(() => Object.values(electionVotes.value).reduce((s, c) => s + c, 0))
const voteResults = computed(() => {
	const total = totalVotes.value || 1
	return memberList.value.map(m => ({
		id: m._id, name: m.nickname,
		count: electionVotes.value[m._id] || 0,
		percent: Math.round(((electionVotes.value[m._id] || 0) / total) * 100)
	})).sort((a, b) => b.count - a.count)
})

const fetchMembers = async () => {
	const userInfo = getLocalUserInfo()
	if (!userInfo.dormId) return
	try {
		const res = await get(`/api/dorm/members?dormId=${userInfo.dormId}`)
		if (res.code === 200) memberList.value = res.data || []
	} catch (e) { console.error(e) }
}

// === 直接指定 ===
const electMember = (m) => {
	if (m.role === 'leader') return
	uni.showModal({
		title: t('election.confirmTitle'),
		content: `${t('election.confirmMsg')} ${m.nickname}？`,
		success: async (res) => {
			if (!res.confirm) return
			const userInfo = getLocalUserInfo()
			try {
				const r = await post('/api/dorm/elect', { dormId: userInfo.dormId, userId: m._id })
				if (r.code === 200) {
					uni.showToast({ title: t('election.success'), icon: 'success' })
					fetchMembers()
				} else { uni.showToast({ title: r.msg, icon: 'none' }) }
			} catch (e) { console.error(e) }
		}
	})
}

// === 随机抽签 ===
const startLottery = () => {
	if (memberList.value.length < 2) return
	lotteryRunning.value = true
	lotteryResult.value = ''
	let count = 0
	const maxCount = 20
	lotteryTimer = setInterval(() => {
		const idx = Math.floor(Math.random() * memberList.value.length)
		lotteryName.value = memberList.value[idx].nickname
		count++
		if (count >= maxCount) {
			clearInterval(lotteryTimer)
			lotteryRunning.value = false
			lotteryResult.value = lotteryName.value
		}
	}, 100)
}
const confirmLottery = async () => {
	const m = memberList.value.find(m => m.nickname === lotteryResult.value)
	if (!m) return
	const userInfo = getLocalUserInfo()
	try {
		const r = await post('/api/dorm/elect', { dormId: userInfo.dormId, userId: m._id })
		if (r.code === 200) {
			uni.showToast({ title: t('election.success'), icon: 'success' })
			resetLottery()
			fetchMembers()
		}
	} catch (e) { console.error(e) }
}
const resetLottery = () => { lotteryResult.value = ''; lotteryName.value = '?' }

// === 匿名投票 ===
const castElectionVote = (m) => {
	uni.showModal({
		title: t('election.voteConfirmTitle'),
		content: `${t('election.voteConfirmMsg')} ${m.nickname}？`,
		success: (res) => {
			if (!res.confirm) return
			electionVotes.value[m._id] = (electionVotes.value[m._id] || 0) + 1
			hasVoted.value = true
			uni.showToast({ title: t('election.voted'), icon: 'success' })
		}
	})
}

const endVote = () => {
	voteEnded.value = true
	// 找出最高票
	const sorted = voteResults.value.filter(r => r.count > 0)
	if (sorted.length === 0) return
	const maxCount = sorted[0].count
	const topCandidates = sorted.filter(r => r.count === maxCount)

	if (topCandidates.length === 1) {
		winner.value = topCandidates[0].name
		isTie.value = false
	} else {
		// 平票：随机抽签
		isTie.value = true
		const idx = Math.floor(Math.random() * topCandidates.length)
		winner.value = topCandidates[idx].name
	}
}

const confirmVoteWinner = async () => {
	const m = memberList.value.find(m => m.nickname === winner.value)
	if (!m) return
	const userInfo = getLocalUserInfo()
	try {
		const r = await post('/api/dorm/elect', { dormId: userInfo.dormId, userId: m._id })
		if (r.code === 200) {
			uni.showToast({ title: t('election.success'), icon: 'success' })
			// 重置投票状态
			electionVotes.value = {}
			hasVoted.value = false
			voteEnded.value = false
			winner.value = ''
			isTie.value = false
			fetchMembers()
		}
	} catch (e) { console.error(e) }
}

onShow(() => {
	applyNavBarTheme()
	uni.setNavigationBarTitle({ title: t('election.title') })
	fetchMembers()
})
</script>

<style scoped>
.page { min-height: 100vh; background-color: var(--bg-page); }
.container { padding: 24rpx; }

/* 当前宿舍长 */
.current-leader-card { background: linear-gradient(135deg, #1677FF, #4A9FFF); border-radius: 16rpx; padding: 28rpx; margin-bottom: 24rpx; }
.dark-mode .current-leader-card { background: linear-gradient(135deg, #0d47a1, #1565c0); }
.card-label { font-size: 24rpx; color: rgba(255,255,255,0.8); display: block; margin-bottom: 8rpx; }
.leader-name { font-size: 36rpx; font-weight: bold; color: #fff; }

/* 模式切换 */
.mode-tabs { display: flex; background: var(--bg-card); border-radius: 12rpx; overflow: hidden; margin-bottom: 24rpx; border: 1rpx solid var(--border-color); }
.mode-tab { flex: 1; text-align: center; padding: 20rpx 0; font-size: 26rpx; color: var(--text-secondary); }
.mode-tab.active { background: var(--color-primary); color: #fff; }
.mode-desc { font-size: 26rpx; color: var(--text-hint); display: block; margin-bottom: 20rpx; }

/* 成员列表 */
.member-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx; margin-bottom: 12rpx; }
.member-info { display: flex; align-items: center; gap: 16rpx; }
.avatar-circle { width: 72rpx; height: 72rpx; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 30rpx; font-weight: bold; }
.avatar-circle.small { width: 52rpx; height: 52rpx; font-size: 24rpx; }
.member-name { font-size: 28rpx; color: var(--text-primary); font-weight: 500; }
.current-tag { font-size: 24rpx; color: #fa8c16; }
.elect-btn { font-size: 26rpx; color: var(--color-primary); }

/* 抽签 */
.lottery-section { text-align: center; }
.lottery-display { margin: 40rpx 0; padding: 60rpx; background: var(--bg-card); border-radius: 50%; width: 280rpx; height: 280rpx; margin-left: auto; margin-right: auto; display: flex; align-items: center; justify-content: center; border: 4rpx solid var(--color-primary); }
.lottery-name { font-size: 48rpx; font-weight: bold; color: var(--color-primary); }
.lottery-name.spinning { animation: pulse 0.2s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.btn-lottery { width: 60%; height: 80rpx; line-height: 80rpx; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; border-radius: 40rpx; font-size: 30rpx; border: none; margin: 0 auto; }
.btn-lottery::after { border: none; }
.lottery-result { margin-top: 32rpx; }
.result-text { font-size: 34rpx; color: var(--text-primary); font-weight: bold; display: block; margin-bottom: 24rpx; }
.redraw-btn { font-size: 26rpx; color: var(--text-hint); display: block; text-align: center; margin-top: 16rpx; }

/* 投票 */
.vote-tip { font-size: 26rpx; color: var(--color-primary); display: block; margin-bottom: 16rpx; }
.vote-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx; margin-bottom: 12rpx; }
.vote-item:active { background: var(--bg-hover); }
.vote-btn { font-size: 26rpx; color: var(--color-primary); font-weight: 500; }
.vote-results { margin-top: 16rpx; }
.result-title { font-size: 28rpx; font-weight: bold; color: var(--text-primary); display: block; margin-bottom: 16rpx; }
.result-row { display: flex; align-items: center; gap: 16rpx; margin-bottom: 16rpx; }
.result-info { display: flex; align-items: center; gap: 8rpx; width: 160rpx; flex-shrink: 0; }
.result-name { font-size: 26rpx; color: var(--text-primary); }
.result-bar-wrap { flex: 1; height: 28rpx; background: var(--bg-input); border-radius: 14rpx; overflow: hidden; }
.result-bar { height: 100%; background: var(--color-primary); border-radius: 14rpx; transition: width 0.3s; }
.result-count { font-size: 24rpx; color: var(--text-hint); width: 80rpx; text-align: right; flex-shrink: 0; }
.winner-section { text-align: center; margin-top: 32rpx; padding: 24rpx; background: #f6ffed; border-radius: 16rpx; }
.dark-mode .winner-section { background: #1a2a1a; }
.winner-text { font-size: 32rpx; font-weight: bold; color: #52c41a; display: block; margin-bottom: 8rpx; }
.tie-text { font-size: 24rpx; color: #fa8c16; display: block; margin-bottom: 16rpx; }
.waiting-tip { text-align: center; padding: 24rpx; color: var(--text-hint); font-size: 26rpx; }
.btn-end-vote { width: 60%; height: 76rpx; line-height: 76rpx; background: #fa8c16; color: #fff; border-radius: 12rpx; font-size: 28rpx; border: none; margin: 16rpx auto 0; }
.btn-end-vote::after { border: none; }
</style>
