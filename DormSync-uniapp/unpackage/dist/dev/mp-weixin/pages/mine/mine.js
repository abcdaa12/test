"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    const loggedIn = common_vendor.ref(false);
    const userInfo = common_vendor.reactive({ nickname: "", avatarUrl: "", signature: "" });
    const loadUserInfo = () => {
      loggedIn.value = utils_auth.isLoggedIn();
      if (loggedIn.value) {
        const info = utils_auth.getLocalUserInfo();
        userInfo.nickname = info.nickname || "";
        userInfo.avatarUrl = info.avatarUrl || "";
        userInfo.signature = info.signature || "";
      }
    };
    const handleLogin = async () => {
      try {
        await utils_auth.wxLogin();
        loadUserInfo();
        common_vendor.index.showToast({ title: utils_i18n.t("mine.loginSuccess"), icon: "success" });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:89", err);
      }
    };
    const goProfile = () => {
      if (loggedIn.value)
        common_vendor.index.navigateTo({ url: "/pages/profile-edit/profile-edit" });
    };
    const goPage = (url) => common_vendor.index.navigateTo({ url });
    const toggleDarkMode = () => {
      utils_theme.toggleDark();
      common_vendor.index.showToast({ title: utils_theme.isDark.value ? utils_i18n.t("mine.darkOn") : utils_i18n.t("mine.darkOff"), icon: "none" });
    };
    const logout = () => {
      common_vendor.index.showModal({
        title: utils_i18n.t("mine.tip"),
        content: utils_i18n.t("mine.logoutConfirm"),
        success: (res) => {
          if (res.confirm) {
            utils_auth.clearAuth();
            loggedIn.value = false;
            userInfo.nickname = "";
            userInfo.avatarUrl = "";
            userInfo.signature = "";
            common_vendor.index.showToast({ title: utils_i18n.t("mine.logoutDone"), icon: "none" });
          }
        }
      });
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      loadUserInfo();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("tab.mine") });
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.avatarUrl
      }, userInfo.avatarUrl ? {
        b: userInfo.avatarUrl
      } : {}, {
        c: common_vendor.t(userInfo.nickname || common_vendor.unref(utils_i18n.t)("mine.defaultSign")),
        d: common_vendor.t(userInfo.signature || common_vendor.unref(utils_i18n.t)("mine.defaultSign")),
        e: !loggedIn.value
      }, !loggedIn.value ? {
        f: common_vendor.t(common_vendor.unref(utils_i18n.t)("mine.notLogged")),
        g: common_vendor.t(common_vendor.unref(utils_i18n.t)("mine.wxLogin")),
        h: common_vendor.o(handleLogin)
      } : {
        i: common_vendor.t(common_vendor.unref(utils_i18n.t)("mine.profile")),
        j: common_vendor.o(goProfile),
        k: common_vendor.t(common_vendor.unref(utils_i18n.t)("mine.language")),
        l: common_vendor.o(($event) => goPage("/pages/language/language")),
        m: common_vendor.t(common_vendor.unref(utils_i18n.t)("mine.darkMode")),
        n: common_vendor.unref(utils_theme.isDark),
        o: common_vendor.o(toggleDarkMode),
        p: common_vendor.t(common_vendor.unref(utils_i18n.t)("mine.about")),
        q: common_vendor.o(($event) => goPage("/pages/about/about")),
        r: common_vendor.t(common_vendor.unref(utils_i18n.t)("mine.terms")),
        s: common_vendor.o(($event) => goPage("/pages/terms/terms")),
        t: common_vendor.t(common_vendor.unref(utils_i18n.t)("mine.logout")),
        v: common_vendor.o(logout)
      }, {
        w: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
