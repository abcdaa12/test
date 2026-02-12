"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "message",
  setup(__props) {
    const searchText = common_vendor.ref("");
    const showFilter = common_vendor.ref(false);
    const filterStatus = common_vendor.ref("all");
    const filterType = common_vendor.ref("all");
    const statusOptions = [
      { label: "全部", value: "all" },
      { label: "未读", value: "unread" },
      { label: "已读", value: "read" }
    ];
    const typeOptions = [
      { label: "全部", value: "all" },
      { label: "投票", value: "vote" },
      { label: "事务", value: "task" },
      { label: "财务", value: "finance" }
    ];
    const messageList = common_vendor.ref([
      { read: false, type: "vote", typeLabel: "投票", content: "投票通知：请参与宿舍长选举", time: "2026-02-11" },
      { read: false, type: "task", typeLabel: "事务", content: "值日提醒：明天轮到你值日", time: "2026-02-11" },
      { read: false, type: "finance", typeLabel: "财务", content: "收款通知：6月电费120元待分摊", time: "2026-02-10" },
      { read: true, type: "vote", typeLabel: "投票", content: "投票结果：周末聚餐选定火锅", time: "2026-02-09" },
      { read: true, type: "task", typeLabel: "事务", content: "事务完成：卫生检查已通过", time: "2026-02-08" },
      { read: true, type: "finance", typeLabel: "财务", content: "缴费确认：5月水费已结清", time: "2026-02-07" }
    ]);
    const filteredMessages = common_vendor.computed(() => {
      return messageList.value.filter((msg) => {
        if (searchText.value && !msg.content.includes(searchText.value))
          return false;
        if (filterStatus.value === "unread" && msg.read)
          return false;
        if (filterStatus.value === "read" && !msg.read)
          return false;
        if (filterType.value !== "all" && msg.type !== filterType.value)
          return false;
        return true;
      });
    });
    let startX = 0;
    const onTouchStart = (e, index) => {
      startX = e.touches[0].clientX;
    };
    const onTouchMove = (e, index) => {
      const diff = e.touches[0].clientX - startX;
      const msg = filteredMessages.value[index];
      if (diff < 0) {
        msg._offsetX = Math.max(diff * 2, -200);
      } else {
        msg._offsetX = 0;
      }
    };
    const onTouchEnd = (index) => {
      const msg = filteredMessages.value[index];
      msg._offsetX = (msg._offsetX || 0) < -100 ? -200 : 0;
    };
    const markRead = (index) => {
      filteredMessages.value[index].read = true;
      filteredMessages.value[index]._offsetX = 0;
      common_vendor.index.showToast({ title: "已标记为已读", icon: "none" });
    };
    const deleteMsg = (index) => {
      const msg = filteredMessages.value[index];
      const realIndex = messageList.value.indexOf(msg);
      if (realIndex > -1) {
        messageList.value.splice(realIndex, 1);
      }
      common_vendor.index.showToast({ title: "已删除", icon: "none" });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: searchText.value,
        b: common_vendor.o(($event) => searchText.value = $event.detail.value),
        c: common_vendor.o(($event) => showFilter.value = true),
        d: showFilter.value
      }, showFilter.value ? {
        e: common_vendor.f(statusOptions, (s, k0, i0) => {
          return {
            a: common_vendor.t(s.label),
            b: s.value,
            c: common_vendor.n(filterStatus.value === s.value ? "active" : ""),
            d: common_vendor.o(($event) => filterStatus.value = s.value, s.value)
          };
        }),
        f: common_vendor.f(typeOptions, (t, k0, i0) => {
          return {
            a: common_vendor.t(t.label),
            b: t.value,
            c: common_vendor.n(filterType.value === t.value ? "active" : ""),
            d: common_vendor.o(($event) => filterType.value = t.value, t.value)
          };
        }),
        g: common_vendor.o(($event) => showFilter.value = false),
        h: common_vendor.o(() => {
        }),
        i: common_vendor.o(($event) => showFilter.value = false)
      } : {}, {
        j: filteredMessages.value.length === 0
      }, filteredMessages.value.length === 0 ? {} : {}, {
        k: common_vendor.f(filteredMessages.value, (msg, index, i0) => {
          return {
            a: common_vendor.t(msg.read ? "[已读]" : "[未读]"),
            b: common_vendor.n(msg.read ? "read" : "unread"),
            c: common_vendor.t(msg.typeLabel),
            d: common_vendor.n("type-" + msg.type),
            e: common_vendor.t(msg.content),
            f: common_vendor.t(msg.time),
            g: common_vendor.o(($event) => onTouchStart($event), index),
            h: common_vendor.o(($event) => onTouchMove($event, index), index),
            i: common_vendor.o(($event) => onTouchEnd(index), index),
            j: "translateX(" + (msg._offsetX || 0) + "rpx)",
            k: common_vendor.o(($event) => markRead(index), index),
            l: common_vendor.o(($event) => deleteMsg(index), index),
            m: index
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4c1b26cf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message/message.js.map
