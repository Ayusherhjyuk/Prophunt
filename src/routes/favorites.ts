import express from 'express';
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite
} from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, addToFavorites);
router.delete('/:propertyId', authenticate, removeFromFavorites);
router.get('/', authenticate, getFavorites);
router.get('/check/:propertyId', authenticate, checkFavorite);

export default router;