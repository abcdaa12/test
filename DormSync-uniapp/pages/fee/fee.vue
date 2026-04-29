<template>
  <view :class="['container', isDark ? 'dark-mode' : '']">
    <!-- 数据可视化大屏入口 -->
    <view class="dashboard-banner" @tap="goToDashboard">
      <view class="banner-left">
        <text class="banner-icon">📊</text>
        <view class="banner-text">
          <text class="banner-title">财务数据可视化大屏</text>
          <text class="banner-sub">点击查看各项支出占比与趋势</text>
        </view>
      </view>
      <text class="banner-arrow">></text>
    </view>

    <!-- 顶部统计卡片 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-value">¥{{ monthSpend }}</text>
        <text class="stats-label">{{ t("fee.monthTotal") }}</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value">¥{{ monthAvg }}</text>
        <text class="stats-label">{{ t("fee.monthAvg") }}</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value">{{ monthCount }}</text>
        <text class="stats-label">{{ t("fee.monthCount") }}</text>
      </view>
    </view>

    <button class="btn-primary" @tap="showForm = !showForm">
      {{ showForm ? t("fee.hideForm") : "+ " + t("fee.toggleForm") }}
    </button>

    <view v-if="showForm" class="card form-card">
      <view class="form-title">{{ t("fee.formTitle") }}</view>
      <input
        class="input"
        v-model="form.title"
        :placeholder="t('fee.namePh')"
      />
      <input
        class="input"
        v-model="form.amount"
        type="digit"
        :placeholder="t('fee.amountPh')"
      />
      <view class="payer-section">
        <text class="payer-label">{{ t("fee.payerPh") }}</text>
        <view class="payer-list">
          <view
            v-for="(m, idx) in members"
            :key="m._id"
            :class="[
              'payer-tag',
              selectedPayerIds.includes(m._id) ? 'payer-active' : '',
            ]"
            @tap="togglePayer(m._id)"
          >
            <text>{{ m.nickname }}</text>
          </view>
        </view>
      </view>
      <input
        class="input"
        v-model="form.remark"
        :placeholder="t('fee.remarkPh')"
      />
      <button class="btn-primary" @tap="submitFee">
        {{ t("fee.submit") }}
      </button>
    </view>

    <!-- 搜索 + 筛选 -->
    <view class="search-bar">
      <input
        class="search-input"
        v-model="keyword"
        :placeholder="t('fee.searchPh')"
        @input="onSearch"
      />
      <picker
        :range="filterPayerNames"
        @change="onFilterPayer"
        :value="filterPayerIndex"
      >
        <view class="filter-btn"
          >{{ filterPayerNames[filterPayerIndex] }} ▾</view
        >
      </picker>
    </view>

    <!-- 按月分组列表 -->
    <scroll-view
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      style="height: calc(100vh - 580rpx)"
    >
      <view v-if="groupedList.length === 0" class="empty-tip">
        <text>{{
          keyword || filterPayerIndex > 0
            ? t("fee.noResult")
            : t("fee.noRecord")
        }}</text>
      </view>
      <view v-for="(group, gi) in groupedList" :key="gi" class="month-group">
        <view class="month-header">
          <text class="month-label">{{ group.month }}</text>
          <text class="month-sum"
            >{{ t("fee.monthTotal") }} ¥{{ group.total }}</text
          >
        </view>
        <view
          v-for="(item, index) in group.items"
          :key="item._id || index"
          class="fee-item"
          @tap="showDetail(item)"
        >
          <view class="fee-icon-wrap">
            <text class="fee-icon">💰</text>
          </view>
          <view class="fee-info">
            <text class="fee-title">{{ item.title }}</text>
            <text class="fee-sub"
              >{{ item.creatorName }} · {{ formatDate(item.createdAt) }}</text
            >
          </view>
          <view class="fee-right">
            <text class="fee-amount">¥{{ item.amount }}</text>
            <text class="fee-avg"
              >{{ t("fee.perPerson") }} ¥{{ item.perPerson }}</text
            >
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 详情弹窗 -->
    <view v-if="detailVisible" class="modal-mask" @tap="detailVisible = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ t("fee.detail") }}</text>
          <text class="modal-close" @tap="detailVisible = false">✕</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">{{ t("fee.formTitle") }}</text>
          <text class="detail-value">{{ detailItem.title }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">{{ t("fee.amount") }}</text>
          <text class="detail-value amount-highlight"
            >¥{{ detailItem.amount }}</text
          >
        </view>
        <view class="detail-row">
          <text class="detail-label">{{ t("fee.payer") }}</text>
          <text class="detail-value">{{ detailItem.creatorName }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">{{ t("fee.perPerson") }}</text>
          <text class="detail-value">¥{{ detailItem.perPerson }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">{{ t("fee.participants") }}</text>
          <text class="detail-value">{{ detailItem.payeeNames || "-" }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">{{ t("fee.time") }}</text>
          <text class="detail-value">{{
            formatFull(detailItem.createdAt)
          }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { get, post } from "@/utils/request";
import { t } from "@/utils/i18n";
import { isDark, applyNavBarTheme } from "@/utils/theme";
import { getLocalUserInfo } from "@/utils/auth";

const showForm = ref(false);
const refreshing = ref(false);
const members = ref([]);
const memberNames = computed(() => members.value.map((m) => m.nickname));
const selectedPayerIds = ref([]);
const form = reactive({ title: "", amount: "", remark: "" });
const feeList = ref([]);
const keyword = ref("");
const filterPayerIndex = ref(0);
const detailVisible = ref(false);
const detailItem = ref({});

const filterPayerNames = computed(() => [
  t("fee.allPayer"),
  ...memberNames.value,
]);

const formatDate = (t) => (t ? new Date(t).toISOString().slice(5, 10) : "");
const formatFull = (t) =>
  t ? new Date(t).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) : "";
const formatMonth = (t) => {
  if (!t) return "";
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const togglePayer = (id) => {
  const idx = selectedPayerIds.value.indexOf(id);
  if (idx >= 0) selectedPayerIds.value.splice(idx, 1);
  else selectedPayerIds.value.push(id);
};
const onFilterPayer = (e) => {
  filterPayerIndex.value = Number(e.detail.value);
};
const onSearch = () => {}; // reactive via computed

// 过滤后的列表
const filteredList = computed(() => {
  let list = feeList.value;
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase();
    list = list.filter(
      (i) =>
        i.title.toLowerCase().includes(kw) ||
        (i.creatorName || "").toLowerCase().includes(kw)
    );
  }
  if (filterPayerIndex.value > 0) {
    const payerName = memberNames.value[filterPayerIndex.value - 1];
    list = list.filter((i) => i.creatorName === payerName);
  }
  return list;
});

// 当月统计
const currentMonth = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
});
const currentMonthList = computed(() =>
  feeList.value.filter((i) => formatMonth(i.createdAt) === currentMonth.value)
);
const monthSpend = computed(() =>
  currentMonthList.value.reduce((s, i) => s + (i.amount || 0), 0).toFixed(2)
);
const monthAvg = computed(() => {
  const mc = members.value.length || 1;
  return (
    currentMonthList.value.reduce((s, i) => s + (i.amount || 0), 0) / mc
  ).toFixed(2);
});
const monthCount = computed(() => currentMonthList.value.length);

// 按月分组
const groupedList = computed(() => {
  const map = {};
  filteredList.value.forEach((item) => {
    const month = formatMonth(item.createdAt) || "未知";
    if (!map[month]) map[month] = { month, items: [], total: 0 };
    map[month].items.push(item);
    map[month].total += item.amount || 0;
  });
  return Object.values(map)
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((g) => ({ ...g, total: g.total.toFixed(2) }));
});

const showDetail = (item) => {
  detailItem.value = {
    ...item,
    payeeNames:
      (item.payeeIds || []).map((p) => p.nickname || p).join("、") || "-",
  };
  detailVisible.value = true;
};

const goToDashboard = () => {
  uni.navigateTo({ url: "/pages/fee/dashboard" });
};

const fetchMembers = async () => {
  try {
    const userInfo = getLocalUserInfo();
    if (!userInfo.dormId) return;
    const res = await get(`/api/dorm/members?dormId=${userInfo.dormId}`);
    if (res.code === 200) members.value = res.data || [];
  } catch (e) {
    console.error(e);
  }
};

const fetchList = async () => {
  try {
    const userInfo = getLocalUserInfo();
    if (!userInfo.dormId) return;
    const res = await get(`/api/finance/list?dormId=${userInfo.dormId}`);
    if (res.code === 200) {
      feeList.value = (res.data || []).map((item) => ({
        ...item,
        creatorName: item.creatorId?.nickname || "",
        perPerson: (item.payeeIds && item.payeeIds.length > 0
          ? item.amount / item.payeeIds.length
          : item.amount
        ).toFixed(2),
      }));
    }
  } catch (e) {
    console.error(e);
  }
};

const submitFee = async () => {
  if (!form.title || !form.amount) {
    uni.showToast({ title: t("fee.fillAll"), icon: "none" });
    return;
  }
  const amount = parseFloat(form.amount);
  if (isNaN(amount) || amount <= 0) {
    uni.showToast({ title: t("fee.invalidAmount"), icon: "none" });
    return;
  }
  if (selectedPayerIds.value.length === 0) {
    uni.showToast({ title: t("fee.payerPh"), icon: "none" });
    return;
  }
  const userInfo = getLocalUserInfo();
  try {
    const res = await post("/api/finance/create", {
      dormId: userInfo.dormId,
      title: form.title,
      amount,
      creatorId: userInfo._id,
      payeeIds: selectedPayerIds.value,
    });
    if (res.code === 200) {
      uni.showToast({ title: t("fee.added"), icon: "success" });
      form.title = "";
      form.amount = "";
      form.remark = "";
      selectedPayerIds.value = [];
      showForm.value = false;
      fetchList();
    } else {
      uni.showToast({ title: res.msg || t("fee.fillAll"), icon: "none" });
    }
  } catch (e) {
    uni.showToast({ title: t("fee.fillAll"), icon: "none" });
  }
};

const onRefresh = async () => {
  refreshing.value = true;
  await fetchList();
  refreshing.value = false;
};

onShow(() => {
  applyNavBarTheme();
  uni.setNavigationBarTitle({ title: t("fee.title") });
  fetchMembers().then(() => fetchList());
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: var(--bg-page);
  padding: 24rpx;
}

/* 大屏横幅 */
.dashboard-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #4a9fff 0%, #1677ff 100%);
  padding: 28rpx 32rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(22, 119, 255, 0.2);
  position: relative;
  overflow: hidden;
}
.dashboard-banner::after {
  content: "";
  position: absolute;
  right: -20rpx;
  top: -20rpx;
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}
.dark-mode .dashboard-banner {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.4);
}
.banner-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  z-index: 1;
}
.banner-icon {
  font-size: 52rpx;
}
.banner-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 8rpx;
  letter-spacing: 2rpx;
}
.banner-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  display: block;
}
.banner-arrow {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  z-index: 1;
  opacity: 0.8;
}

/* 统计卡片 */
.stats-card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1677ff, #4a9fff);
  border-radius: 20rpx;
  padding: 36rpx 0;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(22, 119, 255, 0.2);
}
.dark-mode .stats-card {
  background: linear-gradient(135deg, #0d47a1, #1565c0);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.4);
}
.stats-item {
  flex: 1;
  text-align: center;
}
.stats-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  display: block;
}
.stats-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-top: 8rpx;
}
.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 16rpx;
  margin: 24rpx 0 16rpx;
  align-items: center;
}
.search-input {
  flex: 1;
  height: 68rpx;
  background: var(--bg-card);
  border: 1rpx solid var(--border-color);
  border-radius: 34rpx;
  padding: 0 28rpx;
  font-size: 26rpx;
  color: var(--text-primary);
}
.filter-btn {
  height: 68rpx;
  line-height: 68rpx;
  padding: 0 24rpx;
  background: var(--bg-card);
  border: 1rpx solid var(--border-color);
  border-radius: 34rpx;
  font-size: 24rpx;
  color: var(--color-primary);
  white-space: nowrap;
}

/* 表单 */
.form-card {
  margin-top: 24rpx;
}
.form-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
  color: var(--text-primary);
}
.picker-input {
  color: var(--text-secondary);
}
.payer-section {
  margin-bottom: 20rpx;
}
.payer-label {
  font-size: 28rpx;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 12rpx;
}
.payer-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.payer-tag {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  background: var(--bg-input);
  color: var(--text-secondary);
  border: 1rpx solid var(--border-color);
}
.payer-active {
  background: #e6f4ff;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.dark-mode .payer-active {
  background: #1a2a3a;
}

/* 月份分组 */
.month-group {
  margin-bottom: 8rpx;
}
.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 8rpx 12rpx;
  border-bottom: 1rpx solid var(--border-light);
}
.month-label {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-primary);
}
.month-sum {
  font-size: 24rpx;
  color: var(--text-hint);
}

/* 费用条目 */
.fee-item {
  display: flex;
  align-items: center;
  padding: 24rpx 16rpx;
  background: var(--bg-card);
  border-radius: 12rpx;
  margin-top: 12rpx;
}
.fee-item:active {
  background: var(--bg-hover, #f0f0f0);
}
.fee-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #fff3e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.dark-mode .fee-icon-wrap {
  background: #2a2000;
}
.fee-icon {
  font-size: 36rpx;
}
.fee-info {
  flex: 1;
  overflow: hidden;
}
.fee-title {
  font-size: 28rpx;
  color: var(--text-primary);
  display: block;
  font-weight: 500;
}
.fee-sub {
  font-size: 22rpx;
  color: var(--text-hint);
  display: block;
  margin-top: 6rpx;
}
.fee-right {
  text-align: right;
  flex-shrink: 0;
  margin-left: 16rpx;
}
.fee-amount {
  font-size: 30rpx;
  color: #e74c3c;
  font-weight: bold;
  display: block;
}
.fee-avg {
  font-size: 20rpx;
  color: var(--text-hint);
  display: block;
  margin-top: 4rpx;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: var(--text-placeholder);
  font-size: 28rpx;
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
  width: 85%;
  background: var(--bg-card, #fff);
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  max-height: 80vh;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
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
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid var(--border-light);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-label {
  font-size: 28rpx;
  color: var(--text-secondary);
}
.detail-value {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: 500;
}
.amount-highlight {
  color: #e74c3c;
  font-size: 34rpx;
  font-weight: bold;
}
</style>
