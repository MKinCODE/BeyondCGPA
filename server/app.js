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

// CORS configuration supporting both local Vite dev and Vercel production
const allowedOrigins = [
  'http://localhost:5173',
  'https://beyondcgpa.vercel.app',
  'http://127.0.0.1:5173'
];

if (config.CLIENT_URL && !allowedOrigins.includes(config.CLIENT_URL)) {
  allowedOrigins.push(config.CLIENT_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server) or listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: origin ${origin} is not allowed`));
    }
  },
  credentials: false, // Implementation uses Bearer tokens in Authorization header, not cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
