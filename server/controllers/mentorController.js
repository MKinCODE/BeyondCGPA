const MentorConversation = require('../models/MentorConversation');
const CareerProfile = require('../models/CareerProfile');
const Roadmap = require('../models/Roadmap');
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

    // 1. Gather authoritative DB context
    const profile = await CareerProfile.findOne({ user: userId });
    const roadmap = await Roadmap.findOne({ user: userId });
    const todaysFocus = await preparationEngine.getTodaysFocus(userId);

    const studentContext = {
      profile,
      activeRoadmap: roadmap,
      todaysFocus,
      remainingUnits: roadmap?.remainingUnits || 0,
      completedUnits: roadmap?.completedUnits || 0
    };

    // 2. Fetch conversation
    let conversation = await MentorConversation.findOne({ user: userId });
    if (!conversation) {
      conversation = new MentorConversation({ user: userId, messages: [] });
    }

    // Add user message
    conversation.messages.push({
      sender: 'user',
      text: message.trim(),
      timestamp: new Date()
    });

    // 3. Generate response via AI Abstraction
    const { reply, suggestions } = await aiService.generateMentorResponse({
      studentContext,
      conversationHistory: conversation.messages,
      userMessage: message.trim()
    });

    // Add assistant response
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
