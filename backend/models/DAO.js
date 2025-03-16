const mongoose = require('mongoose');

const DAOSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  tokenName: {
    type: String,
    required: [true, 'Please add a token name'],
    trim: true
  },
  tokenSymbol: {
    type: String,
    required: [true, 'Please add a token symbol'],
    trim: true
  },
  votingPeriod: {
    type: Number,
    required: [true, 'Please add a voting period'],
    default: 3 // days
  },
  quorumPercentage: {
    type: Number,
    required: [true, 'Please add a quorum percentage'],
    min: [1, 'Quorum percentage must be at least 1'],
    max: [100, 'Quorum percentage cannot be more than 100'],
    default: 51
  },
  proposalThreshold: {
    type: Number,
    required: [true, 'Please add a proposal threshold'],
    default: 1
  },
  contractAddress: {
    type: String,
    default: null
  },
  transactionHash: {
    type: String,
    default: null
  },
  creatorAddress: {
    type: String,
    default: null
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DAO', DAOSchema); 