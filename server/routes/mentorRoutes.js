const express = require('express');
const router = express.Router();
const { getConversation, sendMessage, clearHistory } = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/conversation', getConversation);
router.post('/message', sendMessage);
router.delete('/history', clearHistory);

module.exports = router;
