const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  documentType: {
    type: String,
    required: [true, 'Please specify document type'],
    enum: [
      'Non-Disclosure Agreement',
      'Employment Contract',
      'Service Agreement',
      'Terms of Service',
      'Privacy Policy',
      'Lease Agreement',
      'Sales Contract',
      'Partnership Agreement'
    ]
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  parameters: {
    type: Object,
    required: true
  },
  ipfsHash: {
    type: String,
    default: null
  },
  transactionHash: {
    type: String,
    default: null
  },
  ownerAddress: {
    type: String,
    default: null
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  }
});

// Update the updatedAt field on save
documentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Document', documentSchema); 