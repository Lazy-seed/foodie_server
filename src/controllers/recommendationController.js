import Product from '../models/Product.js';
import orderModel from '../models/orderModel.js';

// Get personalized recommendations for user
export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user?.id;
        let recommendedProducts = [];

        if (userId) {
            // Get user's order history
            const userOrders = await orderModel.find({ userId })
                .populate('items.productId')
                .sort({ createdAt: -1 })
                .limit(10);

            if (userOrders.length > 0) {
                // Extract product IDs and categories from order history
                const orderedProductIds = new Set();
                const orderedCategories = new Set();

                userOrders.forEach(order => {
                    order.items?.forEach(item => {
                        if (item.productId) {
                            orderedProductIds.add(item.productId._id.toString());
                            if (item.productId.category) {
                                orderedCategories.add(item.productId.category);
                            }
                        }
                    });
                });

                // Find similar products (same category, not already ordered)
                if (orderedCategories.size > 0) {
                    recommendedProducts = await Product.find({
                        category: { $in: Array.from(orderedCategories) },
                        _id: { $nin: Array.from(orderedProductIds) }
                    })
                        .limit(8)
                        .sort({ createdAt: -1 });
                }
            }
        }

        // If no personalized recommendations or user not logged in, show popular items
        if (recommendedProducts.length < 6) {
            const popularProducts = await Product.find({
                _id: { $nin: recommendedProducts.map(p => p._id) }
            })
                .sort({ createdAt: -1 }) // You can change this to sort by sales/rating when available
                .limit(8 - recommendedProducts.length);

            recommendedProducts = [...recommendedProducts, ...popularProducts];
        }

        res.status(200).json({
            recommendations: recommendedProducts.slice(0, 8),
            isPersonalized: userId && recommendedProducts.length > 0
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({
            message: 'Failed to fetch recommendations',
            error: error.message
        });
    }
};

// Get popular products (fallback)
export const getPopularProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;

        const popularProducts = await Product.find()
            .sort({ createdAt: -1 }) // Can be changed to sort by popularity/sales
            .limit(limit);

        res.status(200).json({ products: popularProducts });
    } catch (error) {
        console.error('Get popular products error:', error);
        res.status(500).json({
            message: 'Failed to fetch popular products',
            error: error.message
        });
    }
};
