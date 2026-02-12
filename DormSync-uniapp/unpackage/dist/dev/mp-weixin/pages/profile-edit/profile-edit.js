"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = {
  __name: "profile-edit",
  setup(__props) {
    const saving = common_vendor.ref(false);
    const isFirstSetup = common_vendor.ref(false);
    const localAvatarPath = common_vendor.ref("");
    const form = common_vendor.reactive({
      avatar: "",
      nickname: "",
      signature: "",
      phone: "",
      className: ""
    });
    common_vendor.onLoad((options) => {
      isFirstSetup.value = options.first === "1";
      const info = utils_auth.getLocalUserInfo();
      form.avatar = info.avatarUrl || "";
      form.nickname = info.nickname === "宿舍成员" ? "" : info.nickname || "";
      form.signature = info.signature || "";
      form.phone = info.phone || "";
      form.className = info.className || info.class || "";
    });
    const onChooseAvatar = (e) => {
      common_vendor.index.__f__("log", "at pages/profile-edit/profile-edit.vue:70", "chooseAvatar 回调:", e.detail);
      const url = e.detail.avatarUrl;
      if (!url)
        return;
      form.avatar = url;
      localAvatarPath.value = url;
    };
    const handleSave = async () => {
      if (!form.nickname.trim()) {
        common_vendor.index.showToast({ title: "请输入姓名", icon: "none" });
        return;
      }
      saving.value = true;
      try {
        let avatarForDB = "";
        if (localAvatarPath.value) {
          try {
            avatarForDB = await uploadAvatar(localAvatarPath.value);
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/profile-edit/profile-edit.vue:88", "头像上传失败", e);
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
          const updated = {
            ...info,
            avatarUrl: localAvatarPath.value || form.avatar || info.avatarUrl,
            avatarServer: avatarForDB || info.avatarServer || "",
            nickname: form.nickname.trim(),
            signature: form.signature.trim(),
            phone: form.phone.trim(),
            className: form.className.trim()
          };
          common_vendor.index.setStorageSync("userInfo", updated);
          common_vendor.index.showToast({ title: "保存成功", icon: "success" });
          setTimeout(() => {
            if (isFirstSetup.value)
              common_vendor.index.switchTab({ url: "/pages/index/index" });
            else
              common_vendor.index.navigateBack();
          }, 500);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/profile-edit/profile-edit.vue:124", "保存失败", e);
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
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
          success: (uploadRes) => {
            try {
              const data = JSON.parse(uploadRes.data);
              if (data.code === 200)
                resolve(data.data.url);
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
        a: form.avatar
      }, form.avatar ? {
        b: form.avatar
      } : {}, {
        c: common_vendor.o(onChooseAvatar),
        d: form.nickname,
        e: common_vendor.o(($event) => form.nickname = $event.detail.value),
        f: form.signature,
        g: common_vendor.o(($event) => form.signature = $event.detail.value),
        h: form.phone,
        i: common_vendor.o(($event) => form.phone = $event.detail.value),
        j: form.className,
        k: common_vendor.o(($event) => form.className = $event.detail.value),
        l: saving.value,
        m: common_vendor.o(handleSave)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b59caf64"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile-edit/profile-edit.js.map
