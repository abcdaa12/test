/**
 * main.js - 应用入口文件
 * 初始化 Vue3 实例，挂载全局工具
 */
import App from './App'
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)

  // 可在此处挂载全局属性或插件
  // 例如：app.config.globalProperties.$request = request

  return {
    app
  }
}
