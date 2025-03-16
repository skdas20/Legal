const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err.stack ? err.stack.red : err.message.red);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // AI API errors
  if (err.message && err.message.includes('API key')) {
    error = new ErrorResponse('AI service authentication failed. Please check API key configuration.', 500);
  } else if (err.message && err.message.includes('quota')) {
    error = new ErrorResponse('AI service quota exceeded. Please try again later.', 429);
  } else if (err.message && err.message.includes('safety')) {
    error = new ErrorResponse('Content was flagged by safety filters. Please modify your request.', 400);
  } else if (err.message && err.message.includes('timeout')) {
    error = new ErrorResponse('AI service request timed out. Please try again.', 504);
  }

  // Network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    error = new ErrorResponse('Service unavailable. Please try again later.', 503);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler; 