import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Order from "../models/orderModel.js";
import Product from "../models/Product.js";

// Generate a short-lived demo token
export const getDemoToken = async (req, res) => {
    try {
        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const email = role === "admin" ? "demo-admin@foodie.com" : "demo-user@foodie.com";
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Demo user not found. Please run seed:demo." });
        }

        // Create a short-lived token (5 minutes)
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
        );

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            expiresIn: 300 // 5 minutes in seconds
        });
    } catch (error) {
        console.error("Demo token error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Create a synthetic demo order for admin demo
export const createDemoOrder = async (req, res) => {
    try {
        // Find the demo user
        const user = await User.findOne({ email: "demo-user@foodie.com" });
        if (!user) {
            return res.status(404).json({ message: "Demo user not found" });
        }

        // Find a product
        const product = await Product.findOne({ title: "Classic Burger" });
        if (!product) {
            return res.status(404).json({ message: "Demo product not found" });
        }

        // Create a new order
        const newOrder = new Order({
            user: user._id,
            items: [
                {
                    product: product._id,
                    quantity: 2,
                    price: product.price,
                    name: product.title
                }
            ],
            totalAmount: product.price * 2,
            paymentStatus: "Completed",
            orderStatus: "Pending",
            paymentId: "demo_payment_" + Date.now(),
            address: {
                street: "123 Demo St",
                city: "Demo City",
                state: "Demo State",
                zipCode: "123456",
                country: "Demo Country"
            }
        });

        const savedOrder = await newOrder.save();

        res.status(201).json({
            message: "Demo order created",
            orderId: savedOrder._id
        });
    } catch (error) {
        console.error("Create demo order error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
