
import { Router } from "express";
import { getLoggedUser, loginController, signupController, logoutController, refreshController, forgotPassword, resetPassword } from "../controllers/UsersController.js";
import { protect } from "../middlewares/authMiddleware.js";

import { authLimiter } from "../middlewares/rateLimiter.js";

const userRoutes = Router();

userRoutes.post("/signup", signupController);
userRoutes.post("/login", authLimiter, loginController);
userRoutes.post("/logout", logoutController);
userRoutes.post("/refresh", refreshController);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.put("/reset-password/:resetToken", resetPassword);
userRoutes.get("/me", protect, getLoggedUser);

export default userRoutes;
