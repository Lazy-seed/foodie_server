import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";

// Analytics controllers
import {
    getDashboardStats,
    getRevenueChart,
    getOrdersChart,
    getTopProducts,
    getSalesByCategory,
    getRecentOrders
} from "../controllers/adminAnalyticsController.js";

// Product controllers
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    toggleAvailability
} from "../controllers/adminProductController.js";

// Order controllers
import {
    getAllOrders,
    getOrderById,
    updateOrderStatus
} from "../controllers/adminOrderController.js";

// User controllers
import {
    getAllUsers,
    getUserById,
    toggleBlockUser,
    getUserOrders
} from "../controllers/adminUserController.js";

const adminRoutes = Router();

// All admin routes require authentication and admin role
adminRoutes.use(protect, admin);

// Analytics routes
adminRoutes.get("/analytics/stats", getDashboardStats);
adminRoutes.get("/analytics/revenue-chart", getRevenueChart);
adminRoutes.get("/analytics/orders-chart", getOrdersChart);
adminRoutes.get("/analytics/top-products", getTopProducts);
adminRoutes.get("/analytics/sales-by-category", getSalesByCategory);
adminRoutes.get("/analytics/recent-orders", getRecentOrders);

// Product management routes
adminRoutes.get("/products", getAllProducts);
adminRoutes.post("/products", createProduct);
adminRoutes.put("/products/:id", updateProduct);
adminRoutes.delete("/products/:id", deleteProduct);
adminRoutes.patch("/products/:id/stock", updateStock);
adminRoutes.patch("/products/:id/availability", toggleAvailability);

// Order management routes
adminRoutes.get("/orders", getAllOrders);
adminRoutes.get("/orders/:id", getOrderById);
adminRoutes.patch("/orders/:id/status", updateOrderStatus);

// User management routes
adminRoutes.get("/users", getAllUsers);
adminRoutes.get("/users/:id", getUserById);
adminRoutes.patch("/users/:id/block", toggleBlockUser);
adminRoutes.get("/users/:id/orders", getUserOrders);

export default adminRoutes;
