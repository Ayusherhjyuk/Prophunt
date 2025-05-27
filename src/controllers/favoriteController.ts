import { Request, Response } from 'express';
import Favorite from '../models/Favorite';
import Property from '../models/Property';
import { AuthRequest } from '../middleware/auth';

export const addToFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.body;
    const userId = req.user!._id;

  
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    
    const existingFavorite = await Favorite.findOne({ userId, propertyId });
    if (existingFavorite) {
      res.status(400).json({ message: 'Property already in favorites' });
      return;
    }

    
    const favorite = await Favorite.create({ userId, propertyId });
    res.status(201).json({
      message: 'Property added to favorites',
      favorite,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removeFromFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const userId = req.user!._id;

    const favorite = await Favorite.findOneAndDelete({ userId, propertyId });
    if (!favorite) {
      res.status(404).json({ message: 'Favorite not found' });
      return;
    }

    res.json({ message: 'Property removed from favorites' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    
    const favorites = await Favorite.find({ userId })
      .populate({
        path: 'propertyId',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ favorites });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const checkFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user!._id;

    const favorite = await Favorite.findOne({ userId, propertyId });
    res.json({ isFavorite: !!favorite });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};