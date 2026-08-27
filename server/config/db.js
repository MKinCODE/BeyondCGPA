const mongoose = require('mongoose');
const { config } = require('./env');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  try {
    let uri = config.MONGODB_URI;

    if (!uri) {
      console.log('⚡ MONGODB_URI not provided. Initializing local MongoDB instance via mongodb-memory-server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      uri = mongoMemoryServerInstance.getUri();
      console.log(`✅ Embedded MongoDB initialized at: ${uri}`);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If external URI failed, try in-memory server as fallback for smooth development
    if (config.MONGODB_URI && !mongoMemoryServerInstance) {
      try {
        console.log('⚡ Attempting fallback to embedded MongoDB instance...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServerInstance = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServerInstance.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Connected to Fallback MongoDB: ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        console.error(`❌ Fallback MongoDB Connection Failed: ${fallbackError.message}`);
        process.exit(1);
      }
    }
    process.exit(1);
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};

module.exports = {
  connectDB,
  closeDB
};
