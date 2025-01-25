import { Router } from 'express';
const cartRoutes = Router();
import { addItem, viewCart, updateItem, removeItem } from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';

cartRoutes.post('/add',authMiddleware, addItem);
cartRoutes.get('/',authMiddleware, viewCart);
cartRoutes.put('/update',authMiddleware, updateItem);
cartRoutes.delete('/remove',authMiddleware, removeItem);

export default cartRoutes;
