"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "schedule",
  setup(__props) {
    const members = common_vendor.ref(["张三", "李四", "王五", "赵六"]);
    const cycleOptions = ["按周排班", "按天轮换"];
    const cycleIndex = common_vendor.ref(0);
    const scheduleList = common_vendor.ref([]);
    const historyList = common_vendor.ref([]);
    const weekdayMap = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
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
          weekday: weekdayMap[d.getDay()],
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
      common_vendor.index.showToast({ title: "排班已生成", icon: "success" });
    };
    common_vendor.onMounted(async () => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(cycleOptions[cycleIndex.value]),
        b: cycleOptions,
        c: common_vendor.o(onCycleChange),
        d: cycleIndex.value,
        e: common_vendor.t(members.value.join("、")),
        f: common_vendor.o(generateSchedule),
        g: common_vendor.t(currentWeekLabel.value),
        h: scheduleList.value.length === 0
      }, scheduleList.value.length === 0 ? {} : {}, {
        i: common_vendor.f(scheduleList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.date),
            b: common_vendor.t(item.weekday),
            c: common_vendor.t(item.person),
            d: index
          };
        }),
        j: historyList.value.length > 0
      }, historyList.value.length > 0 ? {
        k: common_vendor.f(historyList.value, (week, wi, i0) => {
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
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e6e5e79f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/schedule/schedule.js.map
