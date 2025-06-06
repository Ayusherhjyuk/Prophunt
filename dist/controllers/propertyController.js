"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importCSVProperties = exports.getMyProperties = exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const createProperty = async (req, res) => {
    try {
        const propertyData = {
            ...req.body,
            createdBy: req.user._id
        };
        const property = await Property_1.default.create(propertyData);
        res.status(201).json({
            message: 'Property created successfully',
            property
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createProperty = createProperty;
const getProperties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.city)
            filter.city = new RegExp(req.query.city, 'i');
        if (req.query.state)
            filter.state = new RegExp(req.query.state, 'i');
        if (req.query.type)
            filter.type = new RegExp(req.query.type, 'i');
        if (req.query.minPrice)
            filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
        if (req.query.maxPrice)
            filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };
        if (req.query.bedrooms)
            filter.bedrooms = Number(req.query.bedrooms);
        if (req.query.bathrooms)
            filter.bathrooms = Number(req.query.bathrooms);
        if (req.query.furnished && req.query.furnished !== 'all')
            filter.furnished = req.query.furnished;
        if (req.query.listingType)
            filter.listingType = req.query.listingType;
        if (req.query.isVerified !== undefined)
            filter.isVerified = req.query.isVerified === 'true';
        if (req.query.search) {
            filter.$or = [
                { title: new RegExp(req.query.search, 'i') },
                { amenities: new RegExp(req.query.search, 'i') },
                { tags: new RegExp(req.query.search, 'i') }
            ];
        }
        // Sorting
        let sortField = 'createdAt';
        let sortOrder = 'desc';
        if (req.query.sortBy) {
            sortField = req.query.sortBy;
            sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
        }
        const properties = await Property_1.default.find(filter)
            .populate('createdBy', 'name email')
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit);
        const total = await Property_1.default.countDocuments(filter);
        res.json({
            properties,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total,
                limit
            }
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getProperties = getProperties;
const getPropertyById = async (req, res) => {
    try {
        const property = await Property_1.default.findById(req.params.id).populate('createdBy', 'name email');
        if (!property) {
            res.status(404).json({ message: 'Property not found' });
            return;
        }
        res.json({ property });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getPropertyById = getPropertyById;
const updateProperty = async (req, res) => {
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ message: 'Property not found' });
            return;
        }
        if (property.createdBy.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to update this property' });
            return;
        }
        const updatedProperty = await Property_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('createdBy', 'name email');
        res.json({
            message: 'Property updated successfully',
            property: updatedProperty
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ message: 'Property not found' });
            return;
        }
        if (property.createdBy.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to delete this property' });
            return;
        }
        await Property_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Property deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.deleteProperty = deleteProperty;
const getMyProperties = async (req, res) => {
    try {
        const properties = await Property_1.default.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ properties });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getMyProperties = getMyProperties;
const importCSVProperties = async (req, res) => {
    try {
        const filePath = path_1.default.join(__dirname, '../../data/properties.csv');
        const results = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
            const inserted = [];
            for (const prop of results) {
                const existing = await Property_1.default.findOne({ title: prop.title });
                if (!existing) {
                    const propertyData = {
                        ...prop,
                        isVerified: prop.isVerified?.toLowerCase() === 'true',
                        createdBy: req.user._id // attaching the authenticated user
                    };
                    const saved = await Property_1.default.create(propertyData);
                    inserted.push(saved);
                }
            }
            res.status(200).json({
                message: 'CSV data imported successfully',
                totalImported: inserted.length,
                inserted
            });
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.importCSVProperties = importCSVProperties;
