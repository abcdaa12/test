/**
 * 轻量 i18n 国际化工具
 * 用法：import { t } from '@/utils/i18n.js'
 *       模板中：{{ t('home.title') }}
 * 
 * t 是响应式的，切换语言后页面自动更新
 */
import { ref } from 'vue'
import zhCN from './lang/zh-CN.js'
import en from './lang/en.js'
import ko from './lang/ko.js'
import ja from './lang/ja.js'

const messages = { 'zh-CN': zhCN, en, ko, ja }

// 响应式语言标记（用于触发模板重新计算）
export const currentLang = ref(uni.getStorageSync('language') || 'zh-CN')

// 设置语言
export const setLang = (lang) => {
    currentLang.value = lang
    uni.setStorageSync('language', lang)
    updateTabBar()
}

// 动态更新 tabBar 文字
export const updateTabBar = () => {
    const tabs = ['home', 'message', 'more', 'mine']
    tabs.forEach((key, index) => {
        try {
            uni.setTabBarItem({ index, text: t(`tab.${key}`) })
        } catch (e) {
            console.warn('非 TabBar 页面无法设置 TabBarItem', e)
        }
    })
}

/**
 * 翻译函数（响应式）
 * 模板中使用 t('mine.profile') 会自动跟踪 currentLang 的变化
 */
export const t = (key) => {
    // 访问 currentLang.value 使 Vue 追踪依赖
    const lang = currentLang.value
    const keys = key.split('.')
    let val = messages[lang]
    for (const k of keys) {
        if (val && typeof val === 'object') val = val[k]
        else return key
    }
    return val || key
}
