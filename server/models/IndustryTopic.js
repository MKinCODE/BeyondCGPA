const mongoose = require('mongoose');

const industryTopicSchema = new mongoose.Schema(
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
    date: {
      type: String, // Format: YYYY-MM-DD for deterministic calendar lookup
      required: true,
      unique: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Backend', 'Frontend', 'AI/ML', 'Cloud', 'DevOps', 'Security', 'Databases', 'SystemDesign', 'TrendingTech']
    },
    headline: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true
    },
    deepDiveContent: {
      type: String,
      required: true
    },
    whyItMattersInIndustry: {
      type: String,
      required: true
    },
    realWorldUseCases: [
      {
        company: String,
        useCase: String
      }
    ],
    architectureConcept: {
      type: String,
      default: ''
    },
    keyTakeaways: [
      {
        type: String
      }
    ],
    furtherReadingLinks: [
      {
        title: String,
        url: String
      }
    ],
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('IndustryTopic', industryTopicSchema);
