"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_auth = require("./utils/auth.js");
const utils_i18n = require("./utils/i18n.js");
const utils_theme = require("./utils/theme.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/index/index.js";
  "./pages/message/message.js";
  "./pages/more/more.js";
  "./pages/mine/mine.js";
  "./pages/fee/fee.js";
  "./pages/vote/vote.js";
  "./pages/schedule/schedule.js";
  "./pages/profile-edit/profile-edit.js";
  "./pages/language/language.js";
  "./pages/dorm-setup/dorm-setup.js";
  "./pages/invite/invite.js";
  "./pages/members/members.js";
  "./pages/election/election.js";
  "./pages/about/about.js";
  "./pages/terms/terms.js";
  "./pages/announce/announce.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch((options) => {
      common_vendor.index.__f__("log", "at App.vue:13", "App Launch - 宿舍协同管理小程序启动", options);
      utils_i18n.updateTabBar();
      utils_theme.initTheme();
      if (options && options.query && options.query.dormNumber) {
        const dormNumber = decodeURIComponent(options.query.dormNumber);
        common_vendor.index.__f__("log", "at App.vue:20", "从分享卡片获取宿舍号:", dormNumber);
        common_vendor.index.setStorageSync("inviteDormNumber", dormNumber);
      }
      if (utils_auth.isLoggedIn()) {
        const userInfo = common_vendor.index.getStorageSync("userInfo") || {};
        const inviteDorm = common_vendor.index.getStorageSync("inviteDormNumber");
        if (inviteDorm && !userInfo.dormId) {
          common_vendor.index.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
        } else {
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }
      }
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at App.vue:38", "App Show - 小程序进入前台");
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at App.vue:42", "App Hide - 小程序进入后台");
    });
    return () => {
    };
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
