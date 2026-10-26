const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./models/User');
const CareerProfile = require('./models/CareerProfile');
const PreparationTopic = require('./models/PreparationTopic');
const PreparationProgress = require('./models/PreparationProgress');
const Roadmap = require('./models/Roadmap');

const { seedDatabase } = require('./services/seedService');
const onboardingEngine = require('./services/onboardingEngine');
const cieService = require('./services/cieService');
const preparationEngine = require('./services/preparationEngine');

async function runCIEAudit() {
  console.log('🧪 Starting Comprehensive CIE System Logic Audit & Verification...\n');

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  try {
    // Step 0: Seed Database with updated topics
    console.log('--- Step 0: Seeding Curriculum Topics ---');
    await seedDatabase();
    const topicCount = await PreparationTopic.countDocuments();
    console.log(`Total topics in DB: ${topicCount}\n`);

    // =========================================================================
    // CORE DEBUGGING REQUIREMENT: Comparing Two Profiles with Same Goal but Different States
    // =========================================================================
    console.log('--- STEP 1: Two Profiles with Same Goal (Frontend) & Same Strategy (Balanced) ---');
    console.log('Demonstrating that Today\'s Focus is derived mathematically from skill gaps, not hardcoded defaults.\n');

    // Profile A: Beginner in Development, Comfortable in DSA
    const userA = await User.create({
      name: 'Student A (Dev Beginner, DSA Intermediate)',
      email: 'studentA@example.com',
      graduationYear: 2027
    });

    const rawAnswersA = {
      targetDomain: 'Frontend',
      domainProficiency: 'Beginner',
      dsaPreference: 'Balanced',
      dsaProficiency: 'Intermediate',
      priorSkills: ['Arrays_TwoPointers'],
      practicalProjects: 'StartingFresh',
      weeklyHours: 14,
      graduationYear: 2027
    };

    const synthesizedA = await onboardingEngine.synthesizeProfile(rawAnswersA);
    const profileA = await CareerProfile.create({
      user: userA._id,
      targetDomain: synthesizedA.targetDomain,
      dsaPreference: synthesizedA.dsaPreference,
      weeklyHours: synthesizedA.weeklyHours,
      estimatedProficiency: synthesizedA.estimatedProficiency,
      currentProficiency: synthesizedA.currentProficiency,
      selfReportedSkills: synthesizedA.selfReportedSkills,
      selfReportedExperience: synthesizedA.selfReportedExperience,
      cieDerived: { masteredSkills: [] }
    });

    const roadmapA = await cieService.generateBaselineRoadmap(userA._id, profileA);
    const focusA = await preparationEngine.getTodaysFocus(userA._id);

    console.log('Profile A Stored State:');
    console.log('  Target Domain:', profileA.targetDomain);
    console.log('  DSA Preference:', profileA.dsaPreference);
    console.log('  Estimated Proficiency:', profileA.estimatedProficiency);
    console.log('  Self-Reported Skills:', profileA.selfReportedSkills);
    console.log('  Calculated Today\'s Focus:');
    console.log('    Topic:', focusA.topic?.title);
    console.log('    Category:', focusA.category);
    console.log('    Reason:', focusA.reason);
    console.log('    Actionable Task:', focusA.actionableTask?.title, `(${focusA.actionableTask?.url || 'No URL'})`);
    console.log('    Allocations Count:', focusA.allocations?.length);

    // Profile B: Advanced in Development (Built React projects), Beginner in DSA
    const userB = await User.create({
      name: 'Student B (Dev Advanced, DSA Beginner)',
      email: 'studentB@example.com',
      graduationYear: 2027
    });

    const rawAnswersB = {
      targetDomain: 'Frontend',
      domainProficiency: 'Advanced',
      dsaPreference: 'Balanced',
      dsaProficiency: 'Beginner',
      priorSkills: ['React'],
      practicalProjects: 'FullProjects',
      weeklyHours: 14,
      graduationYear: 2027
    };

    const synthesizedB = await onboardingEngine.synthesizeProfile(rawAnswersB);
    const profileB = await CareerProfile.create({
      user: userB._id,
      targetDomain: synthesizedB.targetDomain,
      dsaPreference: synthesizedB.dsaPreference,
      weeklyHours: synthesizedB.weeklyHours,
      estimatedProficiency: synthesizedB.estimatedProficiency,
      currentProficiency: synthesizedB.currentProficiency,
      selfReportedSkills: synthesizedB.selfReportedSkills,
      selfReportedExperience: synthesizedB.selfReportedExperience,
      cieDerived: { masteredSkills: [] }
    });

    const roadmapB = await cieService.generateBaselineRoadmap(userB._id, profileB);
    const focusB = await preparationEngine.getTodaysFocus(userB._id);

    console.log('\nProfile B Stored State:');
    console.log('  Target Domain:', profileB.targetDomain);
    console.log('  DSA Preference:', profileB.dsaPreference);
    console.log('  Estimated Proficiency:', profileB.estimatedProficiency);
    console.log('  Self-Reported Skills:', profileB.selfReportedSkills);
    console.log('  Calculated Today\'s Focus:');
    console.log('    Topic:', focusB.topic?.title);
    console.log('    Category:', focusB.category);
    console.log('    Reason:', focusB.reason);
    console.log('    Actionable Task:', focusB.actionableTask?.title, `(${focusB.actionableTask?.url || 'No URL'})`);
    console.log('    Allocations Count:', focusB.allocations?.length);

    // CRITICAL ASSERTION:
    if (focusA.topic?.title === focusB.topic?.title) {
      throw new Error(`CRITICAL FAILURE: Profile A and B both received ${focusA.topic?.title}! Today's Focus was not personalized to their skill gaps.`);
    }

    if (focusA.topic?.title !== 'Modern React, Component Architecture & State Systems') {
      throw new Error(`Expected Student A to focus on Modern React (dev gap), got: ${focusA.topic?.title}`);
    }

    if (focusB.topic?.title !== 'Arrays & Two Pointers') {
      throw new Error(`Expected Student B to focus on Arrays & Two Pointers (DSA gap), got: ${focusB.topic?.title}`);
    }

    if (!focusA.actionableTask?.url || !focusB.actionableTask?.url) {
      throw new Error('Actionable practice challenge was missing a working practice link!');
    }

    console.log('\n✅ VERIFIED: With the SAME career goal and SAME Balanced strategy:');
    console.log('   - Student A (Dev Beginner) was assigned Development (React)');
    console.log('   - Student B (DSA Beginner) was assigned DSA (Arrays & Two Pointers)');
    console.log('   - Both received actionable practice tasks with direct links!\n');

    // =========================================================================
    // STEP 2: Real Before vs After State Adaptation
    // =========================================================================
    console.log('--- STEP 2: State Transitions & Recalculation ---');

    // 2.1 Demonstrated Mastery: Student B completes Arrays & Two Pointers
    const remainingToCover = focusB.progress.remainingUnits || 4;
    console.log(`--> Event 2.1: Student B logs ${remainingToCover} units with 5/5 confidence on Arrays & Two Pointers...`);
    await preparationEngine.logEffort({
      userId: userB._id,
      topicId: focusB.topic._id,
      unitsCovered: remainingToCover,
      durationMinutes: 90,
      confidenceScore: 5,
      notes: 'Mastered two pointers convergence, cycle detection, and space-time tradeoffs.'
    });

    const updatedProfileB = await CareerProfile.findOne({ user: userB._id });
    const focusBAfterMastery = await preparationEngine.getTodaysFocus(userB._id);

    console.log('  AFTER Mastery State for Student B:');
    console.log('    Mastered Skills:', updatedProfileB.cieDerived.masteredSkills);
    console.log('    Velocity Multiplier:', updatedProfileB.cieDerived.velocityMultiplier);
    console.log('    New Today\'s Focus:', focusBAfterMastery.topic?.title);
    console.log('    Reason:', focusBAfterMastery.reason);

    if (focusBAfterMastery.topic?.title === 'Arrays & Two Pointers') {
      throw new Error('Today\'s Focus failed to advance after mastering Arrays & Two Pointers!');
    }
    console.log('  ✓ Verified: Logged mastery unblocked progression and advanced Today\'s Focus.\n');

    // 2.2 DSA Preference Change: Student B changes strategy from Balanced to SkipForNow
    console.log('--> Event 2.2: Student B changes DSA preference to "SkipForNow" in settings...');
    await cieService.adaptRoadmapToProfileChange(userB._id, { dsaPreference: 'SkipForNow' });

    const updatedRoadmapB = await Roadmap.findOne({ user: userB._id });
    const focusBAfterSkipDSA = await preparationEngine.getTodaysFocus(userB._id);

    console.log('  AFTER DSA Preference Change:');
    console.log('    Has DSA in Roadmap:', updatedRoadmapB.phases.some(p => p.category === 'DSA'));
    console.log('    New Today\'s Focus:', focusBAfterSkipDSA.topic?.title);
    console.log('    Category:', focusBAfterSkipDSA.category);

    if (focusBAfterSkipDSA.category === 'DSA') {
      throw new Error('Today\'s Focus still selected DSA after student chose SkipForNow!');
    }
    console.log('  ✓ Verified: Changing DSA preference restructured the roadmap and updated Today\'s Focus.\n');

    // 2.3 Career Goal Change: Student A changes targetDomain from Frontend to AI/ML
    console.log('--> Event 2.3: Student A changes career target from Frontend to AI/ML...');
    await cieService.adaptRoadmapToProfileChange(userA._id, { targetDomain: 'AI/ML' });

    const focusAAfterGoalChange = await preparationEngine.getTodaysFocus(userA._id);

    console.log('  AFTER Career Goal Change:');
    console.log('    New Today\'s Focus:', focusAAfterGoalChange.topic?.title);
    console.log('    Category:', focusAAfterGoalChange.category);
    console.log('    Reason:', focusAAfterGoalChange.reason);

    if (focusAAfterGoalChange.topic?.title !== 'Applied Machine Learning Pipelines & PyTorch/Scikit-Learn') {
      throw new Error(`Expected Applied ML Pipelines for AI/ML goal change, got: ${focusAAfterGoalChange.topic?.title}`);
    }
    console.log('  ✓ Verified: Changing career goal dynamically recalculated roadmap and Today\'s Focus to ML.\n');

    // 2.4 Preparation Horizon Recalculation: Adjusting Weekly Effort
    console.log('--> Event 2.4: Student A adjusts weekly hours from 14 hrs/week to 28 hrs/week...');
    const beforeHorizon = (await CareerProfile.findOne({ user: userA._id })).cieDerived.readinessHorizon;
    await cieService.adaptRoadmapToProfileChange(userA._id, { weeklyHours: 28 });
    const afterHorizon = (await CareerProfile.findOne({ user: userA._id })).cieDerived.readinessHorizon;

    console.log('  BEFORE Horizon (14 hrs/wk):', beforeHorizon.targetCompletionEstimate);
    console.log('  AFTER Horizon (28 hrs/wk):', afterHorizon.targetCompletionEstimate);

    if (afterHorizon.estimatedWeeks >= beforeHorizon.estimatedWeeks) {
      throw new Error('Doubling weekly hours did not shorten the estimated preparation horizon!');
    }
    console.log('  ✓ Verified: Preparation horizon scaled dynamically with student\'s weekly availability.\n');

    // =========================================================================
    // STEP 3: Free-Text Extraction Calibration
    // =========================================================================
    console.log('--- STEP 3: Free-Text Extraction & Dynamic Profiling ---');
    const freeTextUser = await User.create({
      name: 'Cloud Engineer User',
      email: 'cloud@example.com',
      graduationYear: 2026
    });

    const rawAnswersCloud = {
      targetDomain_other: 'I want to specialize in Kubernetes clusters, Docker containers, and Cloud DevOps CI/CD',
      dsaPreference_other: 'Intensive DSA first because I am preparing for FAANG coding rounds',
      weeklyHours: 20
    };

    const synthesizedCloud = await onboardingEngine.synthesizeProfile(rawAnswersCloud);
    console.log('Extracted State from Free Text:');
    console.log('  Target Domain:', synthesizedCloud.targetDomain);
    console.log('  DSA Preference:', synthesizedCloud.dsaPreference);
    console.log('  Detected Skills:', synthesizedCloud.selfReportedSkills);

    if (synthesizedCloud.targetDomain !== 'Cloud/DevOps') {
      throw new Error(`Expected Cloud/DevOps from free text, got: ${synthesizedCloud.targetDomain}`);
    }
    if (synthesizedCloud.dsaPreference !== 'Intensive') {
      throw new Error(`Expected Intensive DSA from free text, got: ${synthesizedCloud.dsaPreference}`);
    }

    const profileCloud = await CareerProfile.create({
      user: freeTextUser._id,
      targetDomain: synthesizedCloud.targetDomain,
      dsaPreference: synthesizedCloud.dsaPreference,
      weeklyHours: synthesizedCloud.weeklyHours,
      estimatedProficiency: synthesizedCloud.estimatedProficiency,
      currentProficiency: synthesizedCloud.currentProficiency,
      selfReportedSkills: synthesizedCloud.selfReportedSkills,
      cieDerived: { masteredSkills: [] }
    });

    await cieService.generateBaselineRoadmap(freeTextUser._id, profileCloud);
    const focusCloud = await preparationEngine.getTodaysFocus(freeTextUser._id);

    console.log('Today\'s Focus for Free-Text User:');
    console.log('  Topic:', focusCloud.topic?.title);
    console.log('  Category:', focusCloud.category);
    console.log('  Priority:', focusCloud.priority);

    if (focusCloud.category !== 'DSA') {
      throw new Error(`Expected DSA for Intensive priority, got: ${focusCloud.category}`);
    }
    console.log('  ✓ Verified: Free-text was correctly extracted and translated into structured state and Today\'s Focus.\n');

    console.log('========================================================');
    console.log('🎉 ALL COMPREHENSIVE CIE AUDIT TESTS PASSED SUCCESSFULLY!');
    console.log('========================================================');
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
}

runCIEAudit().catch(err => {
  console.error('\n❌ AUDIT FAILED:', err);
  process.exit(1);
});
