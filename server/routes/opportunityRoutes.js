const express = require('express');
const router = express.Router();
const {
  getOpportunitiesFeed,
  updateOpportunityStatus,
  getTrackedApplications,
  ingestOpportunity,
  notifyOpportunityMatches,
  submitOpportunityFeedback,
  triggerOpportunitySync
} = require('../controllers/opportunityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/feed', getOpportunitiesFeed);
router.get('/tracked', getTrackedApplications);
router.post('/sync', triggerOpportunitySync);
router.put('/:opportunityId/status', updateOpportunityStatus);
router.post('/:opportunityId/feedback', submitOpportunityFeedback);
router.post('/ingest', ingestOpportunity);
router.post('/:opportunityId/notify', notifyOpportunityMatches);

module.exports = router;
