"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "vote",
  setup(__props) {
    const showForm = common_vendor.ref(false);
    const form = common_vendor.reactive({
      title: "",
      options: ["", ""]
    });
    const voteList = common_vendor.ref([
      {
        title: "周末聚餐选哪家？",
        status: "active",
        options: [
          { label: "火锅", count: 2 },
          { label: "烧烤", count: 1 },
          { label: "日料", count: 0 }
        ],
        createTime: "2025-06-05"
      },
      {
        title: "空调温度设定",
        status: "ended",
        options: [
          { label: "24°C", count: 3 },
          { label: "26°C", count: 1 }
        ],
        createTime: "2025-05-28"
      }
    ]);
    const addOption = () => {
      if (form.options.length >= 6) {
        common_vendor.index.showToast({ title: "最多6个选项", icon: "none" });
        return;
      }
      form.options.push("");
    };
    const removeOption = (idx) => {
      form.options.splice(idx, 1);
    };
    const getPercent = (vote, optIndex) => {
      const total = vote.options.reduce((sum, o) => sum + o.count, 0);
      if (total === 0)
        return 0;
      return Math.round(vote.options[optIndex].count / total * 100);
    };
    const doVote = (voteIndex, optIndex) => {
      const vote = voteList.value[voteIndex];
      if (vote.status !== "active") {
        common_vendor.index.showToast({ title: "投票已结束", icon: "none" });
        return;
      }
      vote.options[optIndex].count++;
      common_vendor.index.showToast({ title: "投票成功", icon: "success" });
    };
    const submitVote = async () => {
      if (!form.title) {
        common_vendor.index.showToast({ title: "请输入投票主题", icon: "none" });
        return;
      }
      const validOptions = form.options.filter((o) => o.trim() !== "");
      if (validOptions.length < 2) {
        common_vendor.index.showToast({ title: "至少需要2个有效选项", icon: "none" });
        return;
      }
      const newVote = {
        title: form.title,
        status: "active",
        options: validOptions.map((label) => ({ label, count: 0 })),
        createTime: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      };
      voteList.value.unshift(newVote);
      form.title = "";
      form.options = ["", ""];
      showForm.value = false;
      common_vendor.index.showToast({ title: "投票已发起", icon: "success" });
    };
    common_vendor.onMounted(async () => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(showForm.value ? "收起表单" : "+ 发起新投票"),
        b: common_vendor.o(($event) => showForm.value = !showForm.value),
        c: showForm.value
      }, showForm.value ? {
        d: form.title,
        e: common_vendor.o(($event) => form.title = $event.detail.value),
        f: common_vendor.f(form.options, (opt, idx, i0) => {
          return common_vendor.e({
            a: "选项 " + (idx + 1),
            b: form.options[idx],
            c: common_vendor.o(($event) => form.options[idx] = $event.detail.value, idx)
          }, form.options.length > 2 ? {
            d: common_vendor.o(($event) => removeOption(idx), idx)
          } : {}, {
            e: idx
          });
        }),
        g: form.options.length > 2,
        h: common_vendor.o(addOption),
        i: common_vendor.o(submitVote)
      } : {}, {
        j: voteList.value.length === 0
      }, voteList.value.length === 0 ? {} : {}, {
        k: common_vendor.f(voteList.value, (vote, index, i0) => {
          return {
            a: common_vendor.t(vote.title),
            b: common_vendor.t(vote.status === "active" ? "进行中" : "已结束"),
            c: common_vendor.n(vote.status === "active" ? "active" : "ended"),
            d: common_vendor.f(vote.options, (opt, oi, i1) => {
              return {
                a: getPercent(vote, oi) + "%",
                b: common_vendor.t(opt.label),
                c: common_vendor.t(opt.count),
                d: common_vendor.t(getPercent(vote, oi)),
                e: oi,
                f: common_vendor.o(($event) => doVote(index, oi), oi)
              };
            }),
            e: common_vendor.t(vote.createTime),
            f: index
          };
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6ab7a061"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/vote/vote.js.map
