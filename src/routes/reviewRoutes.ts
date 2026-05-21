import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  getCourseComments,
  createCourseComment,
  deleteCourseComment,
  getProductComments,
  createProductComment,
  deleteProductComment,
} from '../controllers/reviewController';

const router = Router();

// ============ COURSE COMMENT ROUTES ============

// GET all comments for a course (public)
router.get('/courses/:courseId/comments', (req, res) => 
  getCourseComments(req as AuthRequest, res)
);

// POST a comment on a course (requires auth)
router.post('/courses/:courseId/comments', authMiddleware, (req, res) =>
  createCourseComment(req as AuthRequest, res)
);

// DELETE a comment from a course (requires auth)
router.delete('/courses/:courseId/comments/:commentId', authMiddleware, (req, res) =>
  deleteCourseComment(req as AuthRequest, res)
);

// ============ PRODUCT COMMENT ROUTES ============

// GET all comments for a product (public)
router.get('/products/:productId/comments', (req, res) =>
  getProductComments(req as AuthRequest, res)
);

// POST a comment on a product (requires auth)
router.post('/products/:productId/comments', authMiddleware, (req, res) =>
  createProductComment(req as AuthRequest, res)
);

// DELETE a comment from a product (requires auth)
router.delete('/products/:productId/comments/:commentId', authMiddleware, (req, res) =>
  deleteProductComment(req as AuthRequest, res)
);

export default router;
