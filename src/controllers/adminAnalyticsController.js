import orderModel from '../models/orderModel.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Total revenue
        const revenueResult = await orderModel.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Total orders
        const totalOrders = await orderModel.countDocuments();

        // Active users (users who have placed at least one order)
        const activeUsers = await orderModel.distinct('userId');

        // Average order value
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Orders this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const ordersThisMonth = await orderModel.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Revenue this month
        const revenueThisMonthResult = await orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    status: { $ne: 'cancelled' }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const revenueThisMonth = revenueThisMonthResult[0]?.total || 0;

        res.status(200).json({
            totalRevenue,
            totalOrders,
            activeUsersCount: activeUsers.length,
            avgOrderValue,
            ordersThisMonth,
            revenueThisMonth
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
    }
};

// Get revenue chart data (last 30 days)
export const getRevenueChart = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueData = await orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalPrice' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ data: revenueData });
    } catch (error) {
        console.error('Get revenue chart error:', error);
        res.status(500).json({ message: 'Failed to fetch revenue chart', error: error.message });
    }
};

// Get orders by status chart
export const getOrdersChart = async (req, res) => {
    try {
        const ordersData = await orderModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({ data: ordersData });
    } catch (error) {
        console.error('Get orders chart error:', error);
        res.status(500).json({ message: 'Failed to fetch orders chart', error: error.message });
    }
};

// Get top selling products
export const getTopProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const topProducts = await Product.find()
            .sort({ soldCount: -1 })
            .limit(limit)
            .select('title imgUrl soldCount price category');

        res.status(200).json({ products: topProducts });
    } catch (error) {
        console.error('Get top products error:', error);
        res.status(500).json({ message: 'Failed to fetch top products', error: error.message });
    }
};

// Get sales by category
export const getSalesByCategory = async (req, res) => {
    try {
        const salesData = await orderModel.aggregate([
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.category',
                    sales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
                    count: { $sum: '$items.quantity' }
                }
            },
            { $sort: { sales: -1 } }
        ]);

        res.status(200).json({ data: salesData });
    } catch (error) {
        console.error('Get sales by category error:', error);
        res.status(500).json({ message: 'Failed to fetch sales by category', error: error.message });
    }
};

// Get recent orders
export const getRecentOrders = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const recentOrders = await orderModel.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'name email')
            .select('_id totalPrice status createdAt userId');

        res.status(200).json({ orders: recentOrders });
    } catch (error) {
        console.error('Get recent orders error:', error);
        res.status(500).json({ message: 'Failed to fetch recent orders', error: error.message });
    }
};
