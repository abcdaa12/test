<template>
  <view :class="['page', isDark ? 'dark-mode' : '']">
    <view class="container">
      <view class="section-title"
        >{{ t("members.title") }} ({{ memberList.length }})</view
      >

      <view
        v-for="(m, i) in memberList"
        :key="m._id || i"
        class="card member-item"
        @tap="showMemberDetail(m)"
      >
        <view class="member-info">
          <image
            v-if="m.avatar"
            class="member-avatar"
            :src="m.avatar"
            mode="aspectFill"
          />
          <view v-else class="member-avatar-placeholder">{{
            (m.nickname || "?")[0]
          }}</view>
          <view class="member-detail">
            <text class="member-name">{{
              m.nickname || t("mine.defaultSign")
            }}</text>
            <text class="member-role">{{
              m.role === "leader"
                ? "🏆 " + t("members.leader")
                : t("members.member")
            }}</text>
          </view>
        </view>
        <text class="view-detail-hint">查看 ></text>
      </view>
    </view>

    <!-- 成员详情弹窗 -->
    <view v-if="detailVisible" class="modal-mask" @tap="detailVisible = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">成员信息</text>
          <text class="modal-close" @tap="detailVisible = false">✕</text>
        </view>

        <view class="detail-avatar-wrap">
          <image
            v-if="currentMember.avatar"
            class="detail-avatar"
            :src="currentMember.avatar"
            mode="aspectFill"
          />
          <view v-else class="detail-avatar-placeholder">{{
            (currentMember.nickname || "?")[0]
          }}</view>
        </view>

        <view class="detail-row">
          <text class="detail-label">昵称</text>
          <text class="detail-value">{{
            currentMember.nickname || "未填写"
          }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">角色</text>
          <text class="detail-value">{{
            currentMember.role === "leader" ? "🏆 宿舍长" : "👤 普通成员"
          }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">电话</text>
          <text class="detail-value" @tap="makePhoneCall(currentMember.phone)">
            {{ currentMember.phone || "未填写" }}
            <text v-if="currentMember.phone" class="phone-icon">📞</text>
          </text>
        </view>
        <view class="detail-row">
          <text class="detail-label">班级</text>
          <text class="detail-value">{{
            currentMember.class || "未填写"
          }}</text>
        </view>
        <view class="detail-row signature-row">
          <text class="detail-label">个性签名</text>
          <text class="detail-value signature-text">{{
            currentMember.signature || "这个人很懒，什么都没写~"
          }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { get } from "@/utils/request";
import { t } from "@/utils/i18n";
import { isDark, applyNavBarTheme } from "@/utils/theme";
import { getLocalUserInfo } from "@/utils/auth";

const memberList = ref([]);
const detailVisible = ref(false);
const currentMember = ref({});

const showMemberDetail = (member) => {
  currentMember.value = member;
  detailVisible.value = true;
};

const makePhoneCall = (phone) => {
  if (!phone) return;
  uni.makePhoneCall({
    phoneNumber: phone,
  });
};

const fetchMembers = async () => {
  try {
    const userInfo = getLocalUserInfo();
    if (!userInfo.dormId) return;
    const res = await get(`/api/dorm/members?dormId=${userInfo.dormId}`);
    if (res.code === 200) memberList.value = res.data || [];
  } catch (e) {
    console.error("获取成员失败", e);
  }
};

onShow(() => {
  applyNavBarTheme();
  uni.setNavigationBarTitle({ title: t("members.title") });
  fetchMembers();
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
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 24rpx;
  color: var(--text-primary);
}
.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  background: var(--bg-card);
  box-shadow: var(--shadow-card);
}
.member-item:active {
  background: var(--bg-hover);
}
.member-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.member-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
}
.member-avatar-placeholder {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1677ff, #4a9fff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  font-weight: bold;
}
.member-detail {
  display: flex;
  flex-direction: column;
}
.member-name {
  font-size: 32rpx;
  color: var(--text-primary);
  font-weight: bold;
  margin-bottom: 8rpx;
}
.member-role {
  font-size: 24rpx;
  color: var(--text-hint);
}
.view-detail-hint {
  font-size: 26rpx;
  color: var(--color-primary);
  font-family: consolas;
  opacity: 0.8;
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background-color: var(--bg-card);
  width: 85%;
  border-radius: 24rpx;
  padding: 40rpx 40rpx 60rpx;
  position: relative;
}
.modal-header {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}
.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: var(--text-primary);
}
.modal-close {
  position: absolute;
  right: 30rpx;
  top: 30rpx;
  font-size: 40rpx;
  color: var(--text-hint);
  padding: 10rpx;
}

.detail-avatar-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}
.detail-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}
.detail-avatar-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #1677ff, #4a9fff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 72rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 16rpx rgba(22, 119, 255, 0.3);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--border-light);
}
.signature-row {
  flex-direction: column;
  align-items: flex-start;
  border-bottom: none;
  padding-top: 32rpx;
}
.detail-label {
  font-size: 28rpx;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.detail-value {
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
}
.phone-icon {
  margin-left: 12rpx;
  font-size: 28rpx;
  color: var(--color-primary);
}
.signature-text {
  margin-top: 16rpx;
  text-align: left;
  background: var(--bg-input);
  padding: 20rpx;
  border-radius: 12rpx;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;
  color: var(--text-secondary);
}
</style>
