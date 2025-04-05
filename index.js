
import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv"
import ConnectDB from "./config/DB_connection.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import cookieParser from "cookie-parser";
import storeRoutes from "./routes/storeRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import Razorpay from "razorpay";
import crypto from "crypto"
dotenv.config();
// import categoryRoutes from "./routes/categoryRoutes";
// import foodRoutes from "./routes/foodRoutes";
// import contactRoutes from "./routes/contactRoutes";

const app = express();
app.use(cookieParser());
const allowedOrigins = ["*"]; 

// Middleware
app.use(cors({ credentials: true, origin: (allowedOrigins, callback) => {
    callback(null, allowedOrigins || "*"); // Allow all origins
  } }));
app.use(json());
// Routes

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/order', orderRoutes);

// Connect to MongoDB
ConnectDB()



// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});// API to create an order
app.post("/api/create-order", async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount, // Convert ₹ to paise
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`,
            payment_capture: 1, // Auto-capture payment
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// API to verify payment
app.post("/api/verify-payment", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error verifying payment" });
    }
});
// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
