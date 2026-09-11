const dotenv = require('dotenv');
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production mode with no fallback');
}

const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || (isProduction ? '' : 'beyond_cgpa_secure_jwt_secret_development_key_2026'),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY || '',
  NVIDIA_API_URL: process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions',
  AI_MODEL: process.env.AI_MODEL || 'meta/llama-3.1-70b-instruct',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'BeyondCGPA <onboarding@resend.dev>'
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
      clientId: config.GOOGLE_CLIENT_ID || undefined,
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
        : (isProduction
            ? 'CRITICAL: JWT_SECRET is required in production with no fallback'
            : 'Using default development JWT Secret')
    },
    emailService: {
      configured: Boolean(config.RESEND_API_KEY),
      provider: config.RESEND_API_KEY ? 'Resend API' : 'Console / Dev Dispatch',
      message: config.RESEND_API_KEY
        ? 'Resend API key configured for transactional emails'
        : 'RESEND_API_KEY missing: OTP codes are logged to console (and previewed in dev responses).'
    }
  };
};

module.exports = {
  config,
  getConfigDiagnostics
};
