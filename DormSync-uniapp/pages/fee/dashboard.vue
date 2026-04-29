<template>
  <view :class="['page', isDark ? 'dark-mode' : '']">
    <scroll-view scroll-y class="dashboard-scroll">
      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">各项支出占比</text>
          <text class="section-desc">分析各类型费用分布情况</text>
        </view>
        <view class="pie-chart-container">
          <!-- CSS 绘制的简易饼图背景 -->
          <view class="pie-circle" :style="pieStyle"></view>
          <!-- 饼图图例 -->
          <view class="pie-legend">
            <view
              v-for="(item, index) in pieData"
              :key="index"
              class="legend-item"
            >
              <view
                class="legend-color"
                :style="{ backgroundColor: colors[index % colors.length] }"
              ></view>
              <text class="legend-name">{{ item.name }}</text>
              <text class="legend-value">¥{{ item.value }}</text>
            </view>
            <view v-if="pieData.length === 0" class="empty-text">暂无数据</view>
          </view>
        </view>
      </view>

      <view class="chart-section">
        <view class="section-header">
          <text class="section-title">近6个月趋势</text>
          <text class="section-desc">追踪宿舍开销走势</text>
        </view>
        <view class="bar-chart-container">
          <view
            v-if="lineData.categories && lineData.categories.length > 0"
            class="bar-chart"
          >
            <view
              v-for="(cat, idx) in lineData.categories"
              :key="idx"
              class="bar-item"
            >
              <text class="bar-value">¥{{ lineData.series[0].data[idx] }}</text>
              <view class="bar-track">
                <view
                  class="bar-fill"
                  :style="{
                    height: getBarHeight(lineData.series[0].data[idx]),
                  }"
                ></view>
              </view>
              <text class="bar-label">{{ cat }}</text>
            </view>
          </view>
          <view v-else class="empty-text">暂无数据</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { get } from "@/utils/request";
import { getLocalUserInfo } from "@/utils/auth";
import { isDark, applyNavBarTheme } from "@/utils/theme";
import { onShow } from "@dcloudio/uni-app";

const pieData = ref([]);
const lineData = ref({});
const colors = [
  "#1890FF",
  "#91CB74",
  "#FAC858",
  "#EE6666",
  "#73C0DE",
  "#3CA272",
];

// 使用 CSS conic-gradient 绘制饼图
const pieStyle = computed(() => {
  if (pieData.value.length === 0) return "background: #f0f0f0;";

  const total = pieData.value.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return "background: #f0f0f0;";

  let gradient = [];
  let currentAngle = 0;

  pieData.value.forEach((item, index) => {
    const percentage = (item.value / total) * 100;
    const color = colors[index % colors.length];
    gradient.push(`${color} ${currentAngle}% ${currentAngle + percentage}%`);
    currentAngle += percentage;
  });

  return `background: conic-gradient(${gradient.join(", ")});`;
});

// 计算柱状图的高度百分比
const getBarHeight = (value) => {
  if (!lineData.value.series || lineData.value.series[0].data.length === 0)
    return "0%";
  const max = Math.max(...lineData.value.series[0].data);
  if (max === 0) return "0%";
  return `${(value / max) * 100}%`;
};

const fetchStatistics = async () => {
  const userInfo = getLocalUserInfo();
  if (!userInfo || !userInfo.dormId) return;

  uni.showLoading({ title: "加载中" });
  try {
    const res = await get(`/api/finance/statistics?dormId=${userInfo.dormId}`);
    if (res.code === 200 && res.data) {
      pieData.value = res.data.pieChart || [];
      lineData.value = res.data.lineChart || {};
    }
  } catch (e) {
    console.error(e);
    uni.showToast({ title: "获取数据失败", icon: "none" });
  } finally {
    uni.hideLoading();
  }
};

onShow(() => {
  applyNavBarTheme();
  uni.setNavigationBarTitle({ title: "数据可视化分析" });
});

onMounted(() => {
  fetchStatistics();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-page);
  padding: 24rpx;
  box-sizing: border-box;
}
.dashboard-scroll {
  height: calc(100vh - 48rpx);
}

.chart-section {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 32rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-primary);
  display: block;
}
.section-desc {
  font-size: 24rpx;
  color: var(--text-hint);
  display: block;
  margin-top: 8rpx;
}

/* CSS 饼图样式 */
.pie-chart-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20rpx 0;
}
.pie-circle {
  width: 240rpx;
  height: 240rpx;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}
.pie-legend {
  flex: 1;
  margin-left: 40rpx;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.legend-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 6rpx;
  margin-right: 12rpx;
}
.legend-name {
  font-size: 26rpx;
  color: var(--text-secondary);
  flex: 1;
}
.legend-value {
  font-size: 26rpx;
  font-weight: bold;
  color: var(--text-primary);
}

/* CSS 柱状图样式（替代折线图） */
.bar-chart-container {
  padding: 20rpx 0 0;
  height: 360rpx;
}
.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
}
.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 80rpx;
}
.bar-value {
  font-size: 20rpx;
  color: var(--color-primary);
  margin-bottom: 8rpx;
}
.bar-track {
  width: 32rpx;
  flex: 1;
  background: var(--bg-input);
  border-radius: 16rpx;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #4a9fff 0%, #1677ff 100%);
  border-radius: 16rpx;
  transition: height 0.5s ease-out;
}
.bar-label {
  font-size: 22rpx;
  color: var(--text-secondary);
  margin-top: 12rpx;
}

.empty-text {
  font-size: 28rpx;
  color: var(--text-hint);
  text-align: center;
  padding: 40rpx 0;
}
</style>
