const MentorConversation = require('../models/MentorConversation');
const CareerProfile = require('../models/CareerProfile');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const PreparationProgress = require('../models/PreparationProgress');
const preparationEngine = require('../services/preparationEngine');
const aiService = require('../services/ai/aiService');

/**
 * Get active mentor conversation history
 */
const getConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let conversation = await MentorConversation.findOne({ user: userId });

    if (!conversation) {
      // Create initial greeting message
      const profile = await CareerProfile.findOne({ user: userId });
      const domain = profile?.targetDomain || 'Engineering';

      conversation = await MentorConversation.create({
        user: userId,
        messages: [
          {
            sender: 'assistant',
            text: `Hi ${req.user.name.split(' ')[0]}! 👋 I'm your BeyondCGPA AI Mentor. I have real-time visibility into your ${domain} preparation roadmap, workload units, and goals.\n\nWhether you need help breaking down complex algorithmic patterns, architectural decisions, or interview strategy, I'm here to guide you!`,
            suggestions: [
              'What should I prepare today?',
              'Explain the core concept in my active topic',
              'How is my readiness horizon calculated?'
            ]
          }
        ]
      });
    }

    const providerStatus = aiService.getProviderStatus();

    res.status(200).json({
      success: true,
      conversation,
      providerStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send message to AI Mentor
 */
const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    // 1. Gather authoritative DB context dynamically on every request
    const [userDoc, profile, roadmap, todaysFocus, recentProgress] = await Promise.all([
      User.findById(userId).select('name email college branch graduationYear currentSemester'),
      CareerProfile.findOne({ user: userId }),
      Roadmap.findOne({ user: userId }),
      preparationEngine.getTodaysFocus(userId),
      PreparationProgress.find({ user: userId })
        .populate('topic')
        .sort({ updatedAt: -1 })
        .limit(5)
    ]);

    const studentContext = {
      user: {
        name: userDoc?.name || req.user.name || 'Student',
        college: userDoc?.college || '',
        branch: userDoc?.branch || '',
        graduationYear: userDoc?.graduationYear || null
      },
      profile,
      onboardingAnswers: profile?.rawAnswers || {},
      activeRoadmap: roadmap,
      todaysFocus,
      recentProgress: recentProgress || [],
      totalUnits: roadmap?.totalAllocatedUnits || 0,
      remainingUnits: roadmap?.remainingUnits || 0,
      completedUnits: roadmap?.completedUnits || 0,
      cieDerived: profile?.cieDerived || {}
    };

    // 2. Fetch conversation and extract prior conversation history cleanly
    let conversation = await MentorConversation.findOne({ user: userId });
    if (!conversation) {
      conversation = new MentorConversation({ user: userId, messages: [] });
    }

    const priorHistory = conversation.messages.map(m => ({
      sender: m.sender,
      text: m.text,
      timestamp: m.timestamp
    }));

    // 3. Generate response via AI Abstraction
    let mentorReply;
    try {
      mentorReply = await aiService.generateMentorResponse({
        studentContext,
        conversationHistory: priorHistory,
        userMessage: message.trim()
      });
    } catch (aiError) {
      // Propagate AI configuration or provider failure transparently
      return res.status(aiError.statusCode || 503).json({
        success: false,
        isProviderError: true,
        message: aiError.message || 'AI Provider Error: Failed to generate mentor response'
      });
    }

    const { reply, suggestions } = mentorReply;

    // 4. Persist user message and assistant reply to DB
    const userMessageObj = {
      sender: 'user',
      text: message.trim(),
      timestamp: new Date()
    };
    conversation.messages.push(userMessageObj);

    const assistantMessage = {
      sender: 'assistant',
      text: reply,
      timestamp: new Date(),
      suggestions: suggestions || []
    };
    conversation.messages.push(assistantMessage);
    await conversation.save();

    res.status(200).json({
      success: true,
      message: assistantMessage,
      conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear chat history
 */
const clearHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await MentorConversation.findOneAndDelete({ user: userId });

    res.status(200).json({
      success: true,
      message: 'Conversation reset.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversation,
  sendMessage,
  clearHistory
};
