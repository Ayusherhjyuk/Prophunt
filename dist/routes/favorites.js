"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const favoriteController_1 = require("../controllers/favoriteController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, favoriteController_1.addToFavorites);
router.delete('/:propertyId', auth_1.authenticate, favoriteController_1.removeFromFavorites);
router.get('/', auth_1.authenticate, favoriteController_1.getFavorites);
router.get('/check/:propertyId', auth_1.authenticate, favoriteController_1.checkFavorite);
exports.default = router;
