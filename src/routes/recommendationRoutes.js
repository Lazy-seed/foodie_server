import { Router } from "express";
import { getRecommendations, getPopularProducts } from "../controllers/recommendationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const recommendationRoutes = Router();

// Get personalized recommendations (optional auth - works for both logged in and guest users)
recommendationRoutes.get("/", (req, res, next) => {
    // Try to authenticate, but don't fail if no token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        protect(req, res, next);
    } else {
        next();
    }
}, getRecommendations);

// Get popular products
recommendationRoutes.get("/popular", getPopularProducts);

export default recommendationRoutes;
