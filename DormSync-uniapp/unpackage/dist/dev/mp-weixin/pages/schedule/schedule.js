"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "schedule",
  setup(__props) {
    const currentYear = common_vendor.ref((/* @__PURE__ */ new Date()).getFullYear());
    const currentMonth = common_vendor.ref((/* @__PURE__ */ new Date()).getMonth());
    const scheduleItems = common_vendor.ref([]);
    const members = common_vendor.ref([]);
    const aiPrompt = common_vendor.ref("");
    const aiLoading = common_vendor.ref(false);
    const aiResult = common_vendor.ref([]);
    const dayDetailVisible = common_vendor.ref(false);
    const selectedDay = common_vendor.ref({});
    const weekHeaders = common_vendor.computed(() => [
      utils_i18n.t("schedule.sun"),
      utils_i18n.t("schedule.mon"),
      utils_i18n.t("schedule.tue"),
      utils_i18n.t("schedule.wed"),
      utils_i18n.t("schedule.thu"),
      utils_i18n.t("schedule.fri"),
      utils_i18n.t("schedule.sat")
    ]);
    const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const calendarDays = common_vendor.computed(() => {
      const year = currentYear.value;
      const month = currentMonth.value;
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today = /* @__PURE__ */ new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const previewMap = {};
      aiResult.value.forEach((item) => {
        previewMap[item.date] = item.personName;
      });
      const cells = [];
      const prevDays = new Date(year, month, 0).getDate();
      for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: prevDays - i, isOtherMonth: true, dateStr: "", person: "" });
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const saved = scheduleItems.value.find((s) => s.date === dateStr);
        const previewName = previewMap[dateStr];
        cells.push({
          day: d,
          isOtherMonth: false,
          dateStr,
          isToday: dateStr === todayStr,
          person: previewName || (saved ? saved.personName : ""),
          isPreview: !!previewName && !saved,
          weekday: weekdayNames[new Date(year, month, d).getDay()]
        });
      }
      const remain = 42 - cells.length;
      for (let i = 1; i <= remain; i++) {
        cells.push({ day: i, isOtherMonth: true, dateStr: "", person: "" });
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
    const onDayTap = (day) => {
      selectedDay.value = day;
      dayDetailVisible.value = true;
    };
    const assignDuty = (day, member) => {
      const previewIdx = aiResult.value.findIndex((i) => i.date === day.dateStr);
      if (previewIdx >= 0) {
        aiResult.value[previewIdx].personName = member.nickname;
        aiResult.value[previewIdx].personId = member._id;
      } else if (aiResult.value.length > 0) {
        aiResult.value.push({ date: day.dateStr, weekday: day.weekday, personName: member.nickname, personId: member._id });
      } else {
        const idx = scheduleItems.value.findIndex((i) => i.date === day.dateStr);
        if (idx >= 0) {
          scheduleItems.value[idx].personName = member.nickname;
          scheduleItems.value[idx].personId = member._id;
        } else {
          scheduleItems.value.push({ date: day.dateStr, weekday: day.weekday, personName: member.nickname, personId: member._id });
        }
      }
      dayDetailVisible.value = false;
    };
    const clearDuty = (day) => {
      const previewIdx = aiResult.value.findIndex((i) => i.date === day.dateStr);
      if (previewIdx >= 0) {
        aiResult.value.splice(previewIdx, 1);
      } else {
        const idx = scheduleItems.value.findIndex((i) => i.date === day.dateStr);
        if (idx >= 0)
          scheduleItems.value.splice(idx, 1);
      }
      dayDetailVisible.value = false;
    };
    const fetchMembers = async () => {
      const userInfo = utils_auth.getLocalUserInfo();
      if (!userInfo.dormId)
        return;
      try {
        const res = await utils_request.get(`/api/dorm/members?dormId=${userInfo.dormId}`);
        if (res.code === 200)
          members.value = res.data || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/schedule/schedule.vue:203", e);
      }
    };
    const fetchSchedule = async () => {
      const userInfo = utils_auth.getLocalUserInfo();
      if (!userInfo.dormId)
        return;
      try {
        const res = await utils_request.get(`/api/schedule/current?dormId=${userInfo.dormId}`);
        const currentItems = res.code === 200 && res.data ? res.data.items || [] : [];
        const hRes = await utils_request.get(`/api/schedule/history?dormId=${userInfo.dormId}`);
        const historyItems = [];
        if (hRes.code === 200 && hRes.data) {
          hRes.data.forEach((h) => {
            if (h.items)
              historyItems.push(...h.items);
          });
        }
        const map = {};
        historyItems.forEach((item) => {
          map[item.date] = item;
        });
        currentItems.forEach((item) => {
          map[item.date] = item;
        });
        scheduleItems.value = Object.values(map);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/schedule/schedule.vue:225", e);
      }
    };
    const callAI = async () => {
      if (!aiPrompt.value.trim() || aiLoading.value)
        return;
      const userInfo = utils_auth.getLocalUserInfo();
      if (!userInfo.dormId)
        return;
      aiLoading.value = true;
      try {
        const startDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, "0")}-01`;
        const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();
        const res = await utils_request.post("/api/schedule/ai-generate", {
          dormId: userInfo.dormId,
          prompt: aiPrompt.value.trim(),
          startDate,
          days: daysInMonth
        });
        if (res.code === 200 && res.data) {
          aiResult.value = res.data.items || [];
          common_vendor.index.showToast({ title: utils_i18n.t("schedule.aiSuccess"), icon: "success" });
        } else {
          common_vendor.index.showToast({ title: res.msg || utils_i18n.t("schedule.aiFail"), icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/schedule/schedule.vue:249", e);
        common_vendor.index.showToast({ title: utils_i18n.t("schedule.aiFail"), icon: "none" });
      } finally {
        aiLoading.value = false;
      }
    };
    const saveAIResult = async () => {
      const userInfo = utils_auth.getLocalUserInfo();
      if (!userInfo.dormId || aiResult.value.length === 0)
        return;
      const items = aiResult.value;
      const weekLabel = `${items[0].date} ~ ${items[items.length - 1].date}`;
      try {
        const res = await utils_request.post("/api/schedule/create", {
          dormId: userInfo.dormId,
          weekLabel,
          cycle: "weekly",
          items
        });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: utils_i18n.t("schedule.saved"), icon: "success" });
          aiResult.value = [];
          aiPrompt.value = "";
          fetchSchedule();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/schedule/schedule.vue:269", e);
      }
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("schedule.title") });
      fetchMembers().then(() => fetchSchedule());
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => changeMonth(-1)),
        b: common_vendor.t(currentYear.value),
        c: common_vendor.t(String(currentMonth.value + 1).padStart(2, "0")),
        d: common_vendor.o(($event) => changeMonth(1)),
        e: common_vendor.f(weekHeaders.value, (w, i, i0) => {
          return {
            a: common_vendor.t(w),
            b: i
          };
        }),
        f: common_vendor.f(calendarDays.value, (day, i, i0) => {
          return common_vendor.e({
            a: common_vendor.t(day.day || ""),
            b: day.person
          }, day.person ? {
            c: common_vendor.t(day.person),
            d: common_vendor.n(day.isPreview ? "preview-text" : "")
          } : {}, {
            e: i,
            f: common_vendor.n(day.isToday ? "today" : ""),
            g: common_vendor.n(day.isOtherMonth ? "other-month" : ""),
            h: common_vendor.n(day.person ? "has-duty" : ""),
            i: common_vendor.n(day.isPreview ? "preview-duty" : ""),
            j: common_vendor.o(($event) => day.dateStr && onDayTap(day), i)
          });
        }),
        g: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.aiTitle")),
        h: common_vendor.unref(utils_i18n.t)("schedule.aiPh"),
        i: common_vendor.o(callAI),
        j: aiPrompt.value,
        k: common_vendor.o(($event) => aiPrompt.value = $event.detail.value),
        l: common_vendor.t(aiLoading.value ? "..." : common_vendor.unref(utils_i18n.t)("schedule.aiBtn")),
        m: common_vendor.o(callAI),
        n: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.aiTipTitle")),
        o: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.aiEx1")),
        p: common_vendor.o(($event) => aiPrompt.value = common_vendor.unref(utils_i18n.t)("schedule.aiEx1")),
        q: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.aiEx2")),
        r: common_vendor.o(($event) => aiPrompt.value = common_vendor.unref(utils_i18n.t)("schedule.aiEx2")),
        s: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.aiEx3")),
        t: common_vendor.o(($event) => aiPrompt.value = common_vendor.unref(utils_i18n.t)("schedule.aiEx3")),
        v: aiResult.value.length > 0
      }, aiResult.value.length > 0 ? {
        w: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.aiResult")),
        x: common_vendor.t(aiResult.value.length),
        y: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.days")),
        z: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.previewHint")),
        A: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.saveSchedule")),
        B: common_vendor.o(saveAIResult),
        C: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.discard")),
        D: common_vendor.o(($event) => aiResult.value = [])
      } : {}, {
        E: dayDetailVisible.value
      }, dayDetailVisible.value ? common_vendor.e({
        F: common_vendor.t(selectedDay.value.dateStr),
        G: common_vendor.t(selectedDay.value.weekday),
        H: common_vendor.o(($event) => dayDetailVisible.value = false),
        I: selectedDay.value.person
      }, selectedDay.value.person ? {
        J: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.dutyPerson")),
        K: common_vendor.t(selectedDay.value.person)
      } : {
        L: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.noDuty"))
      }, {
        M: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.editDuty")),
        N: common_vendor.f(members.value, (m, k0, i0) => {
          return {
            a: common_vendor.t(m.nickname),
            b: m._id,
            c: common_vendor.o(($event) => assignDuty(selectedDay.value, m), m._id)
          };
        }),
        O: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.clearDuty")),
        P: common_vendor.o(($event) => clearDuty(selectedDay.value)),
        Q: common_vendor.o(() => {
        }),
        R: common_vendor.o(($event) => dayDetailVisible.value = false)
      }) : {}, {
        S: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e6e5e79f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/schedule/schedule.js.map
