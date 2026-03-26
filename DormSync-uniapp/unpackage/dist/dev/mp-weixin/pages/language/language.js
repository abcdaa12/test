"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "language",
  setup(__props) {
    const languages = [
      { label: "简体中文", value: "zh-CN" },
      { label: "English", value: "en" },
      { label: "한국어", value: "ko" },
      { label: "日本語", value: "ja" }
    ];
    const current = common_vendor.ref("zh-CN");
    common_vendor.onLoad(() => {
      current.value = utils_i18n.currentLang.value;
    });
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("language.title") });
    });
    const selectLang = (lang) => {
      var _a;
      current.value = lang;
      utils_i18n.setLang(lang);
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("language.title") });
      const name = (_a = languages.find((l) => l.value === lang)) == null ? void 0 : _a.label;
      common_vendor.index.showToast({ title: `${utils_i18n.t("language.switched")} ${name}`, icon: "success" });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(languages, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.label),
            b: current.value === item.value
          }, current.value === item.value ? {} : {}, {
            c: item.value,
            d: common_vendor.o(($event) => selectLang(item.value), item.value)
          });
        }),
        b: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-143e30ec"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/language/language.js.map
