import { Router } from 'express';
import {
  getUserInvoices,
  getInvoiceById,
  getInvoiceByOrderId,
  updateInvoiceStatus,
  getAllInvoices,
} from '../controllers/invoiceController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Rutas protegidas para usuarios
router.get('/', authMiddleware, getUserInvoices);
router.get('/:id', authMiddleware, getInvoiceById);
router.get('/order/:orderId', authMiddleware, getInvoiceByOrderId);
router.patch('/:id/status', authMiddleware, updateInvoiceStatus);

// Rutas admin
router.get('/admin/all', authMiddleware, adminMiddleware, getAllInvoices);

export default router;
