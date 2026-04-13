"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("./request.js");
const DEFAULT_USER_INFO = {
  nickname: "宿舍成员",
  avatarUrl: "",
  openid: ""
};
const downloadAvatarToLocal = (serverPath) => {
  const url = serverPath.startsWith("http") ? serverPath : utils_request.BASE_URL + serverPath;
  return new Promise((resolve) => {
    common_vendor.index.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200 && res.tempFilePath) {
          resolve(res.tempFilePath);
        } else {
          resolve("");
        }
      },
      fail: () => resolve("")
    });
  });
};
const wxLogin = () => {
  return new Promise((resolve, reject) => {
    common_vendor.index.login({
      provider: "weixin",
      success: async (loginRes) => {
        if (!loginRes.code) {
          common_vendor.index.showToast({ title: "登录失败，请重试", icon: "none" });
          reject(new Error("wx.login 未获取到 code"));
          return;
        }
        try {
          const res = await utils_request.post("/api/user/login", { code: loginRes.code });
          if (res.code === 200 && res.data) {
            const { token, userInfo } = res.data;
            let avatarUrl = "";
            if (userInfo.avatar) {
              avatarUrl = await downloadAvatarToLocal(userInfo.avatar);
            }
            const finalUserInfo = {
              _id: userInfo._id || "",
              openid: userInfo.openid || "",
              nickname: userInfo.nickname || DEFAULT_USER_INFO.nickname,
              avatarUrl,
              avatarServer: userInfo.avatar || "",
              phone: userInfo.phone || "",
              className: userInfo.class || "",
              signature: userInfo.signature || "",
              dormId: userInfo.dormId || "",
              role: userInfo.role || "member"
            };
            common_vendor.index.setStorageSync("token", token);
            common_vendor.index.setStorageSync("userInfo", finalUserInfo);
            common_vendor.index.setStorageSync("userId", userInfo._id || "");
            common_vendor.index.__f__("log", "at utils/auth.js:77", "登录成功：", finalUserInfo.nickname, "头像:", avatarUrl);
            resolve(finalUserInfo);
          } else {
            common_vendor.index.showToast({ title: res.message || "登录失败", icon: "none" });
            reject(new Error(res.message || "后端返回异常"));
          }
        } catch (err) {
          common_vendor.index.__f__("error", "at utils/auth.js:84", "登录接口调用失败：", err);
          common_vendor.index.showToast({ title: "登录失败，请重试", icon: "none" });
          reject(err);
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at utils/auth.js:90", "wx.login 调用失败：", err);
        common_vendor.index.showToast({ title: "登录失败，请重试", icon: "none" });
        reject(err);
      }
    });
  });
};
const isLoggedIn = () => {
  return !!common_vendor.index.getStorageSync("token");
};
const getLocalUserInfo = () => {
  return common_vendor.index.getStorageSync("userInfo") || { ...DEFAULT_USER_INFO };
};
const clearAuth = () => {
  common_vendor.index.removeStorageSync("token");
  common_vendor.index.removeStorageSync("userInfo");
  common_vendor.index.removeStorageSync("userId");
};
exports.clearAuth = clearAuth;
exports.getLocalUserInfo = getLocalUserInfo;
exports.isLoggedIn = isLoggedIn;
exports.wxLogin = wxLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/auth.js.map
