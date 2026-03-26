"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
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
        common_vendor.index.showToast({ title: utils_i18n.t("fee.fillAll"), icon: "none" });
        return;
      }
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        common_vendor.index.showToast({ title: utils_i18n.t("fee.invalidAmount"), icon: "none" });
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
      common_vendor.index.showToast({ title: utils_i18n.t("fee.added"), icon: "success" });
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("fee.title") });
    });
    common_vendor.onMounted(async () => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(showForm.value ? common_vendor.unref(utils_i18n.t)("fee.hideForm") : "+ " + common_vendor.unref(utils_i18n.t)("fee.toggleForm")),
        b: common_vendor.o(($event) => showForm.value = !showForm.value),
        c: showForm.value
      }, showForm.value ? {
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.formTitle")),
        e: common_vendor.unref(utils_i18n.t)("fee.namePh"),
        f: form.title,
        g: common_vendor.o(($event) => form.title = $event.detail.value),
        h: common_vendor.unref(utils_i18n.t)("fee.amountPh"),
        i: form.amount,
        j: common_vendor.o(($event) => form.amount = $event.detail.value),
        k: common_vendor.unref(utils_i18n.t)("fee.payerPh"),
        l: form.payer,
        m: common_vendor.o(($event) => form.payer = $event.detail.value),
        n: common_vendor.unref(utils_i18n.t)("fee.remarkPh"),
        o: form.remark,
        p: common_vendor.o(($event) => form.remark = $event.detail.value),
        q: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.submit")),
        r: common_vendor.o(submitFee)
      } : {}, {
        s: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.record")),
        t: feeList.value.length === 0
      }, feeList.value.length === 0 ? {
        v: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.noRecord"))
      } : {}, {
        w: common_vendor.f(feeList.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.title),
            b: common_vendor.t(item.amount),
            c: common_vendor.t(item.payer),
            d: common_vendor.t(item.perPerson),
            e: item.remark
          }, item.remark ? {
            f: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.remark")),
            g: common_vendor.t(item.remark)
          } : {}, {
            h: common_vendor.t(item.createTime),
            i: index
          });
        }),
        x: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.payer")),
        y: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.perPerson")),
        z: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fe67f23b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/fee/fee.js.map
