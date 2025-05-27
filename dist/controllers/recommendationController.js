"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.markRecommendationAsRead = exports.getSentRecommendations = exports.getReceivedRecommendations = exports.recommendProperty = void 0;
const Recommendation_1 = __importDefault(require("../models/Recommendation"));
const User_1 = __importDefault(require("../models/User"));
const Property_1 = __importDefault(require("../models/Property"));
const recommendProperty = async (req, res) => {
    try {
        const { recipientEmail, propertyId, message } = req.body;
        const fromUserId = req.user._id;
        const recipient = await User_1.default.findOne({ email: recipientEmail });
        if (!recipient) {
            res.status(404).json({ message: 'Recipient user not found' });
            return;
        }
        if (recipient._id.toString() === fromUserId.toString()) {
            res.status(400).json({ message: 'Cannot recommend to yourself' });
            return;
        }
        const property = await Property_1.default.findById(propertyId);
        if (!property) {
            res.status(404).json({ message: 'Property not found' });
            return;
        }
        const existingRecommendation = await Recommendation_1.default.findOne({
            fromUserId,
            toUserId: recipient._id,
            propertyId
        });
        if (existingRecommendation) {
            res.status(400).json({ message: 'Property already recommended to this user' });
            return;
        }
        const recommendation = await Recommendation_1.default.create({
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
};
exports.recommendProperty = recommendProperty;
const getReceivedRecommendations = async (req, res) => {
    try {
        const toUserId = req.user._id;
        const recommendations = await Recommendation_1.default.find({ toUserId })
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
};
exports.getReceivedRecommendations = getReceivedRecommendations;
const getSentRecommendations = async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const recommendations = await Recommendation_1.default.find({ fromUserId })
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
};
exports.getSentRecommendations = getSentRecommendations;
const markRecommendationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const toUserId = req.user._id;
        const recommendation = await Recommendation_1.default.findOneAndUpdate({ _id: id, toUserId }, { isRead: true }, { new: true });
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
};
exports.markRecommendationAsRead = markRecommendationAsRead;
const searchUsers = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            res.status(400).json({ message: 'Email query parameter is required' });
            return;
        }
        const users = await User_1.default.find({
            email: new RegExp(email, 'i'),
            _id: { $ne: req.user._id } // Exclude current user
        }).select('name email').limit(10);
        res.json({ users });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.searchUsers = searchUsers;
