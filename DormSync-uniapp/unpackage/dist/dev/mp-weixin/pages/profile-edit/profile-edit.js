"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
const utils_i18n = require("../../utils/i18n.js");
const utils_theme = require("../../utils/theme.js");
const _sfc_main = {
  __name: "profile-edit",
  setup(__props) {
    const saving = common_vendor.ref(false);
    const editing = common_vendor.ref(false);
    const isFirstSetup = common_vendor.ref(false);
    const localAvatarPath = common_vendor.ref("");
    const form = common_vendor.reactive({ avatar: "", nickname: "", signature: "", phone: "", className: "" });
    common_vendor.onLoad((options) => {
      isFirstSetup.value = options.first === "1";
      if (isFirstSetup.value)
        editing.value = true;
      const info = utils_auth.getLocalUserInfo();
      form.avatar = info.avatarUrl || "";
      form.nickname = info.nickname === "宿舍成员" ? "" : info.nickname || "";
      form.signature = info.signature || "";
      form.phone = info.phone || "";
      form.className = info.className || info.class || "";
      common_vendor.index.setNavigationBarTitle({ title: utils_i18n.t("profile.title") });
    });
    common_vendor.onShow(() => {
      utils_theme.applyNavBarTheme();
    });
    const onChooseAvatar = (e) => {
      const url = e.detail.avatarUrl;
      if (!url)
        return;
      form.avatar = url;
      localAvatarPath.value = url;
    };
    const handleSave = async () => {
      if (!form.nickname.trim()) {
        common_vendor.index.showToast({ title: utils_i18n.t("profile.nameRequired"), icon: "none" });
        return;
      }
      saving.value = true;
      try {
        let avatarForDB = "";
        if (localAvatarPath.value) {
          try {
            avatarForDB = await uploadAvatar(localAvatarPath.value);
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/profile-edit/profile-edit.vue:97", "头像上传失败", e);
          }
        }
        if (!avatarForDB) {
          const info = utils_auth.getLocalUserInfo();
          if (info.avatarServer)
            avatarForDB = info.avatarServer;
        }
        const userId = common_vendor.index.getStorageSync("userId");
        const res = await utils_request.put("/api/user/update", {
          userId,
          avatar: avatarForDB,
          nickname: form.nickname.trim(),
          signature: form.signature.trim(),
          phone: form.phone.trim(),
          class: form.className.trim()
        });
        if (res.code === 200) {
          const info = utils_auth.getLocalUserInfo();
          common_vendor.index.setStorageSync("userInfo", {
            ...info,
            avatarUrl: localAvatarPath.value || form.avatar || info.avatarUrl,
            avatarServer: avatarForDB || info.avatarServer || "",
            nickname: form.nickname.trim(),
            signature: form.signature.trim(),
            phone: form.phone.trim(),
            className: form.className.trim()
          });
          common_vendor.index.showToast({ title: utils_i18n.t("profile.saveSuccess"), icon: "success" });
          if (isFirstSetup.value) {
            setTimeout(() => {
              const info2 = utils_auth.getLocalUserInfo();
              if (!info2.dormId) {
                common_vendor.index.redirectTo({ url: "/pages/dorm-setup/dorm-setup" });
              } else {
                common_vendor.index.switchTab({ url: "/pages/index/index" });
              }
            }, 500);
          } else {
            editing.value = false;
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/profile-edit/profile-edit.vue:133", "保存失败", e);
        common_vendor.index.showToast({ title: utils_i18n.t("profile.saveFail"), icon: "none" });
      } finally {
        saving.value = false;
      }
    };
    const uploadAvatar = (filePath) => {
      return new Promise((resolve, reject) => {
        common_vendor.index.uploadFile({
          url: utils_request.BASE_URL + "/api/user/upload-avatar",
          filePath,
          name: "file",
          success: (r) => {
            try {
              const d = JSON.parse(r.data);
              if (d.code === 200)
                resolve(d.data.url);
              else
                reject(new Error("上传失败"));
            } catch (e) {
              reject(e);
            }
          },
          fail: reject
        });
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: editing.value
      }, editing.value ? common_vendor.e({
        b: form.avatar
      }, form.avatar ? {
        c: form.avatar
      } : {}, {
        d: common_vendor.t(common_vendor.unref(utils_i18n.t)("profile.changeAvatar")),
        e: common_vendor.o(onChooseAvatar)
      }) : common_vendor.e({
        f: form.avatar
      }, form.avatar ? {
        g: form.avatar
      } : {}), {
        h: common_vendor.t(common_vendor.unref(utils_i18n.t)("profile.name")),
        i: editing.value
      }, editing.value ? {
        j: common_vendor.unref(utils_i18n.t)("profile.namePh"),
        k: form.nickname,
        l: common_vendor.o(($event) => form.nickname = $event.detail.value)
      } : {
        m: common_vendor.t(form.nickname || common_vendor.unref(utils_i18n.t)("profile.notSet"))
      }, {
        n: common_vendor.t(common_vendor.unref(utils_i18n.t)("profile.signature")),
        o: editing.value
      }, editing.value ? {
        p: common_vendor.unref(utils_i18n.t)("profile.signaturePh"),
        q: form.signature,
        r: common_vendor.o(($event) => form.signature = $event.detail.value)
      } : {
        s: common_vendor.t(form.signature || common_vendor.unref(utils_i18n.t)("profile.notSet"))
      }, {
        t: common_vendor.t(common_vendor.unref(utils_i18n.t)("profile.phone")),
        v: editing.value
      }, editing.value ? {
        w: common_vendor.unref(utils_i18n.t)("profile.phonePh"),
        x: form.phone,
        y: common_vendor.o(($event) => form.phone = $event.detail.value)
      } : {
        z: common_vendor.t(form.phone || common_vendor.unref(utils_i18n.t)("profile.notSet"))
      }, {
        A: common_vendor.t(common_vendor.unref(utils_i18n.t)("profile.className")),
        B: editing.value
      }, editing.value ? {
        C: common_vendor.unref(utils_i18n.t)("profile.classPh"),
        D: form.className,
        E: common_vendor.o(($event) => form.className = $event.detail.value)
      } : {
        F: common_vendor.t(form.className || common_vendor.unref(utils_i18n.t)("profile.notSet"))
      }, {
        G: editing.value
      }, editing.value ? {
        H: common_vendor.t(common_vendor.unref(utils_i18n.t)("profile.save")),
        I: saving.value,
        J: common_vendor.o(handleSave)
      } : {
        K: common_vendor.t(common_vendor.unref(utils_i18n.t)("profile.edit")),
        L: common_vendor.o(($event) => editing.value = true)
      }, {
        M: common_vendor.n(common_vendor.unref(utils_theme.isDark) ? "dark-mode" : "")
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b59caf64"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile-edit/profile-edit.js.map
