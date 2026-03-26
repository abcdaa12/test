"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
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
        common_vendor.index.showToast({ title: utils_i18n.t("vote.maxOption"), icon: "none" });
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
        common_vendor.index.showToast({ title: utils_i18n.t("vote.voteEnded"), icon: "none" });
        return;
      }
      vote.options[optIndex].count++;
      common_vendor.index.showToast({ title: utils_i18n.t("vote.voteSuccess"), icon: "success" });
    };
    const submitVote = async () => {
      if (!form.title) {
        common_vendor.index.showToast({ title: utils_i18n.t("vote.topicRequired"), icon: "none" });
        return;
      }
      const validOptions = form.options.filter((o) => o.trim() !== "");
      if (validOptions.length < 2) {
        common_vendor.index.showToast({ title: utils_i18n.t("vote.minOption"), icon: "none" });
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
      common_vendor.index.showToast({ title: utils_i18n.t("vote.created"), icon: "success" });
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("vote.title") });
    });
    common_vendor.onMounted(async () => {
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(showForm.value ? common_vendor.unref(utils_i18n.t)("vote.hideForm") : "+ " + common_vendor.unref(utils_i18n.t)("vote.toggleForm")),
        b: common_vendor.o(($event) => showForm.value = !showForm.value),
        c: showForm.value
      }, showForm.value ? {
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.formTitle")),
        e: common_vendor.unref(utils_i18n.t)("vote.topicPh"),
        f: form.title,
        g: common_vendor.o(($event) => form.title = $event.detail.value),
        h: common_vendor.f(form.options, (opt, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.unref(utils_i18n.t)("vote.optionPh") + " " + (idx + 1),
            b: form.options[idx],
            c: common_vendor.o(($event) => form.options[idx] = $event.detail.value, idx)
          }, form.options.length > 2 ? {
            d: common_vendor.o(($event) => removeOption(idx), idx)
          } : {}, {
            e: idx
          });
        }),
        i: form.options.length > 2,
        j: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.addOption")),
        k: common_vendor.o(addOption),
        l: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.submit")),
        m: common_vendor.o(submitVote)
      } : {}, {
        n: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.list")),
        o: voteList.value.length === 0
      }, voteList.value.length === 0 ? {
        p: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.noVote"))
      } : {}, {
        q: common_vendor.f(voteList.value, (vote, index, i0) => {
          return {
            a: common_vendor.t(vote.title),
            b: common_vendor.t(vote.status === "active" ? common_vendor.unref(utils_i18n.t)("vote.active") : common_vendor.unref(utils_i18n.t)("vote.ended")),
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
        }),
        r: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.ticket")),
        s: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6ab7a061"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/vote/vote.js.map
