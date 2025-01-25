import { Router } from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const orderRoutes = Router();

orderRoutes.post("/create",authMiddleware, createOrder)
orderRoutes.get("/getOrders",authMiddleware, getOrders)

export default orderRoutes