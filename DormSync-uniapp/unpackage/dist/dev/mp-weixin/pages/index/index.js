"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const dormNo = common_vendor.ref("5号楼306");
    const nickname = common_vendor.ref("张三");
    const announcement = common_vendor.ref("本周三卫生检查，请各位同学提前做好清洁工作。");
    const todoList = common_vendor.ref([
      { text: "投票：宿舍长选举", done: false },
      { text: "事务：本周值日安排确认", done: false },
      { text: "财务：6月电费待缴纳", done: false },
      { text: "投票：周末聚餐地点", done: true }
    ]);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(dormNo.value),
        b: common_vendor.t(nickname.value),
        c: common_vendor.t(announcement.value),
        d: todoList.value.length > 0
      }, todoList.value.length > 0 ? {
        e: common_vendor.f(todoList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.done ? "[已完成]" : "[未完成]"),
            b: common_vendor.n(item.done ? "done" : "undone"),
            c: common_vendor.t(item.text),
            d: index
          };
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
