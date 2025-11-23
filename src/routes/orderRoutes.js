import { Router } from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";

const orderRoutes = Router();

orderRoutes.post("/create", protect, createOrder)
orderRoutes.get("/getOrders", protect, getOrders)

export default orderRoutes