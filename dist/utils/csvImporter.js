"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const Property_1 = __importDefault(require("../models/Property"));
const User_1 = __importDefault(require("../models/User"));
const database_1 = __importDefault(require("../config/database"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const importCSV = async () => {
    try {
        await (0, database_1.default)();
        // Create a default user for imported properties
        let defaultUser = await User_1.default.findOne({ email: 'admin@properties.com' });
        if (!defaultUser) {
            defaultUser = await User_1.default.create({
                email: 'admin@properties.com',
                password: 'admin123',
                name: 'Property Admin'
            });
        }
        // Clear existing properties
        await Property_1.default.deleteMany({});
        console.log('Cleared existing properties');
        const properties = [];
        fs_1.default.createReadStream('./data/properties.csv')
            .pipe((0, csv_parser_1.default)())
            .on('data', (row) => {
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
                await Property_1.default.insertMany(properties);
                console.log(`Successfully imported ${properties.length} properties`);
                process.exit(0);
            }
            catch (error) {
                console.error('Error inserting properties:', error);
                process.exit(1);
            }
        })
            .on('error', (error) => {
            console.error('Error reading CSV:', error);
            process.exit(1);
        });
    }
    catch (error) {
        console.error('Import error:', error);
        process.exit(1);
    }
};
if (require.main === module) {
    importCSV();
}
