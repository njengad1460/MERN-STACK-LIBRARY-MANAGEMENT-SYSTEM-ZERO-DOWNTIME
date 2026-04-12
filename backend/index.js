const mongoose = require('mongoose');
const dotenv = require('dotenv');
const server = require('./server'); // Import the server (with Socket.IO)

dotenv.config();

const PORT = process.env.PORT || 5000;

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI environment variable is not defined.');
  console.error('Make sure you have a .env file or pass MONGO_URI via docker-compose environment.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  process.exit(1);
}

console.log(`Connecting to MongoDB... (URI starts with: ${process.env.MONGO_URI.substring(0, 20)}...)`);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Start server only after DB connection
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO ready for connections`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Handle port already in use
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Run: fuser -k ${PORT}/tcp`);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});