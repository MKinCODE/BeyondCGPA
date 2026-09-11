const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const PreparationTopic = require('../models/PreparationTopic');
const PreparationProgress = require('../models/PreparationProgress');
const Roadmap = require('../models/Roadmap');
const Opportunity = require('../models/Opportunity');
const OpportunityMatch = require('../models/OpportunityMatch');

const cieService = require('../services/cieService');
const onboardingEngine = require('../services/onboardingEngine');
const preparationEngine = require('../services/preparationEngine');

let mongoServer;

async function setupDatabase() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed sample curriculum topics
  const topics = [
    {
      title: 'Arrays & Two Pointers',
      slug: 'arrays-and-two-pointers',
      category: 'DSA',
      domainRelevance: ['Fullstack', 'Backend', 'Frontend', 'AI/ML', 'Cloud/DevOps', 'All'],
      difficulty: 'Beginner',
      allocatedEffortUnits: 3,
      order: 1,
      prerequisites: [],
      summary: 'Master array traversal and two pointer algorithms.'
    },
    {
      title: 'Sliding Window & Hash Maps',
      slug: 'sliding-window-and-hashmaps',
      category: 'DSA',
      domainRelevance: ['Fullstack', 'Backend', 'Frontend', 'AI/ML', 'Cloud/DevOps', 'All'],
      difficulty: 'Intermediate',
      allocatedEffortUnits: 3,
      order: 2,
      prerequisites: ['arrays-and-two-pointers'], // Enforced prerequisite
      summary: 'Fixed and dynamic sliding window algorithms.'
    },
    {
      title: 'Full-Stack Web Architecture & REST APIs',
      slug: 'fullstack-web-architecture-and-apis',
      category: 'Development',
      domainRelevance: ['Fullstack', 'Backend', 'Frontend', 'All'],
      difficulty: 'Beginner',
      allocatedEffortUnits: 4,
      order: 1,
      prerequisites: [],
      summary: 'HTTP protocols, REST API design, state management.'
    },
    {
      title: 'Relational Databases & SQL Optimization',
      slug: 'relational-databases-and-sql-optimization',
      category: 'DBMS',
      domainRelevance: ['Fullstack', 'Backend', 'All'],
      difficulty: 'Intermediate',
      allocatedEffortUnits: 3,
      order: 1,
      prerequisites: [],
      summary: 'Indexing, B-Trees, transaction isolation, EXPLAIN query plans.'
    },
    {
      title: 'Production Capstone Microservice',
      slug: 'production-capstone-microservice',
      category: 'Projects',
      domainRelevance: ['Fullstack', 'Backend', 'Frontend', 'All'],
      difficulty: 'Intermediate',
      allocatedEffortUnits: 5,
      order: 1,
      prerequisites: ['fullstack-web-architecture-and-apis'],
      summary: 'Full production application deployment with CI/CD.'
    }
  ];

  for (const t of topics) {
    await PreparationTopic.create(t);
  }
}

async function teardownDatabase() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log('🚀 Starting CIE & Adaptive Architecture Test Suite...\n');
  await setupDatabase();

  const currentYear = new Date().getFullYear();

  try {
    // -------------------------------------------------------------
    // Test 1: Dynamic Onboarding Questions & Early Exit
    // -------------------------------------------------------------
    console.log('--- Test 1: Dynamic Onboarding Engine ---');
    const gradYears = onboardingEngine.getDynamicGraduationYears();
    assert(gradYears[0] === currentYear, `Graduation year starts with current year (${currentYear})`);
    assert(gradYears.length === 5, 'Generates 5 dynamic graduation year options');

    // Initial question is Target Domain
    const q1 = onboardingEngine.getNextQuestion({});
    assert(q1.id === 'targetDomain', 'Question 1 is targetDomain');

    // Branching for "Undecided"
    const q2Exploration = onboardingEngine.getNextQuestion({ targetDomain: 'Undecided' });
    assert(q2Exploration.id === 'explorationInterest', 'Undecided branches to explorationInterest question');

    // Standard branching
    const q2Std = onboardingEngine.getNextQuestion({ targetDomain: 'Frontend' });
    assert(q2Std.id === 'graduationYear', 'Standard branch asks graduationYear');

    // Check early-exit sufficiency around questions 5-6
    const q5 = onboardingEngine.getNextQuestion({
      targetDomain: 'Frontend',
      graduationYear: currentYear + 2,
      weeklyHours: 14,
      dsaPreference: 'Minimal'
    });
    assert(q5.id === 'primaryProficiency', 'Question 5 calibrates baseline proficiency');
    assert(q5.canFinishEarly === true, 'Allows early calibration completion at Question 5');

    // Hard limit test: at 15 answers, strictly completed
    const fifteenAnswers = {};
    for (let i = 0; i < 15; i++) fifteenAnswers[`q_${i}`] = 'val';
    const q15 = onboardingEngine.getNextQuestion(fifteenAnswers);
    assert(q15.completed === true, 'Hard limit enforced at 15 questions');

    // -------------------------------------------------------------
    // Test 2: Target Domain & "Not Interested in DSA" Priority Adaptation
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Goal & DSA Deprioritization ---');
    const userA = await User.create({
      name: 'Frontend Student (No DSA)',
      email: 'frontend@example.com',
      password: 'password123',
      graduationYear: currentYear + 2
    });

    const profileA = await CareerProfile.create({
      user: userA._id,
      targetDomain: 'Frontend',
      dsaPreference: 'Minimal', // Explicitly deprioritize DSA
      weeklyHours: 14,
      currentProficiency: { development: 'Beginner', dsa: 'Beginner' }
    });

    const roadmapA = await cieService.generateBaselineRoadmap(userA._id, profileA);

    // Verify Phase 1 is Development, NOT DSA
    assert(roadmapA.phases[0].category === 'Development', 'Phase 1 is Development for Frontend student');
    assert(roadmapA.phases[0].title === 'Development Mastery Phase', 'Phase 1 title is Development Mastery Phase');

    // DSA should be placed at the very end with Optional priority
    const lastPhase = roadmapA.phases[roadmapA.phases.length - 1];
    assert(lastPhase.category === 'DSA', 'DSA is demoted to the final phase');
    assert(lastPhase.topics[0].priority === 'Optional', 'DSA topics marked Optional for student requesting Minimal DSA');

    // Verify Today's Focus selects Development topic on Day 1, NOT DSA
    const focusA = await preparationEngine.getTodaysFocus(userA._id);
    assert(focusA.topic.category === 'Development', "Today's Focus is Development, proving DSA is not hardcoded!");
    assert(focusA.topic.title === 'Full-Stack Web Architecture & REST APIs', "Today's Focus selects Web Architecture & APIs");

    // -------------------------------------------------------------
    // Test 3: Genuine General / Exploration Mode for Undecided Students
    // -------------------------------------------------------------
    console.log('\n--- Test 3: General Exploration Mode ---');
    const userB = await User.create({
      name: 'Exploring Student',
      email: 'explore@example.com',
      password: 'password123',
      graduationYear: currentYear + 3
    });

    const profileB = await CareerProfile.create({
      user: userB._id,
      targetDomain: 'Undecided',
      dsaPreference: 'Balanced',
      weeklyHours: 12
    });

    const roadmapB = await cieService.generateBaselineRoadmap(userB._id, profileB);
    assert(roadmapB.phases[0].title.startsWith('Exploration:'), 'Phase titles indicate Exploration track');
    assert(roadmapB.phases.some(p => p.category === 'Development') && roadmapB.phases.some(p => p.category === 'DBMS'),
      'Exploration roadmap includes cross-domain tracks (Dev and DBMS)');

    // -------------------------------------------------------------
    // Test 4: Prerequisite Enforcement in Today's Focus
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Prerequisite Enforcement ---');
    const userC = await User.create({
      name: 'DSA Prereq Student',
      email: 'prereq@example.com',
      password: 'password123',
      graduationYear: currentYear + 1
    });

    const profileC = await CareerProfile.create({
      user: userC._id,
      targetDomain: 'Fullstack',
      dsaPreference: 'Intensive',
      weeklyHours: 18
    });

    await cieService.generateBaselineRoadmap(userC._id, profileC);

    // Initial Today's Focus must be topic 1 ("Arrays & Two Pointers"), because topic 2 has topic 1 as prerequisite
    const focusC1 = await preparationEngine.getTodaysFocus(userC._id);
    assert(focusC1.topic.slug === 'arrays-and-two-pointers', 'Selects foundational topic without prerequisites');

    // Verify that topic 2 ("Sliding Window & Hash Maps") is blocked until topic 1 is completed
    const topicTwo = await PreparationTopic.findOne({ slug: 'sliding-window-and-hashmaps' });
    const prereqCheck = topicTwo.prerequisites.includes('arrays-and-two-pointers');
    assert(prereqCheck === true, 'Topic 2 has arrays-and-two-pointers in prerequisites');

    // Complete Topic 1 with confidence 4
    const topicOne = await PreparationTopic.findOne({ slug: 'arrays-and-two-pointers' });
    await preparationEngine.logEffort({
      userId: userC._id,
      topicId: topicOne._id,
      unitsCovered: 4, // completes all units
      confidenceScore: 4,
      notes: 'Mastered two pointers thoroughly'
    });

    // Now Today's Focus must successfully unblock and select Topic 2
    const focusC2 = await preparationEngine.getTodaysFocus(userC._id);
    assert(focusC2.topic.slug === 'sliding-window-and-hashmaps', 'Topic 2 is unblocked and selected as Today\'s Focus after prerequisite is completed!');

    // -------------------------------------------------------------
    // Test 5: Closed-Loop CIE Reaction to Mastery and Velocity
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Closed-Loop Velocity & Mastery Adaptation ---');
    const updatedProfileC = await CareerProfile.findOne({ user: userC._id });
    assert(updatedProfileC.cieDerived.velocityMultiplier > 1.0, 'Velocity multiplier increased after high-confidence completion');
    assert(updatedProfileC.cieDerived.masteredSkills.includes('Arrays & Two Pointers'), 'Topic recorded in masteredSkills');

    // -------------------------------------------------------------
    // Test 6: Real Career Matching (Skills vs Gaps)
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Opportunity Matching Skills & Gaps ---');
    const opportunity = {
      title: 'Full Stack Engineer Intern',
      company: 'HighTech Inc',
      domain: 'Fullstack',
      targetGraduationYears: [currentYear + 1, currentYear + 2],
      requiredSkills: ['Arrays & Two Pointers', 'React', 'Docker', 'Kubernetes']
    };

    // User C has completed 'Arrays & Two Pointers', but lacks 'React', 'Docker', 'Kubernetes'
    const matchResult = await cieService.calculateOpportunityMatch(opportunity, updatedProfileC, userC);
    assert(matchResult.matchedSkills.includes('Arrays & Two Pointers'), 'Accurately identifies completed topic in matchedSkills');
    assert(matchResult.skillGaps.includes('Docker') && matchResult.skillGaps.includes('Kubernetes'),
      'Accurately identifies missing requirements in skillGaps');
    assert(matchResult.matchScore >= 40 && matchResult.matchScore <= 98, 'Match score calculated realistically');

    console.log('\n🎉 ALL 6 COMPREHENSIVE CIE & ADAPTIVE ARCHITECTURE TESTS PASSED!\n');
  } finally {
    await teardownDatabase();
  }
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
