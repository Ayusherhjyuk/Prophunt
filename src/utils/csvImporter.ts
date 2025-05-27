import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import Property from '../models/Property';
import User from '../models/User';
import connectDB from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

interface CSVRow {
  id: string;
  title: string;
  type: string;
  price: string;
  state: string;
  city: string;
  areaSqFt: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string;
  furnished: string;
  available: string;
  listedBy: string;
  tags: string;
  colorTheme: string;
  rating: string;
  isVerified: string;
  listingType: string;
}

const importCSV = async () => {
  try {
    await connectDB();

    // Create a default user for imported properties
    let defaultUser = await User.findOne({ email: 'admin@properties.com' });
    if (!defaultUser) {
      defaultUser = await User.create({
        email: 'admin@properties.com',
        password: 'admin123',
        name: 'Property Admin'
      });
    }

    // Clear existing properties
    await Property.deleteMany({});
    console.log('Cleared existing properties');

    const properties: any[] = [];

    fs.createReadStream('./data/properties.csv')
      .pipe(csv())
      .on('data', (row: CSVRow) => {
        const property = {
          id: row.id,
          title: row.title,
          type: row.type,
          price: parseInt(row.price) || 0,
          state: row.state,
          city: row.city,
          areaSqFt: parseInt(row.areaSqFt) || 0,
          bedrooms: parseInt(row.bedrooms) || 0,
          bathrooms: parseInt(row.bathrooms) || 0,
          amenities: row.amenities || '',
          furnished: row.furnished || '',
          available: row.available || '',
          listedBy: row.listedBy || '',
          tags: row.tags || '',
          colorTheme: row.colorTheme || '',
          rating: parseFloat(row.rating) || 0,
          isVerified: row.isVerified?.toLowerCase() === 'true',
          listingType: row.listingType || '',
          createdBy: defaultUser._id
        };
        properties.push(property);
      })
      .on('end', async () => {
        try {
          await Property.insertMany(properties);
          console.log(`Successfully imported ${properties.length} properties`);
          process.exit(0);
        } catch (error) {
          console.error('Error inserting properties:', error);
          process.exit(1);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        process.exit(1);
      });

  } catch (error) {
    console.error('Import error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  importCSV();
}