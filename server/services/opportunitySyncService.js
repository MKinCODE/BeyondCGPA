const Opportunity = require('../models/Opportunity');
const opportunityService = require('./opportunityService');
const opportunityAdapters = require('./opportunityAdapters');

let lastSyncTimestamp = 0;
const SYNC_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

class OpportunitySyncService {
  isCacheFresh() {
    return Boolean(lastSyncTimestamp && (Date.now() - lastSyncTimestamp < SYNC_INTERVAL_MS));
  }

  async deactivateExpiredOpportunities() {
    const expiredByDeadline = await Opportunity.updateMany(
      { isActive: true, deadline: { $lt: new Date() } },
      { $set: { isActive: false, expiryReason: 'Application deadline passed' } }
    );

    const expiredByCommunity = await Opportunity.updateMany(
      { isActive: true, reportCount: { $gte: 2 } },
      { $set: { isActive: false, expiryReason: 'Reported closed by community' } }
    );

    return (expiredByDeadline.modifiedCount || 0) + (expiredByCommunity.modifiedCount || 0);
  }

  /**
   * Runs daily search, ingestion, and auto-expiration cleanup.
   * Cached to run at most once per 12 hours unless forced.
   */
  async syncDailyOpportunities({ force = false } = {}) {
    const now = Date.now();
    if (!force && this.isCacheFresh()) {
      const activeCount = await Opportunity.countDocuments({ isActive: true });
      return {
        cached: true,
        lastSync: new Date(lastSyncTimestamp),
        activeCount
      };
    }

    console.log('🔄 [OpportunitySync] Starting daily opportunity search, ingestion & expiration check...');

    // 1. Step 1: Cleanup Expired Opportunities (Deadline passed or reported)
    const expiredDeactivated = await this.deactivateExpiredOpportunities();

    // 2. Step 2: Fetch fresh opportunities from structured adapters
    const dailyOpportunities = opportunityAdapters.getDailyStructuredOpportunities();

    let ingestedCount = 0;
    for (const item of dailyOpportunities) {
      try {
        await opportunityService.ingestOpportunity({ ...item, notify: false });
        ingestedCount++;
      } catch (err) {
        console.warn(`[OpportunitySync] Could not ingest ${item.title}:`, err.message);
      }
    }

    lastSyncTimestamp = Date.now();
    const totalActive = await Opportunity.countDocuments({ isActive: true });

    console.log(`✅ [OpportunitySync] Synchronized ${ingestedCount} opportunities. Total active in DB: ${totalActive}.`);

    return {
      cached: false,
      newlyIngested: ingestedCount,
      expiredDeactivated,
      totalActive,
      syncedAt: new Date(lastSyncTimestamp)
    };
  }

  /**
   * Community feedback loop: records whether a role is still active or expired after user clicks Apply
   */
  async recordCommunityFeedback(userId, opportunityId, { isStillOpen = true, reason = '' } = {}) {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    if (!opportunity.verificationVotes) {
      opportunity.verificationVotes = { upvotes: 0, downvotes: 0 };
    }
    if (!opportunity.verifiedByUsers) opportunity.verifiedByUsers = [];
    if (!opportunity.reportedClosedByUsers) opportunity.reportedClosedByUsers = [];

    const userIdStr = userId.toString();
    const hasUpvoted = opportunity.verifiedByUsers.some(id => id.toString() === userIdStr);
    const hasDownvoted = opportunity.reportedClosedByUsers.some(id => id.toString() === userIdStr);

    if (hasUpvoted || hasDownvoted) {
      return {
        alreadyVoted: true,
        isStillOpen: opportunity.isActive,
        upvotes: opportunity.verificationVotes.upvotes,
        downvotes: opportunity.verificationVotes.downvotes,
        message: 'You have already submitted verification feedback for this opportunity.'
      };
    }

    if (isStillOpen) {
      opportunity.verifiedByUsers.push(userId);
      opportunity.verificationVotes.upvotes = (opportunity.verificationVotes.upvotes || 0) + 1;
      opportunity.lastVerifiedAt = new Date();
    } else {
      opportunity.reportedClosedByUsers.push(userId);
      opportunity.verificationVotes.downvotes = (opportunity.verificationVotes.downvotes || 0) + 1;
      opportunity.reportCount = (opportunity.reportCount || 0) + 1;

      // Auto-deactivate if 2 or more students flag as closed/expired
      if (opportunity.reportCount >= 2) {
        opportunity.isActive = false;
        opportunity.expiryReason = reason || 'Reported closed / expired by student community';
      }
    }

    await opportunity.save();

    return {
      success: true,
      alreadyVoted: false,
      opportunity,
      isStillOpen: opportunity.isActive,
      upvotes: opportunity.verificationVotes.upvotes,
      downvotes: opportunity.verificationVotes.downvotes,
      reportCount: opportunity.reportCount,
      message: isStillOpen
        ? 'Thank you! You verified this opportunity as active for the community.'
        : opportunity.isActive
          ? 'Thank you! Your feedback has been noted.'
          : 'Thank you! Based on community feedback, this opportunity has been marked as closed.'
    };
  }
}

module.exports = new OpportunitySyncService();
