const IndustryTopic = require('../models/IndustryTopic');

/**
 * Get Today's Topic or topic for a specific date (YYYY-MM-DD)
 */
const getTopicByDate = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    // Default to today's date in YYYY-MM-DD format
    const targetDate = req.params.date || new Date().toISOString().split('T')[0];

    let topic = await IndustryTopic.findOne({ date: targetDate });

    // Fallback: If exact date not found, get most recent topic
    if (!topic) {
      topic = await IndustryTopic.findOne().sort({ date: -1 });
    }

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'No industry topic found for this date.'
      });
    }

    const isViewed = userId ? (topic.viewedBy || []).some(id => id.toString() === userId.toString()) : false;

    res.status(200).json({
      success: true,
      topic: {
        ...topic.toObject(),
        isViewed
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Historical Calendar overview (past 30-60 days)
 * Displays topic availability and read status without streak pressure.
 */
const getCalendarOverview = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const allTopics = await IndustryTopic.find().select('title slug date category viewedBy').sort({ date: -1 });

    const topicsByDate = new Map();
    allTopics.forEach(t => {
      const isViewed = userId ? (t.viewedBy || []).some(id => id.toString() === userId.toString()) : false;
      topicsByDate.set(t.date, {
        id: t._id,
        title: t.title,
        slug: t.slug,
        category: t.category,
        isViewed
      });
    });

    // Generate past 30 days matrix
    const calendarDays = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const topicInfo = topicsByDate.get(dateStr);

      let status = 'no-topic';
      if (topicInfo) {
        status = topicInfo.isViewed ? 'viewed' : 'unviewed';
      }

      calendarDays.push({
        date: dateStr,
        dayOfMonth: d.getDate(),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: dateStr === todayStr,
        hasTopic: Boolean(topicInfo),
        status,
        topic: topicInfo || null
      });
    }

    res.status(200).json({
      success: true,
      calendarDays,
      totalTopicsAvailable: allTopics.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark topic as viewed (strictly for reading tracking, never streak calculation)
 */
const markTopicViewed = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { topicId } = req.body;

    const topic = await IndustryTopic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Industry topic not found' });
    }

    if (!topic.viewedBy.some(id => id.toString() === userId.toString())) {
      topic.viewedBy.push(userId);
      await topic.save();
    }

    res.status(200).json({
      success: true,
      message: 'Topic marked as viewed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Browse all topics with category filters
 */
const getAllTopics = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const userId = req.user?._id;

    const filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { deepDiveContent: { $regex: search, $options: 'i' } }
      ];
    }

    const topics = await IndustryTopic.find(filter).sort({ date: -1 });

    const formatted = topics.map(t => ({
      ...t.toObject(),
      isViewed: userId ? (t.viewedBy || []).some(id => id.toString() === userId.toString()) : false
    }));

    res.status(200).json({
      success: true,
      topics: formatted
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTopicByDate,
  getCalendarOverview,
  markTopicViewed,
  getAllTopics
};
