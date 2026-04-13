"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_auth = require("../../utils/auth.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const loading = common_vendor.ref(false);
    common_vendor.onLoad((options) => {
      if (options && options.dormNumber) {
        const dormNumber = decodeURIComponent(options.dormNumber);
        common_vendor.index.__f__("log", "at pages/login/login.vue:33", "登录页收到邀请宿舍号:", dormNumber);
        common_vendor.index.setStorageSync("inviteDormNumber", dormNumber);
      }
    });
    common_vendor.onShow(() => {
      if (utils_auth.isLoggedIn()) {
        const userInfo = common_vendor.index.getStorageSync("userInfo") || {};
        const inviteDorm = common_vendor.index.getStorageSync("inviteDormNumber");
        if (inviteDorm && !userInfo.dormId) {
          common_vendor.index.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
        } else {
          common_vendor.index.removeStorageSync("inviteDormNumber");
          goHome();
        }
      }
    });
    const goHome = () => {
      common_vendor.index.switchTab({ url: "/pages/index/index" });
    };
    const handleLogin = async () => {
      if (loading.value)
        return;
      loading.value = true;
      try {
        const userInfo = await utils_auth.wxLogin();
        common_vendor.index.showToast({ title: utils_i18n.t("login.success"), icon: "success" });
        setTimeout(() => {
          if (!userInfo.nickname || userInfo.nickname === "宿舍成员") {
            common_vendor.index.redirectTo({ url: "/pages/profile-edit/profile-edit?first=1" });
          } else if (!userInfo.dormId) {
            common_vendor.index.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
          } else {
            common_vendor.index.removeStorageSync("inviteDormNumber");
            goHome();
          }
        }, 500);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:82", "登录失败", e);
      } finally {
        loading.value = false;
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0,
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("login.appDesc")),
        c: common_vendor.t(common_vendor.unref(utils_i18n.t)("login.btn")),
        d: loading.value,
        e: common_vendor.o(handleLogin),
        f: common_vendor.t(common_vendor.unref(utils_i18n.t)("login.agreement")),
        g: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
