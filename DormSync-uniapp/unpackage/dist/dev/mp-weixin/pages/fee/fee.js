"use strict";
const common_vendor = require("../../common/vendor.js");
const memberCount = 4;
const _sfc_main = {
  __name: "fee",
  setup(__props) {
    const showForm = common_vendor.ref(false);
    const form = common_vendor.reactive({
      title: "",
      amount: "",
      payer: "",
      remark: ""
    });
    const feeList = common_vendor.ref([
      {
        title: "6月电费",
        amount: "120.00",
        payer: "张三",
        perPerson: "30.00",
        remark: "",
        createTime: "2025-06-01"
      },
      {
        title: "桶装水",
        amount: "40.00",
        payer: "李四",
        perPerson: "10.00",
        remark: "农夫山泉 5桶",
        createTime: "2025-06-03"
      }
    ]);
    const submitFee = async () => {
      if (!form.title || !form.amount || !form.payer) {
        common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        return;
      }
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        common_vendor.index.showToast({ title: "请输入有效金额", icon: "none" });
        return;
      }
      const newFee = {
        title: form.title,
        amount: amount.toFixed(2),
        payer: form.payer,
        perPerson: (amount / memberCount).toFixed(2),
        remark: form.remark,
        createTime: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      };
      feeList.value.unshift(newFee);
      form.title = "";
      form.amount = "";
      form.payer = "";
      form.remark = "";
      showForm.value = false;
      common_vendor.index.showToast({ title: "费用已添加", icon: "success" });
    };
    common_vendor.onMounted(async () => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(showForm.value ? "收起表单" : "+ 发起新费用"),
        b: common_vendor.o(($event) => showForm.value = !showForm.value),
        c: showForm.value
      }, showForm.value ? {
        d: form.title,
        e: common_vendor.o(($event) => form.title = $event.detail.value),
        f: form.amount,
        g: common_vendor.o(($event) => form.amount = $event.detail.value),
        h: form.payer,
        i: common_vendor.o(($event) => form.payer = $event.detail.value),
        j: form.remark,
        k: common_vendor.o(($event) => form.remark = $event.detail.value),
        l: common_vendor.o(submitFee)
      } : {}, {
        m: feeList.value.length === 0
      }, feeList.value.length === 0 ? {} : {}, {
        n: common_vendor.f(feeList.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.title),
            b: common_vendor.t(item.amount),
            c: common_vendor.t(item.payer),
            d: common_vendor.t(item.perPerson),
            e: item.remark
          }, item.remark ? {
            f: common_vendor.t(item.remark)
          } : {}, {
            g: common_vendor.t(item.createTime),
            h: index
          });
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fe67f23b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/fee/fee.js.map
