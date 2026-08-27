const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  durationMinutes: { type: Number, default: 45 },
  unitsLogged: { type: Number, default: 1 },
  notes: { type: String, default: '' },
  problemsSolved: [String]
});

const preparationProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PreparationTopic',
      required: true
    },
    status: {
      type: String,
      enum: ['NotStarted', 'InProgress', 'Completed'],
      default: 'NotStarted'
    },
    totalAllocatedUnits: {
      type: Number,
      required: true,
      default: 3
    },
    completedUnits: {
      type: Number,
      default: 0,
      min: 0
    },
    remainingUnits: {
      type: Number,
      required: true,
      default: 3,
      min: 0
    },
    confidenceScore: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    completedQuestions: [
      {
        type: String // Question Title or ID
      }
    ],
    studentNotes: {
      type: String,
      default: ''
    },
    sessions: [sessionLogSchema],
    lastEngagedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure 1 progress entry per user per topic
preparationProgressSchema.index({ user: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('PreparationProgress', preparationProgressSchema);
