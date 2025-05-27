"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = __importDefault(require("./config/database"));
const redis_1 = require("./config/redis");
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const properties_1 = __importDefault(require("./routes/properties"));
const favorites_1 = __importDefault(require("./routes/favorites"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        services: {
            mongodb: 'Connected',
            redis: 'Connected'
        }
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/properties', properties_1.default);
app.use('/api/favorites', favorites_1.default);
app.use('/api/recommendations', recommendations_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method
    });
});
// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500).json({
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // console.log('Starting server initialization...');
        // console.log(`Environment: ${process.env.NODE_ENV}`);
        // Connect to MongoDB
        // console.log('Connecting to MongoDB...');
        await (0, database_1.default)();
        console.log('MongoDB connected successfully');
        // Connect to Redis
        // console.log('Connecting to Redis...');
        await (0, redis_1.connectRedis)();
        console.log('Redis connected successfully');
        app.listen(PORT, () => {
            console.log('\nServer started successfully!');
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
