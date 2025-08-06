const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: true,
    unique: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  clientPhone: {
    type: String,
    required: true,
    trim: true
  },
  clientAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  caseType: {
    type: String,
    required: true,
    enum: ['personal_injury', 'criminal_defense', 'family_law', 'business_law', 'estate_planning', 'immigration', 'other']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'on_hold', 'pending'],
    default: 'active'
  },
  attorney: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caseManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['contract', 'evidence', 'correspondence', 'court_filing', 'other'],
      default: 'other'
    }
  }],
  importantDates: [{
    title: String,
    date: Date,
    description: String,
    type: {
      type: String,
      enum: ['court_date', 'deadline', 'meeting', 'other'],
      default: 'other'
    }
  }],
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  billingRate: {
    type: Number,
    default: 0
  },
  totalBilled: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

caseSchema.pre('save', async function(next) {
  if (!this.caseNumber) {
    const count = await mongoose.model('Case').countDocuments();
    this.caseNumber = `CASE-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Case', caseSchema);