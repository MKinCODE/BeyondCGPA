const mongoose = require('mongoose');

const opportunityMatchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
      index: true
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 75
    },
    matchReasons: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ['Discovered', 'Saved', 'Applied', 'Interviewing', 'Rejected', 'Offer'],
      default: 'Discovered'
    },
    studentNotes: {
      type: String,
      default: ''
    },
    appliedDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Unique match per user per opportunity
opportunityMatchSchema.index({ user: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('OpportunityMatch', opportunityMatchSchema);
