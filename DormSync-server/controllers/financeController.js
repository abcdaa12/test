/**
 * controllers/financeController.js - 财务管理业务逻辑
 * 接口：发起收款、查看财务记录、删除财务记录
 */
const Finance = require('../models/Finance')
const Dorm = require('../models/Dorm')
const { createNotification } = require('./messageController')

/**
 * 发起收款
 * POST /api/finance/create
 */
exports.createFinance = async (req, res, next) => {
    try {
        const { dormId, title, amount, creatorId, payeeIds } = req.body
        if (!dormId || !title || amount == null || !creatorId) {
            return res.json({ code: 400, msg: '缺少必填参数', data: null })
        }
        if (amount <= 0) {
            return res.json({ code: 400, msg: '金额必须大于0', data: null })
        }
        const finance = await Finance.create({
            dormId, title, amount, creatorId,
            payeeIds: payeeIds || [],
            status: 'unpaid'
        })
        res.json({ code: 200, msg: '收款发起成功', data: finance })
        // 异步通知宿舍成员
        try {
            const dorm = await Dorm.findById(dormId)
            if (dorm) {
                const otherMembers = dorm.members.filter(id => id.toString() !== creatorId)
                const io = req.app.get('io') // 获取 app.js 中挂载的 socket.io 实例
                await createNotification({
                    userIds: otherMembers,
                    type: 'finance',
                    content: `收款通知：${title} ¥${amount}`
                }, io) // 传入 io 实例触发 WebSocket 推送
            }
        } catch (e) { console.error('发送财务通知失败', e) }
    } catch (err) {
        next(err)
    }
}

/**
 * 查看宿舍财务记录
 * GET /api/finance/list?dormId=xxx
 */
exports.getFinanceList = async (req, res, next) => {
    try {
        const { dormId } = req.query
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null })
        }
        const list = await Finance.find({ dormId })
            .populate('creatorId', 'nickname avatar')
            .populate('payeeIds', 'nickname avatar')
            .sort({ createdAt: -1 })
        res.json({ code: 200, msg: '查询成功', data: list })
    } catch (err) {
        next(err)
    }
}

/**
 * 财务数据统计聚合 (用于 ECharts 可视化大屏)
 * GET /api/finance/statistics?dormId=xxx
 */
exports.getFinanceStatistics = async (req, res, next) => {
    try {
        const { dormId } = req.query;
        if (!dormId) {
            return res.json({ code: 400, msg: '缺少参数 dormId', data: null });
        }
        
        // 确保 dormId 是有效的 ObjectId
        const mongoose = require('mongoose');
        const dormObjectId = new mongoose.Types.ObjectId(dormId);

        // 1. 饼图数据：按费用标题关键词分类聚合 (电费/水费/聚餐/其他)
        const allFinances = await Finance.find({ dormId });
        
        let categories = {
            '电费': 0,
            '水费': 0,
            '聚餐/外卖': 0,
            '日用品': 0,
            '其他': 0
        };

        allFinances.forEach(f => {
            const title = f.title || '';
            const amount = f.amount || 0;
            if (title.includes('电')) categories['电费'] += amount;
            else if (title.includes('水')) categories['水费'] += amount;
            else if (title.includes('餐') || title.includes('饭') || title.includes('外卖')) categories['聚餐/外卖'] += amount;
            else if (title.includes('纸') || title.includes('垃圾袋') || title.includes('拖把') || title.includes('洁')) categories['日用品'] += amount;
            else categories['其他'] += amount;
        });

        const pieData = Object.keys(categories)
            .filter(key => categories[key] > 0)
            .map(key => ({
                name: key,
                value: Number(categories[key].toFixed(2))
            }));

        // 2. 折线图数据：近 6 个月的费用趋势
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // 从6个月前的1号开始
        
        const trendData = await Finance.aggregate([
            {
                $match: {
                    dormId: dormObjectId,
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { 
                        year: { $year: "$createdAt" }, 
                        month: { $month: "$createdAt" } 
                    },
                    totalAmount: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 格式化折线图数据
        const lineCategories = [];
        const lineSeries = [];
        
        // 生成近6个月的完整月份数组，保证没有数据的月份显示0
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        for (let i = 5; i >= 0; i--) {
            let d = new Date(currentYear, currentMonth - 1 - i, 1);
            let label = `${d.getMonth() + 1}月`;
            lineCategories.push(label);
            
            // 在聚合结果中查找该月数据
            let match = trendData.find(item => item._id.year === d.getFullYear() && item._id.month === (d.getMonth() + 1));
            lineSeries.push(match ? Number(match.totalAmount.toFixed(2)) : 0);
        }

        res.json({
            code: 200,
            msg: '获取财务统计数据成功',
            data: {
                pieChart: pieData,
                lineChart: {
                    categories: lineCategories,
                    series: [{
                        name: "月度总支出",
                        data: lineSeries
                    }]
                }
            }
        });
    } catch (err) {
        next(err);
    }
}

/**
 * 删除财务记录
 * DELETE /api/finance/delete
 * Body: { financeId }
 */
exports.deleteFinance = async (req, res, next) => {
    try {
        const { financeId } = req.body
        if (!financeId) {
            return res.json({ code: 400, msg: '缺少参数 financeId', data: null })
        }
        const finance = await Finance.findByIdAndDelete(financeId)
        if (!finance) return res.json({ code: 404, msg: '记录不存在', data: null })
        res.json({ code: 200, msg: '删除成功', data: null })
    } catch (err) {
        next(err)
    }
}
