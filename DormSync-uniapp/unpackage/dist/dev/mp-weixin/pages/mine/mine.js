"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "mine",
  setup(__props) {
    const loggedIn = common_vendor.ref(false);
    const userInfo = common_vendor.reactive({
      nickname: "宿舍成员",
      avatarUrl: "",
      signature: "",
      phone: "",
      className: ""
    });
    const loadUserInfo = () => {
      loggedIn.value = utils_auth.isLoggedIn();
      if (loggedIn.value) {
        const info = utils_auth.getLocalUserInfo();
        userInfo.nickname = info.nickname || "宿舍成员";
        userInfo.avatarUrl = info.avatarUrl || "";
        userInfo.signature = info.signature || "";
        userInfo.phone = info.phone || "";
        userInfo.className = info.className || "";
      }
    };
    const handleLogin = async () => {
      try {
        const info = await utils_auth.wxLogin();
        loadUserInfo();
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/mine/mine.vue:112", "手动登录失败：", err);
      }
    };
    const editProfile = () => {
      common_vendor.index.navigateTo({ url: "/pages/profile-edit/profile-edit" });
    };
    const logout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            utils_auth.clearAuth();
            loggedIn.value = false;
            userInfo.nickname = "宿舍成员";
            userInfo.avatarUrl = "";
            userInfo.signature = "";
            userInfo.phone = "";
            userInfo.className = "";
            common_vendor.index.showToast({ title: "已退出登录", icon: "none" });
          }
        }
      });
    };
    common_vendor.onShow(() => {
      loadUserInfo();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.avatarUrl
      }, userInfo.avatarUrl ? {
        b: userInfo.avatarUrl
      } : {}, {
        c: common_vendor.t(userInfo.nickname),
        d: common_vendor.t(userInfo.signature || "这个人很懒，什么都没写~"),
        e: !loggedIn.value
      }, !loggedIn.value ? {
        f: common_vendor.o(handleLogin)
      } : {
        g: common_vendor.t(userInfo.phone || "未设置"),
        h: common_vendor.t(userInfo.className || "未设置"),
        i: common_vendor.o(editProfile),
        j: common_vendor.o(logout)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7c2ebfa5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/mine.js.map
