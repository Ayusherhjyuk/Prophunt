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
exports.searchUsers = exports.markRecommendationAsRead = exports.getSentRecommendations = exports.getReceivedRecommendations = exports.recommendProperty = void 0;
const Recommendation_1 = __importDefault(require("../models/Recommendation"));
const User_1 = __importDefault(require("../models/User"));
const Property_1 = __importDefault(require("../models/Property"));
const recommendProperty = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipientEmail, propertyId, message } = req.body;
        const fromUserId = req.user._id;
        const recipient = yield User_1.default.findOne({ email: recipientEmail });
        if (!recipient) {
            res.status(404).json({ message: 'Recipient user not found' });
            return;
        }
        if (recipient._id.toString() === fromUserId.toString()) {
            res.status(400).json({ message: 'Cannot recommend to yourself' });
            return;
        }
        const property = yield Property_1.default.findById(propertyId);
        if (!property) {
            res.status(404).json({ message: 'Property not found' });
            return;
        }
        const existingRecommendation = yield Recommendation_1.default.findOne({
            fromUserId,
            toUserId: recipient._id,
            propertyId
        });
        if (existingRecommendation) {
            res.status(400).json({ message: 'Property already recommended to this user' });
            return;
        }
        const recommendation = yield Recommendation_1.default.create({
            fromUserId,
            toUserId: recipient._id,
            propertyId,
            message
        });
        res.status(201).json({
            message: 'Property recommended successfully',
            recommendation
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.recommendProperty = recommendProperty;
const getReceivedRecommendations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const toUserId = req.user._id;
        const recommendations = yield Recommendation_1.default.find({ toUserId })
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
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getReceivedRecommendations = getReceivedRecommendations;
const getSentRecommendations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fromUserId = req.user._id;
        const recommendations = yield Recommendation_1.default.find({ fromUserId })
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
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getSentRecommendations = getSentRecommendations;
const markRecommendationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const toUserId = req.user._id;
        const recommendation = yield Recommendation_1.default.findOneAndUpdate({ _id: id, toUserId }, { isRead: true }, { new: true });
        if (!recommendation) {
            res.status(404).json({ message: 'Recommendation not found' });
            return;
        }
        res.json({
            message: 'Recommendation marked as read',
            recommendation
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.markRecommendationAsRead = markRecommendationAsRead;
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.query;
        if (!email) {
            res.status(400).json({ message: 'Email query parameter is required' });
            return;
        }
        const users = yield User_1.default.find({
            email: new RegExp(email, 'i'),
            _id: { $ne: req.user._id } // Exclude current user
        }).select('name email').limit(10);
        res.json({ users });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.searchUsers = searchUsers;
