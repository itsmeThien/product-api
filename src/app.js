const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const productRoutes = require('./routes/product.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Healthcheck endpoint (Product API + MongoDB)
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1;
  const status = isHealthy ? 'UP' : 'DOWN';

  return res.status(isHealthy ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: {
        status: 'UP',
      },
      mongodb: {
        status: dbStatusMap[dbState] || 'unknown',
        connected: isHealthy,
      },
    },
  });
});

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Product RESTful API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      products: 'GET, POST /api/products',
      productById: 'GET, PUT, DELETE /api/products/:pid',
    },
  });
});

// API Routes
app.use('/api/products', productRoutes);

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[App Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
