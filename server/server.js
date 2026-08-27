const app = require('./app');
const { connectDB } = require('./config/db');
const { config } = require('./config/env');
const { seedDatabase } = require('./services/seedService');

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Run Database Seeding
    await seedDatabase();

    // 3. Start Express HTTP Server
    const server = app.listen(config.PORT, () => {
      console.log(`🚀 BeyondCGPA Express Server running on port ${config.PORT} [${config.NODE_ENV}]`);
      console.log(`📡 API Base URL: http://localhost:${config.PORT}/api`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n🛑 Gracefully shutting down BeyondCGPA Express Server...');
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
