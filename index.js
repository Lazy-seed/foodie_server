 
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
dotenv.config();

// import categoryRoutes from "./routes/categoryRoutes";
// import foodRoutes from "./routes/foodRoutes";
// import contactRoutes from "./routes/contactRoutes";

const app = express();
app.use(cookieParser());
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://arcanesole.netlify.app', 'http://192.168.252.1:3000'];

// Middleware
app.use(cors({ credentials: true, origin: allowedOrigins }));
app.use(json());
// Routes

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/order', orderRoutes);

// Connect to MongoDB
ConnectDB()
// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
