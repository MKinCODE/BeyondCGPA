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

  /**
   * Selectively parse useful free-text answers into structured student state
   */
  async extractStructuredStateFromFreeText(freeTextAnswers = {}) {
    const textValues = Object.entries(freeTextAnswers)
      .filter(([k, v]) => typeof v === 'string' && v.trim().length > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    if (!textValues || textValues.trim().length === 0) {
      return {};
    }

    if (nvidiaProvider.isConfigured()) {
      try {
        const systemPrompt = `You are an expert student profile analyzer for BeyondCGPA.
Extract structured career, skill, and preference data from the student's free-text onboarding responses.
Return ONLY a valid JSON object matching this schema, with NO extra markdown formatting:
{
  "detectedDomain": "Frontend" | "Backend" | "Fullstack" | "AI/ML" | "Cloud/DevOps" | "Undecided" | null,
  "detectedSkills": string[],
  "dsaPreference": "Intensive" | "Balanced" | "Minimal" | "SkipForNow" | null,
  "dsaComfort": "Beginner" | "Intermediate" | "Advanced" | null,
  "developmentProficiency": "Beginner" | "Intermediate" | "Advanced" | null,
  "extractedInterests": string[]
}`;

        const messages = [{ sender: 'user', text: `Student free text responses:\n${textValues}` }];
        const rawJson = await nvidiaProvider.generateChatResponse(systemPrompt, messages);
        const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return parsed;
      } catch (err) {
        console.warn('LLM extractor fallback to heuristic due to:', err.message);
        return heuristicProvider.extractStructuredState(freeTextAnswers);
      }
    }

    return heuristicProvider.extractStructuredState(freeTextAnswers);
  }
}

module.exports = new AIService();
