import { Router } from 'express';
import {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getAllOrders,
} from '../controllers/orderController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Rutas protegidas
router.get('/', authMiddleware, getUserOrders);
router.get('/:id', authMiddleware, getOrderById);
router.post('/', authMiddleware, createOrder);
router.patch('/:id/status', authMiddleware, updateOrderStatus);

// Rutas admin
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);

export default router;
