"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "terms",
  setup(__props) {
    const sections = [
      { title: "terms.section1Title", content: "terms.section1Content" },
      { title: "terms.section2Title", content: "terms.section2Content" },
      { title: "terms.section3Title", content: "terms.section3Content" },
      { title: "terms.section4Title", content: "terms.section4Content" },
      { title: "terms.section5Title", content: "terms.section5Content" }
    ];
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("terms.title") });
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(sections, (section, i, i0) => {
          return {
            a: common_vendor.t(common_vendor.unref(utils_i18n.t)(section.title)),
            b: common_vendor.t(common_vendor.unref(utils_i18n.t)(section.content)),
            c: i
          };
        }),
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("terms.updateDate")),
        c: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-96a24d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/terms/terms.js.map
