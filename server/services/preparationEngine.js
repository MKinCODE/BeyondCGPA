const PreparationTopic = require('../models/PreparationTopic');
const PreparationProgress = require('../models/PreparationProgress');
const Roadmap = require('../models/Roadmap');
const CareerProfile = require('../models/CareerProfile');
const cieService = require('./cieService');

class PreparationEngine {
  /**
   * Deterministically identifies Today's Focus: the next actionable, unblocked preparation workload unit
   */
  async getTodaysFocus(userId) {
    const roadmap = await Roadmap.findOne({ user: userId }).populate('phases.topics.topic');
    if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
      return null;
    }

    const profile = await CareerProfile.findOne({ user: userId });
    const masteredSkills = (profile?.cieDerived?.masteredSkills || []).map(s => s.toLowerCase());

    // Collect all topic IDs present in the active roadmap
    const roadmapTopicIds = new Set();
    roadmap.phases.forEach(p => {
      (p.topics || []).forEach(t => {
        if (t.topic) {
          roadmapTopicIds.add(t.topic._id ? t.topic._id.toString() : t.topic.toString());
        }
      });
    });

    // 1. Check for any topic currently InProgress that belongs to the active roadmap
    const inProgressList = await PreparationProgress.find({
      user: userId,
      status: 'InProgress',
      remainingUnits: { $gt: 0 }
    }).populate('topic').sort({ updatedAt: -1 });

    const active = inProgressList.find(p => p.topic && roadmapTopicIds.has(p.topic._id ? p.topic._id.toString() : p.topic.toString()));

    if (active && active.topic) {
      const isStruggling = active.confidenceScore <= 2 || (profile?.cieDerived?.growthAreas || []).includes(active.topic.title);
      const reason = isStruggling
        ? `Reinforcement Focus: consolidating ${active.topic.title} before advancing`
        : `Continue active workload unit in ${active.topic.title}`;

      return {
        topic: active.topic,
        progress: active,
        reason,
        category: active.topic.category,
        isUnblocked: true,
        isReinforcement: isStruggling
      };
    }

    // 2. Fetch all completed and in-progress progress documents
    const allProgressDocs = await PreparationProgress.find({ user: userId }).populate('topic');
    const progressMap = new Map();
    allProgressDocs.forEach(p => {
      if (p.topic) {
        progressMap.set(p.topic._id ? p.topic._id.toString() : p.topic.toString(), p);
      }
    });

    const completedProgress = allProgressDocs.filter(p => p.status === 'Completed' || p.remainingUnits === 0);
    const completedTopicIds = new Set(completedProgress.map(p => p.topic?._id?.toString() || p.topic?.toString()));
    const completedTopicSlugs = new Set(completedProgress.map(p => p.topic?.slug).filter(Boolean));

    // Also consider verified masteredSkills as fulfilling prerequisite slugs
    for (const skill of masteredSkills) {
      if (skill.includes('react')) completedTopicSlugs.add('modern-react-and-state-architecture');
      if (skill.includes('rest') || skill.includes('api')) completedTopicSlugs.add('production-rest-api-architecture');
      if (skill.includes('two pointers') || skill.includes('arrays')) completedTopicSlugs.add('arrays-and-two-pointers');
      if (skill.includes('docker')) completedTopicSlugs.add('containerization-docker-orchestration');
      if (skill.includes('pytorch') || skill.includes('ml')) completedTopicSlugs.add('applied-ml-pipelines-pytorch');
    }

    // Determine the category of the most recently logged session for interleaving
    let recentCategory = null;
    const sortedByRecent = [...allProgressDocs]
      .filter(p => p.lastEngagedAt || (p.sessions && p.sessions.length > 0))
      .sort((a, b) => new Date(b.lastEngagedAt || 0) - new Date(a.lastEngagedAt || 0));
    if (sortedByRecent.length > 0 && sortedByRecent[0].topic) {
      recentCategory = sortedByRecent[0].topic.category;
    }

    const dsaPreference = profile?.dsaPreference || 'Balanced';
    const estimatedProficiency = profile?.estimatedProficiency || profile?.currentProficiency || {
      dsa: 'Beginner',
      development: 'Beginner',
      coreCS: 'Beginner',
      systemDesign: 'Beginner'
    };
    const selfReportedSkills = (profile?.selfReportedSkills || []).map(s => s.toLowerCase());

    // 3. Collect ALL unblocked candidates across the entire active roadmap
    const candidatePool = [];

    for (const phase of roadmap.phases) {
      for (const item of phase.topics) {
        if (!item.topic) continue;

        const topicIdStr = item.topic._id ? item.topic._id.toString() : item.topic.toString();
        if (completedTopicIds.has(topicIdStr)) continue;

        const fullTopic = item.topic.title ? item.topic : await PreparationTopic.findById(topicIdStr);
        if (!fullTopic) continue;

        // Skip DSA entirely if student explicitly selected SkipForNow
        if (dsaPreference === 'SkipForNow' && fullTopic.category === 'DSA') {
          continue;
        }

        // Evaluate prerequisites
        const prerequisites = fullTopic.prerequisites || [];
        const missingPrerequisites = prerequisites.filter(slug => !completedTopicSlugs.has(slug));
        if (missingPrerequisites.length > 0) {
          // Blocked by unsatisfied prerequisites
          continue;
        }

        let progress = progressMap.get(topicIdStr);
        candidatePool.push({
          topic: fullTopic,
          phaseOrder: phase.order || 1,
          phaseTitle: phase.title,
          phaseCategory: phase.category,
          priority: item.priority || 'Standard',
          allocatedEffortUnits: item.allocatedEffortUnits || 3,
          progress
        });
      }
    }

    if (candidatePool.length === 0) {
      return {
        topic: null,
        message: 'All roadmap preparation units completed! Ready for advanced mock interviews and applications.'
      };
    }

    // 4. Multi-Factor Deterministic Candidate Scoring
    const scoredCandidates = candidatePool.map(c => {
      const { topic, phaseOrder, priority, progress } = c;
      const cat = topic.category;
      let score = 0;

      // A. Base Category Alignment
      if (cat === 'Development' || cat === 'Projects') {
        score += 100;
      } else if (cat === 'DSA') {
        score += 80;
      } else {
        score += 65; // Core CS (DBMS, OS, OOP, SystemDesign)
      }

      // B. Strategy Multiplier for DSA
      if (cat === 'DSA') {
        if (dsaPreference === 'Intensive') score += 60; // Total base: 140
        else if (dsaPreference === 'Balanced') score += 20; // Total base: 100 (peers with Development 100)
        else if (dsaPreference === 'Minimal') score -= 55; // Defer after domain basics
      }

      // C. Proficiency Gap Urgency Analysis
      let catProf = 'Beginner';
      if (cat === 'DSA') catProf = estimatedProficiency.dsa || 'Beginner';
      else if (cat === 'Development' || cat === 'Projects') catProf = estimatedProficiency.development || 'Beginner';
      else if (cat === 'SystemDesign') catProf = estimatedProficiency.systemDesign || 'Beginner';
      else catProf = estimatedProficiency.coreCS || 'Beginner';

      if (catProf === 'Beginner') {
        score += 35; // Critical gap needing immediate foundations
      } else if (catProf === 'Intermediate') {
        score += 15;
      } else if (catProf === 'Advanced') {
        score += 0; // Already proficient, focus effort where needed most
      }

      // D. Self-Reported Familiarity vs Unlearned Skill Gap
      const isSelfReported = selfReportedSkills.some(s =>
        s === topic.title.toLowerCase() ||
        topic.title.toLowerCase().includes(s) ||
        (s.includes('react') && topic.slug.includes('react')) ||
        (s.includes('rest') && topic.slug.includes('rest')) ||
        (s.includes('two pointers') && topic.slug.includes('two-pointers'))
      );

      if (isSelfReported) {
        // Known area: prioritize gaps unless other areas are equally known
        score -= 15;
      } else {
        // High-value new capability acquisition
        score += 10;
      }

      // E. Workload Continuity & Reinforcement Handling
      let isReinforcement = false;
      if (progress && progress.status === 'InProgress') {
        const isStruggling = progress.confidenceScore <= 2 || (profile?.cieDerived?.growthAreas || []).includes(topic.title);
        if (isStruggling) {
          score += 90; // Top reinforcement urgency! Consolidate before new work
          isReinforcement = true;
        } else {
          score += 25; // Continuity bonus to finish started unit
        }
      }

      // F. Interleaving Practice for Balanced Learners
      if (dsaPreference === 'Balanced' && recentCategory) {
        if (recentCategory === 'Development' && cat === 'DSA') {
          score += 30; // Alternate into problem solving
        } else if (recentCategory === 'DSA' && (cat === 'Development' || cat === 'Projects')) {
          score += 30; // Alternate into domain engineering
        }
      }

      // G. Structural Phase & Priority Weights
      if (priority === 'Critical') score += 20;
      else if (priority === 'High') score += 10;
      else if (priority === 'Optional') score -= 25;

      score += Math.max(0, (6 - phaseOrder) * 3);

      return {
        ...c,
        calculatedScore: score,
        isReinforcement,
        catProf,
        isSelfReported
      };
    });

    // Sort descending by calculated score
    scoredCandidates.sort((a, b) => b.calculatedScore - a.calculatedScore);

    const primaryCandidate = scoredCandidates[0];
    const fullTopic = primaryCandidate.topic;

    // Ensure progress document exists for primary focus
    let progress = primaryCandidate.progress;
    if (!progress) {
      progress = await PreparationProgress.create({
        user: userId,
        topic: fullTopic._id,
        status: 'NotStarted',
        totalAllocatedUnits: primaryCandidate.allocatedEffortUnits || 3,
        completedUnits: 0,
        remainingUnits: primaryCandidate.allocatedEffortUnits || 3,
        confidenceScore: 3
      });
    }

    // 5. Surface Actionable Practice Task with verified links
    const practiceQuestions = fullTopic.practiceQuestions || [];
    let actionableTask = null;
    if (practiceQuestions.length > 0) {
      const completedSet = new Set(progress.completedQuestions || []);
      const taskObj = practiceQuestions.find(q => !completedSet.has(q.title)) || practiceQuestions[0];
      if (taskObj) {
        actionableTask = {
          title: taskObj.title,
          difficulty: taskObj.difficulty || 'Medium',
          platform: taskObj.platform || 'LeetCode',
          url: taskObj.url || '',
          description: taskObj.description || ''
        };
      }
    }

    // 6. Build Multi-Domain Allocation & Secondary Focus for Balanced / Dual-Track Learners
    let secondaryFocus = null;
    let allocations = [
      {
        category: fullTopic.category,
        topicTitle: fullTopic.title,
        recommendedUnits: 1,
        timeEstimateMinutes: 45,
        type: 'Primary Focus'
      }
    ];

    if (dsaPreference === 'Balanced' || dsaPreference === 'Intensive') {
      // Find top complementary candidate in a different category
      const complementary = scoredCandidates.find(c => {
        if (fullTopic.category === 'DSA') {
          return c.topic.category === 'Development' || c.topic.category === 'Projects';
        } else {
          return c.topic.category === 'DSA';
        }
      });

      if (complementary) {
        let compProgress = complementary.progress;
        if (!compProgress) {
          compProgress = await PreparationProgress.findOne({ user: userId, topic: complementary.topic._id });
        }

        let compTask = null;
        const compPractice = complementary.topic.practiceQuestions || [];
        if (compPractice.length > 0) {
          compTask = {
            title: compPractice[0].title,
            difficulty: compPractice[0].difficulty || 'Medium',
            platform: compPractice[0].platform || 'LeetCode',
            url: compPractice[0].url || '',
            description: compPractice[0].description || ''
          };
        }

        secondaryFocus = {
          topic: complementary.topic,
          progress: compProgress,
          category: complementary.topic.category,
          actionableTask: compTask,
          reason: `Balanced Track Complement: maintain parallel progress in ${complementary.topic.title}`
        };

        allocations.push({
          category: complementary.topic.category,
          topicTitle: complementary.topic.title,
          recommendedUnits: 1,
          timeEstimateMinutes: 30,
          type: 'Balanced Complement'
        });
      }
    }

    // 7. Contextual Rationale Formulation
    let contextReason = '';
    if (primaryCandidate.isReinforcement) {
      contextReason = `Reinforcement Focus: consolidating ${fullTopic.title} before advancing`;
    } else if (dsaPreference === 'Balanced' && primaryCandidate.catProf === 'Beginner') {
      contextReason = `Balanced Priority: addressing primary foundational gap in ${fullTopic.category} (${fullTopic.title})`;
    } else if (roadmap.targetDomain === 'Frontend') {
      contextReason = `Core Frontend Track: mastering ${fullTopic.title}`;
    } else if (roadmap.targetDomain === 'Backend') {
      contextReason = `Core Backend Track: mastering ${fullTopic.title}`;
    } else if (roadmap.targetDomain === 'AI/ML') {
      contextReason = `AI & ML Systems Track: mastering ${fullTopic.title}`;
    } else if (roadmap.targetDomain === 'Cloud/DevOps') {
      contextReason = `DevOps & Reliability Track: mastering ${fullTopic.title}`;
    } else if (roadmap.targetDomain === 'Undecided') {
      contextReason = `Exploration Track: cross-domain sampling in ${fullTopic.title}`;
    } else if (dsaPreference === 'Intensive') {
      contextReason = `Algorithmic Priority: high-yield problem solving pattern (${fullTopic.title})`;
    } else {
      contextReason = `Highest leverage preparation priority in ${fullTopic.title}`;
    }

    return {
      topic: fullTopic,
      progress,
      reason: contextReason,
      category: fullTopic.category,
      isUnblocked: true,
      isReinforcement: primaryCandidate.isReinforcement,
      priority: primaryCandidate.priority,
      actionableTask,
      secondaryFocus,
      allocations
    };
  }

  /**
   * Logs preparation effort for a topic.
   * Workload-based: decrements remainingUnits, increments completedUnits.
   * Triggers CIE adaptation closed loop (velocity scaling, pace drift redistribution, prerequisite unblocking).
   */
  async logEffort({ userId, topicId, unitsCovered = 1, durationMinutes = 45, notes = '', confidenceScore = 3, completedQuestions = [] }) {
    let progress = await PreparationProgress.findOne({ user: userId, topic: topicId });
    const topic = await PreparationTopic.findById(topicId);

    if (!topic) {
      throw new Error('Preparation topic not found');
    }

    if (!progress) {
      progress = new PreparationProgress({
        user: userId,
        topic: topicId,
        totalAllocatedUnits: topic.allocatedEffortUnits || 3,
        remainingUnits: topic.allocatedEffortUnits || 3
      });
    }

    const units = Math.max(1, Number(unitsCovered));
    progress.completedUnits = Math.min(progress.totalAllocatedUnits, progress.completedUnits + units);
    progress.remainingUnits = Math.max(0, progress.totalAllocatedUnits - progress.completedUnits);
    progress.confidenceScore = confidenceScore || progress.confidenceScore;
    if (notes) progress.studentNotes = notes;
    progress.lastEngagedAt = new Date();

    if (completedQuestions && completedQuestions.length > 0) {
      const existingSet = new Set(progress.completedQuestions || []);
      completedQuestions.forEach(q => existingSet.add(q));
      progress.completedQuestions = Array.from(existingSet);
    }

    if (progress.remainingUnits === 0) {
      progress.status = 'Completed';
      progress.completedAt = new Date();
    } else {
      progress.status = 'InProgress';
    }

    progress.sessions.push({
      timestamp: new Date(),
      durationMinutes,
      unitsLogged: units,
      notes,
      problemsSolved: completedQuestions
    });

    await progress.save();

    // Trigger CIE Closed Loop Adaptation (Velocity, Mastery, Workload Reallocation)
    await cieService.adaptToEffortLog({
      userId,
      topicId,
      confidenceScore,
      unitsCovered: units,
      durationMinutes
    });

    return progress;
  }
}

module.exports = new PreparationEngine();
