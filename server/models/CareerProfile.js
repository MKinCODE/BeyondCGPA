const mongoose = require('mongoose');

const careerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    // Structured student inputs
    targetDomain: {
      type: String,
      enum: ['Fullstack', 'Backend', 'Frontend', 'AI/ML', 'Cloud/DevOps', 'DataEngineering', 'Undecided'],
      default: 'Fullstack'
    },
    targetCompaniesCategory: {
      type: [String],
      default: ['Product-based', 'Startups', 'Tech Giants']
    },
    weeklyHours: {
      type: Number,
      default: 14,
      min: 2,
      max: 60
    },
    preferredPace: {
      type: String,
      enum: ['Balanced', 'Accelerated', 'DeepFoundation'],
      default: 'Balanced'
    },
    currentProficiency: {
      dsa: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
      },
      development: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
      },
      coreCS: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
      },
      systemDesign: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
      }
    },
    interests: {
      type: [String],
      default: ['Web Development', 'System Architecture', 'APIs']
    },
    knownLanguages: {
      type: [String],
      default: ['JavaScript', 'C++', 'Python']
    },

    // Raw user inputs preserved without modification
    rawAnswers: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    // CIE-derived analysis & decisions (computed dynamically, never overwriting raw data)
    cieDerived: {
      readinessHorizon: {
        estimatedWeeks: { type: Number, default: 24 },
        targetCompletionEstimate: { type: String, default: '6 months' },
        currentPreparednessScore: { type: Number, default: 15 }, // 0 - 100
        rationale: { type: String, default: 'Based on baseline skills, weekly study commitment, and curriculum workload units.' }
      },
      focusRecommendation: {
        primaryCategory: { type: String, default: 'DSA' },
        reason: { type: String, default: 'Building core problem-solving foundation' }
      },
      strengths: [String],
      growthAreas: [String],
      lastEvaluatedAt: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CareerProfile', careerProfileSchema);
