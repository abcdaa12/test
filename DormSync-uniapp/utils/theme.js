/**
 * 夜间模式管理工具
 * 用法：import { isDark, toggleDark } from '@/utils/theme.js'
 *       模板中：:class="{ 'dark-mode': isDark }"
 */
import { ref } from 'vue'

export const isDark = ref(false)

/** 初始化主题（App.vue 启动时调用） */
export const initTheme = () => {
    isDark.value = uni.getStorageSync('darkMode') === true
    applyNavBarTheme()
}

/** 切换夜间模式 */
export const toggleDark = () => {
    isDark.value = !isDark.value
    uni.setStorageSync('darkMode', isDark.value)
    applyNavBarTheme()
}

/** 设置导航栏和 tabBar 颜色 */
export const applyNavBarTheme = () => {
    const bg = isDark.value ? '#1a1a1a' : '#ffffff'
    const front = isDark.value ? '#ffffff' : '#000000'
    const style = isDark.value ? 'white' : 'black'

    uni.setNavigationBarColor({
        frontColor: front,
        backgroundColor: bg,
        animation: { duration: 200, timingFunc: 'easeIn' }
    })
    uni.setTabBarStyle({
        backgroundColor: isDark.value ? '#1a1a1a' : '#ffffff',
        borderStyle: isDark.value ? 'white' : 'black',
        color: isDark.value ? '#999999' : '#999999',
        selectedColor: isDark.value ? '#5b9bf5' : '#1677FF'
    })
}
