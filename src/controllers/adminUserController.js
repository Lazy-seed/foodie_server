import User from '../models/User.js';
import orderModel from '../models/orderModel.js';

// Get all users with pagination and search
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password -refreshToken -resetPasswordToken')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Get order count and total spent for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const orderCount = await orderModel.countDocuments({ userId: user._id });
            const orderStats = await orderModel.aggregate([
                { $match: { userId: user._id, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, totalSpent: { $sum: '$totalPrice' } } }
            ]);

            return {
                ...user.toObject(),
                orderCount,
                totalSpent: orderStats[0]?.totalSpent || 0
            };
        }));

        res.status(200).json({
            users: usersWithStats,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

// Get user by ID with order history
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password -refreshToken -resetPasswordToken');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's orders
        const orders = await orderModel.find({ userId: id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('items.productId', 'title imgUrl');

        // Get user stats
        const orderCount = await orderModel.countDocuments({ userId: id });
        const orderStats = await orderModel.aggregate([
            { $match: { userId: user._id, status: { $ne: 'cancelled' } } },
            { $group: { _id: null, totalSpent: { $sum: '$totalPrice' } } }
        ]);

        res.status(200).json({
            user: {
                ...user.toObject(),
                orderCount,
                totalSpent: orderStats[0]?.totalSpent || 0
            },
            orders
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
};

// Block/Unblock user
export const toggleBlockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot block admin users' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isBlocked: user.isBlocked
            }
        });
    } catch (error) {
        console.error('Toggle block user error:', error);
        res.status(500).json({ message: 'Failed to toggle user block status', error: error.message });
    }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const total = await orderModel.countDocuments({ userId: id });
        const orders = await orderModel.find({ userId: id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('items.productId', 'title imgUrl price');

        res.status(200).json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
    }
};
