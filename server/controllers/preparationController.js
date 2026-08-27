const Roadmap = require('../models/Roadmap');
const PreparationTopic = require('../models/PreparationTopic');
const PreparationProgress = require('../models/PreparationProgress');
const preparationEngine = require('../services/preparationEngine');
const Notification = require('../models/Notification');

/**
 * Get active student roadmap with live topic progress
 */
const getRoadmap = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let roadmap = await Roadmap.findOne({ user: userId }).populate('phases.topics.topic');

    if (!roadmap) {
      return res.status(200).json({
        success: true,
        roadmap: null,
        message: 'No roadmap initialized. Please complete onboarding.'
      });
    }

    // Attach user progress to each topic in the phases
    const progressDocs = await PreparationProgress.find({ user: userId });
    const progressMap = new Map(progressDocs.map(p => [p.topic.toString(), p]));

    const populatedPhases = roadmap.phases.map(phase => {
      const topicsWithProgress = phase.topics.map(item => {
        const topicId = item.topic?._id ? item.topic._id.toString() : item.topic?.toString();
        const progress = progressMap.get(topicId) || {
          status: 'NotStarted',
          completedUnits: 0,
          remainingUnits: item.allocatedEffortUnits,
          totalAllocatedUnits: item.allocatedEffortUnits,
          confidenceScore: 3
        };

        return {
          ...item.toObject(),
          progress
        };
      });

      return {
        ...phase.toObject(),
        topics: topicsWithProgress
      };
    });

    res.status(200).json({
      success: true,
      roadmap: {
        ...roadmap.toObject(),
        phases: populatedPhases
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Today's Focus (what preparation work the student should do next)
 */
const getTodaysFocus = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const focus = await preparationEngine.getTodaysFocus(userId);

    res.status(200).json({
      success: true,
      todaysFocus: focus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get curriculum topics filtered by category
 */
const getTopicsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const userId = req.user._id;

    const topics = await PreparationTopic.find({ category }).sort({ order: 1 });
    const progressDocs = await PreparationProgress.find({ user: userId });
    const progressMap = new Map(progressDocs.map(p => [p.topic.toString(), p]));

    const topicsWithProgress = topics.map(t => ({
      ...t.toObject(),
      progress: progressMap.get(t._id.toString()) || {
        status: 'NotStarted',
        completedUnits: 0,
        remainingUnits: t.allocatedEffortUnits,
        totalAllocatedUnits: t.allocatedEffortUnits,
        confidenceScore: 3
      }
    }));

    res.status(200).json({
      success: true,
      topics: topicsWithProgress
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single topic detail by slug or ID
 */
const getTopicDetail = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const userId = req.user._id;

    let topic;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      topic = await PreparationTopic.findById(idOrSlug);
    } else {
      topic = await PreparationTopic.findOne({ slug: idOrSlug });
    }

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    const progress = await PreparationProgress.findOne({ user: userId, topic: topic._id });

    res.status(200).json({
      success: true,
      topic,
      progress: progress || {
        status: 'NotStarted',
        completedUnits: 0,
        remainingUnits: topic.allocatedEffortUnits,
        totalAllocatedUnits: topic.allocatedEffortUnits,
        confidenceScore: 3,
        completedQuestions: [],
        studentNotes: ''
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log preparation effort session
 */
const logEffort = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { topicId, unitsCovered, durationMinutes, notes, confidenceScore, completedQuestions } = req.body;

    if (!topicId) {
      return res.status(400).json({ success: false, message: 'Topic ID is required' });
    }

    const progress = await preparationEngine.logEffort({
      userId,
      topicId,
      unitsCovered: unitsCovered || 1,
      durationMinutes: durationMinutes || 45,
      notes,
      confidenceScore,
      completedQuestions
    });

    if (progress.status === 'Completed') {
      const topic = await PreparationTopic.findById(topicId);
      await Notification.create({
        user: userId,
        title: `Topic Mastered: ${topic?.title || 'Unit Completed'}`,
        message: `Awesome work! You completed all allocated effort units for ${topic?.title}.`,
        type: 'RoadmapMilestone',
        link: '/dashboard/roadmap'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Effort logged successfully and workload updated.',
      progress
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoadmap,
  getTodaysFocus,
  getTopicsByCategory,
  getTopicDetail,
  logEffort
};
