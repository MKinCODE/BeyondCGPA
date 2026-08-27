const mongoose = require('mongoose');

const roadmapPhaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['DSA', 'Development', 'OOP', 'DBMS', 'OS', 'SystemDesign', 'Projects', 'InterviewPrep'],
    required: true
  },
  order: { type: Number, required: true },
  topics: [
    {
      topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PreparationTopic',
        required: true
      },
      title: String,
      slug: String,
      allocatedEffortUnits: Number,
      priority: {
        type: String,
        enum: ['Critical', 'High', 'Standard', 'Optional'],
        default: 'High'
      }
    }
  ]
});

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    targetDomain: {
      type: String,
      required: true,
      default: 'Fullstack'
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Archived'],
      default: 'Active'
    },
    phases: [roadmapPhaseSchema],
    totalAllocatedUnits: {
      type: Number,
      default: 0
    },
    completedUnits: {
      type: Number,
      default: 0
    },
    remainingUnits: {
      type: Number,
      default: 0
    },
    adaptationCount: {
      type: Number,
      default: 0
    },
    lastAdaptedReason: {
      type: String,
      default: 'Initial baseline calibration'
    },
    lastAdaptedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
