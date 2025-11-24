import { Router } from "express";
import { getDemoToken, createDemoOrder } from "../controllers/demoController.js";
import rateLimit from "express-rate-limit";

const demoRoutes = Router();

// Rate limiter for demo token generation
const demoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many demo requests from this IP, please try again after 15 minutes"
});

demoRoutes.post("/auth/demo-token", demoLimiter, getDemoToken);
demoRoutes.post("/order/create", createDemoOrder);

export default demoRoutes;
