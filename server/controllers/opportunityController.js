const opportunityService = require('../services/opportunityService');
const OpportunityMatch = require('../models/OpportunityMatch');
const Opportunity = require('../models/Opportunity');

/**
 * Get personalized CIE-ranked opportunities feed
 */
const getOpportunitiesFeed = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, workplaceType } = req.query;

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

module.exports = {
  getOpportunitiesFeed,
  updateOpportunityStatus,
  getTrackedApplications,
  ingestOpportunity
};
