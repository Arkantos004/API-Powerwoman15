import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  requestInstructor,
  getInstructorRequests,
  approveInstructor,
  rejectInstructor,
} from '../controllers/userController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/request-instructor', authMiddleware, requestInstructor);

// Rutas admin
router.get('/all', authMiddleware, adminMiddleware, getAllUsers);
router.get('/instructor/requests', authMiddleware, adminMiddleware, getInstructorRequests);
router.patch('/:userId/approve-instructor', authMiddleware, adminMiddleware, approveInstructor);
router.patch('/:userId/reject-instructor', authMiddleware, adminMiddleware, rejectInstructor);

export default router;
