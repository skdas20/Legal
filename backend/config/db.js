const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.log('MONGODB_URI not set, skipping database connection'.yellow);
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
    
    // Add connection error handler
    conn.connection.on('error', (err) => {
      console.error(`MongoDB Connection Error: ${err.message}`.red);
    });
    
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`.red);
    // Don't exit the process, just log the error
    console.log('Continuing without database connection'.yellow);
    throw error; // Propagate the error for proper handling
  }
};

module.exports = connectDB; 