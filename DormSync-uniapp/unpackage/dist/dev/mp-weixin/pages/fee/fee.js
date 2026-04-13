"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "fee",
  setup(__props) {
    const showForm = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const members = common_vendor.ref([]);
    const memberNames = common_vendor.computed(() => members.value.map((m) => m.nickname));
    const selectedPayerIds = common_vendor.ref([]);
    const form = common_vendor.reactive({ title: "", amount: "", remark: "" });
    const feeList = common_vendor.ref([]);
    const keyword = common_vendor.ref("");
    const filterPayerIndex = common_vendor.ref(0);
    const detailVisible = common_vendor.ref(false);
    const detailItem = common_vendor.ref({});
    const filterPayerNames = common_vendor.computed(() => [utils_i18n.t("fee.allPayer"), ...memberNames.value]);
    const formatDate = (t) => t ? new Date(t).toISOString().slice(5, 10) : "";
    const formatFull = (t) => t ? new Date(t).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) : "";
    const formatMonth = (t) => {
      if (!t)
        return "";
      const d = new Date(t);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    };
    const togglePayer = (id) => {
      const idx = selectedPayerIds.value.indexOf(id);
      if (idx >= 0)
        selectedPayerIds.value.splice(idx, 1);
      else
        selectedPayerIds.value.push(id);
    };
    const onFilterPayer = (e) => {
      filterPayerIndex.value = Number(e.detail.value);
    };
    const onSearch = () => {
    };
    const filteredList = common_vendor.computed(() => {
      let list = feeList.value;
      if (keyword.value.trim()) {
        const kw = keyword.value.trim().toLowerCase();
        list = list.filter((i) => i.title.toLowerCase().includes(kw) || (i.creatorName || "").toLowerCase().includes(kw));
      }
      if (filterPayerIndex.value > 0) {
        const payerName = memberNames.value[filterPayerIndex.value - 1];
        list = list.filter((i) => i.creatorName === payerName);
      }
      return list;
    });
    const currentMonth = common_vendor.computed(() => {
      const now = /* @__PURE__ */ new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });
    const currentMonthList = common_vendor.computed(() => feeList.value.filter((i) => formatMonth(i.createdAt) === currentMonth.value));
    const monthSpend = common_vendor.computed(() => currentMonthList.value.reduce((s, i) => s + (i.amount || 0), 0).toFixed(2));
    const monthAvg = common_vendor.computed(() => {
      const mc = members.value.length || 1;
      return (currentMonthList.value.reduce((s, i) => s + (i.amount || 0), 0) / mc).toFixed(2);
    });
    const monthCount = common_vendor.computed(() => currentMonthList.value.length);
    const groupedList = common_vendor.computed(() => {
      const map = {};
      filteredList.value.forEach((item) => {
        const month = formatMonth(item.createdAt) || "未知";
        if (!map[month])
          map[month] = { month, items: [], total: 0 };
        map[month].items.push(item);
        map[month].total += item.amount || 0;
      });
      return Object.values(map).sort((a, b) => b.month.localeCompare(a.month)).map((g) => ({ ...g, total: g.total.toFixed(2) }));
    });
    const showDetail = (item) => {
      detailItem.value = {
        ...item,
        payeeNames: (item.payeeIds || []).map((p) => p.nickname || p).join("、") || "-"
      };
      detailVisible.value = true;
    };
    const fetchMembers = async () => {
      try {
        const userInfo = utils_auth.getLocalUserInfo();
        if (!userInfo.dormId)
          return;
        const res = await utils_request.get(`/api/dorm/members?dormId=${userInfo.dormId}`);
        if (res.code === 200)
          members.value = res.data || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/fee/fee.vue:205", e);
      }
    };
    const fetchList = async () => {
      try {
        const userInfo = utils_auth.getLocalUserInfo();
        if (!userInfo.dormId)
          return;
        const res = await utils_request.get(`/api/finance/list?dormId=${userInfo.dormId}`);
        if (res.code === 200) {
          feeList.value = (res.data || []).map((item) => {
            var _a;
            return {
              ...item,
              creatorName: ((_a = item.creatorId) == null ? void 0 : _a.nickname) || "",
              perPerson: (item.payeeIds && item.payeeIds.length > 0 ? item.amount / item.payeeIds.length : item.amount).toFixed(2)
            };
          });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/fee/fee.vue:220", e);
      }
    };
    const submitFee = async () => {
      if (!form.title || !form.amount) {
        common_vendor.index.showToast({ title: utils_i18n.t("fee.fillAll"), icon: "none" });
        return;
      }
      const amount = parseFloat(form.amount);
      if (isNaN(amount) || amount <= 0) {
        common_vendor.index.showToast({ title: utils_i18n.t("fee.invalidAmount"), icon: "none" });
        return;
      }
      if (selectedPayerIds.value.length === 0) {
        common_vendor.index.showToast({ title: utils_i18n.t("fee.payerPh"), icon: "none" });
        return;
      }
      const userInfo = utils_auth.getLocalUserInfo();
      try {
        const res = await utils_request.post("/api/finance/create", {
          dormId: userInfo.dormId,
          title: form.title,
          amount,
          creatorId: userInfo._id,
          payeeIds: selectedPayerIds.value
        });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: utils_i18n.t("fee.added"), icon: "success" });
          form.title = "";
          form.amount = "";
          form.remark = "";
          selectedPayerIds.value = [];
          showForm.value = false;
          fetchList();
        } else {
          common_vendor.index.showToast({ title: res.msg || utils_i18n.t("fee.fillAll"), icon: "none" });
        }
      } catch (e) {
        common_vendor.index.showToast({ title: utils_i18n.t("fee.fillAll"), icon: "none" });
      }
    };
    const onRefresh = async () => {
      refreshing.value = true;
      await fetchList();
      refreshing.value = false;
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("fee.title") });
      fetchMembers().then(() => fetchList());
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(monthSpend.value),
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.monthTotal")),
        c: common_vendor.t(monthAvg.value),
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.monthAvg")),
        e: common_vendor.t(monthCount.value),
        f: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.monthCount")),
        g: common_vendor.t(showForm.value ? common_vendor.unref(utils_i18n.t)("fee.hideForm") : "+ " + common_vendor.unref(utils_i18n.t)("fee.toggleForm")),
        h: common_vendor.o(($event) => showForm.value = !showForm.value),
        i: showForm.value
      }, showForm.value ? {
        j: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.formTitle")),
        k: common_vendor.unref(utils_i18n.t)("fee.namePh"),
        l: form.title,
        m: common_vendor.o(($event) => form.title = $event.detail.value),
        n: common_vendor.unref(utils_i18n.t)("fee.amountPh"),
        o: form.amount,
        p: common_vendor.o(($event) => form.amount = $event.detail.value),
        q: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.payerPh")),
        r: common_vendor.f(members.value, (m, idx, i0) => {
          return {
            a: common_vendor.t(m.nickname),
            b: m._id,
            c: common_vendor.n(selectedPayerIds.value.includes(m._id) ? "payer-active" : ""),
            d: common_vendor.o(($event) => togglePayer(m._id), m._id)
          };
        }),
        s: common_vendor.unref(utils_i18n.t)("fee.remarkPh"),
        t: form.remark,
        v: common_vendor.o(($event) => form.remark = $event.detail.value),
        w: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.submit")),
        x: common_vendor.o(submitFee)
      } : {}, {
        y: common_vendor.unref(utils_i18n.t)("fee.searchPh"),
        z: common_vendor.o([($event) => keyword.value = $event.detail.value, onSearch]),
        A: keyword.value,
        B: common_vendor.t(filterPayerNames.value[filterPayerIndex.value]),
        C: filterPayerNames.value,
        D: common_vendor.o(onFilterPayer),
        E: filterPayerIndex.value,
        F: groupedList.value.length === 0
      }, groupedList.value.length === 0 ? {
        G: common_vendor.t(keyword.value || filterPayerIndex.value > 0 ? common_vendor.unref(utils_i18n.t)("fee.noResult") : common_vendor.unref(utils_i18n.t)("fee.noRecord"))
      } : {}, {
        H: common_vendor.f(groupedList.value, (group, gi, i0) => {
          return {
            a: common_vendor.t(group.month),
            b: common_vendor.t(group.total),
            c: common_vendor.f(group.items, (item, index, i1) => {
              return {
                a: common_vendor.t(item.title),
                b: common_vendor.t(item.creatorName),
                c: common_vendor.t(formatDate(item.createdAt)),
                d: common_vendor.t(item.amount),
                e: common_vendor.t(item.perPerson),
                f: item._id || index,
                g: common_vendor.o(($event) => showDetail(item), item._id || index)
              };
            }),
            d: gi
          };
        }),
        I: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.monthTotal")),
        J: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.perPerson")),
        K: refreshing.value,
        L: common_vendor.o(onRefresh),
        M: detailVisible.value
      }, detailVisible.value ? {
        N: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.detail")),
        O: common_vendor.o(($event) => detailVisible.value = false),
        P: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.formTitle")),
        Q: common_vendor.t(detailItem.value.title),
        R: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.amount")),
        S: common_vendor.t(detailItem.value.amount),
        T: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.payer")),
        U: common_vendor.t(detailItem.value.creatorName),
        V: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.perPerson")),
        W: common_vendor.t(detailItem.value.perPerson),
        X: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.participants")),
        Y: common_vendor.t(detailItem.value.payeeNames || "-"),
        Z: common_vendor.t(common_vendor.unref(utils_i18n.t)("fee.time")),
        aa: common_vendor.t(formatFull(detailItem.value.createdAt)),
        ab: common_vendor.o(() => {
        }),
        ac: common_vendor.o(($event) => detailVisible.value = false)
      } : {}, {
        ad: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fe67f23b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/fee/fee.js.map
