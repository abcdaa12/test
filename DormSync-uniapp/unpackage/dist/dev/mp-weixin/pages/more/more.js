"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "more",
  setup(__props) {
    const goTo = (url) => {
      common_vendor.index.navigateTo({ url });
    };
    const handleEntry = (name) => {
      common_vendor.index.showToast({ title: `${name} ${utils_i18n.t("more.developing")}`, icon: "none" });
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("more.title") });
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.decision")),
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.createDecision")),
        c: common_vendor.o(($event) => goTo("/pages/vote/vote")),
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.viewDecision")),
        e: common_vendor.o(($event) => goTo("/pages/vote/vote")),
        f: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.task")),
        g: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.createTask")),
        h: common_vendor.o(($event) => goTo("/pages/schedule/schedule")),
        i: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.viewTask")),
        j: common_vendor.o(($event) => goTo("/pages/schedule/schedule")),
        k: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.member")),
        l: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.viewMember")),
        m: common_vendor.o(($event) => handleEntry(common_vendor.unref(utils_i18n.t)("more.viewMember"))),
        n: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.election")),
        o: common_vendor.o(($event) => handleEntry(common_vendor.unref(utils_i18n.t)("more.election"))),
        p: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.leave")),
        q: common_vendor.o(($event) => handleEntry(common_vendor.unref(utils_i18n.t)("more.leave"))),
        r: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.invite")),
        s: common_vendor.o(($event) => handleEntry(common_vendor.unref(utils_i18n.t)("more.invite"))),
        t: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.finance")),
        v: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.createFee")),
        w: common_vendor.o(($event) => goTo("/pages/fee/fee")),
        x: common_vendor.t(common_vendor.unref(utils_i18n.t)("more.viewRecord")),
        y: common_vendor.o(($event) => goTo("/pages/fee/fee")),
        z: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ac368486"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/more/more.js.map
