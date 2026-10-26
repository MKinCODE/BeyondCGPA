const opportunityService = require('../services/opportunityService');
const opportunitySyncService = require('../services/opportunitySyncService');
const OpportunityMatch = require('../models/OpportunityMatch');
const Opportunity = require('../models/Opportunity');

/**
 * Get personalized CIE-ranked opportunities feed with smart daily background sync
 */
const getOpportunitiesFeed = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, workplaceType } = req.query;

    // Automatically check for daily refresh & clean up expired postings (cached, runs <= once every 12h)
    await opportunitySyncService.syncDailyOpportunities();

    const feed = await opportunityService.getStudentOpportunityFeed(userId, { type, workplaceType });

    res.status(200).json({
      success: true,
      count: feed.length,
      opportunities: feed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status (Discovered, Saved, Applied, Interviewing, Offer)
 */
const updateOpportunityStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { opportunityId } = req.params;
    const { status, notes } = req.body;

    const updatedMatch = await opportunityService.updateApplicationStatus(userId, opportunityId, { status, notes });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      match: updatedMatch
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student's tracked applications
 */
const getTrackedApplications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const matches = await OpportunityMatch.find({
      user: userId,
      status: { $in: ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'] }
    }).populate('opportunity');

    res.status(200).json({
      success: true,
      tracked: matches
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manual or webhook ATS ingestion endpoint
 */
const ingestOpportunity = async (req, res, next) => {
  try {
    const opportunity = await opportunityService.ingestOpportunity(req.body);
    res.status(201).json({
      success: true,
      opportunity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manual trigger to dispatch notification alerts for an opportunity
 */
const notifyOpportunityMatches = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    const result = await opportunityService.notifyMatchingUsersForOpportunity(opportunity);
    res.status(200).json({
      success: true,
      message: `Alerts dispatched: ${result.notifiedCount} students notified, ${result.skippedCount} skipped`,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit community feedback on whether a job posting still exists/is active
 */
const submitOpportunityFeedback = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { opportunityId } = req.params;
    const { isStillOpen, reason } = req.body;

    const result = await opportunitySyncService.recordCommunityFeedback(userId, opportunityId, { isStillOpen, reason });
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger explicit opportunity sync & fresh roles ingestion
 */
const triggerOpportunitySync = async (req, res, next) => {
  try {
    const result = await opportunitySyncService.syncDailyOpportunities({ force: true });
    res.status(200).json({
      success: true,
      message: 'Opportunity sync completed successfully',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOpportunitiesFeed,
  updateOpportunityStatus,
  getTrackedApplications,
  ingestOpportunity,
  notifyOpportunityMatches,
  submitOpportunityFeedback,
  triggerOpportunitySync
};
