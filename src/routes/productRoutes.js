import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  AutoAddProducts,
} from "../controllers/ProductController.js";

const productRoutes = express.Router();

// Routes
productRoutes.post("/", createProduct); // Create Product
productRoutes.get("/", getAllProducts); // Get All Products
productRoutes.get("/:id", getProductById); // Get Product by ID
productRoutes.put("/:id", updateProduct); // Update Product
productRoutes.delete("/:id", deleteProduct); // Delete Product
productRoutes.post("/auto", AutoAddProducts); // Delete Product

export default productRoutes;
