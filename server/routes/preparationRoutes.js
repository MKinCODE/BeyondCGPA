const express = require('express');
const router = express.Router();
const {
  getRoadmap,
  getTodaysFocus,
  getTopicsByCategory,
  getTopicDetail,
  logEffort
} = require('../controllers/preparationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/roadmap', getRoadmap);
router.get('/todays-focus', getTodaysFocus);
router.get('/categories/:category', getTopicsByCategory);
router.get('/topics/:idOrSlug', getTopicDetail);
router.post('/effort', logEffort);

module.exports = router;
