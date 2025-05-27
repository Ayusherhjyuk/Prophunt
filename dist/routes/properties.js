"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const propertyController_1 = require("../controllers/propertyController");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = express_1.default.Router();
router.get('/', (0, cache_1.cache)(300), propertyController_1.getProperties);
router.get('/my-properties', auth_1.authenticate, propertyController_1.getMyProperties);
router.get('/:id', (0, cache_1.cache)(600), propertyController_1.getPropertyById);
router.post('/', auth_1.authenticate, (0, cache_1.clearCache)('/api/properties'), propertyController_1.createProperty);
router.put('/:id', auth_1.authenticate, (0, cache_1.clearCache)('/api/properties'), propertyController_1.updateProperty);
router.delete('/:id', auth_1.authenticate, (0, cache_1.clearCache)('/api/properties'), propertyController_1.deleteProperty);
router.post('/import-csv', auth_1.authenticate, propertyController_1.importCSVProperties);
exports.default = router;
