"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const recommendationController_1 = require("../controllers/recommendationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, recommendationController_1.recommendProperty);
router.get('/received', auth_1.authenticate, recommendationController_1.getReceivedRecommendations);
router.get('/sent', auth_1.authenticate, recommendationController_1.getSentRecommendations);
router.put('/:id/read', auth_1.authenticate, recommendationController_1.markRecommendationAsRead);
router.get('/search-users', auth_1.authenticate, recommendationController_1.searchUsers);
exports.default = router;
