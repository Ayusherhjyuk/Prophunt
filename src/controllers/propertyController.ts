import { Request, Response } from 'express';
import Property from '../models/Property';
import { AuthRequest } from '../middleware/auth';
import { SortOrder } from 'mongoose';
import csv from 'csv-parser';
import path from 'path';
import fs from 'fs';

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const propertyData = {
      ...req.body,
      createdBy: req.user!._id
    };

    const property = await Property.create(propertyData);
    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

   
    const filter: any = {};
    
    if (req.query.city) filter.city = new RegExp(req.query.city as string, 'i');
    if (req.query.state) filter.state = new RegExp(req.query.state as string, 'i');
    if (req.query.type) filter.type = new RegExp(req.query.type as string, 'i');
    if (req.query.minPrice) filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };
    if (req.query.bedrooms) filter.bedrooms = Number(req.query.bedrooms);
    if (req.query.bathrooms) filter.bathrooms = Number(req.query.bathrooms);
    if (req.query.furnished && req.query.furnished !== 'all') filter.furnished = req.query.furnished;
    if (req.query.listingType) filter.listingType = req.query.listingType;
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';

   
    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search as string, 'i') },
        { amenities: new RegExp(req.query.search as string, 'i') },
        { tags: new RegExp(req.query.search as string, 'i') }
      ];
    }

    // Sorting
     let sortField = 'createdAt';
     let sortOrder: SortOrder = 'desc';

    if (req.query.sortBy) {
      sortField = req.query.sortBy as string;
      sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
    }

    const properties = await Property.find(filter)
  .populate('createdBy', 'name email')
  .sort({ [sortField]: sortOrder })
  .skip(skip)
  .limit(limit);

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};



export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id).populate('createdBy', 'name email');

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    res.json({ property });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (property.createdBy.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this property' });
      return;
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (property.createdBy.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this property' });
      return;
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyProperties = async (req: AuthRequest, res: Response) => {
  try {
    const properties = await Property.find({ createdBy: req.user!._id })
      .sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const importCSVProperties = async (req: AuthRequest, res: Response) => {
  try {
    const filePath = path.join(__dirname, '../../data/properties.csv');
    const results: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const inserted: any[] = [];

        for (const prop of results) {
          const existing = await Property.findOne({ title: prop.title });
          if (!existing) {
            const propertyData = {
              ...prop,
              isVerified: prop.isVerified?.toLowerCase() === 'true',
              createdBy: req.user!._id // attaching the authenticated user
            };
            const saved = await Property.create(propertyData);
            inserted.push(saved);
          }
        }

        res.status(200).json({
          message: 'CSV data imported successfully',
          totalImported: inserted.length,
          inserted
        });
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};