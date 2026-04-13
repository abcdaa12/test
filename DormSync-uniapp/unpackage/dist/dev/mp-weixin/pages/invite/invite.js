"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "invite",
  setup(__props) {
    const phone = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    const dormNumber = common_vendor.ref("");
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("invite.title") });
      fetchDormNumber();
    });
    const fetchDormNumber = async () => {
      const info = utils_auth.getLocalUserInfo();
      if (!info.dormId)
        return;
      try {
        const res = await utils_request.get(`/api/dorm/info?dormId=${info.dormId}`);
        if (res.code === 200 && res.data) {
          dormNumber.value = res.data.dormNumber || "";
          info.dormNumber = dormNumber.value;
          common_vendor.index.setStorageSync("userInfo", info);
        }
      } catch (e) {
        dormNumber.value = info.dormNumber || "";
      }
    };
    common_vendor.onShareAppMessage(() => {
      utils_auth.getLocalUserInfo();
      return {
        title: utils_i18n.t("invite.shareCardTitle") + " " + dormNumber.value,
        path: `/pages/login/login?dormNumber=${encodeURIComponent(dormNumber.value)}`,
        imageUrl: "/static/logo.png"
      };
    });
    const handleInvite = async () => {
      var _a;
      if (!phone.value.trim()) {
        common_vendor.index.showToast({ title: utils_i18n.t("invite.phoneRequired"), icon: "none" });
        return;
      }
      if (phone.value.trim().length !== 11) {
        common_vendor.index.showToast({ title: utils_i18n.t("invite.phoneInvalid"), icon: "none" });
        return;
      }
      const info = utils_auth.getLocalUserInfo();
      if (!info.dormId) {
        common_vendor.index.showToast({ title: utils_i18n.t("dorm.noDorm"), icon: "none" });
        return;
      }
      loading.value = true;
      try {
        const res = await utils_request.post("/api/dorm/invite", { dormId: info.dormId, phone: phone.value.trim() });
        if (res.code === 200) {
          common_vendor.index.showToast({ title: `${utils_i18n.t("invite.success")}${((_a = res.data) == null ? void 0 : _a.nickname) ? " (" + res.data.nickname + ")" : ""}`, icon: "success" });
          phone.value = "";
        } else {
          common_vendor.index.showToast({ title: res.msg || utils_i18n.t("invite.fail"), icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/invite/invite.vue:108", "邀请失败", e);
      } finally {
        loading.value = false;
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(common_vendor.unref(utils_i18n.t)("invite.title")),
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("invite.desc")),
        c: common_vendor.t(common_vendor.unref(utils_i18n.t)("invite.shareTitle")),
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("invite.shareDesc")),
        e: common_vendor.t(common_vendor.unref(utils_i18n.t)("invite.shareBtn")),
        f: common_vendor.t(common_vendor.unref(utils_i18n.t)("invite.phoneLabel")),
        g: common_vendor.unref(utils_i18n.t)("invite.phonePh"),
        h: phone.value,
        i: common_vendor.o(($event) => phone.value = $event.detail.value),
        j: common_vendor.t(common_vendor.unref(utils_i18n.t)("invite.btn")),
        k: loading.value,
        l: common_vendor.o(handleInvite),
        m: common_vendor.t(common_vendor.unref(utils_i18n.t)("invite.dormLabel")),
        n: common_vendor.t(dormNumber.value),
        o: common_vendor.t(common_vendor.unref(utils_i18n.t)("invite.dormTip")),
        p: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-34e3eabd"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/invite/invite.js.map
