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

  buildMentorSystemPrompt(studentContext) {
    const {
      user = {},
      profile = {},
      onboardingAnswers = {},
      activeRoadmap = {},
      todaysFocus = {},
      recentProgress = [],
      totalUnits = 0,
      remainingUnits = 0,
      completedUnits = 0,
      cieDerived = {}
    } = studentContext;

    const domain = profile.targetDomain || 'Engineering';
    const weeklyHours = profile.weeklyHours || 14;
    const preferredPace = profile.preferredPace || 'Balanced';
    const targetCompanies = (profile.targetCompaniesCategory || []).join(', ') || 'Product-based companies';
    const languages = (profile.knownLanguages || []).join(', ') || 'JavaScript, Python';
    const prof = profile.currentProficiency || profile.estimatedProficiency || {};

    const rawAnswersList = Object.entries(onboardingAnswers)
      .filter(([k, v]) => v && typeof v === 'string' && v.trim().length > 0)
      .map(([k, v]) => `  • ${k}: ${v}`)
      .slice(0, 8)
      .join('\n') || '  • Standard onboarding calibration completed';

    const readiness = cieDerived.readinessHorizon || {};
    const pacing = cieDerived.pacingHealth || {};
    const velocity = (cieDerived.velocityMultiplier || 1.0).toFixed(2);
    const strengths = (cieDerived.strengths || []).join(', ') || 'Baseline engineering aptitude';
    const growthAreas = (cieDerived.growthAreas || []).join(', ') || 'Domain practice continuity';

    const focusTopic = todaysFocus.topic?.title || 'Core Foundations';
    const focusCat = todaysFocus.topic?.category || todaysFocus.category || 'Foundations';
    const focusReason = todaysFocus.reason || 'Next unblocked high-leverage workload unit';
    const isReinforcement = Boolean(todaysFocus.isReinforcement);
    const taskTitle = todaysFocus.actionableTask?.title
      ? `"${todaysFocus.actionableTask.title}" (${todaysFocus.actionableTask.platform || 'LeetCode'}, ${todaysFocus.actionableTask.difficulty || 'Medium'})`
      : 'Hands-on practice task';

    const recentEffortSummary = (recentProgress || []).map(p => {
      const topicName = p.topic?.title || 'Topic';
      const conf = p.confidenceScore ? `Confidence: ${p.confidenceScore}/5` : '';
      const notes = p.studentNotes ? `Notes: "${p.studentNotes}"` : '';
      return `  • ${topicName} (Completed: ${p.completedUnits}/${p.totalAllocatedUnits} units; ${conf} ${notes})`;
    }).slice(0, 3).join('\n') || '  • Initial learning units queued';

    return `You are BeyondCGPA AI Mentor, an expert career mentor, technical guide, and engineering coach for university computer science students.

AUTHORITATIVE REAL-TIME STUDENT CONTEXT (Authoritative state from DB & CIE Engine):
1. Student Profile:
   - Name: ${user.name || 'Student'}
   - College / Branch / Grad Year: ${user.college || 'University'} | ${user.branch || 'CS'} | Class of ${user.graduationYear || 2026}
   - Career Track: ${domain} (Preferred Pace: ${preferredPace})
   - Weekly Availability: ${weeklyHours} hours/week
   - Target Companies: ${targetCompanies}
   - Known Languages: ${languages}
   - Estimated Proficiency: DSA: ${prof.dsa || 'Beginner'}, Dev: ${prof.development || 'Beginner'}, CoreCS: ${prof.coreCS || 'Beginner'}, SystemDesign: ${prof.systemDesign || 'Beginner'}

2. Onboarding Background & Self-Reported Answers:
${rawAnswersList}

3. CIE Engine Calculations (Authoritative Decision State):
   - Roadmap Workload Units: ${completedUnits} completed, ${remainingUnits} remaining (Total: ${totalUnits})
   - Readiness Horizon: ${readiness.targetCompletionEstimate || '~6 months'} (${readiness.estimatedWeeks || 24} weeks)
   - Preparedness Score: ${readiness.currentPreparednessScore || 15}/100
   - Pacing Health: Daily target ${pacing.dailyTargetUnits || 1.0} units/day (Status: ${pacing.status || 'OnPace'}, Velocity: ${velocity}x)
   - Strengths: ${strengths}
   - Growth Areas: ${growthAreas}

4. Today's Focus (Current Active Workload Unit):
   - Topic: ${focusTopic} [${focusCat}]
   - Prioritization Reason: ${focusReason}
   - Reinforcement Needed: ${isReinforcement ? 'YES (Consolidation required before advancing)' : 'NO'}
   - Actionable Practice Task: ${taskTitle}

5. Recent Effort & Session History:
${recentEffortSummary}

MANDATORY MENTOR BEHAVIOR & RULES:
1. Ground every answer directly in the student's actual current context. Do NOT generate generic introductory greetings or repeat "Hi, I'm your AI Mentor...".
2. Address the student's specific question directly. If they express that the pace is "too fast" or they are overwhelmed:
   - Emphasize that BeyondCGPA is workload-unit based, NOT calendar-streak based: missed days have ZERO penalty.
   - Reason about their actual schedule (${weeklyHours} hrs/week, ~${pacing.dailyTargetUnits || 1} units/day) and ${remainingUnits} remaining units.
   - Suggest concrete actions: reducing weekly hours in settings, switching preferred pace to DeepFoundation, or breaking down Today's Focus (${focusTopic}) into 25-minute units.
3. The Career Intelligence Engine (CIE) remains the sole authoritative decision engine: do NOT invent unearned student progress or claim to alter the roadmap directly. Guide the student to act on the CIE recommendations.
4. Keep answers clear, technical when needed, encouraging, and structured with concise bullet points.
5. Provide 2-3 dynamic, contextual follow-up suggestions for the student formatted at the very end as:
SUGGESTIONS: ["suggestion 1", "suggestion 2", "suggestion 3"]`;
  }

  async generateMentorResponse({ studentContext, conversationHistory = [], userMessage }) {
    if (nvidiaProvider.isConfigured()) {
      try {
        const systemPrompt = this.buildMentorSystemPrompt(studentContext);

        // Include prior conversation history cleanly + current user message
        const messages = [
          ...conversationHistory.slice(-8),
          { sender: 'user', text: userMessage }
        ];

        const rawReply = await nvidiaProvider.generateChatResponse(systemPrompt, messages);

        // Parse optional SUGGESTIONS: line from the reply
        let replyText = rawReply;
        let suggestions = [];

        const suggestionsMatch = rawReply.match(/SUGGESTIONS:\s*(\[.*?\])/s);
        if (suggestionsMatch) {
          try {
            suggestions = JSON.parse(suggestionsMatch[1]);
            replyText = rawReply.replace(/SUGGESTIONS:\s*\[.*?\]/s, '').trim();
          } catch (e) {
            // Keep default suggestions if parse fails
          }
        }

        if (!suggestions || suggestions.length === 0) {
          const focusTitle = studentContext.todaysFocus?.topic?.title || 'Core Foundations';
          suggestions = [
            `How should I approach ${focusTitle}?`,
            'Can you break this down into smaller steps?',
            'What should I focus on next in my roadmap?'
          ];
        }

        return {
          reply: replyText,
          suggestions
        };
      } catch (err) {
        // Transparently propagate external AI provider error without fake fallbacks
        console.error('NVIDIA AI Call Failed:', err.message);
        const providerError = new Error(`AI Provider Error (${nvidiaProvider.model}): ${err.response?.data?.error?.message || err.message}`);
        providerError.statusCode = 503;
        providerError.isProviderError = true;
        throw providerError;
      }
    }

    // Default to built-in CIE Heuristic Intelligence engine
    return heuristicProvider.generateMentorResponse(studentContext, conversationHistory, userMessage);
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
