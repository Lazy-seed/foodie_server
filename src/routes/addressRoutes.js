import { Router } from "express";
import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../controllers/addressController.js";
import { protect } from "../middlewares/authMiddleware.js";

const addressRoutes = Router();

// All routes require authentication
addressRoutes.get("/", protect, getAddresses);
addressRoutes.post("/", protect, addAddress);
addressRoutes.put("/:addressId", protect, updateAddress);
addressRoutes.delete("/:addressId", protect, deleteAddress);
addressRoutes.patch("/:addressId/default", protect, setDefaultAddress);

export default addressRoutes;
