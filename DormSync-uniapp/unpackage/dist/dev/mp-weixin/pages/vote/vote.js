"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "vote",
  setup(__props) {
    const showForm = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const editingId = common_vendor.ref("");
    const form = common_vendor.reactive({ title: "", options: ["", ""], deadlineDate: "", deadlineTime: "23:59", anonymous: false });
    const voteList = common_vendor.ref([]);
    const detailVisible = common_vendor.ref(false);
    const detailItem = common_vendor.ref({});
    const formatDateTime = (val) => {
      if (!val)
        return "";
      const d = new Date(val);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      return `${date} ${time}`;
    };
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
    const onDateChange = (e) => {
      form.deadlineDate = e.detail.value;
    };
    const onTimeChange = (e) => {
      form.deadlineTime = e.detail.value;
    };
    const getPercent = (vote, oi) => {
      if (!vote || !vote.options)
        return 0;
      const total = vote.options.reduce((s, o) => s + o.count, 0);
      return total === 0 ? 0 : Math.round(vote.options[oi].count / total * 100);
    };
    const getTotalVotes = (vote) => {
      if (!vote || !vote.options)
        return 0;
      return vote.options.reduce((s, o) => s + o.count, 0);
    };
    const getVoterNames = (vote, optIndex) => {
      if (!vote || !vote.voters)
        return [];
      const names = [];
      vote.voters.forEach((v) => {
        if (v.optionIndex !== optIndex)
          return;
        if (v.userId && typeof v.userId === "object") {
          if (v.userId.nickname)
            names.push(v.userId.nickname);
        }
      });
      return names;
    };
    const hasCurrentUserVoted = (vote) => {
      if (!vote || !vote.voters)
        return false;
      const userId = common_vendor.index.getStorageSync("userId");
      return vote.voters.some((v) => {
        const vid = v.userId && typeof v.userId === "object" ? v.userId._id : v.userId;
        return vid && vid.toString() === userId;
      });
    };
    const showDetail = (vote) => {
      detailItem.value = vote;
      detailVisible.value = true;
    };
    const doVote = async (vote, optIndex) => {
      if (vote.status !== "active") {
        common_vendor.index.showToast({ title: utils_i18n.t("vote.voteEnded"), icon: "none" });
        return;
      }
      try {
        const res = await utils_request.post("/api/decision/vote", { decisionId: vote._id, optionIndex: optIndex });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: utils_i18n.t("vote.voteSuccess"), icon: "success" });
        } else {
          common_vendor.index.showToast({ title: res.msg || utils_i18n.t("vote.voteEnded"), icon: "none" });
        }
      } catch (e) {
        common_vendor.index.showToast({ title: utils_i18n.t("vote.voteEnded"), icon: "none" });
      }
    };
    const doVoteFromDetail = async (vote, oi) => {
      await doVote(vote, oi);
      await fetchList();
      const updated = voteList.value.find((v) => v._id === vote._id);
      if (updated)
        detailItem.value = updated;
    };
    const doVoteAndRefresh = async (vote, oi) => {
      await doVote(vote, oi);
      await fetchList();
    };
    const fetchList = async () => {
      try {
        const userInfo = utils_auth.getLocalUserInfo();
        if (!userInfo.dormId)
          return;
        const res = await utils_request.get(`/api/decision/list?dormId=${userInfo.dormId}`);
        if (res.code === 200)
          voteList.value = res.data || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/vote/vote.vue:229", e);
      }
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
      if (!form.deadlineDate) {
        common_vendor.index.showToast({ title: utils_i18n.t("vote.selectDeadline"), icon: "none" });
        return;
      }
      const deadline = `${form.deadlineDate}T${form.deadlineTime || "23:59"}:00`;
      const userInfo = utils_auth.getLocalUserInfo();
      try {
        const res = await utils_request.post("/api/decision/create", {
          dormId: userInfo.dormId,
          title: form.title,
          options: validOptions,
          deadline,
          creatorId: userInfo._id,
          anonymous: form.anonymous
        });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: utils_i18n.t("vote.created"), icon: "success" });
          resetForm();
          showForm.value = false;
          fetchList();
        } else {
          common_vendor.index.showToast({ title: res.msg, icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/vote/vote.vue:248", e);
      }
    };
    const startEdit = (vote) => {
      editingId.value = vote._id;
      form.title = vote.title;
      form.anonymous = !!vote.anonymous;
      if (vote.deadline) {
        const d = new Date(vote.deadline);
        form.deadlineDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        form.deadlineTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      }
      showForm.value = true;
    };
    const cancelEdit = () => {
      resetForm();
      editingId.value = "";
      showForm.value = false;
    };
    const saveEdit = async () => {
      if (!form.title) {
        common_vendor.index.showToast({ title: utils_i18n.t("vote.topicRequired"), icon: "none" });
        return;
      }
      if (!form.deadlineDate) {
        common_vendor.index.showToast({ title: utils_i18n.t("vote.selectDeadline"), icon: "none" });
        return;
      }
      const deadline = `${form.deadlineDate}T${form.deadlineTime || "23:59"}:00`;
      try {
        const res = await utils_request.put("/api/decision/update", {
          decisionId: editingId.value,
          title: form.title,
          deadline,
          anonymous: form.anonymous
        });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: utils_i18n.t("vote.editSuccess"), icon: "success" });
          resetForm();
          editingId.value = "";
          showForm.value = false;
          fetchList();
        } else {
          common_vendor.index.showToast({ title: res.msg, icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/vote/vote.vue:275", e);
      }
    };
    const deleteVote = (vote) => {
      common_vendor.index.showModal({
        title: utils_i18n.t("vote.deleteTitle"),
        content: utils_i18n.t("vote.deleteConfirm"),
        success: async (res) => {
          if (!res.confirm)
            return;
          try {
            const r = await utils_request.del("/api/decision/delete", { decisionId: vote._id });
            if (r.code === 200) {
              common_vendor.index.showToast({ title: utils_i18n.t("vote.deleted"), icon: "success" });
              fetchList();
            }
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/vote/vote.vue:286", e);
          }
        }
      });
    };
    const resetForm = () => {
      form.title = "";
      form.options = ["", ""];
      form.deadlineDate = "";
      form.deadlineTime = "23:59";
      form.anonymous = false;
    };
    const onRefresh = async () => {
      refreshing.value = true;
      await fetchList();
      refreshing.value = false;
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("vote.title") });
      fetchList();
    });
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: common_vendor.t(showForm.value ? common_vendor.unref(utils_i18n.t)("vote.hideForm") : "+ " + common_vendor.unref(utils_i18n.t)("vote.toggleForm")),
        b: common_vendor.o(($event) => showForm.value = !showForm.value),
        c: showForm.value
      }, showForm.value ? common_vendor.e({
        d: common_vendor.t(editingId.value ? common_vendor.unref(utils_i18n.t)("vote.editTitle") : common_vendor.unref(utils_i18n.t)("vote.formTitle")),
        e: common_vendor.unref(utils_i18n.t)("vote.topicPh"),
        f: form.title,
        g: common_vendor.o(($event) => form.title = $event.detail.value),
        h: !editingId.value
      }, !editingId.value ? {
        i: common_vendor.f(form.options, (opt, idx, i0) => {
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
        j: form.options.length > 2
      } : {}, {
        k: !editingId.value
      }, !editingId.value ? {
        l: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.addOption")),
        m: common_vendor.o(addOption)
      } : {}, {
        n: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.deadline")),
        o: common_vendor.t(form.deadlineDate || common_vendor.unref(utils_i18n.t)("vote.selectDate")),
        p: form.deadlineDate,
        q: common_vendor.o(onDateChange),
        r: common_vendor.t(form.deadlineTime || "23:59"),
        s: form.deadlineTime,
        t: common_vendor.o(onTimeChange),
        v: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.anonymous")),
        w: form.anonymous,
        x: common_vendor.o(($event) => form.anonymous = $event.detail.value),
        y: common_vendor.t(editingId.value ? common_vendor.unref(utils_i18n.t)("vote.saveEdit") : common_vendor.unref(utils_i18n.t)("vote.submit")),
        z: common_vendor.o(($event) => editingId.value ? saveEdit() : submitVote()),
        A: editingId.value
      }, editingId.value ? {
        B: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.cancelEdit")),
        C: common_vendor.o(cancelEdit)
      } : {}) : {}, {
        D: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.list")),
        E: voteList.value.length === 0
      }, voteList.value.length === 0 ? {
        F: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.noVote"))
      } : {}, {
        G: common_vendor.f(voteList.value, (vote, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(vote.title),
            b: vote.anonymous
          }, vote.anonymous ? {
            c: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.anonymousTag"))
          } : {}, {
            d: common_vendor.t(vote.status === "active" ? common_vendor.unref(utils_i18n.t)("vote.active") : common_vendor.unref(utils_i18n.t)("vote.ended")),
            e: common_vendor.n(vote.status === "active" ? "active" : "ended"),
            f: vote.deadline
          }, vote.deadline ? {
            g: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.deadline")),
            h: common_vendor.t(formatDateTime(vote.deadline))
          } : {}, {
            i: common_vendor.f(vote.options, (opt, oi, i1) => {
              return common_vendor.e(hasCurrentUserVoted(vote) ? {
                a: getPercent(vote, oi) + "%"
              } : {}, hasCurrentUserVoted(vote) ? {
                b: common_vendor.t(opt.label),
                c: common_vendor.t(opt.count),
                d: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.ticket")),
                e: common_vendor.t(getPercent(vote, oi))
              } : {
                f: common_vendor.t(opt.label)
              }, {
                g: oi,
                h: common_vendor.o(($event) => doVoteAndRefresh(vote, oi), oi)
              });
            }),
            j: hasCurrentUserVoted(vote),
            k: hasCurrentUserVoted(vote),
            l: common_vendor.t(formatDateTime(vote.createdAt)),
            m: common_vendor.o(($event) => startEdit(vote), vote._id || index),
            n: common_vendor.o(($event) => deleteVote(vote), vote._id || index),
            o: vote._id || index,
            p: common_vendor.n(vote.anonymous ? "anonymous-card" : ""),
            q: common_vendor.o(($event) => showDetail(vote), vote._id || index)
          });
        }),
        H: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.edit")),
        I: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.deleteBtn")),
        J: refreshing.value,
        K: common_vendor.o(onRefresh),
        L: detailVisible.value
      }, detailVisible.value ? common_vendor.e({
        M: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.detail")),
        N: common_vendor.o(($event) => detailVisible.value = false),
        O: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.topic")),
        P: common_vendor.t(detailItem.value.title),
        Q: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.creator")),
        R: common_vendor.t(((_a = detailItem.value.creatorId) == null ? void 0 : _a.nickname) || "-"),
        S: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.deadline")),
        T: common_vendor.t(formatDateTime(detailItem.value.deadline)),
        U: hasCurrentUserVoted(detailItem.value)
      }, hasCurrentUserVoted(detailItem.value) ? {
        V: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.totalVotes")),
        W: common_vendor.t(getTotalVotes(detailItem.value)),
        X: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.ticket"))
      } : {}, {
        Y: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.voteType")),
        Z: common_vendor.t(detailItem.value.anonymous ? "🔒 " + common_vendor.unref(utils_i18n.t)("vote.anonymousTag") : common_vendor.unref(utils_i18n.t)("vote.publicVote")),
        aa: common_vendor.n(detailItem.value.anonymous ? "anonymous-yes" : ""),
        ab: common_vendor.f(detailItem.value.options, (opt, oi, i0) => {
          return common_vendor.e({
            a: common_vendor.t(opt.label)
          }, hasCurrentUserVoted(detailItem.value) ? {
            b: common_vendor.t(opt.count),
            c: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.ticket")),
            d: common_vendor.t(getPercent(detailItem.value, oi))
          } : {}, hasCurrentUserVoted(detailItem.value) ? {
            e: getPercent(detailItem.value, oi) + "%"
          } : {}, {
            f: !detailItem.value.anonymous && hasCurrentUserVoted(detailItem.value) && getVoterNames(detailItem.value, oi).length > 0
          }, !detailItem.value.anonymous && hasCurrentUserVoted(detailItem.value) && getVoterNames(detailItem.value, oi).length > 0 ? {
            g: common_vendor.t(getVoterNames(detailItem.value, oi).join("、"))
          } : {}, {
            h: oi
          });
        }),
        ac: hasCurrentUserVoted(detailItem.value),
        ad: hasCurrentUserVoted(detailItem.value),
        ae: detailItem.value.status === "active" && !hasCurrentUserVoted(detailItem.value)
      }, detailItem.value.status === "active" && !hasCurrentUserVoted(detailItem.value) ? {
        af: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.tapToVote")),
        ag: common_vendor.f(detailItem.value.options, (opt, oi, i0) => {
          return {
            a: common_vendor.t(opt.label),
            b: oi,
            c: common_vendor.o(($event) => doVoteFromDetail(detailItem.value, oi), oi)
          };
        })
      } : {}, {
        ah: hasCurrentUserVoted(detailItem.value)
      }, hasCurrentUserVoted(detailItem.value) ? {
        ai: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.alreadyVoted"))
      } : {}, {
        aj: common_vendor.o(() => {
        }),
        ak: common_vendor.o(($event) => detailVisible.value = false)
      }) : {}, {
        al: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6ab7a061"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/vote/vote.js.map
