"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "message",
  setup(__props) {
    const searchText = common_vendor.ref("");
    const showFilter = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const filterStatus = common_vendor.ref("all");
    const filterType = common_vendor.ref("all");
    const messageList = common_vendor.ref([]);
    const statusOptions = common_vendor.computed(() => [
      { label: utils_i18n.t("message.all"), value: "all" },
      { label: utils_i18n.t("message.unread"), value: "unread" },
      { label: utils_i18n.t("message.read"), value: "read" }
    ]);
    const typeOptions = common_vendor.computed(() => [
      { label: utils_i18n.t("message.all"), value: "all" },
      { label: utils_i18n.t("message.voteType"), value: "vote" },
      { label: utils_i18n.t("message.taskType"), value: "task" },
      { label: utils_i18n.t("message.financeType"), value: "finance" },
      { label: utils_i18n.t("message.dormType"), value: "dorm" },
      { label: utils_i18n.t("message.announceType"), value: "announce" }
    ]);
    const typeLabel = (type) => {
      const map = { vote: utils_i18n.t("message.voteType"), task: utils_i18n.t("message.taskType"), finance: utils_i18n.t("message.financeType"), dorm: utils_i18n.t("message.dormType"), announce: utils_i18n.t("message.announceType") };
      return map[type] || type;
    };
    const typeIcon = (type) => {
      const map = { vote: "🗳️", task: "📋", finance: "💰", dorm: "👥", announce: "📢" };
      return map[type] || "📢";
    };
    const formatTime = (val) => {
      if (!val)
        return "";
      const d = new Date(val);
      const now = /* @__PURE__ */ new Date();
      const diff = now - d;
      if (diff < 6e4)
        return utils_i18n.t("message.justNow");
      if (diff < 36e5)
        return Math.floor(diff / 6e4) + utils_i18n.t("message.minAgo");
      if (diff < 864e5)
        return Math.floor(diff / 36e5) + utils_i18n.t("message.hourAgo");
      return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, "0")}`;
    };
    const unreadCount = common_vendor.computed(() => messageList.value.filter((m) => m.status === "unread").length);
    const filteredMessages = common_vendor.computed(() => {
      return messageList.value.filter((msg) => {
        if (searchText.value && !msg.content.includes(searchText.value))
          return false;
        if (filterStatus.value === "unread" && msg.status !== "unread")
          return false;
        if (filterStatus.value === "read" && msg.status !== "read")
          return false;
        if (filterType.value !== "all" && msg.type !== filterType.value)
          return false;
        return true;
      });
    });
    const fetchMessages = async () => {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        if (!userId)
          return;
        const res = await utils_request.get(`/api/message/list?userId=${userId}`);
        if (res.code === 200)
          messageList.value = res.data || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/message/message.vue:131", e);
      }
    };
    const onMsgTap = async (msg) => {
      if (msg.status === "unread") {
        try {
          await utils_request.put("/api/message/update", { messageId: msg._id, status: "read" });
          msg.status = "read";
          updateBadge();
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/message/message.vue:142", e);
        }
      }
      const routeMap = {
        finance: "/pages/fee/fee",
        vote: "/pages/vote/vote",
        task: "/pages/schedule/schedule",
        dorm: "/pages/members/members",
        announce: "/pages/announce/announce"
      };
      const url = routeMap[msg.type];
      if (url)
        common_vendor.index.navigateTo({ url });
    };
    const markAllRead = async () => {
      try {
        const res = await utils_request.put("/api/message/read-all", {});
        if (res.code === 200) {
          messageList.value.forEach((m) => m.status = "read");
          updateBadge();
          common_vendor.index.showToast({ title: utils_i18n.t("message.allRead"), icon: "success" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/message/message.vue:165", e);
      }
    };
    const updateBadge = async () => {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        if (!userId)
          return;
        const res = await utils_request.get(`/api/message/unread-count?userId=${userId}`);
        if (res.code === 200 && res.data) {
          const count = res.data.count || 0;
          if (count > 0) {
            common_vendor.index.setTabBarBadge({ index: 1, text: String(count > 99 ? "99+" : count) });
          } else {
            common_vendor.index.removeTabBarBadge({ index: 1 });
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/message/message.vue:181", e);
      }
    };
    const onRefresh = async () => {
      refreshing.value = true;
      await fetchMessages();
      refreshing.value = false;
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("message.title") });
      fetchMessages();
      updateBadge();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(utils_i18n.t)("message.search"),
        b: searchText.value,
        c: common_vendor.o(($event) => searchText.value = $event.detail.value),
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.filter")),
        e: common_vendor.o(($event) => showFilter.value = true),
        f: unreadCount.value > 0
      }, unreadCount.value > 0 ? {
        g: common_vendor.t(unreadCount.value),
        h: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.unreadMsg")),
        i: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.readAll")),
        j: common_vendor.o(markAllRead)
      } : {}, {
        k: showFilter.value
      }, showFilter.value ? {
        l: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.byStatus")),
        m: common_vendor.f(statusOptions.value, (s, k0, i0) => {
          return {
            a: common_vendor.t(s.label),
            b: s.value,
            c: common_vendor.n(filterStatus.value === s.value ? "active" : ""),
            d: common_vendor.o(($event) => filterStatus.value = s.value, s.value)
          };
        }),
        n: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.byType")),
        o: common_vendor.f(typeOptions.value, (t2, k0, i0) => {
          return {
            a: common_vendor.t(t2.label),
            b: t2.value,
            c: common_vendor.n(filterType.value === t2.value ? "active" : ""),
            d: common_vendor.o(($event) => filterType.value = t2.value, t2.value)
          };
        }),
        p: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.confirm")),
        q: common_vendor.o(($event) => showFilter.value = false),
        r: common_vendor.o(() => {
        }),
        s: common_vendor.o(($event) => showFilter.value = false)
      } : {}, {
        t: filteredMessages.value.length === 0
      }, filteredMessages.value.length === 0 ? {
        v: common_vendor.t(common_vendor.unref(utils_i18n.t)("message.noMessage"))
      } : {}, {
        w: common_vendor.f(filteredMessages.value, (msg, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(typeIcon(msg.type)),
            b: common_vendor.n("icon-" + msg.type),
            c: common_vendor.t(typeLabel(msg.type)),
            d: common_vendor.t(formatTime(msg.createTime)),
            e: common_vendor.t(msg.content),
            f: msg.status === "unread"
          }, msg.status === "unread" ? {} : {}, {
            g: msg._id || index,
            h: common_vendor.n(msg.status === "unread" ? "msg-unread" : ""),
            i: common_vendor.o(($event) => onMsgTap(msg), msg._id || index)
          });
        }),
        x: refreshing.value,
        y: common_vendor.o(onRefresh),
        z: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4c1b26cf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message/message.js.map
