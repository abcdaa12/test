"use strict";
const common_vendor = require("../common/vendor.js");
const isDark = common_vendor.ref(false);
const initTheme = () => {
  isDark.value = common_vendor.index.getStorageSync("darkMode") === true;
  applyNavBarTheme();
};
const toggleDark = () => {
  isDark.value = !isDark.value;
  common_vendor.index.setStorageSync("darkMode", isDark.value);
  applyNavBarTheme();
};
const applyNavBarTheme = () => {
  const bg = isDark.value ? "#1a1a1a" : "#ffffff";
  const front = isDark.value ? "#ffffff" : "#000000";
  isDark.value ? "white" : "black";
  common_vendor.index.setNavigationBarColor({
    frontColor: front,
    backgroundColor: bg,
    animation: { duration: 200, timingFunc: "easeIn" }
  });
  common_vendor.index.setTabBarStyle({
    backgroundColor: isDark.value ? "#1a1a1a" : "#ffffff",
    borderStyle: isDark.value ? "white" : "black",
    color: isDark.value ? "#999999" : "#999999",
    selectedColor: isDark.value ? "#5b9bf5" : "#1677FF"
  });
};
exports.applyNavBarTheme = applyNavBarTheme;
exports.initTheme = initTheme;
exports.isDark = isDark;
exports.toggleDark = toggleDark;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/theme.js.map
