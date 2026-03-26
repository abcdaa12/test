"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "schedule",
  setup(__props) {
    const members = common_vendor.ref(["张三", "李四", "王五", "赵六"]);
    const cycleOptions = common_vendor.computed(() => [utils_i18n.t("schedule.weekly"), utils_i18n.t("schedule.daily")]);
    const cycleIndex = common_vendor.ref(0);
    const scheduleList = common_vendor.ref([]);
    const historyList = common_vendor.ref([]);
    const weekdayMap = common_vendor.computed(() => [
      utils_i18n.t("schedule.sun"),
      utils_i18n.t("schedule.mon"),
      utils_i18n.t("schedule.tue"),
      utils_i18n.t("schedule.wed"),
      utils_i18n.t("schedule.thu"),
      utils_i18n.t("schedule.fri"),
      utils_i18n.t("schedule.sat")
    ]);
    const currentWeekLabel = common_vendor.computed(() => {
      const now = /* @__PURE__ */ new Date();
      const monday = new Date(now);
      const day = now.getDay() || 7;
      monday.setDate(now.getDate() - day + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return `${formatDate(monday)} ~ ${formatDate(sunday)}`;
    });
    const formatDate = (date) => {
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${m}-${d}`;
    };
    const formatFullDate = (date) => {
      const y = date.getFullYear();
      return `${y}-${formatDate(date)}`;
    };
    const onCycleChange = (e) => {
      cycleIndex.value = Number(e.detail.value);
    };
    const generateSchedule = () => {
      const now = /* @__PURE__ */ new Date();
      const day = now.getDay() || 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - day + 1);
      const list = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        list.push({
          date: formatFullDate(d),
          weekday: weekdayMap.value[d.getDay()],
          person: members.value[i % members.value.length]
        });
      }
      if (scheduleList.value.length > 0) {
        historyList.value.unshift({
          label: currentWeekLabel.value,
          items: [...scheduleList.value]
        });
      }
      scheduleList.value = list;
      common_vendor.index.showToast({ title: utils_i18n.t("schedule.generated"), icon: "success" });
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("schedule.title") });
    });
    common_vendor.onMounted(async () => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.setting")),
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.cycle")),
        c: common_vendor.t(cycleOptions.value[cycleIndex.value]),
        d: cycleOptions.value,
        e: common_vendor.o(onCycleChange),
        f: cycleIndex.value,
        g: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.members")),
        h: common_vendor.t(members.value.join("、")),
        i: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.generate")),
        j: common_vendor.o(generateSchedule),
        k: common_vendor.t(currentWeekLabel.value),
        l: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.table")),
        m: scheduleList.value.length === 0
      }, scheduleList.value.length === 0 ? {
        n: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.noSchedule"))
      } : {}, {
        o: common_vendor.f(scheduleList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.date),
            b: common_vendor.t(item.weekday),
            c: common_vendor.t(item.person),
            d: index
          };
        }),
        p: historyList.value.length > 0
      }, historyList.value.length > 0 ? {
        q: common_vendor.t(common_vendor.unref(utils_i18n.t)("schedule.history")),
        r: common_vendor.f(historyList.value, (week, wi, i0) => {
          return {
            a: common_vendor.t(week.label),
            b: common_vendor.f(week.items, (item, si, i1) => {
              return {
                a: common_vendor.t(item.date),
                b: common_vendor.t(item.weekday),
                c: common_vendor.t(item.person),
                d: si
              };
            }),
            c: wi
          };
        })
      } : {}, {
        s: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e6e5e79f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/schedule/schedule.js.map
