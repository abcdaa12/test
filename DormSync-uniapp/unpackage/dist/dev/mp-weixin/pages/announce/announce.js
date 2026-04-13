"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "announce",
  setup(__props) {
    const showForm = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const form = common_vendor.reactive({ title: "", content: "" });
    const announceList = common_vendor.ref([]);
    const detailVisible = common_vendor.ref(false);
    const detailItem = common_vendor.ref({});
    const formatTime = (val) => val ? new Date(val).toISOString().slice(0, 10) : "";
    const formatFull = (val) => val ? new Date(val).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) : "";
    const fetchList = async () => {
      const userInfo = utils_auth.getLocalUserInfo();
      if (!userInfo.dormId)
        return;
      try {
        const res = await utils_request.get(`/api/announce/list?dormId=${userInfo.dormId}`);
        if (res.code === 200)
          announceList.value = res.data || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/announce/announce.vue:84", e);
      }
    };
    const submitAnnounce = async () => {
      if (!form.title.trim()) {
        common_vendor.index.showToast({ title: utils_i18n.t("announce.titleRequired"), icon: "none" });
        return;
      }
      const userInfo = utils_auth.getLocalUserInfo();
      try {
        const res = await utils_request.post("/api/announce/create", { dormId: userInfo.dormId, title: form.title, content: form.content });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: utils_i18n.t("announce.published"), icon: "success" });
          form.title = "";
          form.content = "";
          showForm.value = false;
          fetchList();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/announce/announce.vue:97", e);
      }
    };
    const showDetail = async (item) => {
      try {
        const res = await utils_request.get(`/api/announce/detail?announceId=${item._id}`);
        if (res.code === 200 && res.data) {
          detailItem.value = res.data;
          detailVisible.value = true;
          await utils_request.put("/api/announce/read", { announceId: item._id });
          fetchList();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/announce/announce.vue:110", e);
      }
    };
    const deleteAnnounce = (item) => {
      common_vendor.index.showModal({
        title: utils_i18n.t("announce.deleteTitle"),
        content: utils_i18n.t("announce.deleteConfirm"),
        success: async (res) => {
          if (!res.confirm)
            return;
          try {
            const r = await utils_request.del("/api/announce/delete", { announceId: item._id });
            if (r.code === 200) {
              common_vendor.index.showToast({ title: utils_i18n.t("announce.deleted"), icon: "success" });
              detailVisible.value = false;
              fetchList();
            }
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/announce/announce.vue:125", e);
          }
        }
      });
    };
    const onRefresh = async () => {
      refreshing.value = true;
      await fetchList();
      refreshing.value = false;
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("announce.title") });
      fetchList();
    });
    return (_ctx, _cache) => {
      var _a;
      return common_vendor.e({
        a: common_vendor.t(showForm.value ? common_vendor.unref(utils_i18n.t)("announce.hideForm") : "+ " + common_vendor.unref(utils_i18n.t)("announce.create")),
        b: common_vendor.o(($event) => showForm.value = !showForm.value),
        c: showForm.value
      }, showForm.value ? {
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("announce.create")),
        e: common_vendor.unref(utils_i18n.t)("announce.titlePh"),
        f: form.title,
        g: common_vendor.o(($event) => form.title = $event.detail.value),
        h: common_vendor.unref(utils_i18n.t)("announce.contentPh"),
        i: form.content,
        j: common_vendor.o(($event) => form.content = $event.detail.value),
        k: common_vendor.t(common_vendor.unref(utils_i18n.t)("announce.publish")),
        l: common_vendor.o(submitAnnounce)
      } : {}, {
        m: common_vendor.t(common_vendor.unref(utils_i18n.t)("announce.list")),
        n: announceList.value.length === 0
      }, announceList.value.length === 0 ? {
        o: common_vendor.t(common_vendor.unref(utils_i18n.t)("announce.noAnnounce"))
      } : {}, {
        p: common_vendor.f(announceList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(item.readCount),
            c: common_vendor.t(item.totalMembers),
            d: common_vendor.t((item.content || "").slice(0, 50)),
            e: common_vendor.t(item.content && item.content.length > 50 ? "..." : ""),
            f: common_vendor.t(item.creatorName),
            g: common_vendor.t(formatTime(item.createdAt)),
            h: item._id || index,
            i: common_vendor.o(($event) => showDetail(item), item._id || index)
          };
        }),
        q: common_vendor.t(common_vendor.unref(utils_i18n.t)("announce.read")),
        r: refreshing.value,
        s: common_vendor.o(onRefresh),
        t: detailVisible.value
      }, detailVisible.value ? {
        v: common_vendor.t(detailItem.value.title),
        w: common_vendor.o(($event) => detailVisible.value = false),
        x: common_vendor.t(detailItem.value.content || common_vendor.unref(utils_i18n.t)("announce.noContent")),
        y: common_vendor.t(common_vendor.unref(utils_i18n.t)("announce.publisher")),
        z: common_vendor.t(((_a = detailItem.value.creatorId) == null ? void 0 : _a.nickname) || ""),
        A: common_vendor.t(formatFull(detailItem.value.createdAt)),
        B: common_vendor.t(common_vendor.unref(utils_i18n.t)("announce.readStatus")),
        C: common_vendor.t((detailItem.value.readBy || []).length),
        D: common_vendor.t(common_vendor.unref(utils_i18n.t)("announce.people")),
        E: common_vendor.f(detailItem.value.readBy || [], (u, k0, i0) => {
          return {
            a: common_vendor.t(u.nickname),
            b: u._id
          };
        }),
        F: common_vendor.t(common_vendor.unref(utils_i18n.t)("announce.delete")),
        G: common_vendor.o(($event) => deleteAnnounce(detailItem.value)),
        H: common_vendor.o(() => {
        }),
        I: common_vendor.o(($event) => detailVisible.value = false)
      } : {}, {
        J: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-fee56dda"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/announce/announce.js.map
