const dotenv = require('dotenv');
dotenv.config();

const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'beyond_cgpa_secure_jwt_secret_development_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || '',
  NVIDIA_API_URL: process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions',
  AI_MODEL: process.env.AI_MODEL || 'meta/llama-3.1-70b-instruct',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};

const getConfigDiagnostics = () => {
  return {
    mongodb: {
      configured: Boolean(config.MONGODB_URI),
      message: config.MONGODB_URI
        ? 'MongoDB URI is configured'
        : 'MONGODB_URI missing: Using automated embedded local Mongo database for development.'
    },
    googleOAuth: {
      configured: Boolean(config.GOOGLE_CLIENT_ID),
      message: config.GOOGLE_CLIENT_ID
        ? 'Google OAuth client ID configured'
        : 'GOOGLE_CLIENT_ID missing: Direct one-click login enabled for local development.'
    },
    aiService: {
      configured: Boolean(config.NVIDIA_API_KEY),
      provider: config.NVIDIA_API_KEY ? 'NVIDIA AI Engine' : 'CIE Deterministic Heuristic Intelligence (Fallback)',
      message: config.NVIDIA_API_KEY
        ? `NVIDIA API Key configured (${config.AI_MODEL})`
        : 'NVIDIA_API_KEY missing: Operating via CIE intelligent heuristic reasoning engine.'
    },
    jwtSecret: {
      configured: Boolean(process.env.JWT_SECRET),
      message: process.env.JWT_SECRET
        ? 'JWT Secret is set via environment'
        : 'Using default development JWT Secret'
    }
  };
};

module.exports = {
  config,
  getConfigDiagnostics
};
