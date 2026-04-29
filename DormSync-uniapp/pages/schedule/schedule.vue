<template>
  <view :class="['container', isDark ? 'dark-mode' : '']">
    <!-- 月份切换 -->
    <view class="month-nav">
      <text class="nav-arrow" @tap="changeMonth(-1)">◀</text>
      <text class="month-label"
        >{{ currentYear }}.{{ String(currentMonth + 1).padStart(2, "0") }}</text
      >
      <text class="nav-arrow" @tap="changeMonth(1)">▶</text>
    </view>

    <!-- 批量操作控制栏 -->
    <view class="batch-control-bar">
      <view class="batch-toggle" @tap="toggleBatchMode">
        <switch
          :checked="isBatchMode"
          color="#1677FF"
          style="transform: scale(0.7)"
        />
        <text class="batch-text">{{
          isBatchMode ? "退出批量操作" : "开启批量操作"
        }}</text>
      </view>

      <view v-if="isBatchMode && selectedDays.length > 0" class="batch-actions">
        <text class="batch-count">已选 {{ selectedDays.length }} 天</text>
        <button class="btn-batch btn-clear" @tap="batchClearDuty">
          批量清除
        </button>
        <button class="btn-batch btn-assign" @tap="batchDetailVisible = true">
          批量指派
        </button>
      </view>
    </view>

    <!-- 星期头 -->
    <view class="weekday-row">
      <text v-for="(w, i) in weekHeaders" :key="i" class="weekday-cell">{{
        w
      }}</text>
    </view>

    <!-- 日历格子 -->
    <view class="calendar-grid">
      <view
        v-for="(day, i) in calendarDays"
        :key="i"
        :class="[
          'day-cell',
          day.isToday ? 'today' : '',
          day.isOtherMonth ? 'other-month' : '',
          day.person ? 'has-duty' : '',
          day.isPreview ? 'preview-duty' : '',
          isBatchMode && isSelectedDay(day.dateStr) ? 'day-selected' : '',
        ]"
        @tap="day.dateStr && onDayTap(day)"
      >
        <view
          v-if="isBatchMode && isSelectedDay(day.dateStr)"
          class="selected-badge"
          >✓</view
        >
        <text class="day-num">{{ day.day || "" }}</text>
        <text
          v-if="day.person"
          :class="['day-person', day.isPreview ? 'preview-text' : '']"
          >{{ day.person }}</text
        >
      </view>
    </view>

    <!-- AI 排班区域 -->
    <view class="ai-section">
      <view class="ai-header">
        <text class="ai-title">🤖 {{ t("schedule.aiTitle") }}</text>
      </view>
      <view class="ai-input-row">
        <input
          class="ai-input"
          v-model="aiPrompt"
          :placeholder="t('schedule.aiPh')"
          @confirm="callAI"
        />
        <view class="ai-btn" @tap="callAI">
          <text class="ai-btn-text">{{
            aiLoading ? "..." : t("schedule.aiBtn")
          }}</text>
        </view>
      </view>
      <view class="ai-tips">
        <text class="ai-tip-title">{{ t("schedule.aiTipTitle") }}</text>
        <text class="ai-tip" @tap="aiPrompt = t('schedule.aiEx1')"
          >💡 {{ t("schedule.aiEx1") }}</text
        >
        <text class="ai-tip" @tap="aiPrompt = t('schedule.aiEx2')"
          >💡 {{ t("schedule.aiEx2") }}</text
        >
        <text class="ai-tip" @tap="aiPrompt = t('schedule.aiEx3')"
          >💡 {{ t("schedule.aiEx3") }}</text
        >
      </view>
    </view>

    <!-- AI 生成结果操作栏 -->
    <view v-if="aiResult.length > 0" class="ai-result">
      <view class="result-header">
        <text class="result-title"
          >📋 {{ t("schedule.aiResult") }}（{{ aiResult.length
          }}{{ t("schedule.days") }}）</text
        >
      </view>
      <text class="result-hint">{{ t("schedule.previewHint") }}</text>
      <view class="result-actions">
        <button class="btn-save" @tap="saveAIResult">
          {{ t("schedule.saveSchedule") }}
        </button>
        <text class="btn-cancel" @tap="aiResult = []">{{
          t("schedule.discard")
        }}</text>
      </view>
    </view>

    <!-- 当日详情弹窗 -->
    <view
      v-if="dayDetailVisible"
      class="modal-mask"
      @tap="dayDetailVisible = false"
    >
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title"
            >{{ selectedDay.dateStr }} {{ selectedDay.weekday }}</text
          >
          <text class="modal-close" @tap="dayDetailVisible = false">✕</text>
        </view>
        <view class="detail-info">
          <text v-if="selectedDay.person" class="detail-person"
            >🧹 {{ t("schedule.dutyPerson") }}：{{ selectedDay.person }}</text
          >
          <text v-else class="detail-empty">{{ t("schedule.noDuty") }}</text>
        </view>
        <view class="detail-divider"></view>
        <text class="detail-edit-title">{{ t("schedule.editDuty") }}</text>
        <view class="member-pick-list">
          <view
            v-for="m in members"
            :key="m._id"
            class="member-pick-item"
            @tap="assignDuty(selectedDay, m)"
          >
            <text>{{ m.nickname }}</text>
          </view>
          <view
            class="member-pick-item clear-item"
            @tap="clearDuty(selectedDay)"
          >
            <text>{{ t("schedule.clearDuty") }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 批量指派弹窗 -->
    <view
      v-if="batchDetailVisible"
      class="modal-mask"
      @tap="batchDetailVisible = false"
    >
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title"
            >批量指派值日 ({{ selectedDays.length }}天)</text
          >
          <text class="modal-close" @tap="batchDetailVisible = false">✕</text>
        </view>
        <text class="detail-edit-title">请选择要把这几天指派给谁：</text>
        <view class="member-pick-list">
          <view
            v-for="m in members"
            :key="m._id"
            class="member-pick-item"
            @tap="batchAssignDuty(m)"
          >
            <text>{{ m.nickname }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { get, post } from "@/utils/request";
import { t } from "@/utils/i18n";
import { isDark, applyNavBarTheme } from "@/utils/theme";
import { getLocalUserInfo } from "@/utils/auth";

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const scheduleItems = ref([]);
const members = ref([]);
const aiPrompt = ref("");
const aiLoading = ref(false);
const aiResult = ref([]);
const dayDetailVisible = ref(false);
const selectedDay = ref({});

// 批量操作相关状态
const isBatchMode = ref(false);
const selectedDays = ref([]);
const batchDetailVisible = ref(false);

const toggleBatchMode = () => {
  isBatchMode.value = !isBatchMode.value;
  selectedDays.value = [];
};

const isSelectedDay = (dateStr) => {
  return selectedDays.value.some((d) => d.dateStr === dateStr);
};

const onDayTap = (day) => {
  if (isBatchMode.value) {
    // 批量模式下：选中/取消选中该天
    const idx = selectedDays.value.findIndex((d) => d.dateStr === day.dateStr);
    if (idx >= 0) {
      selectedDays.value.splice(idx, 1);
    } else {
      selectedDays.value.push(day);
    }
  } else {
    // 单选模式下：打开详情弹窗
    selectedDay.value = day;
    dayDetailVisible.value = true;
  }
};

// 批量清除值班
const batchClearDuty = async () => {
  if (selectedDays.value.length === 0) return;
  const userInfo = getLocalUserInfo();
  if (!userInfo.dormId) return;

  const mergedMap = {};
  scheduleItems.value.forEach((item) => {
    if (item && item.date) {
      // 如果不在选中的要删除的列表里，才保留
      if (!isSelectedDay(item.date)) {
        mergedMap[item.date] = item;
      }
    }
  });

  const finalItems = Object.values(mergedMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // 核心修复：当把所有排班都删光时，给一个兜底的 weekLabel，允许提交空数组
  let weekLabel = "批量清除排班";
  if (finalItems.length > 0) {
    weekLabel = `${finalItems[0].date} ~ ${
      finalItems[finalItems.length - 1].date
    }`;
  }

  try {
    const res = await post("/api/schedule/create", {
      dormId: userInfo.dormId,
      weekLabel,
      cycle: "weekly",
      items: finalItems,
    });
    if (res.code === 200) {
      uni.showToast({
        title: `已清除 ${selectedDays.value.length} 天排班`,
        icon: "success",
      });
      selectedDays.value = [];
      isBatchMode.value = false; // 清除成功后自动退出批量模式
      fetchSchedule();
    }
  } catch (e) {
    console.error(e);
  }
};

// 批量指派值班
const batchAssignDuty = async (member) => {
  if (selectedDays.value.length === 0) return;
  const userInfo = getLocalUserInfo();
  if (!userInfo.dormId) return;

  const mergedMap = {};
  scheduleItems.value.forEach((item) => {
    if (item && item.date) mergedMap[item.date] = item;
  });

  // 把选中的天全部赋值给选中的人
  selectedDays.value.forEach((day) => {
    mergedMap[day.dateStr] = {
      date: day.dateStr,
      weekday: day.weekday,
      personName: member.nickname,
      personId: member._id,
    };
  });

  const finalItems = Object.values(mergedMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  let weekLabel = "批量指派排班";
  if (finalItems.length > 0) {
    weekLabel = `${finalItems[0].date} ~ ${
      finalItems[finalItems.length - 1].date
    }`;
  }

  try {
    const res = await post("/api/schedule/create", {
      dormId: userInfo.dormId,
      weekLabel,
      cycle: "weekly",
      items: finalItems,
    });
    if (res.code === 200) {
      uni.showToast({
        title: `成功指派 ${selectedDays.value.length} 天`,
        icon: "success",
      });
      selectedDays.value = [];
      batchDetailVisible.value = false;
      fetchSchedule();
    }
  } catch (e) {
    console.error(e);
  }
};

const weekHeaders = computed(() => [
  t("schedule.sun"),
  t("schedule.mon"),
  t("schedule.tue"),
  t("schedule.wed"),
  t("schedule.thu"),
  t("schedule.fri"),
  t("schedule.sat"),
]);

const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// 生成日历格子（合并已保存排班 + AI预览）
const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // AI 预览数据转 map
  const previewMap = {};
  aiResult.value.forEach((item) => {
    previewMap[item.date] = item.personName;
  });

  const cells = [];
  // 上月补位
  const prevDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      day: prevDays - i,
      isOtherMonth: true,
      dateStr: "",
      person: "",
    });
  }
  // 本月
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    const saved = scheduleItems.value.find((s) => s.date === dateStr);
    const previewName = previewMap[dateStr];
    cells.push({
      day: d,
      isOtherMonth: false,
      dateStr,
      isToday: dateStr === todayStr,
      person: previewName || (saved ? saved.personName : ""),
      isPreview: !!previewName && !saved,
      weekday: weekdayNames[new Date(year, month, d).getDay()],
    });
  }
  // 下月补位 (动态计算所需行数，移除多余空行)
  // 如果 cells 的数量正好是 7 的倍数，且大于等于 28，就不需要补位了
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const remain = 7 - remainder;
    for (let i = 1; i <= remain; i++) {
      cells.push({ day: i, isOtherMonth: true, dateStr: "", person: "" });
    }
  } else if (cells.length < 35 && cells.length !== 28) {
    // 极其罕见的情况：正好填满但不足5行（如2月），补齐到5行
    for (let i = 1; i <= 7; i++) {
      cells.push({ day: i, isOtherMonth: true, dateStr: "", person: "" });
    }
  }
  return cells;
});

const changeMonth = (delta) => {
  let m = currentMonth.value + delta;
  let y = currentYear.value;
  if (m < 0) {
    m = 11;
    y--;
  }
  if (m > 11) {
    m = 0;
    y++;
  }
  currentMonth.value = m;
  currentYear.value = y;
  fetchSchedule();
};

// 弹窗中选择某人值日
const assignDuty = async (day, member) => {
  // 核心修复：单点修改排班时，确保无论是否是预览状态，都最终合并并提交到后端
  const userInfo = getLocalUserInfo();
  if (!userInfo.dormId) return;

  // 1. 构建全量字典，并更新当前操作的那一天
  const mergedMap = {};
  scheduleItems.value.forEach((item) => {
    if (item && item.date) mergedMap[item.date] = item;
  });

  // 如果这一天本来在 AI 预览里，也把它拿出来合并
  const previewIdx = aiResult.value.findIndex((i) => i.date === day.dateStr);
  if (previewIdx >= 0) {
    aiResult.value.splice(previewIdx, 1);
  }

  mergedMap[day.dateStr] = {
    date: day.dateStr,
    weekday: day.weekday,
    personName: member.nickname,
    personId: member._id,
  };

  const finalItems = Object.values(mergedMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  let weekLabel = "手动排班更新";
  if (finalItems.length > 0) {
    weekLabel = `${finalItems[0].date} ~ ${
      finalItems[finalItems.length - 1].date
    }`;
  }

  try {
    const res = await post("/api/schedule/create", {
      dormId: userInfo.dormId,
      weekLabel,
      cycle: "weekly",
      items: finalItems,
    });
    if (res.code === 200) {
      uni.showToast({ title: "修改成功", icon: "success" });
      fetchSchedule(); // 重新拉取
    }
  } catch (e) {
    console.error(e);
  }

  dayDetailVisible.value = false;
};

// 清除某天的排班 (单选模式)
const clearDuty = async (day) => {
  // 如果当前是 AI 预览模式，且这天在预览里
  const previewIdx = aiResult.value.findIndex((i) => i.date === day.dateStr);
  if (previewIdx >= 0) {
    aiResult.value.splice(previewIdx, 1);
    dayDetailVisible.value = false;
    return; // 如果是清除 AI 预览的数据，直接返回，不要调接口
  }

  // 核心修复：清除已保存的排班（从字典里删掉那天）
  const userInfo = getLocalUserInfo();
  if (!userInfo.dormId) return;

  const mergedMap = {};
  scheduleItems.value.forEach((item) => {
    // 注意这里：只跳过你要删除的那一天，其他天都保留
    if (item && item.date && item.date !== day.dateStr) {
      mergedMap[item.date] = item;
    }
  });

  const finalItems = Object.values(mergedMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  let weekLabel = "手动清除排班";
  if (finalItems.length > 0) {
    weekLabel = `${finalItems[0].date} ~ ${
      finalItems[finalItems.length - 1].date
    }`;
  }

  try {
    // 强制先在本地删掉，让页面立马给出反馈
    scheduleItems.value = finalItems;

    const res = await post("/api/schedule/create", {
      dormId: userInfo.dormId,
      weekLabel,
      cycle: "weekly",
      items: finalItems,
    });
    if (res.code === 200) {
      uni.showToast({ title: "清除成功", icon: "success" });
      fetchSchedule(); // 同步最新数据
    } else {
      uni.showToast({ title: res.msg || "清除失败", icon: "none" });
      fetchSchedule(); // 如果后端失败了，把旧数据拉回来
    }
  } catch (e) {
    console.error(e);
    fetchSchedule();
  }

  dayDetailVisible.value = false;
};

const fetchMembers = async () => {
  const userInfo = getLocalUserInfo();
  if (!userInfo.dormId) return;
  try {
    const res = await get(`/api/dorm/members?dormId=${userInfo.dormId}`);
    if (res.code === 200) members.value = res.data || [];
  } catch (e) {
    console.error(e);
  }
};

const fetchSchedule = async () => {
  const userInfo = getLocalUserInfo();
  if (!userInfo.dormId) return;
  try {
    const res = await get(
      `/api/schedule/current?dormId=${userInfo.dormId}&_t=${Date.now()}`
    );
    const currentItems =
      res.code === 200 && res.data ? res.data.items || [] : [];

    // 因为后端现在是全量覆盖保存了，所以直接取 currentItems 即可，不需要再和历史合并了
    scheduleItems.value = currentItems;
  } catch (e) {
    console.error(e);
  }
};

const callAI = async () => {
  if (!aiPrompt.value.trim() || aiLoading.value) return;
  const userInfo = getLocalUserInfo();
  if (!userInfo.dormId) return;
  aiLoading.value = true;
  try {
    const startDate = `${currentYear.value}-${String(
      currentMonth.value + 1
    ).padStart(2, "0")}-01`;
    const daysInMonth = new Date(
      currentYear.value,
      currentMonth.value + 1,
      0
    ).getDate();
    const res = await post("/api/schedule/ai-generate", {
      dormId: userInfo.dormId,
      prompt: aiPrompt.value.trim(),
      startDate,
      days: daysInMonth,
    });
    if (res.code === 200 && res.data) {
      aiResult.value = res.data.items || [];
      uni.showToast({ title: t("schedule.aiSuccess"), icon: "success" });
    } else {
      uni.showToast({ title: res.msg || t("schedule.aiFail"), icon: "none" });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({ title: t("schedule.aiFail"), icon: "none" });
  } finally {
    aiLoading.value = false;
  }
};

const saveAIResult = async () => {
  const userInfo = getLocalUserInfo();
  if (!userInfo.dormId || aiResult.value.length === 0) return;

  // 核心修复：合并现有排班和新的 AI 排班（防止未涉及的数据被覆盖）
  // 1. 将现有的历史所有排班转为字典 (Map)
  const mergedMap = {};
  scheduleItems.value.forEach((item) => {
    if (item && item.date) {
      mergedMap[item.date] = item;
    }
  });

  // 2. 先根据当前月份找出所有在当月的日期
  const year = currentYear.value;
  const month = currentMonth.value;
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;

  // 3. AI操作主要是针对当前月，所以我们先把当前月里存在，但 AI 结果里不存在的数据删掉
  // 因为 AI 是返回全量需要排班的天数，如果AI结果没这天，说明被AI删了或这天没排班
  Object.keys(mergedMap).forEach((dateStr) => {
    if (dateStr.startsWith(monthPrefix)) {
      const inAi = aiResult.value.some((aiItem) => aiItem.date === dateStr);
      if (!inAi) {
        delete mergedMap[dateStr];
      }
    }
  });

  // 4. 将新的 AI 预览结果覆盖/新增进字典
  aiResult.value.forEach((item) => {
    if (item && item.date) {
      mergedMap[item.date] = item;
    }
  });

  // 3. 提取出合并后的全量数据
  const finalItems = Object.values(mergedMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // 为了符合后端 Schema，取最早和最晚的一天作为 label
  let weekLabel = "排班表";
  if (finalItems.length > 0) {
    weekLabel = `${finalItems[0].date} ~ ${
      finalItems[finalItems.length - 1].date
    }`;
  }

  try {
    const res = await post("/api/schedule/create", {
      dormId: userInfo.dormId,
      weekLabel,
      cycle: "weekly",
      items: finalItems, // 提交合并后的全量数据
    });
    if (res.code === 200) {
      uni.showToast({ title: t("schedule.saved"), icon: "success" });
      aiResult.value = [];
      aiPrompt.value = "";
      fetchSchedule(); // 重新拉取
    }
  } catch (e) {
    console.error(e);
  }
};

onShow(() => {
  applyNavBarTheme();
  uni.setNavigationBarTitle({ title: t("schedule.title") });
  fetchMembers().then(() => fetchSchedule());
});
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: var(--bg-page);
  padding: 24rpx;
}

/* 月份导航 */
.month-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40rpx;
  margin-bottom: 20rpx;
}
.nav-arrow {
  font-size: 32rpx;
  color: var(--color-primary);
  padding: 12rpx 20rpx;
}
.month-label {
  font-size: 34rpx;
  font-weight: bold;
  color: var(--text-primary);
}

/* 批量操作控制栏 */
.batch-control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  margin-bottom: 16rpx;
  border-bottom: 1rpx solid var(--border-light);
}
.batch-toggle {
  display: flex;
  align-items: center;
}
.batch-text {
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-left: 8rpx;
}
.batch-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.batch-count {
  font-size: 24rpx;
  color: var(--color-primary);
  font-weight: bold;
}
.btn-batch {
  margin: 0;
  padding: 0 20rpx;
  height: 56rpx;
  line-height: 56rpx;
  font-size: 24rpx;
  border-radius: 28rpx;
}
.btn-clear {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1rpx solid #ffa39e;
}
.btn-assign {
  background-color: #e6f4ff;
  color: #1677ff;
  border: 1rpx solid #91caff;
}

/* 选中状态 */
.day-cell {
  position: relative;
}
.day-selected {
  background-color: rgba(22, 119, 255, 0.1) !important;
  border-color: #1677ff !important;
}
.selected-badge {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 32rpx;
  height: 32rpx;
  background-color: #1677ff;
  color: #fff;
  border-radius: 50%;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 星期头 */
.weekday-row {
  display: flex;
}
.weekday-cell {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: var(--text-hint);
  padding: 12rpx 0;
}

/* 日历格子 */
.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}
.day-cell {
  width: 14.285%;
  box-sizing: border-box;
  min-height: 100rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 4rpx;
  border: 1rpx solid var(--border-light);
}
.day-cell.other-month {
  opacity: 0.3;
}
.day-cell.today {
  background-color: #e3f2fd;
}
.dark-mode .day-cell.today {
  background-color: #0d47a1;
}
.day-cell.has-duty {
  background-color: #f1f8e9;
}
.dark-mode .day-cell.has-duty {
  background-color: #1a2a1a;
}
.day-cell.preview-duty {
  background-color: #f1f8e9;
}
.dark-mode .day-cell.preview-duty {
  background-color: #1a2a1a;
}
.day-num {
  font-size: 24rpx;
  color: var(--text-primary);
}
.day-person {
  font-size: 18rpx;
  color: var(--color-primary);
  margin-top: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 90rpx;
}
.preview-text {
  color: var(--color-primary);
}

/* AI 区域 */
.ai-section {
  margin-top: 32rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
}
.ai-header {
  margin-bottom: 20rpx;
}
.ai-title {
  font-size: 30rpx;
  font-weight: bold;
  color: var(--text-primary);
}
.ai-input-row {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.ai-input {
  flex: 1;
  height: 72rpx;
  border: 1rpx solid var(--border-color);
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
  color: var(--text-primary);
  background: var(--bg-input);
}
.ai-btn {
  height: 72rpx;
  padding: 0 28rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
}
.ai-btn-text {
  color: #fff;
  font-size: 26rpx;
  white-space: nowrap;
}
.ai-tips {
  margin-top: 8rpx;
}
.ai-tip-title {
  font-size: 22rpx;
  color: var(--text-hint);
  display: block;
  margin-bottom: 8rpx;
}
.ai-tip {
  font-size: 24rpx;
  color: var(--color-primary);
  display: block;
  padding: 8rpx 0;
}

/* AI 结果 */
.ai-result {
  margin-top: 24rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid var(--color-primary);
}
.result-header {
  margin-bottom: 16rpx;
}
.result-title {
  font-size: 28rpx;
  font-weight: bold;
  color: var(--text-primary);
}
.result-hint {
  font-size: 24rpx;
  color: var(--text-hint);
  margin-bottom: 16rpx;
}
.result-item {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1rpx solid var(--border-light);
}
.result-item:last-child {
  border-bottom: none;
}
.result-date {
  font-size: 26rpx;
  color: var(--text-secondary);
}
.result-person {
  font-size: 26rpx;
  color: var(--color-primary);
  font-weight: bold;
}
.result-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-top: 20rpx;
}
.btn-save {
  flex: 1;
  height: 76rpx;
  line-height: 76rpx;
  background: var(--color-primary);
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}
.btn-save::after {
  border: none;
}
.btn-cancel {
  font-size: 26rpx;
  color: var(--text-hint);
  padding: 0 16rpx;
}

/* 弹窗 */
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
  width: 80%;
  background: var(--bg-card, #fff);
  border-radius: 20rpx;
  padding: 36rpx 32rpx;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
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
.detail-info {
  text-align: center;
  padding: 20rpx 0;
}
.detail-weekday {
  font-size: 28rpx;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 16rpx;
}
.detail-person {
  font-size: 32rpx;
  color: var(--color-primary);
  font-weight: bold;
}
.detail-empty {
  font-size: 28rpx;
  color: var(--text-placeholder);
}
.detail-divider {
  height: 1rpx;
  background: var(--border-light);
  margin: 20rpx 0;
}
.detail-edit-title {
  font-size: 26rpx;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 16rpx;
}
.member-pick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.member-pick-item {
  padding: 16rpx 28rpx;
  background: var(--bg-input);
  border-radius: 12rpx;
  font-size: 26rpx;
  color: var(--text-primary);
}
.member-pick-item:active {
  background: var(--color-primary);
  color: #fff;
}
.clear-item {
  color: #ff4d4f;
  background: #fff1f0;
}
.dark-mode .clear-item {
  background: #2a1010;
}
</style>
