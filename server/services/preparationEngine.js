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

    // 2. Fetch all completed topics with their slugs to evaluate prerequisites
    const completedProgress = await PreparationProgress.find({
      user: userId,
      status: 'Completed'
    }).populate('topic');

    const completedTopicIds = new Set(completedProgress.map(p => p.topic?._id?.toString() || p.topic?.toString()));
    const completedTopicSlugs = new Set(completedProgress.map(p => p.topic?.slug).filter(Boolean));

    // Also consider topics in masteredSkills as fulfilling prerequisites
    for (const skill of masteredSkills) {
      if (skill.includes('react')) completedTopicSlugs.add('modern-react-and-state-architecture');
      if (skill.includes('rest') || skill.includes('api')) completedTopicSlugs.add('production-rest-api-architecture');
      if (skill.includes('two pointers') || skill.includes('arrays')) completedTopicSlugs.add('arrays-and-two-pointers');
      if (skill.includes('docker')) completedTopicSlugs.add('containerization-docker-orchestration');
      if (skill.includes('pytorch') || skill.includes('ml')) completedTopicSlugs.add('applied-ml-pipelines-pytorch');
    }

    // 3. Scan through roadmap phases (ordered according to student domain & priorities)
    for (const phase of roadmap.phases) {
      for (const item of phase.topics) {
        if (!item.topic) continue;

        const topicIdStr = item.topic._id ? item.topic._id.toString() : item.topic.toString();
        if (!completedTopicIds.has(topicIdStr)) {
          const fullTopic = item.topic.title ? item.topic : await PreparationTopic.findById(topicIdStr);
          if (!fullTopic) continue;

          // Prerequisite Evaluation: verify all prerequisite slugs are mastered
          const prerequisites = fullTopic.prerequisites || [];
          const missingPrerequisites = prerequisites.filter(slug => !completedTopicSlugs.has(slug));

          if (missingPrerequisites.length > 0) {
            // Blocked by unsatisfied prerequisites; skip to next candidate topic
            continue;
          }

          // Found the highest-priority, unblocked topic!
          let progress = await PreparationProgress.findOne({
            user: userId,
            topic: fullTopic._id
          }).populate('topic');

          if (!progress) {
            progress = await PreparationProgress.create({
              user: userId,
              topic: fullTopic._id,
              status: 'NotStarted',
              totalAllocatedUnits: item.allocatedEffortUnits || 3,
              completedUnits: 0,
              remainingUnits: item.allocatedEffortUnits || 3,
              confidenceScore: 3
            });
          }

          // Construct contextual, personalized reason
          let contextReason = `Highest unblocked priority in ${phase.title}`;
          if (roadmap.targetDomain === 'Frontend') {
            contextReason = `Core Frontend Track: mastering ${fullTopic.title}`;
          } else if (roadmap.targetDomain === 'Backend') {
            contextReason = `Core Backend Track: mastering ${fullTopic.title}`;
          } else if (roadmap.targetDomain === 'AI/ML') {
            contextReason = `AI & ML Systems Track: mastering ${fullTopic.title}`;
          } else if (roadmap.targetDomain === 'Cloud/DevOps') {
            contextReason = `DevOps & Reliability Track: mastering ${fullTopic.title}`;
          } else if (roadmap.targetDomain === 'Undecided') {
            contextReason = `Exploration Track: cross-domain sampling in ${fullTopic.title}`;
          } else if (profile?.dsaPreference === 'Intensive') {
            contextReason = `Algorithmic Priority: high-yield problem solving pattern (${fullTopic.title})`;
          }

          return {
            topic: fullTopic,
            progress,
            reason: contextReason,
            category: fullTopic.category || phase.category,
            isUnblocked: true,
            priority: item.priority || 'High'
          };
        }
      }
    }

    // If all completed or all remaining are temporarily blocked
    return {
      topic: null,
      message: 'All roadmap preparation units completed! Ready for advanced mock interviews and applications.'
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
