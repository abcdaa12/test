<template>
  <view :class="['login-page', isDark ? 'dark-mode' : '']">
    <view class="login-content">
      <view class="logo-section">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-name">DormSync</text>
        <text class="app-desc">{{ t("login.appDesc") }}</text>
      </view>

      <view class="login-section">
        <button class="login-btn" :loading="loading" @click="handleLogin">
          {{ t("login.btn") }}
        </button>
        <text class="login-tip">{{ t("login.agreement") }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
import { wxLogin, isLoggedIn } from "../../utils/auth";
import { t } from "../../utils/i18n";
import { isDark } from "../../utils/theme.js";
import { connectWebSocket } from "../../utils/websocket";

const loading = ref(false);

// 页面加载时捕获分享卡片带来的参数
onLoad((options) => {
  if (options && options.dormNumber) {
    const dormNumber = decodeURIComponent(options.dormNumber);
    console.log("登录页收到邀请宿舍号:", dormNumber);
    uni.setStorageSync("inviteDormNumber", dormNumber);
  }
});

// 每次显示页面时检查登录态
onShow(() => {
  if (isLoggedIn()) {
    const userInfo = uni.getStorageSync("userInfo") || {};
    const inviteDorm = uni.getStorageSync("inviteDormNumber");
    if (inviteDorm && !userInfo.dormId) {
      // 已登录但没宿舍，有邀请参数 → 跳到加入宿舍页
      uni.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
    } else {
      uni.removeStorageSync("inviteDormNumber");
      goHome();
    }
  }
});

/**
 * 跳转到首页（switchTab）
 */
const goHome = () => {
  uni.switchTab({ url: "/pages/index/index" });
};

/**
 * 点击登录
 */
const handleLogin = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const userInfo = await wxLogin();

    // 登录成功后，主动建立 WebSocket 连接
    const userId = uni.getStorageSync("userId");
    if (userId) connectWebSocket(userId);

    uni.showToast({ title: t("login.success"), icon: "success" });
    setTimeout(() => {
      if (!userInfo.nickname || userInfo.nickname === "宿舍成员") {
        uni.redirectTo({ url: "/pages/profile-edit/profile-edit?first=1" });
      } else if (!userInfo.dormId) {
        // 没有宿舍 → 跳到宿舍设置页（如果有邀请参数会自动预填）
        uni.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
      } else {
        // 已有宿舍，清除可能残留的邀请参数
        uni.removeStorageSync("inviteDormNumber");
        goHome();
      }
    }, 500);
  } catch (e) {
    console.error("登录失败", e);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1677ff 0%, #4a9fff 50%, #f5f5f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 60rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
  border-radius: 32rpx;
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
}

.app-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #fff;
  color: #1677ff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 44rpx;
  border: none;
  text-align: center;
}

.login-btn::after {
  border: none;
}

.login-tip {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 30rpx;
}

/* 夜间模式 */
.dark-mode.login-page {
  background: linear-gradient(180deg, #0d47a1 0%, #1a237e 50%, #121212 100%);
}
.dark-mode .login-btn {
  background-color: #1e1e1e;
  color: #5b9bf5;
}
.dark-mode .login-tip {
  color: rgba(255, 255, 255, 0.4);
}
</style>
