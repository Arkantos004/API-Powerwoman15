import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import {
  getSiteSettings,
  getSiteSetting,
  updateSiteSetting,
} from '../controllers/settingsController';

const router = Router();

// Rutas públicas
router.get('/', getSiteSettings);
router.get('/:key', getSiteSetting);

// Rutas protegidas (admin only)
router.put('/:key', authMiddleware, adminMiddleware, updateSiteSetting);

export default router;
