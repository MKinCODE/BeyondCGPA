class HeuristicProvider {
  generateMentorResponse(studentContext, arg2, arg3) {
    let conversationHistory = [];
    let userMessage = '';
    if (typeof arg2 === 'string') {
      userMessage = arg2;
      conversationHistory = [];
    } else {
      conversationHistory = Array.isArray(arg2) ? arg2 : [];
      userMessage = typeof arg3 === 'string' ? arg3 : '';
    }

    const text = (userMessage || '').toLowerCase().trim();
    const {
      profile = {},
      activeRoadmap = {},
      todaysFocus = {},
      recentProgress = [],
      cieDerived = profile?.cieDerived || studentContext.cieDerived || {},
      onboardingAnswers = profile?.rawAnswers || studentContext.onboardingAnswers || {},
      user = studentContext.user || {}
    } = studentContext;

    const domain = profile?.targetDomain || 'Engineering';
    const weeklyHours = profile?.weeklyHours || 14;
    const preferredPace = profile?.preferredPace || 'Balanced';
    const targetCompanies = (profile?.targetCompaniesCategory || []).join(', ') || 'Product companies & Startups';
    const totalUnits = activeRoadmap?.totalAllocatedUnits || studentContext.totalUnits || 0;
    const remainingUnits = activeRoadmap?.remainingUnits ?? (studentContext.remainingUnits || 0);
    const completedUnits = activeRoadmap?.completedUnits ?? (studentContext.completedUnits || 0);

    const focusTopic = todaysFocus?.topic?.title || 'Core Foundations';
    const focusCat = todaysFocus?.topic?.category || todaysFocus?.category || 'Foundations';
    const focusReason = todaysFocus?.reason || 'High-leverage preparation priority';
    const isReinforcement = Boolean(todaysFocus?.isReinforcement);
    const actionableTask = todaysFocus?.actionableTask;

    const readiness = cieDerived.readinessHorizon || {};
    const pacing = cieDerived.pacingHealth || {};
    const velocity = Number(cieDerived.velocityMultiplier || 1.0).toFixed(2);
    const dailyTargetUnits = pacing.dailyTargetUnits || (weeklyHours / 10).toFixed(1);
    const driftUnits = pacing.driftUnits || 0;

    let reply = '';
    let suggestions = [];

    // 0. Friendly Greeting ("hello", "hi", "hey")
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i.test(text)) {
      const studentName = user.name ? user.name.split(' ')[0] : 'there';
      reply = `Hello ${studentName}! 👋

Here is your current preparation snapshot:
• **Career Track:** **${domain}** (${weeklyHours} hrs/week)
• **Today's Focus:** **${focusTopic}** (${focusCat})
• **Remaining Workload:** **${remainingUnits} learning units** (${readiness.targetCompletionEstimate || '~6 months'} readiness horizon)

What would you like to work on today? We can break down **${focusTopic}**, review practice problems, or adjust your study pacing!`;

      suggestions = [
        `How should I approach ${focusTopic}?`,
        'What should I study next?',
        'Review my readiness timeline'
      ];
    }
    // 1. Pacing, Workload, Overwhelm, "Too fast", "Too slow", "Falling behind", Schedule
    else if (/\b(too fast|fast for me|slow down|slow it down|too slow|overwhelm|overwhelmed|falling behind|behind|can't keep up|cannot keep up|burnout|too much|pacing|pace|hours|schedule|daily target|drift|exhausted|reduce pace)\b/i.test(text)) {
      reply = `I completely understand—balancing university commitments and rigorous technical preparation can easily feel overwhelming.

Here is how your preparation is currently structured in CIE:
• **Weekly Availability:** ${weeklyHours} hours/week (~${dailyTargetUnits} effort units/day)
• **Current Workload:** **${remainingUnits} learning units remaining** across your ${domain} roadmap
• **Active Topic:** **${focusTopic}** (${focusCat})

**Core BeyondCGPA Principle: Workload Units, NOT Calendar Streaks**
In BeyondCGPA, there is **zero penalty** for taking a break or moving at a calmer pace. Missed days do not hurt your standing or break streaks—your remaining effort units simply stay preserved until you return.

**Recommended Adjustments:**
1. **Reduce Weekly Commitment:** If ${weeklyHours} hrs/week feels too intense, adjust your availability to **8–10 hours/week** in your profile settings. The Career Intelligence Engine will automatically stretch your horizon to a sustainable pace.
2. **Switch to Deep Foundation:** In Settings, you can change your pace to **DeepFoundation**, which provisions extra reinforcement units.
3. **Chunk Today's Focus:** Don't attempt to finish **${focusTopic}** in one marathon session. Break it down into a single 25-minute focused interval today.`;

      suggestions = [
        `Break down ${focusTopic} into smaller steps`,
        'How does CIE adapt my horizon if I slow down?',
        'What should I prepare today?'
      ];
    }
    // 2. Today's Focus & Active Practice Guidance
    else if (/\b(today|focus|practice|what should i (do|study|learn|prepare)|start|where do i start|next step|actionable|task|action)\b/i.test(text)) {
      reply = `For today, your high-leverage focus is **${focusTopic}** in the **${focusCat}** track.

**Why CIE Prioritized This:**
${focusReason}${isReinforcement ? '\n*(CIE marked this as a Reinforcement Unit to consolidate your conceptual foundation before advancing.)*' : ''}

**Recommended Execution Strategy:**
1. **Dedicated Focus:** Set aside **35–45 minutes** without multitasking.
2. **Understand the Pattern:** Before writing code, make sure you can explain the core mechanism (state invariants, edge cases, space-time tradeoffs).
${actionableTask ? `3. **Active Practice:** Tackle **"${actionableTask.title}"** (${actionableTask.platform || 'LeetCode'}, **${actionableTask.difficulty || 'Medium'}**).\n4. **Log Effort:** Log your unit once completed so CIE calibrates your next unblocked topic accurately.` : '3. **Log Effort:** Log your effort unit upon completion so CIE updates your readiness horizon.'}`;

      suggestions = [
        `Explain the core pattern in ${focusTopic}`,
        'Give me a problem walkthrough',
        'How many units are left in this phase?'
      ];
    }
    // 3. Difficulty, Struggling, Stuck, Confused, Low Confidence
    else if (/\b(hard|difficult|struggl|stuck|confus|don't understand|do not understand|failing|low confidence|frustrat|help with)\b/i.test(text)) {
      reply = `It's completely normal to find **${focusTopic}** challenging—it is one of the pivotal concepts in ${domain} interviews.

**How CIE Protects You When Struggling:**
When you log an effort session with a confidence score of **1 or 2 out of 5**, CIE automatically adds reinforcement review buffers to your roadmap and adjusts your velocity without penalizing your readiness horizon.

**De-risking Strategy:**
1. **Whiteboard First:** Diagram the input-to-output flow on paper before writing code.
2. **Test Small Edge Cases:** Test with empty inputs, single elements, or boundary values.
3. **20-Minute Rule:** Give yourself 20 minutes of active whiteboard reasoning before looking at hints. Understand the pattern, don't memorize the solution.`;

      suggestions = [
        `Explain ${focusTopic} in simple terms`,
        'What prerequisite should I review?',
        'Break down the algorithmic pattern'
      ];
    }
    // 4. Roadmap, Readiness Horizon, Timeline, Score, Completion
    else if (/\b(roadmap|readiness|horizon|timeline|when ready|when will i|preparedness|score|completion|remaining units|units left)\b/i.test(text)) {
      reply = `Here is your authoritative preparation timeline calculated by the Career Intelligence Engine:

• **Remaining Workload:** **${remainingUnits} learning units** left (with **${completedUnits} completed** out of ${totalUnits || (completedUnits + remainingUnits)} total)
• **Estimated Readiness Horizon:** **${readiness.targetCompletionEstimate || '~6 months'}** (${readiness.estimatedWeeks || 24} weeks)
• **Current Preparedness Score:** **${readiness.currentPreparednessScore || 15}/100**
• **Weekly Schedule:** **${weeklyHours} hrs/week** (Velocity: **${velocity}x**)
• **Pacing Health:** **${pacing.status || 'OnPace'}** (${pacing.dailyTargetUnits || 1.0} units/day)

Your next immediate milestone is completing your active focus on **${focusTopic}**. Each completed unit directly increments your placement readiness score!`;

      suggestions = [
        'How can I accelerate my readiness horizon?',
        `What topic unlocks after ${focusTopic}?`,
        'What should I prepare today?'
      ];
    }
    // 5. Conceptual Explanations & Patterns
    else if (/\b(explain|what is|how does|concept|understand|break down|pattern|walkthrough|difference between|how to tackle|code example)\b/i.test(text)) {
      reply = `Let's break down the core architectural and algorithmic patterns behind **${focusTopic}** in the **${domain}** track:

1. **Foundational Mechanism:** Focus on how data flows and how invariants are maintained. In engineering interviews, interviewers look for how you handle state changes and edge conditions.
2. **Complexity Bounds:** Identify the time complexity target (e.g. $O(N)$ or $O(N \\log N)$) and whether space can be optimized from $O(N)$ to $O(1)$.
3. **Common Failure Modes:** The most common pitfalls are off-by-one boundary bugs, unhandled null/empty inputs, and redundant re-computations.

Would you like a step-by-step code demonstration or an edge-case checklist for **${focusTopic}**?`;

      suggestions = [
        `Show me a concrete code example for ${focusTopic}`,
        'What are common interview edge cases for this?',
        'What should I practice next?'
      ];
    }
    // 6. Career, Companies, Resumes, Internships, Placements
    else if (/\b(opportunity|internship|job|resume|interview|tier 1|faang|product companies|placement|hire|hired)\b/i.test(text)) {
      reply = `For targeting **${targetCompanies}** in the **${domain}** track:

1. **Deep Implementation Over Toy Tutorials:** Showcase 2 production-grade projects with live URLs, CI/CD, and documented architecture trade-offs.
2. **Pattern Fluency:** Product companies prioritize pattern intuition (recognizing when to apply two pointers, sliding window, caching, or indexing) over memorized code.
3. **CIE Match Alignment:** Your opportunities feed dynamically scores roles against your verified roadmap units. Completing **${focusTopic}** will strengthen your match scores for incoming roles.`;

      suggestions = [
        'Show my top matched opportunities',
        'What skills should I add to my profile?',
        'Review my readiness timeline'
      ];
    }
    // 7. Conversational Follow-up / Direct Assistance (Never repeating generic intro)
    else {
      reply = `Understood. Looking at your current **${domain}** preparation track:

• **Active Focus:** **${focusTopic}** (${focusCat})
• **Remaining Workload:** **${remainingUnits} effort units**
• **Weekly Schedule:** **${weeklyHours} hrs/week**

Regarding "${userMessage.trim()}":
To make steady progress without burnout, keep your focus dialed into the immediate topic in front of you. Would you like me to explain the core concepts of **${focusTopic}**, provide an actionable coding task, or adjust your study pacing?`;

      suggestions = [
        `How should I approach ${focusTopic}?`,
        'What should I prepare today?',
        'Review my readiness timeline'
      ];
    }

    return { reply, suggestions };
  }

  /**
   * Deterministic extraction of structured student state from free-text answers
   */
  extractStructuredState(freeTextAnswers = {}) {
    const combinedText = Object.values(freeTextAnswers)
      .filter(v => typeof v === 'string' && v.trim().length > 0)
      .join(' ')
      .toLowerCase();

    if (!combinedText) {
      return {};
    }

    const result = {
      detectedDomain: null,
      detectedSkills: [],
      dsaPreference: null,
      dsaComfort: null,
      developmentProficiency: null,
      extractedInterests: []
    };

    // 1. Domain Detection with word boundary matching
    if (/\b(devops|cloud|docker|kubernetes|k8s|ci\/cd|infrastructure|terraform)\b/i.test(combinedText)) {
      result.detectedDomain = 'Cloud/DevOps';
    } else if (/\b(ai|artificial intelligence|machine learning|ml|llm|pytorch|deep learning|data science)\b/i.test(combinedText)) {
      result.detectedDomain = 'AI/ML';
    } else if (/\b(frontend|ui\/ux|react|client-side|css|tailwind|vue|angular)\b/i.test(combinedText)) {
      result.detectedDomain = 'Frontend';
    } else if (/\b(backend|api|apis|microservice|microservices|server|express|django|spring boot)\b/i.test(combinedText)) {
      result.detectedDomain = 'Backend';
    } else if (/\b(fullstack|full stack|mern|mean|web development)\b/i.test(combinedText)) {
      result.detectedDomain = 'Fullstack';
    } else if (/\b(undecided|not sure|explore|general)\b/i.test(combinedText)) {
      result.detectedDomain = 'Undecided';
    }

    // 2. Skill Detection
    const skillDictionary = [
      { name: 'React', patterns: ['react', 'next.js', 'nextjs', 'jsx'] },
      { name: 'JavaScript', patterns: ['javascript', 'js', 'es6'] },
      { name: 'TypeScript', patterns: ['typescript', 'ts'] },
      { name: 'Node.js', patterns: ['node', 'nodejs', 'express'] },
      { name: 'Python', patterns: ['python', 'py'] },
      { name: 'SQL', patterns: ['sql', 'postgres', 'postgresql', 'mysql'] },
      { name: 'MongoDB', patterns: ['mongo', 'mongodb', 'nosql'] },
      { name: 'Docker', patterns: ['docker', 'container', 'compose'] },
      { name: 'Kubernetes', patterns: ['kubernetes', 'k8s'] },
      { name: 'PyTorch', patterns: ['pytorch', 'torch'] },
      { name: 'Two Pointers & Arrays', patterns: ['two pointers', 'sliding window', 'leetcode', 'dsa'] },
      { name: 'Redis', patterns: ['redis', 'caching'] },
      { name: 'Kafka', patterns: ['kafka', 'message broker'] },
      { name: 'Git', patterns: ['git', 'github'] },
      { name: 'CSS/Tailwind', patterns: ['css', 'tailwind', 'sass'] }
    ];

    const detected = new Set();
    for (const skill of skillDictionary) {
      if (skill.patterns.some(p => combinedText.includes(p))) {
        detected.add(skill.name);
      }
    }
    result.detectedSkills = Array.from(detected);

    // 3. DSA Preference extraction
    if (combinedText.includes('skip dsa') || combinedText.includes('no dsa') || combinedText.includes('hate dsa') || combinedText.includes('avoid dsa')) {
      result.dsaPreference = 'SkipForNow';
    } else if (combinedText.includes('minimal dsa') || combinedText.includes('deprioritize') || combinedText.includes('practical first') || combinedText.includes('portfolio first') || combinedText.includes('less dsa')) {
      result.dsaPreference = 'Minimal';
    } else if (combinedText.includes('intensive') || combinedText.includes('heavy dsa') || combinedText.includes('faang') || combinedText.includes('competitive programming')) {
      result.dsaPreference = 'Intensive';
    }

    // 4. Proficiency signals
    if (combinedText.includes('advanced') || combinedText.includes('production') || combinedText.includes('internship') || combinedText.includes('built several apps') || combinedText.includes('2+ years') || combinedText.includes('300+')) {
      result.developmentProficiency = 'Advanced';
    } else if (combinedText.includes('intermediate') || combinedText.includes('comfortable') || combinedText.includes('built projects') || combinedText.includes('built a couple') || combinedText.includes('50+')) {
      result.developmentProficiency = 'Intermediate';
    } else if (combinedText.includes('beginner') || combinedText.includes('started') || combinedText.includes('new to') || combinedText.includes('learning')) {
      result.developmentProficiency = 'Beginner';
    }

    if (combinedText.includes('solved 100+') || combinedText.includes('solved 200+') || combinedText.includes('trees and graphs') || combinedText.includes('dynamic programming')) {
      result.dsaComfort = 'Intermediate';
    }

    return result;
  }
}

module.exports = new HeuristicProvider();
