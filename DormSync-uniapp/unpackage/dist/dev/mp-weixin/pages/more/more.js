"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "more",
  setup(__props) {
    const goTo = (url) => {
      common_vendor.index.navigateTo({ url });
    };
    const handleEntry = (name) => {
      common_vendor.index.showToast({ title: `${name}功能开发中`, icon: "none" });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => goTo("/pages/vote/vote")),
        b: common_vendor.o(($event) => goTo("/pages/vote/vote")),
        c: common_vendor.o(($event) => goTo("/pages/schedule/schedule")),
        d: common_vendor.o(($event) => goTo("/pages/schedule/schedule")),
        e: common_vendor.o(($event) => handleEntry("查看成员")),
        f: common_vendor.o(($event) => handleEntry("宿舍长选举")),
        g: common_vendor.o(($event) => handleEntry("离开宿舍")),
        h: common_vendor.o(($event) => handleEntry("邀请新成员")),
        i: common_vendor.o(($event) => goTo("/pages/fee/fee")),
        j: common_vendor.o(($event) => goTo("/pages/fee/fee"))
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ac368486"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/more/more.js.map
