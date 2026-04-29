<template>
  <view :class="['container', isDark ? 'dark-mode' : '']">
    <button class="btn-primary" @tap="showForm = !showForm">
      {{ showForm ? t("vote.hideForm") : "+ " + t("vote.toggleForm") }}
    </button>

    <view v-if="showForm" class="card form-card">
      <view class="form-title">{{
        editingId ? t("vote.editTitle") : t("vote.formTitle")
      }}</view>
      <input
        class="input"
        v-model="form.title"
        :placeholder="t('vote.topicPh')"
      />
      <view
        v-if="!editingId"
        v-for="(opt, idx) in form.options"
        :key="idx"
        class="option-row"
      >
        <input
          class="input option-input"
          v-model="form.options[idx]"
          :placeholder="t('vote.optionPh') + ' ' + (idx + 1)"
        />
        <text
          v-if="form.options.length > 2"
          class="option-del"
          @tap="removeOption(idx)"
          >✕</text
        >
      </view>
      <view v-if="!editingId" class="option-actions">
        <text class="add-option" @tap="addOption"
          >+ {{ t("vote.addOption") }}</text
        >
      </view>
      <view class="setting-row">
        <text class="setting-label">{{ t("vote.deadline") }}</text>
        <view class="datetime-pick">
          <picker mode="date" :value="form.deadlineDate" @change="onDateChange">
            <text class="picker-value"
              >{{ form.deadlineDate || t("vote.selectDate") }} ▾</text
            >
          </picker>
          <picker mode="time" :value="form.deadlineTime" @change="onTimeChange">
            <text class="picker-value"
              >{{ form.deadlineTime || "23:59" }} ▾</text
            >
          </picker>
        </view>
      </view>
      <view class="setting-row">
        <text class="setting-label">{{ t("vote.anonymous") }}</text>
        <switch
          :checked="form.anonymous"
          @change="form.anonymous = $event.detail.value"
          color="#1677FF"
        />
      </view>
      <button class="btn-primary" @tap="editingId ? saveEdit() : submitVote()">
        {{ editingId ? t("vote.saveEdit") : t("vote.submit") }}
      </button>
      <text v-if="editingId" class="cancel-edit" @tap="cancelEdit">{{
        t("vote.cancelEdit")
      }}</text>
    </view>

    <view class="section-title">{{ t("vote.list") }}</view>
    <scroll-view
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      style="height: calc(100vh - 400rpx)"
    >
      <view v-if="voteList.length === 0" class="empty-tip">
        <text>{{ t("vote.noVote") }}</text>
      </view>
      <view
        v-for="(vote, index) in voteList"
        :key="vote._id || index"
        :class="['card', 'vote-item', vote.anonymous ? 'anonymous-card' : '']"
        @tap="showDetail(vote)"
      >
        <view class="vote-header">
          <text class="vote-title">{{ vote.title }}</text>
          <view class="vote-tags">
            <text v-if="vote.anonymous" class="vote-tag anonymous"
              >🔒 {{ t("vote.anonymousTag") }}</text
            >
            <text
              :class="[
                'vote-status',
                vote.status === 'active' ? 'active' : 'ended',
              ]"
            >
              {{
                vote.status === "active" ? t("vote.active") : t("vote.ended")
              }}
            </text>
          </view>
        </view>
        <view v-if="vote.deadline" class="vote-deadline">
          <text
            >{{ t("vote.deadline") }}：{{ formatDateTime(vote.deadline) }}</text
          >
        </view>
        <view
          v-for="(opt, oi) in vote.options"
          :key="oi"
          class="vote-option"
          @tap.stop="doVoteAndRefresh(vote, oi)"
        >
          <view
            v-if="hasCurrentUserVoted(vote) || vote.status === 'ended'"
            class="option-bar"
          >
            <view
              :class="['option-fill', opt.isWinner ? 'option-fill-winner' : '']"
              :style="{ width: getPercent(vote, oi) + '%' }"
            ></view>
          </view>
          <view
            v-if="hasCurrentUserVoted(vote) || vote.status === 'ended'"
            class="option-info"
          >
            <text :class="[opt.isWinner ? 'option-winner-text' : '']">
              {{ opt.label }}
              <text v-if="opt.isWinner" class="winner-icon">👑</text>
            </text>
            <text class="option-count"
              >{{ opt.count }} {{ t("vote.ticket") }} ({{
                getPercent(vote, oi)
              }}%)</text
            >
          </view>
          <view v-else class="option-pending">
            <text>{{ opt.label }}</text>
          </view>
        </view>
        <view class="vote-footer">
          <text class="vote-time">{{ formatDateTime(vote.createdAt) }}</text>
          <view class="vote-actions-row">
            <text class="action-link edit" @tap.stop="startEdit(vote)">{{
              t("vote.edit")
            }}</text>
            <text class="action-link delete" @tap.stop="deleteVote(vote)">{{
              t("vote.deleteBtn")
            }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 投票详情弹窗 -->
    <view v-if="detailVisible" class="modal-mask" @tap="detailVisible = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ t("vote.detail") }}</text>
          <text class="modal-close" @tap="detailVisible = false">✕</text>
        </view>
        <view class="detail-section">
          <view class="detail-row">
            <text class="detail-label">{{ t("vote.topic") }}</text>
            <text class="detail-value">{{ detailItem.title }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">{{ t("vote.creator") }}</text>
            <text class="detail-value">{{
              detailItem.creatorId?.nickname || "-"
            }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">{{ t("vote.deadline") }}</text>
            <text class="detail-value">{{
              formatDateTime(detailItem.deadline)
            }}</text>
          </view>
          <view v-if="hasCurrentUserVoted(detailItem)" class="detail-row">
            <text class="detail-label">{{ t("vote.totalVotes") }}</text>
            <text class="detail-value"
              >{{ getTotalVotes(detailItem) }} {{ t("vote.ticket") }}</text
            >
          </view>
          <view class="detail-row">
            <text class="detail-label">{{ t("vote.voteType") }}</text>
            <text
              :class="[
                'detail-value',
                detailItem.anonymous ? 'anonymous-yes' : '',
              ]"
            >
              {{
                detailItem.anonymous
                  ? "🔒 " + t("vote.anonymousTag")
                  : t("vote.publicVote")
              }}
            </text>
          </view>
        </view>
        <view class="detail-divider"></view>
        <view class="detail-options">
          <view
            v-for="(opt, oi) in detailItem.options"
            :key="oi"
            class="detail-opt"
          >
            <view class="detail-opt-header">
              <text class="detail-opt-label">{{ opt.label }}</text>
              <text
                v-if="hasCurrentUserVoted(detailItem)"
                class="detail-opt-count"
                >{{ opt.count }} {{ t("vote.ticket") }} ({{
                  getPercent(detailItem, oi)
                }}%)</text
              >
            </view>
            <view v-if="hasCurrentUserVoted(detailItem)" class="detail-opt-bar">
              <view
                class="detail-opt-fill"
                :style="{ width: getPercent(detailItem, oi) + '%' }"
              ></view>
            </view>
            <view
              v-if="
                !detailItem.anonymous &&
                hasCurrentUserVoted(detailItem) &&
                getVoterNames(detailItem, oi).length > 0
              "
              class="detail-voters"
            >
              <text class="voter-text"
                >👤 {{ getVoterNames(detailItem, oi).join("、") }}</text
              >
            </view>
          </view>
        </view>
        <view
          v-if="
            detailItem.status === 'active' && !hasCurrentUserVoted(detailItem)
          "
          class="detail-actions"
        >
          <text class="detail-tip">{{ t("vote.tapToVote") }}</text>
          <view class="detail-vote-btns">
            <view
              v-for="(opt, oi) in detailItem.options"
              :key="oi"
              class="detail-vote-btn"
              @tap="doVoteFromDetail(detailItem, oi)"
            >
              <text>{{ opt.label }}</text>
            </view>
          </view>
        </view>
        <view v-if="hasCurrentUserVoted(detailItem)" class="voted-tip">
          <text>✅ {{ t("vote.alreadyVoted") }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { get, post, put, del } from "@/utils/request";
import { t } from "@/utils/i18n";
import { isDark, applyNavBarTheme } from "@/utils/theme";
import { getLocalUserInfo } from "@/utils/auth";

const showForm = ref(false);
const refreshing = ref(false);
const editingId = ref("");
const form = reactive({
  title: "",
  options: ["", ""],
  deadlineDate: "",
  deadlineTime: "23:59",
  anonymous: false,
});
const voteList = ref([]);
const detailVisible = ref(false);
const detailItem = ref({});

const formatDateTime = (val) => {
  if (!val) return "";
  const d = new Date(val);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
  return `${date} ${time}`;
};

const addOption = () => {
  if (form.options.length >= 6) {
    uni.showToast({ title: t("vote.maxOption"), icon: "none" });
    return;
  }
  form.options.push("");
};
const removeOption = (idx) => {
  form.options.splice(idx, 1);
};
const onDateChange = (e) => {
  form.deadlineDate = e.detail.value;
};
const onTimeChange = (e) => {
  form.deadlineTime = e.detail.value;
};

const getPercent = (vote, oi) => {
  if (!vote || !vote.options) return 0;
  const total = vote.options.reduce((s, o) => s + o.count, 0);
  return total === 0 ? 0 : Math.round((vote.options[oi].count / total) * 100);
};
const getTotalVotes = (vote) => {
  if (!vote || !vote.options) return 0;
  return vote.options.reduce((s, o) => s + o.count, 0);
};
const getVoterNames = (vote, optIndex) => {
  if (!vote || !vote.voters) return [];
  const names = [];
  vote.voters.forEach((v) => {
    if (v.optionIndex !== optIndex) return;
    // populate 成功: v.userId = { _id, nickname }
    // populate 失败: v.userId = "字符串id"
    if (v.userId && typeof v.userId === "object") {
      if (v.userId.nickname) names.push(v.userId.nickname);
    }
  });
  return names;
};

// 判断当前用户是否已投票
const hasCurrentUserVoted = (vote) => {
  if (!vote || !vote.voters) return false;
  const userId = uni.getStorageSync("userId");
  return vote.voters.some((v) => {
    const vid =
      v.userId && typeof v.userId === "object" ? v.userId._id : v.userId;
    return vid && vid.toString() === userId;
  });
};

const showDetail = (vote) => {
  detailItem.value = vote;
  detailVisible.value = true;
};

const doVote = async (vote, optIndex) => {
  if (vote.status !== "active") {
    uni.showToast({ title: t("vote.voteEnded"), icon: "none" });
    return;
  }
  try {
    const res = await post("/api/decision/vote", {
      decisionId: vote._id,
      optionIndex: optIndex,
    });
    if (res.code === 200) {
      uni.showToast({ title: t("vote.voteSuccess"), icon: "success" });
    } else {
      uni.showToast({ title: res.msg || t("vote.voteEnded"), icon: "none" });
    }
  } catch (e) {
    uni.showToast({ title: t("vote.voteEnded"), icon: "none" });
  }
};
const doVoteFromDetail = async (vote, oi) => {
  await doVote(vote, oi);
  await fetchList();
  const updated = voteList.value.find((v) => v._id === vote._id);
  if (updated) detailItem.value = updated;
};
const doVoteAndRefresh = async (vote, oi) => {
  await doVote(vote, oi);
  await fetchList();
};

const fetchList = async () => {
  try {
    const userInfo = getLocalUserInfo();
    if (!userInfo.dormId) return;
    const res = await get(`/api/decision/list?dormId=${userInfo.dormId}`);
    if (res.code === 200) {
      const now = Date.now();
      voteList.value = (res.data || []).map((vote) => {
        // 动态计算是否已过期
        const isExpired = new Date(vote.deadline).getTime() < now;
        if (isExpired && vote.status === "active") {
          vote.status = "ended";
        }

        // 计算出得票数最多的选项（最高票）
        let maxCount = 0;
        vote.options.forEach((opt) => {
          if (opt.count > maxCount) maxCount = opt.count;
        });
        // 标记最高票选项
        vote.options.forEach((opt) => {
          opt.isWinner =
            vote.status === "ended" && opt.count === maxCount && maxCount > 0;
        });

        return vote;
      });
    }
  } catch (e) {
    console.error(e);
  }
};

const submitVote = async () => {
  if (!form.title) {
    uni.showToast({ title: t("vote.topicRequired"), icon: "none" });
    return;
  }
  const validOptions = form.options.filter((o) => o.trim() !== "");
  if (validOptions.length < 2) {
    uni.showToast({ title: t("vote.minOption"), icon: "none" });
    return;
  }
  if (!form.deadlineDate) {
    uni.showToast({ title: t("vote.selectDeadline"), icon: "none" });
    return;
  }
  const deadline = `${form.deadlineDate}T${form.deadlineTime || "23:59"}:00`;
  const userInfo = getLocalUserInfo();
  try {
    const res = await post("/api/decision/create", {
      dormId: userInfo.dormId,
      title: form.title,
      options: validOptions,
      deadline,
      creatorId: userInfo._id,
      anonymous: form.anonymous,
    });
    if (res.code === 200) {
      uni.showToast({ title: t("vote.created"), icon: "success" });
      resetForm();
      showForm.value = false;
      fetchList();
    } else {
      uni.showToast({ title: res.msg, icon: "none" });
    }
  } catch (e) {
    console.error(e);
  }
};

const startEdit = (vote) => {
  editingId.value = vote._id;
  form.title = vote.title;
  form.anonymous = !!vote.anonymous;
  if (vote.deadline) {
    const d = new Date(vote.deadline);
    form.deadlineDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    form.deadlineTime = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  }
  showForm.value = true;
};
const cancelEdit = () => {
  resetForm();
  editingId.value = "";
  showForm.value = false;
};
const saveEdit = async () => {
  if (!form.title) {
    uni.showToast({ title: t("vote.topicRequired"), icon: "none" });
    return;
  }
  if (!form.deadlineDate) {
    uni.showToast({ title: t("vote.selectDeadline"), icon: "none" });
    return;
  }
  const deadline = `${form.deadlineDate}T${form.deadlineTime || "23:59"}:00`;
  try {
    const res = await put("/api/decision/update", {
      decisionId: editingId.value,
      title: form.title,
      deadline,
      anonymous: form.anonymous,
    });
    if (res.code === 200) {
      uni.showToast({ title: t("vote.editSuccess"), icon: "success" });
      resetForm();
      editingId.value = "";
      showForm.value = false;
      fetchList();
    } else {
      uni.showToast({ title: res.msg, icon: "none" });
    }
  } catch (e) {
    console.error(e);
  }
};

const deleteVote = (vote) => {
  uni.showModal({
    title: t("vote.deleteTitle"),
    content: t("vote.deleteConfirm"),
    success: async (res) => {
      if (!res.confirm) return;
      try {
        const r = await del("/api/decision/delete", { decisionId: vote._id });
        if (r.code === 200) {
          uni.showToast({ title: t("vote.deleted"), icon: "success" });
          fetchList();
        }
      } catch (e) {
        console.error(e);
      }
    },
  });
};

const resetForm = () => {
  form.title = "";
  form.options = ["", ""];
  form.deadlineDate = "";
  form.deadlineTime = "23:59";
  form.anonymous = false;
};
const onRefresh = async () => {
  refreshing.value = true;
  await fetchList();
  refreshing.value = false;
};

onShow(() => {
  applyNavBarTheme();
  uni.setNavigationBarTitle({ title: t("vote.title") });
  fetchList();
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: var(--bg-page);
  padding: 24rpx;
}
.form-card {
  margin-top: 24rpx;
}
.form-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
  color: var(--text-primary);
}
.option-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.option-input {
  flex: 1;
}
.option-del {
  color: #e74c3c;
  font-size: 32rpx;
  padding: 8rpx 16rpx;
  margin-bottom: 20rpx;
}
.option-actions {
  margin-bottom: 20rpx;
}
.add-option {
  color: var(--color-primary);
  font-size: 28rpx;
}
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  margin-bottom: 20rpx;
}
.setting-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}
.datetime-pick {
  display: flex;
  gap: 16rpx;
}
.picker-value {
  font-size: 28rpx;
  color: var(--color-primary);
}
.cancel-edit {
  display: block;
  text-align: center;
  color: var(--text-hint);
  font-size: 26rpx;
  margin-top: 16rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin: 32rpx 0 16rpx;
  color: var(--text-primary);
}
.empty-tip {
  text-align: center;
  padding: 60rpx 0;
  color: var(--text-placeholder);
  font-size: 28rpx;
}

/* 投票卡片 */
.vote-item {
  margin-bottom: 16rpx;
}
.anonymous-card {
  border-left: 6rpx solid #ff9800;
}
.vote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.vote-title {
  font-size: 30rpx;
  font-weight: bold;
  color: var(--text-primary);
  flex: 1;
}
.vote-tags {
  display: flex;
  gap: 8rpx;
  align-items: center;
  flex-shrink: 0;
}
.vote-tag {
  font-size: 22rpx;
  padding: 2rpx 12rpx;
  border-radius: 16rpx;
}
.vote-tag.anonymous {
  background-color: #fff3e0;
  color: #e65100;
}
.dark-mode .vote-tag.anonymous {
  background-color: #3e2700;
  color: #ffb74d;
}
.vote-status {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}
.vote-status.active {
  background-color: #e8f5e9;
  color: #4caf50;
}
.vote-status.ended {
  background-color: var(--bg-input);
  color: var(--text-hint);
}
.dark-mode .vote-status.active {
  background-color: #1a2a1a;
}
.vote-deadline {
  font-size: 24rpx;
  color: var(--text-hint);
  margin-bottom: 12rpx;
}
.vote-option {
  margin-bottom: 16rpx;
  position: relative;
}
.option-bar {
  height: 48rpx;
  background-color: var(--bg-input);
  border-radius: 8rpx;
  overflow: hidden;
}
.option-fill {
  height: 100%;
  background-color: var(--bg-hover);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}
.option-fill-winner {
  background-color: rgba(22, 119, 255, 0.15); /* 赢家进度条高亮 */
}
.option-winner-text {
  color: var(--color-primary);
  font-weight: bold;
}
.winner-icon {
  margin-left: 8rpx;
  font-size: 28rpx;
}
.option-info {
  position: absolute;
  top: 0;
  left: 16rpx;
  right: 16rpx;
  height: 48rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
  color: var(--text-primary);
}
.option-count {
  color: var(--text-secondary);
  font-size: 24rpx;
}
.option-pending {
  height: 48rpx;
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  background: var(--bg-input);
  border-radius: 8rpx;
  font-size: 26rpx;
  color: var(--text-primary);
}
.option-pending:active {
  background: var(--color-primary);
  color: #fff;
  opacity: 0.8;
}
.vote-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}
.vote-time {
  font-size: 22rpx;
  color: var(--text-placeholder);
}
.vote-actions-row {
  display: flex;
  gap: 24rpx;
}
.action-link {
  font-size: 24rpx;
  padding: 4rpx 8rpx;
}
.action-link.edit {
  color: var(--color-primary);
}
.action-link.delete {
  color: #ff4d4f;
}

/* 详情弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  width: 88%;
  background: var(--bg-card, #fff);
  border-radius: 20rpx;
  padding: 36rpx 32rpx;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}
.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: var(--text-primary);
}
.modal-close {
  font-size: 36rpx;
  color: var(--text-hint);
  padding: 8rpx 16rpx;
}
.detail-section {
  margin-bottom: 8rpx;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid var(--border-light);
}
.detail-label {
  font-size: 26rpx;
  color: var(--text-secondary);
}
.detail-value {
  font-size: 26rpx;
  color: var(--text-primary);
  font-weight: 500;
}
.anonymous-yes {
  color: #e65100;
}
.detail-divider {
  height: 1rpx;
  background: var(--border-color);
  margin: 20rpx 0;
}
.detail-options {
  margin-bottom: 20rpx;
}
.detail-opt {
  margin-bottom: 20rpx;
}
.detail-opt-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}
.detail-opt-label {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: 500;
}
.detail-opt-count {
  font-size: 24rpx;
  color: var(--color-primary);
}
.detail-opt-bar {
  height: 24rpx;
  background: var(--bg-input);
  border-radius: 12rpx;
  overflow: hidden;
}
.detail-opt-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 12rpx;
  opacity: 0.6;
  transition: width 0.3s;
}
.detail-voters {
  margin-top: 8rpx;
}
.voter-text {
  font-size: 22rpx;
  color: var(--text-hint);
}
.detail-actions {
  margin-top: 16rpx;
}
.detail-tip {
  font-size: 24rpx;
  color: var(--text-hint);
  text-align: center;
  display: block;
  margin-bottom: 16rpx;
}
.detail-vote-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.detail-vote-btn {
  flex: 1;
  min-width: 40%;
  text-align: center;
  padding: 16rpx 0;
  background: var(--color-primary);
  color: #fff;
  border-radius: 12rpx;
  font-size: 26rpx;
}
.detail-vote-btn:active {
  opacity: 0.8;
}
.voted-tip {
  text-align: center;
  padding: 24rpx 0;
  color: #4caf50;
  font-size: 28rpx;
}
</style>
