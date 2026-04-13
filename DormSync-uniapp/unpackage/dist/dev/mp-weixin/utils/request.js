"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://192.168.5.5:3000";
const TIMEOUT = 6e4;
const request = (options = {}) => {
  return new Promise((resolve, reject) => {
    const header = {
      "Content-Type": "application/json",
      ...options.header
    };
    const token = common_vendor.index.getStorageSync("token");
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }
    common_vendor.index.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header,
      timeout: TIMEOUT,
      success: (res) => {
        const { statusCode, data } = res;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(data);
        } else if (statusCode === 401) {
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.removeStorageSync("userInfo");
          common_vendor.index.removeStorageSync("userId");
          common_vendor.index.showToast({ title: "登录已过期，请重新登录", icon: "none" });
          setTimeout(() => {
            common_vendor.index.switchTab({ url: "/pages/mine/mine" });
          }, 1500);
          reject(res);
        } else {
          common_vendor.index.showToast({
            title: data.message || "请求失败",
            icon: "none"
          });
          reject(res);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
        reject(err);
      }
    });
  });
};
const get = (url, data) => request({ url, method: "GET", data });
const post = (url, data) => request({ url, method: "POST", data });
const put = (url, data) => request({ url, method: "PUT", data });
const del = (url, data) => request({ url, method: "DELETE", data });
exports.BASE_URL = BASE_URL;
exports.del = del;
exports.get = get;
exports.post = post;
exports.put = put;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
