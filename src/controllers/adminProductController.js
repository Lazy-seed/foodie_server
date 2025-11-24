import Product from '../models/Product.js';

// Get all products with pagination and filters
export const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const availability = req.query.availability;

        const query = {};
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }
        if (availability !== undefined) {
            query.isAvailable = availability === 'true';
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            products,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ message: 'Failed to fetch products', error: error.message });
    }
};

// Create new product
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Failed to create product', error: error.message });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Failed to update product', error: error.message });
    }
};

// Delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
};

// Update product stock
export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            { stock },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Stock updated successfully', product });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ message: 'Failed to update stock', error: error.message });
    }
};

// Toggle product availability
export const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.isAvailable = !product.isAvailable;
        await product.save();

        res.status(200).json({
            message: `Product ${product.isAvailable ? 'enabled' : 'disabled'} successfully`,
            product
        });
    } catch (error) {
        console.error('Toggle availability error:', error);
        res.status(500).json({ message: 'Failed to toggle availability', error: error.message });
    }
};
