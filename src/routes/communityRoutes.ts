import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  createComment,
  likePost,
  unlikePost,
} from '../controllers/communityController';

const router = Router();

// Public routes
router.get('/', (req, res, next) => getAllPosts(req as AuthRequest, res));
router.get('/:id', (req, res, next) => getPostById(req as AuthRequest, res));

// Protected routes (require authentication)
router.post('/', authMiddleware, (req, res, next) => createPost(req as AuthRequest, res));
router.put('/:id', authMiddleware, (req, res, next) => updatePost(req as AuthRequest, res));
router.delete('/:id', authMiddleware, (req, res, next) => deletePost(req as AuthRequest, res));

// Comments
router.post('/:id/comments', authMiddleware, (req, res, next) => createComment(req as AuthRequest, res));

// Likes
router.post('/:id/like', authMiddleware, (req, res, next) => likePost(req as AuthRequest, res));
router.delete('/:id/like', authMiddleware, (req, res, next) => unlikePost(req as AuthRequest, res));

export default router;
