const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['Greenhouse', 'Lever', 'Ashby', 'StructuredExternal'],
      default: 'StructuredExternal'
    },
    sourceId: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    companyLogo: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: 'Remote / Bengaluru, India'
    },
    type: {
      type: String,
      enum: ['Internship', 'FullTime', 'EarlyCareer'],
      default: 'Internship'
    },
    workplaceType: {
      type: String,
      enum: ['Remote', 'Hybrid', 'Onsite'],
      default: 'Remote'
    },
    domain: {
      type: String,
      enum: ['Fullstack', 'Backend', 'Frontend', 'AI/ML', 'Cloud/DevOps', 'DataEngineering', 'SoftwareEngineering'],
      default: 'SoftwareEngineering'
    },
    targetGraduationYears: {
      type: [Number],
      default: [2025, 2026, 2027, 2028]
    },
    description: {
      type: String,
      required: true
    },
    responsibilities: [String],
    requiredSkills: [String],
    preferredSkills: [String],
    applyUrl: {
      type: String,
      required: true
    },
    salaryRange: {
      type: String,
      default: 'Competitive Stipend / Package'
    },
    deadline: {
      type: Date
    },
    postedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    deduplicationHash: {
      type: String,
      unique: true,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
