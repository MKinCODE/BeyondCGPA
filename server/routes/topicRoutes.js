const express = require('express');
const router = express.Router();
const {
  getTopicByDate,
  getCalendarOverview,
  markTopicViewed,
  getAllTopics
} = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');

// Calendar overview can be viewed public/authenticated
router.get('/calendar', protect, getCalendarOverview);
router.get('/explore', protect, getAllTopics);
router.get('/date/:date', protect, getTopicByDate);
router.get('/today', protect, getTopicByDate);
router.post('/viewed', protect, markTopicViewed);

module.exports = router;
