const express = require('express');
const router = express.Router();
const { getReadinessAnalysis } = require('../controllers/cieController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/readiness', getReadinessAnalysis);

module.exports = router;
