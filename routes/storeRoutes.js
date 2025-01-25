import { Router } from 'express';
import { getStores } from '../controllers/storeController.js';
const storeRoutes = Router();
storeRoutes.get('/', getStores)

 export default storeRoutes

