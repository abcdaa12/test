"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "members",
  setup(__props) {
    const memberList = common_vendor.ref([]);
    const fetchMembers = async () => {
      try {
        const userInfo = utils_auth.getLocalUserInfo();
        if (!userInfo.dormId)
          return;
        const res = await utils_request.get(`/api/dorm/members?dormId=${userInfo.dormId}`);
        if (res.code === 200)
          memberList.value = res.data || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/members/members.vue:36", "获取成员失败", e);
      }
    };
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("members.title") });
      fetchMembers();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(common_vendor.unref(utils_i18n.t)("members.title")),
        b: common_vendor.t(memberList.value.length),
        c: common_vendor.f(memberList.value, (m, i, i0) => {
          return common_vendor.e({
            a: m.avatar
          }, m.avatar ? {
            b: m.avatar
          } : {
            c: common_vendor.t((m.nickname || "?")[0])
          }, {
            d: common_vendor.t(m.nickname || common_vendor.unref(utils_i18n.t)("mine.defaultSign")),
            e: common_vendor.t(m.role === "leader" ? "🏆 " + common_vendor.unref(utils_i18n.t)("members.leader") : common_vendor.unref(utils_i18n.t)("members.member")),
            f: m.phone
          }, m.phone ? {
            g: common_vendor.t(m.phone)
          } : {}, {
            h: m._id || i
          });
        }),
        d: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e9ff4301"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/members/members.js.map
