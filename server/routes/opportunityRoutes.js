const express = require('express');
const router = express.Router();
const {
  getOpportunitiesFeed,
  updateOpportunityStatus,
  getTrackedApplications,
  ingestOpportunity
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/feed', getOpportunitiesFeed);
router.get('/tracked', getTrackedApplications);
router.put('/:opportunityId/status', updateOpportunityStatus);
router.post('/ingest', ingestOpportunity);

module.exports = router;
