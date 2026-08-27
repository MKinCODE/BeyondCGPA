const express = require('express');
const router = express.Router();
const {
  requestSignupOTP,
  verifyOTPAndRegister,
  loginWithPassword,
  googleAuth,
  adminQuickLogin,
  getMe,
  getConfigStatus
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup-otp', requestSignupOTP);
router.post('/verify-register', verifyOTPAndRegister);
router.post('/login-password', loginWithPassword);
router.post('/google', googleAuth);
router.post('/admin-login', adminQuickLogin);

router.get('/me', protect, getMe);
router.get('/config-status', getConfigStatus);

module.exports = router;
