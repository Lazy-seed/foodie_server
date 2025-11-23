import { Router } from 'express';
const cartRoutes = Router();
import { addItem, viewCart, updateItem, removeItem } from '../controllers/cartController.js';
import { protect } from "../middlewares/authMiddleware.js";

cartRoutes.post('/add', protect, addItem);
cartRoutes.get('/', protect, viewCart);
cartRoutes.put('/update', protect, updateItem);
cartRoutes.delete('/remove', protect, removeItem);

export default cartRoutes;
