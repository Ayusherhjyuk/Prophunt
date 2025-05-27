import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import connectDB from './config/database';
import { connectRedis } from './config/redis';

// Routes
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import favoriteRoutes from './routes/favorites';
import recommendationRoutes from './routes/recommendations';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recommendations', recommendationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    await connectDB();
     console.log('MongoDB connected successfully');
    
    // Connect to Redis
    // console.log('Connecting to Redis...');
    await connectRedis();
     console.log('Redis connected successfully');
    
    app.listen(PORT, () => {
      console.log('\nServer started successfully!');
       console.log(`Server running on port ${PORT}`);
       console.log(`Health check: http://localhost:${PORT}/health`);
     
    });
  } catch (error) {
     console.error('Failed to start server:', error);
     process.exit(1);
  }
};


startServer();

export default app;
