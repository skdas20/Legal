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

// Make these routes public for testing with Vercel deployment
router.post('/review-contract', reviewContract);
router.post('/review-contract-image', reviewContractImage);
router.post('/chat', chat);

// Protected routes - only the document generation requires auth
router.post('/generate-document', protect, generateDocument);

module.exports = router; 