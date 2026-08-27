const PreparationTopic = require('../models/PreparationTopic');
const PreparationProgress = require('../models/PreparationProgress');
const Roadmap = require('../models/Roadmap');
const CareerProfile = require('../models/CareerProfile');
const cieService = require('./cieService');

class PreparationEngine {
  /**
   * Deterministically identifies Today's Focus: the next actionable preparation workload unit
   */
  async getTodaysFocus(userId) {
    const roadmap = await Roadmap.findOne({ user: userId }).populate('phases.topics.topic');
    if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
      return null;
    }

    // 1. Look for any topic currently InProgress
    const inProgress = await PreparationProgress.findOne({
      user: userId,
      status: 'InProgress',
      remainingUnits: { $gt: 0 }
    }).populate('topic');

    if (inProgress && inProgress.topic) {
      return {
        topic: inProgress.topic,
        progress: inProgress,
        reason: 'Continue active preparation unit',
        category: inProgress.topic.category
      };
    }

    // 2. Iterate sequentially through roadmap phases to find the first unblocked topic
    const completedProgress = await PreparationProgress.find({
      user: userId,
      status: 'Completed'
    }).select('topic');

    const completedTopicIds = new Set(completedProgress.map(p => p.topic.toString()));

    for (const phase of roadmap.phases) {
      for (const item of phase.topics) {
        if (!item.topic) continue;

        const topicIdStr = item.topic._id ? item.topic._id.toString() : item.topic.toString();
        if (!completedTopicIds.has(topicIdStr)) {
          // Check if progress record exists
          let progress = await PreparationProgress.findOne({
            user: userId,
            topic: item.topic._id || item.topic
          }).populate('topic');

          if (!progress) {
            progress = await PreparationProgress.create({
              user: userId,
              topic: item.topic._id || item.topic,
              status: 'NotStarted',
              totalAllocatedUnits: item.allocatedEffortUnits || 3,
              completedUnits: 0,
              remainingUnits: item.allocatedEffortUnits || 3
            });
          }

          const fullTopic = progress.topic || await PreparationTopic.findById(item.topic._id || item.topic);

          return {
            topic: fullTopic,
            progress,
            reason: `Next priority in ${phase.title}`,
            category: phase.category
          };
        }
      }
    }

    // If all completed
    return {
      topic: null,
      message: 'All roadmap preparation units completed! Ready for advanced mock interviews and applications.'
    };
  }

  /**
   * Logs preparation effort for a topic.
   * Workload-based: decrements remainingUnits, increments completedUnits.
   * Missed days do NOT penalize or reset.
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
        totalAllocatedUnits: topic.allocatedEffortUnits,
        remainingUnits: topic.allocatedEffortUnits
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

    // Recalculate Roadmap totals
    await this.syncRoadmapProgress(userId);

    return progress;
  }

  /**
   * Syncs total completed/remaining units in Roadmap and updates CIE readiness horizon
   */
  async syncRoadmapProgress(userId) {
    const allProgress = await PreparationProgress.find({ user: userId });
    const totalAllocated = allProgress.reduce((acc, p) => acc + (p.totalAllocatedUnits || 0), 0);
    const completed = allProgress.reduce((acc, p) => acc + (p.completedUnits || 0), 0);
    const remaining = Math.max(0, totalAllocated - completed);

    const roadmap = await Roadmap.findOneAndUpdate(
      { user: userId },
      {
        totalAllocatedUnits: totalAllocated,
        completedUnits: completed,
        remainingUnits: remaining,
        lastAdaptedAt: new Date()
      },
      { new: true }
    );

    const profile = await CareerProfile.findOne({ user: userId });
    if (profile && roadmap) {
      const readinessHorizon = cieService.calculateReadinessHorizon({
        totalUnits: totalAllocated,
        completedUnits: completed,
        weeklyHours: profile.weeklyHours || 14
      });

      await CareerProfile.findOneAndUpdate(
        { user: userId },
        {
          'cieDerived.readinessHorizon': readinessHorizon,
          'cieDerived.lastEvaluatedAt': new Date()
        }
      );
    }

    return roadmap;
  }
}

module.exports = new PreparationEngine();
