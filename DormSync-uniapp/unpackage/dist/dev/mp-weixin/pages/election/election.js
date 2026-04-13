"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "election",
  setup(__props) {
    const mode = common_vendor.ref("assign");
    const memberList = common_vendor.ref([]);
    const currentLeader = common_vendor.computed(() => {
      const leader = memberList.value.find((m) => m.role === "leader");
      return leader ? leader.nickname : "-";
    });
    common_vendor.computed(() => memberList.value.filter((m) => m.role !== "leader"));
    const lotteryRunning = common_vendor.ref(false);
    const lotteryName = common_vendor.ref("?");
    const lotteryResult = common_vendor.ref("");
    let lotteryTimer = null;
    const electionVotes = common_vendor.ref({});
    const hasVoted = common_vendor.ref(false);
    const voteEnded = common_vendor.ref(false);
    const winner = common_vendor.ref("");
    const isTie = common_vendor.ref(false);
    const totalVotes = common_vendor.computed(() => Object.values(electionVotes.value).reduce((s, c) => s + c, 0));
    const voteResults = common_vendor.computed(() => {
      const total = totalVotes.value || 1;
      return memberList.value.map((m) => ({
        id: m._id,
        name: m.nickname,
        count: electionVotes.value[m._id] || 0,
        percent: Math.round((electionVotes.value[m._id] || 0) / total * 100)
      })).sort((a, b) => b.count - a.count);
    });
    const fetchMembers = async () => {
      const userInfo = utils_auth.getLocalUserInfo();
      if (!userInfo.dormId)
        return;
      try {
        const res = await utils_request.get(`/api/dorm/members?dormId=${userInfo.dormId}`);
        if (res.code === 200)
          memberList.value = res.data || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/election/election.vue:137", e);
      }
    };
    const electMember = (m) => {
      if (m.role === "leader")
        return;
      common_vendor.index.showModal({
        title: utils_i18n.t("election.confirmTitle"),
        content: `${utils_i18n.t("election.confirmMsg")} ${m.nickname}？`,
        success: async (res) => {
          if (!res.confirm)
            return;
          const userInfo = utils_auth.getLocalUserInfo();
          try {
            const r = await utils_request.post("/api/dorm/elect", { dormId: userInfo.dormId, userId: m._id });
            if (r.code === 200) {
              common_vendor.index.showToast({ title: utils_i18n.t("election.success"), icon: "success" });
              fetchMembers();
            } else {
              common_vendor.index.showToast({ title: r.msg, icon: "none" });
            }
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/election/election.vue:155", e);
          }
        }
      });
    };
    const startLottery = () => {
      if (memberList.value.length < 2)
        return;
      lotteryRunning.value = true;
      lotteryResult.value = "";
      let count = 0;
      const maxCount = 20;
      lotteryTimer = setInterval(() => {
        const idx = Math.floor(Math.random() * memberList.value.length);
        lotteryName.value = memberList.value[idx].nickname;
        count++;
        if (count >= maxCount) {
          clearInterval(lotteryTimer);
          lotteryRunning.value = false;
          lotteryResult.value = lotteryName.value;
        }
      }, 100);
    };
    const confirmLottery = async () => {
      const m = memberList.value.find((m2) => m2.nickname === lotteryResult.value);
      if (!m)
        return;
      const userInfo = utils_auth.getLocalUserInfo();
      try {
        const r = await utils_request.post("/api/dorm/elect", { dormId: userInfo.dormId, userId: m._id });
        if (r.code === 200) {
          common_vendor.index.showToast({ title: utils_i18n.t("election.success"), icon: "success" });
          resetLottery();
          fetchMembers();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/election/election.vue:189", e);
      }
    };
    const resetLottery = () => {
      lotteryResult.value = "";
      lotteryName.value = "?";
    };
    const castElectionVote = (m) => {
      common_vendor.index.showModal({
        title: utils_i18n.t("election.voteConfirmTitle"),
        content: `${utils_i18n.t("election.voteConfirmMsg")} ${m.nickname}？`,
        success: (res) => {
          if (!res.confirm)
            return;
          electionVotes.value[m._id] = (electionVotes.value[m._id] || 0) + 1;
          hasVoted.value = true;
          common_vendor.index.showToast({ title: utils_i18n.t("election.voted"), icon: "success" });
        }
      });
    };
    const endVote = () => {
      voteEnded.value = true;
      const sorted = voteResults.value.filter((r) => r.count > 0);
      if (sorted.length === 0)
        return;
      const maxCount = sorted[0].count;
      const topCandidates = sorted.filter((r) => r.count === maxCount);
      if (topCandidates.length === 1) {
        winner.value = topCandidates[0].name;
        isTie.value = false;
      } else {
        isTie.value = true;
        const idx = Math.floor(Math.random() * topCandidates.length);
        winner.value = topCandidates[idx].name;
      }
    };
    const confirmVoteWinner = async () => {
      const m = memberList.value.find((m2) => m2.nickname === winner.value);
      if (!m)
        return;
      const userInfo = utils_auth.getLocalUserInfo();
      try {
        const r = await utils_request.post("/api/dorm/elect", { dormId: userInfo.dormId, userId: m._id });
        if (r.code === 200) {
          common_vendor.index.showToast({ title: utils_i18n.t("election.success"), icon: "success" });
          electionVotes.value = {};
          hasVoted.value = false;
          voteEnded.value = false;
          winner.value = "";
          isTie.value = false;
          fetchMembers();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/election/election.vue:242", e);
      }
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("election.title") });
      fetchMembers();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.current")),
        b: common_vendor.t(currentLeader.value),
        c: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.modeAssign")),
        d: common_vendor.n(mode.value === "assign" ? "active" : ""),
        e: common_vendor.o(($event) => mode.value = "assign"),
        f: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.modeLottery")),
        g: common_vendor.n(mode.value === "lottery" ? "active" : ""),
        h: common_vendor.o(($event) => mode.value = "lottery"),
        i: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.modeVote")),
        j: common_vendor.n(mode.value === "vote" ? "active" : ""),
        k: common_vendor.o(($event) => mode.value = "vote"),
        l: mode.value === "assign"
      }, mode.value === "assign" ? {
        m: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.assignDesc")),
        n: common_vendor.f(memberList.value, (m, i, i0) => {
          return common_vendor.e({
            a: common_vendor.t((m.nickname || "?")[0]),
            b: common_vendor.t(m.nickname),
            c: m.role === "leader"
          }, m.role === "leader" ? {
            d: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.currentTag"))
          } : {
            e: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.elect"))
          }, {
            f: m._id || i,
            g: common_vendor.o(($event) => electMember(m), m._id || i)
          });
        })
      } : {}, {
        o: mode.value === "lottery"
      }, mode.value === "lottery" ? common_vendor.e({
        p: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.lotteryDesc")),
        q: common_vendor.t(lotteryName.value),
        r: lotteryRunning.value ? 1 : "",
        s: !lotteryResult.value
      }, !lotteryResult.value ? {
        t: common_vendor.t(lotteryRunning.value ? common_vendor.unref(utils_i18n.t)("election.drawing") : common_vendor.unref(utils_i18n.t)("election.startDraw")),
        v: common_vendor.o(startLottery),
        w: lotteryRunning.value
      } : {}, {
        x: lotteryResult.value
      }, lotteryResult.value ? {
        y: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.drawResult")),
        z: common_vendor.t(lotteryResult.value),
        A: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.confirmResult")),
        B: common_vendor.o(confirmLottery),
        C: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.redraw")),
        D: common_vendor.o(resetLottery)
      } : {}) : {}, {
        E: mode.value === "vote"
      }, mode.value === "vote" ? common_vendor.e({
        F: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.voteDesc")),
        G: !hasVoted.value && !voteEnded.value
      }, !hasVoted.value && !voteEnded.value ? {
        H: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.voteTip")),
        I: common_vendor.f(memberList.value, (m, i, i0) => {
          return {
            a: common_vendor.t((m.nickname || "?")[0]),
            b: common_vendor.t(m.nickname),
            c: m._id || i,
            d: common_vendor.o(($event) => castElectionVote(m), m._id || i)
          };
        }),
        J: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.voteFor"))
      } : {}, {
        K: hasVoted.value || voteEnded.value
      }, hasVoted.value || voteEnded.value ? common_vendor.e({
        L: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.voteResult")),
        M: common_vendor.f(voteResults.value, (r, i, i0) => {
          return {
            a: common_vendor.t((r.name || "?")[0]),
            b: common_vendor.t(r.name),
            c: r.percent + "%",
            d: common_vendor.t(r.count),
            e: i
          };
        }),
        N: common_vendor.t(common_vendor.unref(utils_i18n.t)("vote.ticket")),
        O: voteEnded.value && winner.value
      }, voteEnded.value && winner.value ? common_vendor.e({
        P: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.winner")),
        Q: common_vendor.t(winner.value),
        R: isTie.value
      }, isTie.value ? {
        S: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.tieNote"))
      } : {}, {
        T: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.confirmResult")),
        U: common_vendor.o(confirmVoteWinner)
      }) : {}, {
        V: !voteEnded.value
      }, !voteEnded.value ? {
        W: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.waitingVotes")),
        X: common_vendor.t(totalVotes.value),
        Y: common_vendor.t(memberList.value.length)
      } : {}, {
        Z: !voteEnded.value && totalVotes.value > 0
      }, !voteEnded.value && totalVotes.value > 0 ? {
        aa: common_vendor.t(common_vendor.unref(utils_i18n.t)("election.endVote")),
        ab: common_vendor.o(endVote)
      } : {}) : {}) : {}, {
        ac: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4c4d1550"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/election/election.js.map
