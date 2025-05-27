import { Request, Response } from 'express';
import Recommendation from '../models/Recommendation';
import User from '../models/User';
import Property from '../models/Property';
import { AuthRequest } from '../middleware/auth';

export const recommendProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { recipientEmail, propertyId, message } = req.body;
    const fromUserId = req.user!._id;

   
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      res.status(404).json({ message: 'Recipient user not found' });
      return;
    }

    if (recipient._id.toString() === fromUserId.toString()) {
      res.status(400).json({ message: 'Cannot recommend to yourself' });
      return;
    }

   
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    
    const existingRecommendation = await Recommendation.findOne({
      fromUserId,
      toUserId: recipient._id,
      propertyId
    });

    if (existingRecommendation) {
      res.status(400).json({ message: 'Property already recommended to this user' });
      return;
    }

    const recommendation = await Recommendation.create({
      fromUserId,
      toUserId: recipient._id,
      propertyId,
      message
    });

    res.status(201).json({
      message: 'Property recommended successfully',
      recommendation
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getReceivedRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const toUserId = req.user!._id;
    
    const recommendations = await Recommendation.find({ toUserId })
      .populate('fromUserId', 'name email')
      .populate({
        path: 'propertyId',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ recommendations });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getSentRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const fromUserId = req.user!._id;
    
    const recommendations = await Recommendation.find({ fromUserId })
      .populate('toUserId', 'name email')
      .populate({
        path: 'propertyId',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ recommendations });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const markRecommendationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const toUserId = req.user!._id;

    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: id, toUserId },
      { isRead: true },
      { new: true }
    );

    if (!recommendation) {
      res.status(404).json({ message: 'Recommendation not found' });
      return;
    }

    res.json({
      message: 'Recommendation marked as read',
      recommendation
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.query;
    
    if (!email) {
      res.status(400).json({ message: 'Email query parameter is required' });
      return;
    }

    const users = await User.find({
      email: new RegExp(email as string, 'i'),
      _id: { $ne: req.user!._id } // Exclude current user
    }).select('name email').limit(10);

    res.json({ users });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
