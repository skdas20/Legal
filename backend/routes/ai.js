const express = require('express');
const {
  generateDocument,
  reviewContract,
  reviewContractImage,
  chat
} = require('../controllers/aiController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');

// Test route that doesn't require authentication
router.get('/test', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "AI API is working properly",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Test route error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'AI service is not working properly'
    });
  }
});

// Simple echo route for testing
router.post('/echo', (req, res) => {
  try {
    const { message } = req.body;
    res.status(200).json({
      success: true,
      message: "Echo successful",
      data: {
        response: `You said: ${message || 'nothing'}`
      }
    });
  } catch (error) {
    console.error('Echo route error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Echo service failed'
    });
  }
});

// Protected routes
router.post('/generate-document', protect, generateDocument);
router.post('/review-contract', protect, reviewContract);
router.post('/review-contract-image', protect, reviewContractImage);
router.post('/chat', protect, chat);

module.exports = router; 