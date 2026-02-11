<script setup>
/**
 * App.vue - 应用入口组件
 * 配置全局生命周期和全局样式
 */
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
	console.log('App Launch - 宿舍协同管理小程序启动')
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

/* 页面基础样式 */
page {
	background-color: #f5f5f5;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	font-size: 28rpx;
	color: #333;
	box-sizing: border-box;
}

/* 通用容器 */
.container {
	padding: 24rpx;
}

/* 卡片样式 */
.card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

/* 主按钮样式 */
.btn-primary {
	background-color: #4A90D9;
	color: #fff;
	border-radius: 12rpx;
	font-size: 30rpx;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
}

/* 表单输入框 */
.input {
	border: 1rpx solid #ddd;
	border-radius: 8rpx;
	padding: 16rpx 20rpx;
	font-size: 28rpx;
	margin-bottom: 20rpx;
	background-color: #fafafa;
}
</style>
