<script setup>
/**
 * App.vue - 应用入口组件
 * - 全局生命周期管理
 * - 小程序首次打开时自动触发微信登录
 */
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { isLoggedIn } from "./utils/auth";
import { updateTabBar } from "./utils/i18n";
import { initTheme } from "./utils/theme";
import { connectWebSocket, closeWebSocket } from "./utils/websocket";

onLaunch((options) => {
  console.log("App Launch - 宿舍协同管理小程序启动", options);
  updateTabBar();
  initTheme();

  // 捕获分享卡片带来的宿舍号参数
  if (options && options.query && options.query.dormNumber) {
    const dormNumber = decodeURIComponent(options.query.dormNumber);
    console.log("从分享卡片获取宿舍号:", dormNumber);
    uni.setStorageSync("inviteDormNumber", dormNumber);
  }

  if (isLoggedIn()) {
    const userInfo = uni.getStorageSync("userInfo") || {};
    const userId = uni.getStorageSync("userId");
    const inviteDorm = uni.getStorageSync("inviteDormNumber");

    if (userId) {
      // 启动 WebSocket 实时推送监听
      connectWebSocket(userId);
    }

    if (inviteDorm && !userInfo.dormId) {
      // 已登录但没宿舍，且有邀请参数 → 跳到加入宿舍页
      uni.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
    } else {
      uni.switchTab({ url: "/pages/index/index" });
    }
  }
  // 未登录时停留在登录页（pages.json 第一个页面就是 login）
});

onShow(() => {
  console.log("App Show - 小程序进入前台");
  // 从后台切回前台时，尝试恢复 WebSocket 连接
  if (isLoggedIn()) {
    const userId = uni.getStorageSync("userId");
    if (userId) connectWebSocket(userId);
  }
});

onHide(() => {
  console.log("App Hide - 小程序进入后台");
  // 节省资源，小程序进入后台时可以断开连接
  // closeWebSocket()
});
</script>

<style>
/* ========== CSS 变量（亮色主题） ========== */
page {
  --bg-page: #f5f5f5;
  --bg-card: #ffffff;
  --bg-input: #fafafa;
  --bg-hover: #f9f9f9;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-placeholder: #bbbbbb;
  --text-hint: #999999;
  --border-color: #eeeeee;
  --border-light: #f5f5f5;
  --shadow-card: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  --color-primary: #1677ff;

  background-color: var(--bg-page);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 28rpx;
  color: var(--text-primary);
  box-sizing: border-box;
}

/* ========== 夜间模式覆盖 ========== */
.dark-mode {
  --bg-page: #121212;
  --bg-card: #1e1e1e;
  --bg-input: #2a2a2a;
  --bg-hover: #2c2c2c;
  --text-primary: #e0e0e0;
  --text-secondary: #aaaaaa;
  --text-placeholder: #666666;
  --text-hint: #888888;
  --border-color: #333333;
  --border-light: #2a2a2a;
  --shadow-card: 0 2rpx 12rpx rgba(0, 0, 0, 0.3);
  --color-primary: #5b9bf5;
}
.dark-mode {
  background-color: var(--bg-page);
  color: var(--text-primary);
  min-height: 100vh;
}

/* ========== 全局样式 ========== */

.container {
  padding: 24rpx;
}

.card {
  background-color: var(--bg-card);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--shadow-card);
}

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
}

.input {
  border: 1rpx solid var(--border-color);
  border-radius: 8rpx;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  background-color: var(--bg-input);
  color: var(--text-primary);
}
</style>
