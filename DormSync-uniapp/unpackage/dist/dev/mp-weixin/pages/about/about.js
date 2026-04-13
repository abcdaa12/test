"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "about",
  setup(__props) {
    const featureKeys = [
      { icon: "📋", key: "about.featureTodo" },
      { icon: "💰", key: "about.featureFee" },
      { icon: "🗳️", key: "about.featureVote" },
      { icon: "📅", key: "about.featureSchedule" },
      { icon: "💬", key: "about.featureMessage" },
      { icon: "👥", key: "about.featureMember" }
    ];
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("about.title") });
    });
    return (_ctx, _cache) => {
      return {
        a: common_assets._imports_0,
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("about.appIntro")),
        c: common_vendor.t(common_vendor.unref(utils_i18n.t)("about.appDesc")),
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("about.features")),
        e: common_vendor.f(featureKeys, (item, i, i0) => {
          return {
            a: common_vendor.t(item.icon),
            b: common_vendor.t(common_vendor.unref(utils_i18n.t)(item.key)),
            c: i
          };
        }),
        f: common_vendor.t(common_vendor.unref(utils_i18n.t)("about.contact")),
        g: common_vendor.t(common_vendor.unref(utils_i18n.t)("about.contactInfo")),
        h: common_vendor.t(common_vendor.unref(utils_i18n.t)("about.copyright")),
        i: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-13a78ac6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/about/about.js.map
