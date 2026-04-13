"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "dorm-setup",
  setup(__props) {
    const mode = common_vendor.ref("create");
    const dormNumber = common_vendor.ref("");
    const loading = common_vendor.ref(false);
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("dorm.setupTitle") });
      const inviteDorm = common_vendor.index.getStorageSync("inviteDormNumber");
      if (inviteDorm) {
        mode.value = "join";
        dormNumber.value = inviteDorm;
        common_vendor.index.removeStorageSync("inviteDormNumber");
      }
    });
    const handleCreate = async () => {
      if (!dormNumber.value.trim()) {
        common_vendor.index.showToast({ title: utils_i18n.t("dorm.dormNumberRequired"), icon: "none" });
        return;
      }
      loading.value = true;
      try {
        const res = await utils_request.post("/api/dorm/create", { dormNumber: dormNumber.value.trim() });
        if (res.code === 200) {
          saveDormInfo(res.data);
          common_vendor.index.showToast({ title: utils_i18n.t("dorm.createSuccess"), icon: "success" });
          setTimeout(() => common_vendor.index.switchTab({ url: "/pages/index/index" }), 500);
        } else {
          common_vendor.index.showToast({ title: res.msg || utils_i18n.t("dorm.createFail"), icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/dorm-setup/dorm-setup.vue:94", "创建宿舍失败", e);
      } finally {
        loading.value = false;
      }
    };
    const handleJoin = async () => {
      if (!dormNumber.value.trim()) {
        common_vendor.index.showToast({ title: utils_i18n.t("dorm.dormNumberRequired"), icon: "none" });
        return;
      }
      loading.value = true;
      try {
        const res = await utils_request.post("/api/dorm/join", { dormNumber: dormNumber.value.trim() });
        if (res.code === 200) {
          saveDormInfo(res.data);
          common_vendor.index.showToast({ title: utils_i18n.t("dorm.joinSuccess"), icon: "success" });
          setTimeout(() => common_vendor.index.switchTab({ url: "/pages/index/index" }), 500);
        } else {
          common_vendor.index.showToast({ title: res.msg || utils_i18n.t("dorm.joinFail"), icon: "none" });
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/dorm-setup/dorm-setup.vue:117", "加入宿舍失败", e);
      } finally {
        loading.value = false;
      }
    };
    const saveDormInfo = (data) => {
      const info = utils_auth.getLocalUserInfo();
      info.dormId = data.dormId;
      info.dormNumber = data.dormNumber;
      common_vendor.index.setStorageSync("userInfo", info);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(utils_i18n.t)("dorm.setupTitle")),
        b: common_vendor.t(common_vendor.unref(utils_i18n.t)("dorm.setupDesc")),
        c: common_vendor.t(common_vendor.unref(utils_i18n.t)("dorm.createTab")),
        d: common_vendor.n(mode.value === "create" ? "active" : ""),
        e: common_vendor.o(($event) => mode.value = "create"),
        f: common_vendor.t(common_vendor.unref(utils_i18n.t)("dorm.joinTab")),
        g: common_vendor.n(mode.value === "join" ? "active" : ""),
        h: common_vendor.o(($event) => mode.value = "join"),
        i: mode.value === "create"
      }, mode.value === "create" ? {
        j: common_vendor.t(common_vendor.unref(utils_i18n.t)("dorm.createTip")),
        k: common_vendor.unref(utils_i18n.t)("dorm.dormNumberPh"),
        l: dormNumber.value,
        m: common_vendor.o(($event) => dormNumber.value = $event.detail.value),
        n: common_vendor.t(common_vendor.unref(utils_i18n.t)("dorm.createBtn")),
        o: loading.value,
        p: common_vendor.o(handleCreate)
      } : {}, {
        q: mode.value === "join"
      }, mode.value === "join" ? {
        r: common_vendor.t(common_vendor.unref(utils_i18n.t)("dorm.joinTip")),
        s: common_vendor.unref(utils_i18n.t)("dorm.dormNumberPh"),
        t: dormNumber.value,
        v: common_vendor.o(($event) => dormNumber.value = $event.detail.value),
        w: common_vendor.t(common_vendor.unref(utils_i18n.t)("dorm.joinBtn")),
        x: loading.value,
        y: common_vendor.o(handleJoin)
      } : {}, {
        z: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-baf89709"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/dorm-setup/dorm-setup.js.map
