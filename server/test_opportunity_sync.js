const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Opportunity = require('./models/Opportunity');
const opportunitySyncService = require('./services/opportunitySyncService');

async function testOpportunitySyncAndFeedback() {
  console.log('--- Testing Opportunity Daily Sync & Community Verification Engine ---');
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  try {
    // 1. Run sync
    console.log('1. Triggering initial opportunity sync...');
    const syncResult = await opportunitySyncService.syncDailyOpportunities({ force: true });
    console.log(`Synced ${syncResult.newlyIngested} opportunities across platforms. Cache isFresh: ${opportunitySyncService.isCacheFresh()}`);

    const allActive = await Opportunity.find({ isActive: true });
    console.log(`Active opportunities in DB: ${allActive.length}`);
    if (allActive.length === 0) {
      throw new Error('Expected active opportunities after sync!');
    }

    const testOpp = allActive[0];
    console.log(`Selected test opportunity: "${testOpp.title}" at ${testOpp.company} [ID: ${testOpp._id}, Source: ${testOpp.sourcePlatform || testOpp.source}]`);

    // 2. Submit positive feedback
    const fakeUserId1 = new mongoose.Types.ObjectId();
    const upvoteResult = await opportunitySyncService.recordCommunityFeedback(fakeUserId1, testOpp._id, { isStillOpen: true });
    console.log(`Positive feedback recorded:`, {
      upvotes: upvoteResult.opportunity.verificationVotes.upvotes,
      reportCount: upvoteResult.opportunity.reportCount,
      isActive: upvoteResult.opportunity.isActive
    });

    if (upvoteResult.opportunity.verificationVotes.upvotes !== 1) {
      throw new Error('Upvote count was not incremented');
    }

    // 3. Submit negative feedback from user 2
    const fakeUserId2 = new mongoose.Types.ObjectId();
    const report1 = await opportunitySyncService.recordCommunityFeedback(fakeUserId2, testOpp._id, { isStillOpen: false });
    console.log(`First negative report recorded: reportCount = ${report1.opportunity.reportCount}, isActive = ${report1.opportunity.isActive}`);

    if (report1.opportunity.reportCount !== 1 || report1.opportunity.isActive !== true) {
      throw new Error('First report should increment count but leave role active until threshold');
    }

    // 4. Submit negative feedback from user 3 (reaching threshold of 2)
    const fakeUserId3 = new mongoose.Types.ObjectId();
    const report2 = await opportunitySyncService.recordCommunityFeedback(fakeUserId3, testOpp._id, { isStillOpen: false, reason: 'Link dead on Ashby' });
    console.log(`Second negative report recorded: reportCount = ${report2.opportunity.reportCount}, isActive = ${report2.opportunity.isActive}, reason = "${report2.opportunity.expiryReason}"`);

    if (report2.opportunity.isActive !== false) {
      throw new Error('Opportunity should be deactivated after 2 negative reports');
    }

    // 5. Test Auto-deactivation of past deadlines
    console.log('5. Testing auto-deactivation of expired deadlines...');
    const pastOpp = await Opportunity.create({
      title: 'Old Summer Intern',
      company: 'Legacy Corp',
      description: 'Role from the past',
      domain: 'Backend',
      skillsRequired: ['Node.js'],
      deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      isActive: true,
      postedDate: new Date(Date.now() - 30 * 60 * 60 * 1000),
      applyUrl: 'https://example.com/apply-old',
      source: 'StructuredExternal',
      sourceId: 'legacy-123',
      deduplicationHash: 'legacy-hash-123'
    });

    const expiredCount = await opportunitySyncService.deactivateExpiredOpportunities();
    console.log(`Expired roles auto-deactivated: ${expiredCount}`);

    const checkedPast = await Opportunity.findById(pastOpp._id);
    console.log(`Past role state: isActive = ${checkedPast.isActive}, expiryReason = "${checkedPast.expiryReason}"`);

    if (checkedPast.isActive !== false) {
      throw new Error('Past deadline role was not deactivated!');
    }

    console.log('\n========================================================');
    console.log('🎉 ALL OPPORTUNITY SYNC & FEEDBACK TESTS PASSED!');
    console.log('========================================================\n');
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
  }
}

testOpportunitySyncAndFeedback().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
