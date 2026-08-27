const nvidiaProvider = require('./nvidiaProvider');
const heuristicProvider = require('./heuristicProvider');

class AIService {
  getProviderStatus() {
    const isNvidiaActive = nvidiaProvider.isConfigured();
    return {
      activeProvider: isNvidiaActive ? 'NVIDIA AI Engine' : 'CIE Heuristic Intelligence (Active Fallback)',
      isExternalConfigured: isNvidiaActive,
      model: isNvidiaActive ? nvidiaProvider.model : 'Deterministic Heuristic Expert'
    };
  }

  async generateMentorResponse({ studentContext, conversationHistory, userMessage }) {
    if (nvidiaProvider.isConfigured()) {
      try {
        const systemPrompt = `You are BeyondCGPA AI Mentor, an expert career and engineering companion for university computer science students.
You have real-time access to the student's authoritative profile and progress state:
- Target Domain: ${studentContext.profile?.targetDomain || 'Engineering'}
- Weekly Availability: ${studentContext.profile?.weeklyHours || 14} hours/week
- Target Companies: ${(studentContext.profile?.targetCompaniesCategory || []).join(', ')}
- Current Today's Focus: ${studentContext.todaysFocus?.topic?.title || 'Foundations'}
- Remaining Roadmap Units: ${studentContext.remainingUnits || 0}
- Completed Units: ${studentContext.completedUnits || 0}

Guidelines:
1. Provide concise, clear, encouraging, and technically rigorous answers.
2. Emphasize workload management (effort units) instead of streaks. Missed days have zero penalty.
3. Offer practical next steps and suggest 2-3 short follow-up questions at the end formatted in a JSON array or bullet points.`;

        const messages = [
          ...conversationHistory.slice(-8),
          { sender: 'user', text: userMessage }
        ];

        const rawReply = await nvidiaProvider.generateChatResponse(systemPrompt, messages);
        return {
          reply: rawReply,
          suggestions: [
            'How do I master this topic faster?',
            'Show me practical code examples',
            'What should I focus on next in my roadmap?'
          ]
        };
      } catch (err) {
        console.warn('Falling back to CIE Heuristic Provider due to error:', err.message);
        return heuristicProvider.generateMentorResponse(studentContext, userMessage);
      }
    }

    // Default to Heuristic Provider
    return heuristicProvider.generateMentorResponse(studentContext, userMessage);
  }
}

module.exports = new AIService();
