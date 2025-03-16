const express = require('express');
const {
  createDAO,
  getDAOs,
  getUserDAOs,
  getDAO,
  updateDAO,
  updateDAOBlockchain,
  deleteDAO
} = require('../controllers/daoController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getDAOs);
router.get('/:id', getDAO);

// Protected routes
router.post('/', protect, createDAO);
router.get('/user/me', protect, getUserDAOs);
router.put('/:id', protect, updateDAO);
router.put('/:id/blockchain', protect, updateDAOBlockchain);
router.delete('/:id', protect, deleteDAO);

module.exports = router; 