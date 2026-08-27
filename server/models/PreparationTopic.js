const mongoose = require('mongoose');

const practiceQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  platform: { type: String, default: 'LeetCode' },
  url: { type: String, default: '' },
  description: { type: String, default: '' },
  sampleSolutionGuide: { type: String, default: '' }
});

const preparationTopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['DSA', 'Development', 'OOP', 'DBMS', 'OS', 'SystemDesign', 'Projects', 'InterviewPrep']
    },
    domainRelevance: {
      type: [String],
      default: ['Fullstack', 'Backend', 'Frontend', 'AI/ML', 'Cloud/DevOps', 'All']
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    allocatedEffortUnits: {
      type: Number,
      required: true,
      default: 3, // Planned learning effort units (e.g. 3 sessions/workload units)
      min: 1
    },
    order: {
      type: Number,
      default: 1
    },
    prerequisites: [
      {
        type: String // Slugs of prerequisite topics
      }
    ],
    summary: {
      type: String,
      required: true
    },
    keyConcepts: [
      {
        title: String,
        description: String,
        codeSnippet: String
      }
    ],
    practiceQuestions: [practiceQuestionSchema],
    actionableChecklist: [String],
    estimatedHoursPerUnit: {
      type: Number,
      default: 1.5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PreparationTopic', preparationTopicSchema);
