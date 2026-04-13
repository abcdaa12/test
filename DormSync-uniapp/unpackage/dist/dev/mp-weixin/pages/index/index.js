"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const dormNo = common_vendor.ref("");
    const nickname = common_vendor.ref("");
    const announcement = common_vendor.ref("");
    const todoList = common_vendor.ref([]);
    const refreshing = common_vendor.ref(false);
    const showAddTodo = common_vendor.ref(false);
    const newTodoText = common_vendor.ref("");
    const goTo = (url) => common_vendor.index.navigateTo({ url });
    common_vendor.onShareAppMessage(() => {
      return {
        title: `${utils_i18n.t("invite.shareCardTitle")} ${dormNo.value}`,
        path: `/pages/login/login?dormNumber=${encodeURIComponent(dormNo.value)}`,
        imageUrl: "/static/logo.png"
      };
    });
    const fetchTodoList = async () => {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const url = userId ? `/api/todo/list?userId=${userId}` : "/api/todo/list";
        const res = await utils_request.get(url);
        if (res.code === 200)
          todoList.value = res.data || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:110", "获取待办列表失败", e);
      }
    };
    const addTodo = async () => {
      const text = newTodoText.value.trim();
      if (!text)
        return;
      try {
        const res = await utils_request.post("/api/todo/create", { content: text });
        if (res.code === 200) {
          newTodoText.value = "";
          showAddTodo.value = false;
          fetchTodoList();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:123", "创建待办失败", e);
      }
    };
    const deleteTodo = async (item) => {
      try {
        const res = await utils_request.del("/api/todo/delete", { todoId: item._id });
        if (res.code === 200)
          fetchTodoList();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:130", e);
      }
    };
    const fetchDormInfo = async () => {
      try {
        const userInfo = utils_auth.getLocalUserInfo();
        if (!userInfo.dormId)
          return;
        const res = await utils_request.get(`/api/dorm/info?dormId=${userInfo.dormId}`);
        if (res.code === 200 && res.data) {
          dormNo.value = res.data.dormNumber || "";
        }
        const aRes = await utils_request.get(`/api/announce/list?dormId=${userInfo.dormId}`);
        if (aRes.code === 200 && aRes.data && aRes.data.length > 0) {
          announcement.value = aRes.data[0].title;
        } else {
          announcement.value = utils_i18n.t("home.noNotice");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:148", "获取宿舍信息失败", e);
      }
    };
    const fetchUnreadCount = async () => {
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:164", e);
      }
    };
    const onRefresh = async () => {
      refreshing.value = true;
      await Promise.all([fetchDormInfo(), fetchTodoList(), fetchUnreadCount()]);
      refreshing.value = false;
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      if (!utils_auth.isLoggedIn()) {
        common_vendor.index.redirectTo({ url: "/pages/login/login" });
        return;
      }
      const userInfo = utils_auth.getLocalUserInfo();
      nickname.value = userInfo.nickname || utils_i18n.t("mine.defaultSign");
      if (!userInfo.dormId) {
        common_vendor.index.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
        return;
      }
      common_vendor.index.setNavigationBarTitle({ title: `${dormNo.value || ""} - ${utils_i18n.t("home.title")}` });
      fetchDormInfo();
      fetchTodoList();
      fetchUnreadCount();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(dormNo.value),
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.dorm")),
        c: common_vendor.t(nickname.value),
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.hello")),
        e: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.fee")),
        f: common_vendor.o(($event) => goTo("/pages/fee/fee")),
        g: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.vote")),
        h: common_vendor.o(($event) => goTo("/pages/vote/vote")),
        i: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.schedule")),
        j: common_vendor.o(($event) => goTo("/pages/schedule/schedule")),
        k: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.members")),
        l: common_vendor.o(($event) => goTo("/pages/members/members")),
        m: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.notice")),
        n: common_vendor.t(announcement.value),
        o: common_vendor.o(($event) => goTo("/pages/announce/announce")),
        p: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.todo")),
        q: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.addTodo")),
        r: common_vendor.o(($event) => showAddTodo.value = !showAddTodo.value),
        s: showAddTodo.value
      }, showAddTodo.value ? {
        t: common_vendor.unref(utils_i18n.t)("home.todoPh"),
        v: common_vendor.o(addTodo),
        w: newTodoText.value,
        x: common_vendor.o(($event) => newTodoText.value = $event.detail.value),
        y: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.todoAdd")),
        z: common_vendor.o(addTodo)
      } : {}, {
        A: todoList.value.length > 0
      }, todoList.value.length > 0 ? {
        B: common_vendor.f(todoList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.content),
            b: common_vendor.o(($event) => deleteTodo(item), item._id || index),
            c: item._id || index
          };
        })
      } : {
        C: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.noTodo"))
      }, {
        D: refreshing.value,
        E: common_vendor.o(onRefresh),
        F: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
