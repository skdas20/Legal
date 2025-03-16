const DAO = require('../models/DAO');
const User = require('../models/User');
const { createDAOOnBlockchain } = require('../utils/blockchain');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new DAO
// @route   POST /api/daos
// @access  Private
exports.createDAO = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Create DAO
  const dao = await DAO.create(req.body);

  res.status(201).json({
    success: true,
    data: dao
  });
});

// @desc    Get all DAOs
// @route   GET /api/daos
// @access  Public
exports.getDAOs = asyncHandler(async (req, res, next) => {
  const daos = await DAO.find();

  res.status(200).json({
    success: true,
    count: daos.length,
    data: daos
  });
});

// @desc    Get user DAOs
// @route   GET /api/daos/user
// @access  Private
exports.getUserDAOs = asyncHandler(async (req, res, next) => {
  const daos = await DAO.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: daos.length,
    data: daos
  });
});

// @desc    Get single DAO
// @route   GET /api/daos/:id
// @access  Public
exports.getDAO = asyncHandler(async (req, res, next) => {
  const dao = await DAO.findById(req.params.id);

  if (!dao) {
    return next(new ErrorResponse(`DAO not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: dao
  });
});

// @desc    Update DAO
// @route   PUT /api/daos/:id
// @access  Private
exports.updateDAO = asyncHandler(async (req, res, next) => {
  let dao = await DAO.findById(req.params.id);

  if (!dao) {
    return next(new ErrorResponse(`DAO not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is DAO owner
  if (dao.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this DAO`, 401));
  }

  dao = await DAO.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: dao
  });
});

// @desc    Update DAO blockchain info
// @route   PUT /api/daos/:id/blockchain
// @access  Private
exports.updateDAOBlockchain = asyncHandler(async (req, res, next) => {
  const { contractAddress, transactionHash, creatorAddress } = req.body;

  if (!contractAddress || !transactionHash || !creatorAddress) {
    return next(new ErrorResponse('Please provide contractAddress, transactionHash, and creatorAddress', 400));
  }

  let dao = await DAO.findById(req.params.id);

  if (!dao) {
    return next(new ErrorResponse(`DAO not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is DAO owner
  if (dao.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this DAO`, 401));
  }

  dao = await DAO.findByIdAndUpdate(
    req.params.id, 
    { contractAddress, transactionHash, creatorAddress }, 
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: dao
  });
});

// @desc    Delete DAO
// @route   DELETE /api/daos/:id
// @access  Private
exports.deleteDAO = asyncHandler(async (req, res, next) => {
  const dao = await DAO.findById(req.params.id);

  if (!dao) {
    return next(new ErrorResponse(`DAO not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is DAO owner
  if (dao.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this DAO`, 401));
  }

  await dao.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get a single DAO by ID
exports.getDAOById = async (req, res) => {
  try {
    const dao = await DAO.findById(req.params.id)
      .populate('members', 'username email walletAddress');
    
    if (!dao) {
      return res.status(404).json({ message: 'DAO not found' });
    }
    
    // Check if user is a member of this DAO
    if (!dao.members.some(member => member._id.toString() === req.userId)) {
      return res.status(403).json({ message: 'Not authorized to view this DAO' });
    }
    
    res.json(dao);
  } catch (error) {
    console.error('Get DAO error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a member to a DAO
exports.addMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    
    // Find DAO
    const dao = await DAO.findById(req.params.id);
    
    if (!dao) {
      return res.status(404).json({ message: 'DAO not found' });
    }
    
    // Check if user is the creator of this DAO
    if (dao.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to add members to this DAO' });
    }
    
    // Check if member already exists
    if (dao.members.includes(memberId)) {
      return res.status(400).json({ message: 'User is already a member of this DAO' });
    }
    
    // Add member to DAO
    dao.members.push(memberId);
    await dao.save();
    
    // Add DAO to user's DAOs
    await User.findByIdAndUpdate(
      memberId,
      { $push: { daos: dao._id } }
    );
    
    res.json(dao);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a member from a DAO
exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    
    // Find DAO
    const dao = await DAO.findById(req.params.id);
    
    if (!dao) {
      return res.status(404).json({ message: 'DAO not found' });
    }
    
    // Check if user is the creator of this DAO
    if (dao.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to remove members from this DAO' });
    }
    
    // Check if trying to remove the creator
    if (memberId === dao.createdBy.toString()) {
      return res.status(400).json({ message: 'Cannot remove the creator of the DAO' });
    }
    
    // Remove member from DAO
    dao.members = dao.members.filter(member => member.toString() !== memberId);
    await dao.save();
    
    // Remove DAO from user's DAOs
    await User.findByIdAndUpdate(
      memberId,
      { $pull: { daos: dao._id } }
    );
    
    res.json(dao);
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new proposal
exports.createProposal = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Find DAO
    const dao = await DAO.findById(req.params.id);
    
    if (!dao) {
      return res.status(404).json({ message: 'DAO not found' });
    }
    
    // Check if user is a member of this DAO
    if (!dao.members.some(member => member.toString() === req.userId)) {
      return res.status(403).json({ message: 'Not authorized to create proposals in this DAO' });
    }
    
    // Create proposal
    const proposal = {
      title,
      description,
      votesFor: 0,
      votesAgainst: 0,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      executed: false
    };
    
    // Add proposal to DAO
    dao.proposals.push(proposal);
    await dao.save();
    
    res.status(201).json(dao);
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on a proposal
exports.voteOnProposal = async (req, res) => {
  try {
    const { proposalId, support } = req.body;
    
    // Find DAO
    const dao = await DAO.findById(req.params.id);
    
    if (!dao) {
      return res.status(404).json({ message: 'DAO not found' });
    }
    
    // Check if user is a member of this DAO
    if (!dao.members.some(member => member.toString() === req.userId)) {
      return res.status(403).json({ message: 'Not authorized to vote in this DAO' });
    }
    
    // Find proposal
    const proposal = dao.proposals.id(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    // Check if voting period has ended
    if (new Date() > proposal.deadline) {
      return res.status(400).json({ message: 'Voting period has ended' });
    }
    
    // Check if proposal has been executed
    if (proposal.executed) {
      return res.status(400).json({ message: 'Proposal has already been executed' });
    }
    
    // Update votes
    if (support) {
      proposal.votesFor += 1;
    } else {
      proposal.votesAgainst += 1;
    }
    
    await dao.save();
    
    res.json(dao);
  } catch (error) {
    console.error('Vote on proposal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Execute a proposal
exports.executeProposal = async (req, res) => {
  try {
    const { proposalId } = req.body;
    
    // Find DAO
    const dao = await DAO.findById(req.params.id);
    
    if (!dao) {
      return res.status(404).json({ message: 'DAO not found' });
    }
    
    // Check if user is a member of this DAO
    if (!dao.members.some(member => member.toString() === req.userId)) {
      return res.status(403).json({ message: 'Not authorized to execute proposals in this DAO' });
    }
    
    // Find proposal
    const proposal = dao.proposals.id(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }
    
    // Check if voting period has ended
    if (new Date() < proposal.deadline) {
      return res.status(400).json({ message: 'Voting period has not ended yet' });
    }
    
    // Check if proposal has been executed
    if (proposal.executed) {
      return res.status(400).json({ message: 'Proposal has already been executed' });
    }
    
    // Check if proposal has passed
    if (proposal.votesFor <= proposal.votesAgainst) {
      return res.status(400).json({ message: 'Proposal did not pass' });
    }
    
    // Execute proposal
    proposal.executed = true;
    await dao.save();
    
    res.json(dao);
  } catch (error) {
    console.error('Execute proposal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 