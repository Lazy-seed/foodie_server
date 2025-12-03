import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import OrderModel from "../src/models/orderModel.js";
import Address from "../src/models/addressModel.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Order statuses with realistic distribution
const ORDER_STATUSES = [
    { status: "pending", weight: 10 },      // 10% pending
    { status: "processing", weight: 15 },   // 15% processing
    { status: "shipped", weight: 20 },      // 20% shipped
    { status: "delivered", weight: 50 },    // 50% delivered
    { status: "cancelled", weight: 5 },     // 5% cancelled
];

// Payment methods
const PAYMENT_METHODS = ["COD", "Online", "Card"];

// Helper: Get random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper: Get random number between min and max
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: Get weighted random status
const getWeightedStatus = () => {
    const totalWeight = ORDER_STATUSES.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of ORDER_STATUSES) {
        if (random < item.weight) {
            return item.status;
        }
        random -= item.weight;
    }
    return "delivered";
};

// Helper: Generate random date in the past N days
const getRandomPastDate = (daysAgo) => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
    return new Date(randomTime);
};

// Helper: Generate random order items
const generateOrderItems = (products, minItems = 1, maxItems = 5) => {
    const numItems = getRandomInt(minItems, maxItems);
    const selectedProducts = [];
    const usedProductIds = new Set();

    // Select random unique products
    while (selectedProducts.length < numItems && selectedProducts.length < products.length) {
        const product = getRandomItem(products);
        if (!usedProductIds.has(product._id.toString())) {
            selectedProducts.push(product);
            usedProductIds.add(product._id.toString());
        }
    }

    // Create order items with random quantities
    return selectedProducts.map(product => ({
        productId: product._id,
        quantity: getRandomInt(1, 3),
        price: product.price
    }));
};

// Helper: Calculate total price
const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const seedOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // Fetch all users and products
        const users = await User.find({ role: "user" });
        const products = await Product.find();

        if (users.length === 0) {
            console.log("No users found. Please seed users first.");
            process.exit(1);
        }

        if (products.length === 0) {
            console.log("No products found. Please seed products first.");
            process.exit(1);
        }

        console.log(`Found ${users.length} users and ${products.length} products`);

        // Configuration
        const ORDERS_PER_USER_MIN = 0;  // Some users have no orders
        const ORDERS_PER_USER_MAX = 5;  // Max orders per user
        const DAYS_BACK = 100;           // Generate orders from past 30 days

        let totalOrdersCreated = 0;
        // Generate orders for each user
        for (const user of users) {
            const numOrders = getRandomInt(ORDERS_PER_USER_MIN, ORDERS_PER_USER_MAX);

            if (numOrders === 0) {
                console.log(`Skipping user ${user.email} (no orders)`);
                continue;
            }

            // Get user's address
            const userAddress = await Address.findOne({ userId: user._id });

            if (!userAddress || userAddress.addresses.length === 0) {
                console.log(`Skipping user ${user.email} (no address)`);
                continue;
            }

            const defaultAddress = userAddress.addresses.find(addr => addr.isDefault) || userAddress.addresses[0];

            // Create multiple orders for this user
            for (let i = 0; i < numOrders; i++) {
                const orderItems = generateOrderItems(products);
                const totalPrice = calculateTotalPrice(orderItems);
                const status = getWeightedStatus();
                const createdAt = getRandomPastDate(DAYS_BACK);
                const paymentMethod = getRandomItem(PAYMENT_METHODS);

                const orderData = {
                    userId: user._id,
                    items: orderItems,
                    totalPrice: totalPrice,
                    paymentMethod: paymentMethod,
                    shippingAddress: {
                        firstName: defaultAddress.firstName,
                        lastName: defaultAddress.lastName,
                        address: {
                            line1: defaultAddress.address.line1,
                            line2: defaultAddress.address.line2 || ""
                        },
                        city: defaultAddress.city,
                        postcode: parseInt(defaultAddress.postcode),
                        contact: parseInt(defaultAddress.contact)
                    },
                    status: status,
                    createdAt: createdAt,
                    note: status === "cancelled" ? "Cancelled by user" : ""
                };

                try {
                    await OrderModel.create(orderData);
                    totalOrdersCreated++;

                    // Update product sold count
                    for (const item of orderItems) {
                        if (status === "delivered") {
                            await Product.findByIdAndUpdate(
                                item.productId,
                                { $inc: { soldCount: item.quantity } }
                            );
                        }
                    }
                } catch (error) {
                    console.error(`Error creating order for user ${user.email}:`, error.message);
                }
            }

            console.log(`Created ${numOrders} orders for user ${user.email}`);
        }

        console.log(`\n✅ Demo order seeding completed!`);
        console.log(`📦 Total orders created: ${totalOrdersCreated}`);
        console.log(`👥 Users with orders: ${users.length}`);

        // Show status distribution
        const statusCounts = await OrderModel.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        console.log(`\n📊 Order Status Distribution:`);
        statusCounts.forEach(({ _id, count }) => {
            console.log(`   ${_id}: ${count} orders`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error seeding demo orders:", error);
        process.exit(1);
    }
};

seedOrders();
