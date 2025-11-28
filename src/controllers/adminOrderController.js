import orderModel from '../models/orderModel.js';

// Get all orders with pagination and filters
export const getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status || '';
        const search = req.query.search || '';

        const query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            query._id = search;
        }

        const total = await orderModel.countDocuments(query);
        const orders = await orderModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('userId', 'name email')
            .populate('items.productId', 'title imgUrl');

        res.status(200).json({
            orders,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderModel.findById(id)
            .populate('userId', 'name email phone')
            .populate('items.productId', 'title imgUrl price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Failed to fetch order', error: error.message });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status.toLowerCase())) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await orderModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('userId', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully', order });

        // Emit real-time update
        try {
            const { getIO } = await import('../socket.js');
            const io = getIO();
            io.to(order.userId._id.toString()).emit('orderStatusUpdated', { orderId: order._id, status: order.status });
        } catch (socketError) {
            console.error('Socket emit error:', socketError);
        }
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
};
