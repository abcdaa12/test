"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const dormNo = common_vendor.ref("5号楼306");
    const nickname = common_vendor.ref("");
    const announcement = common_vendor.ref("本周三卫生检查，请各位同学提前做好清洁工作。");
    const todoList = common_vendor.ref([]);
    const todoPageMap = {
      vote: "/pages/vote/vote",
      task: "/pages/schedule/schedule",
      finance: "/pages/fee/fee"
    };
    const fetchTodoList = async () => {
      try {
        const userId = common_vendor.index.getStorageSync("userId");
        const url = userId ? `/api/todo/list?userId=${userId}` : "/api/todo/list";
        const res = await utils_request.get(url);
        if (res.code === 200) {
          todoList.value = res.data || [];
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:93", "获取待办列表失败", e);
      }
    };
    const handleTodoClick = (item) => {
      const path = todoPageMap[item.type];
      if (!path)
        return;
      const url = item.relatedId ? `${path}?id=${item.relatedId}` : path;
      common_vendor.index.navigateTo({
        url,
        fail: () => {
          common_vendor.index.switchTab({ url: path });
        }
      });
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      if (!utils_auth.isLoggedIn()) {
        common_vendor.index.redirectTo({ url: "/pages/login/login" });
        return;
      }
      const userInfo = utils_auth.getLocalUserInfo();
      nickname.value = userInfo.nickname || utils_i18n.t("mine.defaultSign");
      common_vendor.index.setNavigationBarTitle({
        title: `${dormNo.value} - ${utils_i18n.t("home.title")}`
      });
      fetchTodoList();
    });
    common_vendor.onMounted(() => {
      if (utils_auth.isLoggedIn()) {
        fetchTodoList();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(dormNo.value),
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.dorm")),
        c: common_vendor.t(nickname.value),
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.hello")),
        e: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.notice")),
        f: common_vendor.t(announcement.value),
        g: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.todo")),
        h: todoList.value.length > 0
      }, todoList.value.length > 0 ? {
        i: common_vendor.f(todoList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.content),
            b: item._id || index,
            c: common_vendor.o(($event) => handleTodoClick(item), item._id || index)
          };
        }),
        j: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.undone"))
      } : {
        k: common_vendor.t(common_vendor.unref(utils_i18n.t)("home.noTodo"))
      }, {
        l: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
