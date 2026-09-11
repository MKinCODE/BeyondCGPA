const express = require('express');
const router = express.Router();
const {
  getNextOnboardingQuestion,
  submitOnboarding,
  getProfile,
  updateProfile
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/onboarding/next-question', getNextOnboardingQuestion);
router.post('/onboarding', submitOnboarding);
router.get('/', getProfile);
router.put('/', updateProfile);

module.exports = router;
