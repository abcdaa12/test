<template>
  <view :class="['page', isDark ? 'dark-mode' : '']">
    <view class="container">
      <!-- 顶部欢迎卡片 -->
      <view class="header-card">
        <text class="header-title">宿舍管理与设置</text>
        <text class="header-sub">邀请成员、选举宿舍长、退出宿舍等</text>
      </view>

      <!-- 成员管理列表 (List) -->
      <view class="list-section">
        <view class="section-title">成员管理</view>
        <view class="list-container">
          <view class="list-item" @tap="goTo('/pages/members/members')">
            <text class="list-icon">👤</text>
            <text class="list-label">{{ t("more.viewMember") }}</text>
            <text class="list-arrow">></text>
          </view>

          <view class="list-item" @tap="goTo('/pages/election/election')">
            <text class="list-icon">🏆</text>
            <text class="list-label">{{ t("more.election") }}</text>
            <text class="list-arrow">></text>
          </view>

          <view class="list-item" @tap="goTo('/pages/invite/invite')">
            <text class="list-icon">✉️</text>
            <text class="list-label">{{ t("more.invite") }}</text>
            <text class="list-arrow">></text>
          </view>
        </view>
      </view>

      <!-- 危险操作区域 -->
      <view class="danger-section">
        <view class="danger-btn" @tap="handleLeave">
          <text class="danger-icon">🚪</text>
          <text class="danger-label">{{ t("more.leave") }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { get, post, put } from "@/utils/request";
import { t } from "@/utils/i18n";
import { isDark, applyNavBarTheme } from "@/utils/theme";
import { getLocalUserInfo, clearAuth } from "@/utils/auth";

const goTo = (url) => {
  uni.navigateTo({ url });
};

const handleLeave = () => {
  uni.showModal({
    title: t("more.leaveTitle"),
    content: t("more.leaveConfirm"),
    success: async (res) => {
      if (!res.confirm) return;
      try {
        const userInfo = getLocalUserInfo();
        const r = await post("/api/dorm/leave", {
          dormId: userInfo.dormId,
          userId: userInfo._id,
        });
        if (r.code === 200) {
          // 更新本地缓存
          const info = getLocalUserInfo();
          info.dormId = "";
          info.role = "member";
          uni.setStorageSync("userInfo", info);
          uni.showToast({ title: t("more.leaveSuccess"), icon: "success" });
          setTimeout(() => {
            uni.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
          }, 1000);
        } else {
          uni.showToast({ title: r.msg, icon: "none" });
        }
      } catch (e) {
        console.error(e);
      }
    },
  });
};

onShow(() => {
  applyNavBarTheme();
  uni.setNavigationBarTitle({ title: t("more.title") });
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--bg-page);
}
.container {
  padding: 24rpx;
}

/* 顶部欢迎卡片 */
.header-card {
  background: linear-gradient(135deg, #1677ff, #4a9fff);
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 20rpx rgba(22, 119, 255, 0.2);
}
.dark-mode .header-card {
  background: linear-gradient(135deg, #0d47a1, #1565c0);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.4);
}
.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}
.header-sub {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

/* 区域标题 */
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 24rpx;
  padding-left: 8rpx;
}

/* 核心功能网格 */
.grid-section {
  margin-bottom: 40rpx;
}
.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  background: var(--bg-card);
  border-radius: 20rpx;
  padding: 32rpx 16rpx;
  box-shadow: var(--shadow-card);
}
.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.grid-item:active {
  opacity: 0.7;
}
.grid-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}
.grid-icon {
  font-size: 48rpx;
}
.grid-label {
  font-size: 24rpx;
  color: var(--text-primary);
  font-weight: 500;
}

/* 成员管理列表 */
.list-section {
  margin-bottom: 40rpx;
}
.list-container {
  background: var(--bg-card);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.list-item {
  display: flex;
  align-items: center;
  padding: 32rpx 32rpx;
  border-bottom: 1rpx solid var(--border-light);
}
.list-item:last-child {
  border-bottom: none;
}
.list-item:active {
  background-color: var(--bg-hover);
}
.list-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}
.list-label {
  flex: 1;
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: 500;
}
.list-arrow {
  font-size: 32rpx;
  color: var(--text-hint);
  font-family: consolas;
}

/* 危险操作区域 */
.danger-section {
  margin-top: 60rpx;
  padding: 0 32rpx;
}
.danger-btn {
  background: var(--bg-card);
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  box-shadow: var(--shadow-card);
  border: 1rpx solid #ffe5e5;
}
.dark-mode .danger-btn {
  border-color: #4a2e2e;
}
.danger-btn:active {
  background-color: #fff1f0;
}
.dark-mode .danger-btn:active {
  background-color: #2a1616;
}
.danger-icon {
  font-size: 36rpx;
}
.danger-label {
  font-size: 32rpx;
  color: #ff4d4f;
  font-weight: bold;
}
</style>
