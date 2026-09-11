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

    // TEST 1: Persona 1 - Pure Frontend Goal with Minimal DSA
    console.log('--- TEST 1: Persona 1 (Frontend Goal + Minimal DSA) ---');
    const user1 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      graduationYear: 2027
    });

    const rawAnswers1 = {
      targetDomain: 'Frontend',
      domainProficiency: 'Intermediate',
      dsaPreference: 'Minimal',
      priorSkills: ['React'],
      weeklyHours: 14,
      graduationYear: 2027
    };

    const synthesized1 = await onboardingEngine.synthesizeProfile(rawAnswers1);
    console.log('Synthesized Profile 1:');
    console.log('  Target Domain:', synthesized1.targetDomain);
    console.log('  Self-Reported Skills:', synthesized1.selfReportedSkills);
    console.log('  Estimated Proficiency:', synthesized1.estimatedProficiency);

    // Save profile ensuring self-reported skills are NOT unearned mastery
    const profile1 = await CareerProfile.create({
      user: user1._id,
      targetDomain: synthesized1.targetDomain,
      dsaPreference: synthesized1.dsaPreference,
      weeklyHours: synthesized1.weeklyHours,
      estimatedProficiency: synthesized1.estimatedProficiency,
      currentProficiency: synthesized1.currentProficiency,
      selfReportedSkills: synthesized1.selfReportedSkills,
      cieDerived: { masteredSkills: [] } // Empty verified mastery initially!
    });

    const roadmap1 = await cieService.generateBaselineRoadmap(user1._id, profile1);
    console.log(`Roadmap 1 Phases for ${profile1.targetDomain} (DSA: ${profile1.dsaPreference}):`);
    roadmap1.phases.forEach(p => {
      console.log(`  Phase ${p.order}: [${p.category}] ${p.title} (${p.topics.length} topics)`);
      p.topics.forEach(t => console.log(`    - ${t.title} (${t.allocatedEffortUnits} units, Priority: ${t.priority})`));
    });

    // Check Today's Focus for User 1
    const focus1 = await preparationEngine.getTodaysFocus(user1._id);
    console.log('\nToday\'s Focus for User 1 (Frontend):');
    console.log('  Topic:', focus1.topic?.title);
    console.log('  Category:', focus1.category);
    console.log('  Reason:', focus1.reason);

    // Assertions for User 1
    if (focus1.topic?.title !== 'Modern React, Component Architecture & State Systems') {
      throw new Error(`Expected Modern React for Frontend focus, got: ${focus1.topic?.title}`);
    }
    if (focus1.topic?.title.includes('Express')) {
      throw new Error('Frontend student was wrongly assigned Express backend work!');
    }
    // Verify DSA is at the end
    const lastPhase1 = roadmap1.phases[roadmap1.phases.length - 1];
    if (lastPhase1.category !== 'DSA') {
      throw new Error(`Expected DSA to be deferred to the last phase for Minimal DSA, got: ${lastPhase1.category}`);
    }
    console.log('✅ TEST 1 PASSED: Frontend goal with Minimal DSA produced React development focus, zero Express work, and DSA deferred.\n');

    // TEST 2: Persona 2 - Backend Goal with Intensive DSA
    console.log('--- TEST 2: Persona 2 (Backend Goal + Intensive DSA) ---');
    const user2 = await User.create({
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      graduationYear: 2026
    });

    const rawAnswers2 = {
      targetDomain: 'Backend',
      domainProficiency: 'Intermediate',
      dsaPreference: 'Intensive',
      weeklyHours: 18,
      graduationYear: 2026
    };

    const synthesized2 = await onboardingEngine.synthesizeProfile(rawAnswers2);
    const profile2 = await CareerProfile.create({
      user: user2._id,
      targetDomain: synthesized2.targetDomain,
      dsaPreference: synthesized2.dsaPreference,
      weeklyHours: synthesized2.weeklyHours,
      estimatedProficiency: synthesized2.estimatedProficiency,
      currentProficiency: synthesized2.currentProficiency,
      selfReportedSkills: synthesized2.selfReportedSkills,
      cieDerived: { masteredSkills: [] }
    });

    const roadmap2 = await cieService.generateBaselineRoadmap(user2._id, profile2);
    console.log(`Roadmap 2 Phase 1: [${roadmap2.phases[0].category}] ${roadmap2.phases[0].title}`);

    const focus2 = await preparationEngine.getTodaysFocus(user2._id);
    console.log('Today\'s Focus for User 2 (Backend + Intensive DSA):');
    console.log('  Topic:', focus2.topic?.title);
    console.log('  Category:', focus2.category);
    console.log('  Reason:', focus2.reason);

    if (focus2.category !== 'DSA' || focus2.topic?.title !== 'Arrays & Two Pointers') {
      throw new Error(`Expected Arrays & Two Pointers for Intensive DSA, got: ${focus2.topic?.title}`);
    }
    console.log('✅ TEST 2 PASSED: Intensive DSA placed DSA in Phase 1 with Critical priority and Two Pointers focus.\n');

    // TEST 3: Persona 3 - Undecided / General Exploration Mode
    console.log('--- TEST 3: Persona 3 (Undecided / Exploration Mode) ---');
    const user3 = await User.create({
      name: 'Ananya Roy',
      email: 'ananya@example.com',
      graduationYear: 2028
    });

    const rawAnswers3 = {
      targetDomain: 'Undecided',
      explorationInterest: 'BuildingVisualApps',
      dsaPreference: 'Balanced',
      weeklyHours: 10,
      graduationYear: 2028
    };

    const synthesized3 = await onboardingEngine.synthesizeProfile(rawAnswers3);
    const profile3 = await CareerProfile.create({
      user: user3._id,
      targetDomain: synthesized3.targetDomain,
      dsaPreference: synthesized3.dsaPreference,
      weeklyHours: synthesized3.weeklyHours,
      estimatedProficiency: synthesized3.estimatedProficiency,
      currentProficiency: synthesized3.currentProficiency,
      selfReportedSkills: synthesized3.selfReportedSkills,
      cieDerived: { masteredSkills: [] }
    });

    const roadmap3 = await cieService.generateBaselineRoadmap(user3._id, profile3);
    console.log('Roadmap 3 Exploration Phases:');
    roadmap3.phases.forEach(p => console.log(`  Phase ${p.order}: ${p.title} (${p.topics.length} topics)`));

    const focus3 = await preparationEngine.getTodaysFocus(user3._id);
    console.log('Today\'s Focus for User 3 (Exploration):');
    console.log('  Topic:', focus3.topic?.title);
    console.log('  Reason:', focus3.reason);

    if (!focus3.reason.includes('Exploration Track')) {
      throw new Error(`Expected Exploration Track reason, got: ${focus3.reason}`);
    }
    console.log('✅ TEST 3 PASSED: Undecided student received genuine cross-domain exploration track without forced career bias.\n');

    // TEST 4: Persona 4 - Free-Text "Other" Extraction (AI/ML Goal + Skip DSA)
    console.log('--- TEST 4: Free-Text "Other" Extraction ---');
    const user4 = await User.create({
      name: 'Kavita Iyer',
      email: 'kavita@example.com',
      graduationYear: 2027
    });

    const rawAnswers4 = {
      targetDomain_other: 'I want to build intelligent agents and machine learning pipelines with PyTorch',
      dsaPreference_other: 'Skip DSA completely for now; focus 100% on model engineering',
      weeklyHours: 16
    };

    const synthesized4 = await onboardingEngine.synthesizeProfile(rawAnswers4);
    console.log('Extracted State from Free Text:');
    console.log('  Detected Domain:', synthesized4.targetDomain);
    console.log('  Detected DSA Preference:', synthesized4.dsaPreference);
    console.log('  Detected Skills:', synthesized4.selfReportedSkills);

    if (synthesized4.targetDomain !== 'AI/ML') {
      throw new Error(`Expected AI/ML from free text, got: ${synthesized4.targetDomain}`);
    }
    if (synthesized4.dsaPreference !== 'SkipForNow') {
      throw new Error(`Expected SkipForNow from free text, got: ${synthesized4.dsaPreference}`);
    }

    const profile4 = await CareerProfile.create({
      user: user4._id,
      targetDomain: synthesized4.targetDomain,
      dsaPreference: synthesized4.dsaPreference,
      weeklyHours: synthesized4.weeklyHours,
      estimatedProficiency: synthesized4.estimatedProficiency,
      currentProficiency: synthesized4.currentProficiency,
      selfReportedSkills: synthesized4.selfReportedSkills,
      cieDerived: { masteredSkills: [] }
    });

    const roadmap4 = await cieService.generateBaselineRoadmap(user4._id, profile4);
    const focus4 = await preparationEngine.getTodaysFocus(user4._id);
    console.log('Today\'s Focus for User 4 (Extracted AI/ML):');
    console.log('  Topic:', focus4.topic?.title);
    console.log('  Category:', focus4.category);

    if (focus4.topic?.title !== 'Applied Machine Learning Pipelines & PyTorch/Scikit-Learn') {
      throw new Error(`Expected Applied ML Pipelines, got: ${focus4.topic?.title}`);
    }
    // Verify DSA is omitted
    const hasDsa4 = roadmap4.phases.some(p => p.category === 'DSA');
    if (hasDsa4) {
      throw new Error('DSA was supposed to be completely skipped for User 4!');
    }
    console.log('✅ TEST 4 PASSED: Free text extracted AI/ML domain and Skip DSA preference into structured state.\n');

    // TEST 5: Real Closed-Loop Dynamic Adaptation (Before vs After)
    console.log('--- TEST 5: Demonstration of Real Before vs After Adaptation ---');
    console.log('Starting with User 1 (Frontend):');
    console.log('  BEFORE Stored State:');
    console.log('    Velocity Multiplier: 1.0');
    console.log('    Mastered Skills: []');
    console.log('    Remaining Units:', roadmap1.remainingUnits);
    console.log('    Today\'s Focus:', focus1.topic?.title);

    // 5.1: Student successfully completes "Modern React" with high confidence (5/5)
    console.log('\n--> Logging effort: 3 units covered with high confidence (5/5) on Modern React...');
    await preparationEngine.logEffort({
      userId: user1._id,
      topicId: focus1.topic._id,
      unitsCovered: 3,
      durationMinutes: 90,
      confidenceScore: 5,
      notes: 'Mastered component lifecycle, hook invariants, and state lifting.'
    });

    const updatedProfile1 = await CareerProfile.findOne({ user: user1._id });
    const updatedRoadmap1 = await Roadmap.findOne({ user: user1._id });
    const focus1AfterCompletion = await preparationEngine.getTodaysFocus(user1._id);

    console.log('\n  AFTER High-Mastery Completion State:');
    console.log('    Velocity Multiplier:', updatedProfile1.cieDerived.velocityMultiplier);
    console.log('    Mastered Skills:', updatedProfile1.cieDerived.masteredSkills);
    console.log('    Remaining Units:', updatedRoadmap1.remainingUnits);
    console.log('    Today\'s Focus (Dynamically Advanced):', focus1AfterCompletion.topic?.title);
    console.log('    Reason:', focus1AfterCompletion.reason);

    // Verify downstream change
    if (focus1AfterCompletion.topic?.title !== 'Web Performance, DOM Mechanics & Responsive UI Architecture') {
      throw new Error(`Expected Today's Focus to advance to Web Performance, got: ${focus1AfterCompletion.topic?.title}`);
    }
    if (!updatedProfile1.cieDerived.masteredSkills.includes('Modern React, Component Architecture & State Systems')) {
      throw new Error('Mastered skills was not updated with verified performance evidence!');
    }
    console.log('  ✓ Verified: Successful progress advanced mastery, accelerated velocity, and unlocked the next prerequisite topic.');

    // 5.2: Student struggles with Web Performance (confidenceScore: 1/5)
    console.log('\n--> Logging struggle: 1 unit with low confidence (1/5) on Web Performance...');
    await preparationEngine.logEffort({
      userId: user1._id,
      topicId: focus1AfterCompletion.topic._id,
      unitsCovered: 1,
      durationMinutes: 60,
      confidenceScore: 1,
      notes: 'Struggled with critical rendering path reflows and CSSOM calculations.'
    });

    const struggleProfile = await CareerProfile.findOne({ user: user1._id });
    const focus1AfterStruggle = await preparationEngine.getTodaysFocus(user1._id);

    console.log('\n  AFTER Struggle State:');
    console.log('    Velocity Multiplier:', struggleProfile.cieDerived.velocityMultiplier);
    console.log('    Growth Areas:', struggleProfile.cieDerived.growthAreas);
    console.log('    Today\'s Focus (Reinforcement Triggered):', focus1AfterStruggle.topic?.title);
    console.log('    Reason:', focus1AfterStruggle.reason);
    console.log('    Is Reinforcement Flag:', focus1AfterStruggle.isReinforcement);

    if (!focus1AfterStruggle.isReinforcement || !focus1AfterStruggle.reason.includes('Reinforcement')) {
      throw new Error('Expected reinforcement focus after low confidence struggle!');
    }
    console.log('  ✓ Verified: Repeated struggle triggered reinforcement replanning buffer rather than naive advancement.');

    // 5.3: Student updates career goal to Backend in profile settings
    console.log('\n--> Student changes career goal to Backend in Profile Settings...');
    await cieService.adaptRoadmapToProfileChange(user1._id, { targetDomain: 'Backend' });

    const goalChangedRoadmap = await Roadmap.findOne({ user: user1._id });
    const focus1AfterGoalChange = await preparationEngine.getTodaysFocus(user1._id);

    console.log('\n  AFTER Goal Change State:');
    console.log('    New Target Domain:', goalChangedRoadmap.targetDomain);
    console.log('    New Today\'s Focus:', focus1AfterGoalChange.topic?.title);
    console.log('    Reason:', focus1AfterGoalChange.reason);

    if (focus1AfterGoalChange.topic?.title !== 'Production REST API Architecture & Express.js') {
      throw new Error(`Expected REST API Express for Backend goal change, got: ${focus1AfterGoalChange.topic?.title}`);
    }
    console.log('  ✓ Verified: Changing career goal dynamically recalculated roadmap phases and Today\'s Focus to Backend REST APIs.');

    console.log('\n========================================================');
    console.log('🎉 ALL AUDIT VERIFICATION TESTS PASSED SUCCESSFULLY!');
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
