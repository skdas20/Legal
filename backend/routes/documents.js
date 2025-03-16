const express = require('express');
const {
  createDocument,
  getDocuments,
  getUserDocuments,
  getDocument,
  updateDocument,
  updateDocumentBlockchain,
  deleteDocument
} = require('../controllers/documentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.post('/', protect, createDocument);
router.get('/user', protect, getUserDocuments);
router.get('/:id', protect, getDocument);
router.put('/:id', protect, updateDocument);
router.put('/:id/blockchain', protect, updateDocumentBlockchain);
router.delete('/:id', protect, deleteDocument);

// Admin only routes
router.get('/', protect, authorize('admin'), getDocuments);

module.exports = router; 