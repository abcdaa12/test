"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/fee/fee.js";
  "./pages/vote/vote.js";
  "./pages/schedule/schedule.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    common_vendor.onLaunch(() => {
      common_vendor.index.__f__("log", "at App.vue:9", "App Launch - 宿舍协同管理小程序启动");
    });
    common_vendor.onShow(() => {
      common_vendor.index.__f__("log", "at App.vue:13", "App Show - 小程序进入前台");
    });
    common_vendor.onHide(() => {
      common_vendor.index.__f__("log", "at App.vue:17", "App Hide - 小程序进入后台");
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
