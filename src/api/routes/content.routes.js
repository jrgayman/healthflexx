import { Router } from 'express';
import { 
  getFeaturedContent,
  getContentByCategory,
  getContentById,
  likeContent,
  unlikeContent,
  getContentLikes,
  searchContent
} from '../controllers/content.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Content routes
router.get('/featured', getFeaturedContent);
router.get('/category/:categoryId', getContentByCategory);
router.get('/search', searchContent);
router.get('/:id', getContentById);
router.post('/:id/like', authMiddleware, likeContent);
router.delete('/:id/like', authMiddleware, unlikeContent);
router.get('/:id/likes', getContentLikes);

export default router;