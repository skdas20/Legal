const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database (but don't exit if it fails)
try {
  connectDB();
} catch (err) {
  console.error(`Database connection error: ${err.message}`.red);
  console.log('Continuing without database connection'.yellow);
}

// Route files
const auth = require('./routes/auth');
const documents = require('./routes/documents');
const daos = require('./routes/daos');
const ai = require('./routes/ai');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS with specific options
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/documents', documents);
app.use('/api/daos', daos);
app.use('/api/ai', ai);

// Add a simple test route
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working!'
  });
});

// Error handler middleware
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`.red);
  console.log('Server will continue running'.yellow);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection: ${err.message}`.red);
  console.log('Server will continue running'.yellow);
});

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = require('net');
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

// Start the server
const startServer = async () => {
  try {
    const desiredPort = process.env.PORT || 5000;
    const port = await findAvailablePort(desiredPort);
    
    const server = app.listen(port, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow.bold);
      // Update the frontend URL if needed
      if (port !== desiredPort) {
        console.log(`Note: Frontend should use http://localhost:${port} as API URL`.cyan);
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error(`Server error: ${error.message}`.red);
    });

  } catch (error) {
    console.error(`Failed to start server: ${error.message}`.red);
    process.exit(1);
  }
};

startServer(); 