"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "more",
  setup(__props) {
    const goTo = (url) => {
      common_vendor.index.navigateTo({ url });
    };
    const handleLeave = () => {
      common_vendor.index.showModal({
        title: utils_i18n.t("more.leaveTitle"),
        content: utils_i18n.t("more.leaveConfirm"),
        success: async (res) => {
          if (!res.confirm)
            return;
          try {
            const userInfo = utils_auth.getLocalUserInfo();
            const r = await utils_request.post("/api/dorm/leave", { dormId: userInfo.dormId, userId: userInfo._id });
            if (r.code === 200) {
              const info = utils_auth.getLocalUserInfo();
              info.dormId = "";
              info.role = "member";
              common_vendor.index.setStorageSync("userInfo", info);
              common_vendor.index.showToast({ title: utils_i18n.t("more.leaveSuccess"), icon: "success" });
              setTimeout(() => {
                common_vendor.index.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
              }, 1e3);
            } else {
              common_vendor.index.showToast({ title: r.msg, icon: "none" });
            }
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/more/more.vue:101", e);
          }
        }
      });
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("more.title") });
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.decision")),
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.decision")),
        c: common_vendor.o(($event) => goTo("/pages/vote/vote")),
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.task")),
        e: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.task")),
        f: common_vendor.o(($event) => goTo("/pages/schedule/schedule")),
        g: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.finance")),
        h: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.finance")),
        i: common_vendor.o(($event) => goTo("/pages/fee/fee")),
        j: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.announcement")),
        k: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.announceManage")),
        l: common_vendor.o(($event) => goTo("/pages/announce/announce")),
        m: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.member")),
        n: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.viewMember")),
        o: common_vendor.o(($event) => goTo("/pages/members/members")),
        p: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.election")),
        q: common_vendor.o(($event) => goTo("/pages/election/election")),
        r: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.invite")),
        s: common_vendor.o(($event) => goTo("/pages/invite/invite")),
        t: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.leave")),
        v: common_vendor.o(handleLeave),
        w: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ac368486"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/more/more.js.map
