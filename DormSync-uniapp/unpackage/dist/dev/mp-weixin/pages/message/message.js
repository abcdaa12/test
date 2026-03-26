"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "message",
  setup(__props) {
    const searchText = common_vendor.ref("");
    const showFilter = common_vendor.ref(false);
    const filterStatus = common_vendor.ref("all");
    const filterType = common_vendor.ref("all");
    const statusOptions = common_vendor.computed(() => [
      { label: utils_i18n.t("message.all"), value: "all" },
      { label: utils_i18n.t("message.unread"), value: "unread" },
      { label: utils_i18n.t("message.read"), value: "read" }
    ]);
    const typeOptions = common_vendor.computed(() => [
      { label: utils_i18n.t("message.all"), value: "all" },
      { label: utils_i18n.t("message.voteType"), value: "vote" },
      { label: utils_i18n.t("message.taskType"), value: "task" },
      { label: utils_i18n.t("message.financeType"), value: "finance" }
    ]);
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
      common_vendor.index.showToast({ title: utils_i18n.t("message.markedRead"), icon: "none" });
    };
    const deleteMsg = (index) => {
      const msg = filteredMessages.value[index];
      const realIndex = messageList.value.indexOf(msg);
      if (realIndex > -1) {
        messageList.value.splice(realIndex, 1);
      }
      common_vendor.index.showToast({ title: utils_i18n.t("message.deleted"), icon: "none" });
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("message.title") });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(utils_i18n.t)("message.search"),
        b: searchText.value,
        c: common_vendor.o(($event) => searchText.value = $event.detail.value),
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.filter")),
        e: common_vendor.o(($event) => showFilter.value = true),
        f: showFilter.value
      }, showFilter.value ? {
        g: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.byStatus")),
        h: common_vendor.f(statusOptions.value, (s, k0, i0) => {
          return {
            a: common_vendor.t(s.label),
            b: s.value,
            c: common_vendor.n(filterStatus.value === s.value ? "active" : ""),
            d: common_vendor.o(($event) => filterStatus.value = s.value, s.value)
          };
        }),
        i: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.byType")),
        j: common_vendor.f(typeOptions.value, (t2, k0, i0) => {
          return {
            a: common_vendor.t(t2.label),
            b: t2.value,
            c: common_vendor.n(filterType.value === t2.value ? "active" : ""),
            d: common_vendor.o(($event) => filterType.value = t2.value, t2.value)
          };
        }),
        k: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.confirm")),
        l: common_vendor.o(($event) => showFilter.value = false),
        m: common_vendor.o(() => {
        }),
        n: common_vendor.o(($event) => showFilter.value = false)
      } : {}, {
        o: filteredMessages.value.length === 0
      }, filteredMessages.value.length === 0 ? {
        p: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.noMessage"))
      } : {}, {
        q: common_vendor.f(filteredMessages.value, (msg, index, i0) => {
          return {
            a: common_vendor.t(msg.read ? "[" + common_vendor.unref(utils_i18n.t)("message.readTag") + "]" : "[" + common_vendor.unref(utils_i18n.t)("message.unreadTag") + "]"),
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
        }),
        r: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.markRead")),
        s: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.delete")),
        t: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4c1b26cf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message/message.js.map
