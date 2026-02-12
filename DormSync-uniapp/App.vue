<script setup>
/**
 * App.vue - 应用入口组件
 * - 全局生命周期管理
 * - 小程序首次打开时自动触发微信登录
 */
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { isLoggedIn } from './utils/auth'

onLaunch(() => {
	console.log('App Launch - 宿舍协同管理小程序启动')

	if (isLoggedIn()) {
		// 已登录，直接跳到首页
		console.log('本地已有登录态，跳转首页')
		uni.switchTab({ url: '/pages/index/index' })
	}
	// 未登录时停留在登录页（pages.json 第一个页面就是 login）
})

onShow(() => {
	console.log('App Show - 小程序进入前台')
})

onHide(() => {
	console.log('App Hide - 小程序进入后台')
})
</script>

<style>
/* ========== 全局样式 ========== */

page {
	background-color: #f5f5f5;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	font-size: 28rpx;
	color: #333;
	box-sizing: border-box;
}

.container {
	padding: 24rpx;
}

.card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn-primary {
	background-color: #1677FF;
	color: #fff;
	border-radius: 12rpx;
	font-size: 30rpx;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
}

.input {
	border: 1rpx solid #ddd;
	border-radius: 8rpx;
	padding: 16rpx 20rpx;
	font-size: 28rpx;
	margin-bottom: 20rpx;
	background-color: #fafafa;
}
</style>
