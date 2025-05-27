import express from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
  importCSVProperties
} from '../controllers/propertyController';
import { authenticate } from '../middleware/auth';
import { cache, clearCache } from '../middleware/cache';

const router = express.Router();

router.get('/', cache(300), getProperties);
router.get('/my-properties', authenticate, getMyProperties);
router.get('/:id', cache(600), getPropertyById);
router.post('/', authenticate, clearCache('/api/properties'), createProperty);
router.put('/:id', authenticate, clearCache('/api/properties'), updateProperty);
router.delete('/:id', authenticate, clearCache('/api/properties'), deleteProperty);
router.post('/import-csv', authenticate, importCSVProperties);


export default router;