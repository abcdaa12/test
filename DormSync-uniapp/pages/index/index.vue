<template>
  <view :class="['page', isDark ? 'dark-mode' : '']">
    <scroll-view
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      style="height: 100vh"
    >
      <view class="container">
        <view class="dorm-banner">
          <text class="dorm-number">🏠 {{ dormNo }} {{ t("home.dorm") }}</text>
        </view>

        <view class="welcome-section">
          <text class="welcome-text"
            >{{ nickname }}，{{ t("home.hello") }}！✨</text
          >
        </view>

        <!-- 快捷入口卡片 -->
        <view class="quick-actions">
          <view class="action-card" @tap="goTo('/pages/fee/fee')">
            <text class="action-icon">💰</text>
            <text class="action-label">{{ t("home.fee") }}</text>
          </view>
          <view class="action-card" @tap="goTo('/pages/vote/vote')">
            <text class="action-icon">🗳️</text>
            <text class="action-label">{{ t("home.vote") }}</text>
          </view>
          <view class="action-card" @tap="goTo('/pages/schedule/schedule')">
            <text class="action-icon">📅</text>
            <text class="action-label">{{ t("home.schedule") }}</text>
          </view>
          <view class="action-card" @tap="goTo('/pages/members/members')">
            <text class="action-icon">👥</text>
            <text class="action-label">{{ t("home.members") }}</text>
          </view>
        </view>

        <view class="notice-card" @tap="goTo('/pages/announce/announce')">
          <view class="section-header">
            <text class="section-title">📢 {{ t("home.notice") }}</text>
          </view>
          <view class="notice-content">
            <!-- 跑马灯效果：垂直轮播展示最新的 3 条公告 -->
            <swiper
              v-if="announcements.length > 0"
              class="notice-swiper"
              vertical
              autoplay
              circular
              :interval="3000"
              :duration="500"
              disable-touch
            >
              <swiper-item
                v-for="(item, index) in announcements"
                :key="index"
                class="notice-swiper-item"
              >
                <text class="notice-text">{{ item.title }}</text>
              </swiper-item>
            </swiper>
            <text v-else class="notice-text">{{ t("home.noNotice") }}</text>
          </view>
        </view>

        <view class="todo-card">
          <view class="section-header">
            <text class="section-title">📋 {{ t("home.todo") }}</text>
            <text class="add-todo-btn" @tap="showAddTodo = !showAddTodo"
              >+ {{ t("home.addTodo") }}</text
            >
          </view>

          <!-- 添加待办表单 -->
          <view v-if="showAddTodo" class="add-todo-form">
            <input
              class="todo-input"
              v-model="newTodoText"
              :placeholder="t('home.todoPh')"
              @confirm="addTodo"
            />
            <view class="todo-submit-btn" @tap="addTodo">
              <text class="todo-submit-text">{{ t("home.todoAdd") }}</text>
            </view>
          </view>

          <view v-if="todoList.length > 0" class="todo-list">
            <scroll-view scroll-y class="todo-scroll-area">
              <view
                v-for="(item, index) in todoList"
                :key="item._id || index"
                class="todo-item"
              >
                <view class="todo-left">
                  <text class="todo-dot">•</text>
                  <text class="todo-text">{{ item.content }}</text>
                </view>
                <text class="todo-del" @tap="deleteTodo(item)">✕</text>
              </view>
            </scroll-view>
          </view>
          <view v-else class="todo-empty">
            <text>{{ t("home.noTodo") }}🎉</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow, onShareAppMessage } from "@dcloudio/uni-app";
import { get, post, del } from "../../utils/request.js";
import { isLoggedIn, getLocalUserInfo } from "../../utils/auth.js";
import { t } from "../../utils/i18n.js";
import { isDark, applyNavBarTheme } from "../../utils/theme.js";

const dormNo = ref("");
const nickname = ref("");
const announcements = ref([]); // 改为数组，用于存储多条公告
const todoList = ref([]);
const refreshing = ref(false);
const showAddTodo = ref(false);
const newTodoText = ref("");

const goTo = (url) => uni.navigateTo({ url });

onShareAppMessage(() => {
  return {
    title: `${t("invite.shareCardTitle")} ${dormNo.value}`,
    path: `/pages/login/login?dormNumber=${encodeURIComponent(dormNo.value)}`,
    imageUrl: "/static/logo.png",
  };
});

const fetchTodoList = async () => {
  try {
    const userId = uni.getStorageSync("userId");
    const url = userId ? `/api/todo/list?userId=${userId}` : "/api/todo/list";
    const res = await get(url);
    if (res.code === 200) todoList.value = res.data || [];
  } catch (e) {
    console.error("获取待办列表失败", e);
  }
};

const addTodo = async () => {
  const text = newTodoText.value.trim();
  if (!text) return;
  try {
    const res = await post("/api/todo/create", { content: text });
    if (res.code === 200) {
      newTodoText.value = "";
      showAddTodo.value = false;
      fetchTodoList();
    }
  } catch (e) {
    console.error("创建待办失败", e);
  }
};

const deleteTodo = async (item) => {
  try {
    const res = await del("/api/todo/delete", { todoId: item._id });
    if (res.code === 200) fetchTodoList();
  } catch (e) {
    console.error(e);
  }
};

const fetchDormInfo = async () => {
  try {
    const userInfo = getLocalUserInfo();
    if (!userInfo.dormId) return;
    const res = await get(`/api/dorm/info?dormId=${userInfo.dormId}`);
    if (res.code === 200 && res.data) {
      dormNo.value = res.data.dormNumber || "";
    }
    // 获取最新 3 条公告，用于跑马灯展示
    const aRes = await get(
      `/api/announce/list?dormId=${userInfo.dormId}&limit=3`
    );
    if (aRes.code === 200 && aRes.data) {
      announcements.value = aRes.data;
    } else {
      announcements.value = [];
    }
  } catch (e) {
    console.error("获取宿舍信息失败", e);
  }
};

const fetchUnreadCount = async () => {
  try {
    const userId = uni.getStorageSync("userId");
    if (!userId) return;
    const res = await get(`/api/message/unread-count?userId=${userId}`);
    if (res.code === 200 && res.data) {
      const count = res.data.count || 0;
      if (count > 0) {
        uni.setTabBarBadge({
          index: 1,
          text: String(count > 99 ? "99+" : count),
        });
      } else {
        uni.removeTabBarBadge({ index: 1 });
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const onRefresh = async () => {
  refreshing.value = true;
  await Promise.all([fetchDormInfo(), fetchTodoList(), fetchUnreadCount()]);
  refreshing.value = false;
};

onShow(() => {
  applyNavBarTheme();
  if (!isLoggedIn()) {
    uni.redirectTo({ url: "/pages/login/login" });
    return;
  }
  const userInfo = getLocalUserInfo();
  nickname.value = userInfo.nickname || t("mine.defaultSign");
  if (!userInfo.dormId) {
    uni.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
    return;
  }
  uni.setNavigationBarTitle({
    title: `${dormNo.value || ""} - ${t("home.title")}`,
  });
  fetchDormInfo();
  fetchTodoList();
  fetchUnreadCount();
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
.dorm-banner {
  background-color: #e6f7ff;
  border-radius: 10px;
  padding: 20rpx 30rpx;
  margin-bottom: 24rpx;
}
.dark-mode .dorm-banner {
  background-color: #1a2a3a;
}
.dorm-number {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--color-primary);
}
.welcome-section {
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}
.welcome-text {
  font-size: 30rpx;
  color: var(--text-primary);
}

/* 快捷入口 */
.quick-actions {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}
.action-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--bg-card);
  border-radius: 16rpx;
  padding: 24rpx 0;
  border: 1rpx solid var(--border-color);
}
.action-card:active {
  background-color: var(--bg-hover);
}
.action-icon {
  font-size: 44rpx;
  margin-bottom: 8rpx;
}
.action-label {
  font-size: 24rpx;
  color: var(--text-primary);
}

/* 公告卡片 */
.notice-card {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--shadow-card);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: var(--text-primary);
}
.notice-content {
  margin-top: 12rpx;
  background: #fff5f5;
  padding: 20rpx;
  border-radius: 12rpx;
  border-left: 6rpx solid #ff4d4f;
  height: 80rpx;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.dark-mode .notice-content {
  background: #2a1e1e;
  border-left-color: #d32f2f;
}
.notice-swiper {
  width: 100%;
  height: 100%;
}
.notice-swiper-item {
  display: flex;
  align-items: center;
}
.notice-text {
  font-size: 28rpx;
  color: #ff4d4f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.dark-mode .notice-text {
  color: #ff8a80;
}
.todo-card {
  background-color: var(--bg-card);
  border: 1rpx solid var(--border-color);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

/* 添加待办 */
.add-todo-btn {
  font-size: 26rpx;
  color: var(--color-primary);
}
.add-todo-form {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.todo-input {
  flex: 1;
  height: 64rpx;
  border: 1rpx solid var(--border-color);
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  color: var(--text-primary);
  background-color: var(--bg-input);
}
.todo-submit-btn {
  background-color: var(--color-primary);
  border-radius: 8rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
}
.todo-submit-text {
  color: #fff;
  font-size: 26rpx;
}

.todo-list {
  margin-top: 12rpx;
}
.todo-scroll-area {
  max-height: 400rpx; /* 限制待办列表最大高度，超出部分内部滚动 */
}
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 0;
  border-bottom: 1rpx solid var(--border-light);
}
.todo-item:last-child {
  border-bottom: none;
}
.todo-left {
  display: flex;
  align-items: center;
  flex: 1;
}
.todo-dot {
  font-size: 32rpx;
  margin-right: 12rpx;
  color: var(--color-primary);
}
.todo-text {
  font-size: 28rpx;
  color: var(--text-primary);
  flex: 1;
}
.todo-del {
  font-size: 28rpx;
  color: #ff4d4f;
  padding: 8rpx 16rpx;
}
.todo-empty {
  text-align: center;
  padding: 40rpx 0;
  color: var(--text-hint);
  font-size: 28rpx;
}
</style>
