const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { getConfigDiagnostics } = require('./config/env');

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

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health and Diagnostic Endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/diagnostics', (req, res) => {
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
