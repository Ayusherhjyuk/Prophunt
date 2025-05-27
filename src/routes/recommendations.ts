import express from 'express';
import {
  recommendProperty,
  getReceivedRecommendations,
  getSentRecommendations,
  markRecommendationAsRead,
  searchUsers
} from '../controllers/recommendationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, recommendProperty);
router.get('/received', authenticate, getReceivedRecommendations);
router.get('/sent', authenticate, getSentRecommendations);
router.put('/:id/read', authenticate, markRecommendationAsRead);
router.get('/search-users', authenticate, searchUsers);

export default router;