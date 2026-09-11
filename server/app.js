const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { config, getConfigDiagnostics } = require('./config/env');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const cieRoutes = require('./routes/cieRoutes');
const preparationRoutes = require('./routes/preparationRoutes');
const topicRoutes = require('./routes/topicRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// CORS configuration supporting local Vite dev, Vercel production, and preview URLs
const allowedOrigins = [
  'http://localhost:5173',
  'https://beyondcgpa.vercel.app',
  'http://127.0.0.1:5173'
];

if (config.CLIENT_URL) {
  const customOrigins = config.CLIENT_URL.split(',').map(url => url.trim().replace(/\/+$/, '')).filter(Boolean);
  customOrigins.forEach(url => {
    if (!allowedOrigins.includes(url)) {
      allowedOrigins.push(url);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server) or listed origins or any Vercel domain
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: false, // Implementation uses Bearer tokens in Authorization header, not cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint for Render deployment pings and health checks
app.get('/', (req, res) => {
  res.status(200).send('BeyondCGPA API is running');
});

// Production Health Check (Root level, used by uptime monitors to keep Render alive)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API-scoped Health and Diagnostic Endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/diagnostics', (req, res) => {
  if (config.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Diagnostics endpoint is disabled in production.'
    });
  }

  res.status(200).json({
    success: true,
    diagnostics: getConfigDiagnostics()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/cie', cieRoutes);
app.use('/api/preparation', preparationRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
