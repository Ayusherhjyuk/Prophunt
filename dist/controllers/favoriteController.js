"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFavorite = exports.getFavorites = exports.removeFromFavorites = exports.addToFavorites = void 0;
const Favorite_1 = __importDefault(require("../models/Favorite"));
const Property_1 = __importDefault(require("../models/Property"));
const addToFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { propertyId } = req.body;
        const userId = req.user._id;
        const property = yield Property_1.default.findById(propertyId);
        if (!property) {
            res.status(404).json({ message: 'Property not found' });
            return;
        }
        const existingFavorite = yield Favorite_1.default.findOne({ userId, propertyId });
        if (existingFavorite) {
            res.status(400).json({ message: 'Property already in favorites' });
            return;
        }
        const favorite = yield Favorite_1.default.create({ userId, propertyId });
        res.status(201).json({
            message: 'Property added to favorites',
            favorite,
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.addToFavorites = addToFavorites;
const removeFromFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { propertyId } = req.params;
        const userId = req.user._id;
        const favorite = yield Favorite_1.default.findOneAndDelete({ userId, propertyId });
        if (!favorite) {
            res.status(404).json({ message: 'Favorite not found' });
            return;
        }
        res.json({ message: 'Property removed from favorites' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.removeFromFavorites = removeFromFavorites;
const getFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const favorites = yield Favorite_1.default.find({ userId })
            .populate({
            path: 'propertyId',
            populate: {
                path: 'createdBy',
                select: 'name email'
            }
        })
            .sort({ createdAt: -1 });
        res.json({ favorites });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getFavorites = getFavorites;
const checkFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { propertyId } = req.params;
        const userId = req.user._id;
        const favorite = yield Favorite_1.default.findOne({ userId, propertyId });
        res.json({ isFavorite: !!favorite });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.checkFavorite = checkFavorite;
