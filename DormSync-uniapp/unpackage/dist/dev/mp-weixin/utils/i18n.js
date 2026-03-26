"use strict";
const common_vendor = require("../common/vendor.js");
const utils_lang_zhCN = require("./lang/zh-CN.js");
const utils_lang_en = require("./lang/en.js");
const utils_lang_ko = require("./lang/ko.js");
const utils_lang_ja = require("./lang/ja.js");
const messages = { "zh-CN": utils_lang_zhCN.zhCN, en: utils_lang_en.en, ko: utils_lang_ko.ko, ja: utils_lang_ja.ja };
const currentLang = common_vendor.ref(common_vendor.index.getStorageSync("language") || "zh-CN");
const setLang = (lang) => {
  currentLang.value = lang;
  common_vendor.index.setStorageSync("language", lang);
  updateTabBar();
};
const updateTabBar = () => {
  const tabs = ["home", "message", "more", "mine"];
  tabs.forEach((key, index) => {
    common_vendor.index.setTabBarItem({ index, text: t(`tab.${key}`) });
  });
};
const t = (key) => {
  const lang = currentLang.value;
  const keys = key.split(".");
  let val = messages[lang];
  for (const k of keys) {
    if (val && typeof val === "object")
      val = val[k];
    else
      return key;
  }
  return val || key;
};
exports.currentLang = currentLang;
exports.setLang = setLang;
exports.t = t;
exports.updateTabBar = updateTabBar;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/i18n.js.map
