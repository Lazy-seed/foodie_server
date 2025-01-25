 
import { Router } from "express";
import { getLoggedUser, loginController, signupController } from "../controllers/UsersController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const userRoutes = Router();

userRoutes.post("/signup",signupController);
userRoutes.post("/login",loginController);
userRoutes.get("/loggedUser", authMiddleware, getLoggedUser);

export default userRoutes;
