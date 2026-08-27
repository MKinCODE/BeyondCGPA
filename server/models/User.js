const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      select: false // Never return password in standard queries
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    avatar: {
      type: String,
      default: 'https://api.dicebear.com/7.x/bottts/svg?seed=student'
    },
    college: {
      type: String,
      default: ''
    },
    branch: {
      type: String,
      default: 'Computer Science & Engineering'
    },
    graduationYear: {
      type: Number,
      default: new Date().getFullYear() + 2
    },
    currentRoleTarget: {
      type: String,
      default: 'Full Stack Engineer'
    },
    authProvider: {
      type: String,
      enum: ['google', 'local'],
      default: 'local'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    verificationCode: {
      type: String,
      select: false
    },
    verificationCodeExpires: {
      type: Date,
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student'
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
