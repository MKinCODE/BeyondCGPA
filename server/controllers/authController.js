const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const emailService = require('../services/emailService');
const { config, getConfigDiagnostics } = require('../config/env');

const googleClient = config.GOOGLE_CLIENT_ID ? new OAuth2Client(config.GOOGLE_CLIENT_ID) : null;

const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

/**
 * Step 1 of Signup: Validate details, generate 6-digit OTP, dispatch to email
 */
const requestSignupOTP = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are all required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists and is verified
    let user = await User.findOne({ email: cleanEmail });
    if (user && user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email is already registered and verified. Please sign in.'
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!user) {
      user = new User({
        email: cleanEmail,
        name: name.trim(),
        password: hashedPassword,
        isEmailVerified: false,
        authProvider: 'local',
        verificationCode: otpCode,
        verificationCodeExpires: expiresAt
      });
    } else {
      // Update unverified user
      user.name = name.trim();
      user.password = hashedPassword;
      user.verificationCode = otpCode;
      user.verificationCodeExpires = expiresAt;
    }

    await user.save();

    // Dispatch OTP via Email Service
    const dispatchResult = await emailService.sendVerificationOTP(cleanEmail, name, otpCode);

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Please enter the 6-digit code to complete registration.`,
      email: cleanEmail,
      previewOtp: dispatchResult.previewOtp // Returned in dev mode if SMTP not configured
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 2 of Signup: Verify 6-digit OTP and complete account registration
 */
const verifyOTPAndRegister = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+verificationCode +verificationCodeExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Signup request not found. Please start signup again.'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. Please sign in.'
      });
    }

    if (!user.verificationCode || user.verificationCode !== otpCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    // Mark verified
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Initialize CareerProfile if not existing
    let profile = await CareerProfile.findOne({ user: user._id });
    if (!profile) {
      profile = await CareerProfile.create({
        user: user._id,
        targetDomain: 'Fullstack',
        weeklyHours: 14
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Account created.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        onboardingCompleted: user.onboardingCompleted,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sign In with Email and Password
 */
const loginWithPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was created via Google OAuth. Please sign in with Google.'
      });
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your email has not been verified yet. Please complete signup verification.',
        needsVerification: true,
        email: cleanEmail
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        onboardingCompleted: user.onboardingCompleted,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Genuine Google OAuth Token Verification
 */
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential token is required'
      });
    }

    if (!config.GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        success: false,
        message: 'Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID or use Email/Password login.',
        diagnostics: getConfigDiagnostics()
      });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return res.status(401).json({
        success: false,
        message: `Google token verification failed: ${verifyErr.message}`
      });
    }

    const { sub: googleId, email, name, picture: avatar } = payload;
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      user = await User.create({
        googleId,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        authProvider: 'google',
        isEmailVerified: true,
        onboardingCompleted: false
      });

      await CareerProfile.create({
        user: user._id,
        targetDomain: 'Fullstack',
        weeklyHours: 14
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        onboardingCompleted: user.onboardingCompleted,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Seed or Authenticate Admin/Reviewer User
 */
const adminQuickLogin = async (req, res, next) => {
  try {
    const adminEmail = 'admin@beyondcgpa.dev';
    const adminPass = 'Admin@2026';

    let user = await User.findOne({ email: adminEmail }).select('+password');

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPass, salt);

      user = await User.create({
        email: adminEmail,
        name: 'BeyondCGPA Admin',
        password: hashedPassword,
        isEmailVerified: true,
        role: 'admin',
        authProvider: 'local',
        onboardingCompleted: true,
        college: 'Stanford / IIT',
        branch: 'Computer Science and Engineering',
        graduationYear: 2026,
        currentRoleTarget: 'Lead Software Engineer'
      });

      await CareerProfile.create({
        user: user._id,
        targetDomain: 'Fullstack',
        weeklyHours: 16
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Admin session authenticated successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        onboardingCompleted: user.onboardingCompleted,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await CareerProfile.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        onboardingCompleted: user.onboardingCompleted,
        role: user.role
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return system diagnostic configuration state
 */
const getConfigStatus = (req, res) => {
  res.status(200).json({
    success: true,
    diagnostics: getConfigDiagnostics()
  });
};

module.exports = {
  requestSignupOTP,
  verifyOTPAndRegister,
  loginWithPassword,
  googleAuth,
  adminQuickLogin,
  getMe,
  getConfigStatus
};
