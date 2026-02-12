"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const loading = common_vendor.ref(false);
    common_vendor.onShow(() => {
      if (utils_auth.isLoggedIn()) {
        goHome();
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
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          if (!userInfo.nickname || userInfo.nickname === "宿舍成员") {
            common_vendor.index.redirectTo({ url: "/pages/profile-edit/profile-edit?first=1" });
          } else {
            goHome();
          }
        }, 500);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:61", "登录失败", e);
      } finally {
        loading.value = false;
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0,
        b: loading.value,
        c: common_vendor.o(handleLogin)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
