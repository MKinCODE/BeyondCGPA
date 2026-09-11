class HeuristicProvider {
  generateMentorResponse(studentContext, userMessage) {
    const text = userMessage.toLowerCase();
    const { profile, activeRoadmap, todaysFocus, remainingUnits, completedUnits } = studentContext;

    const domain = profile?.targetDomain || 'Engineering';
    const weeklyHours = profile?.weeklyHours || 14;
    const focusTitle = todaysFocus?.topic?.title || 'Core DSA / System Foundations';

    let reply = '';
    let suggestions = [];

    if (text.includes('roadmap') || text.includes('plan') || text.includes('where to start')) {
      reply = `Based on your **${domain}** track and your **${weeklyHours} hrs/week** schedule, your adaptive roadmap currently has **${remainingUnits} learning units remaining** (with **${completedUnits} completed**).\n\nYour immediate high-leverage focus is **${focusTitle}**. Remember: BeyondCGPA tracks learning workload, not calendar streaks. If you miss a day, there's zero penalty—simply pick up your remaining effort units when you return!`;
      suggestions = [
        'How should I approach today\'s focus topic?',
        'How does my readiness horizon change if I increase weekly hours?',
        'What projects should I build for product companies?'
      ];
    } else if (text.includes('today') || text.includes('focus') || text.includes('practice')) {
      reply = `For today, your preparation focus is **${focusTitle}** in the **${todaysFocus?.topic?.category || 'DSA'}** track.\n\nRecommended strategy:\n1. Dedicate **45-60 minutes** without multitasking.\n2. Understand the underlying pattern (e.g. state invariants, pointers, space-time tradeoffs) before coding.\n3. Log your effort unit once done so the Career Intelligence Engine adapts your horizon accurately.`;
      suggestions = [
        `Explain the core pattern in ${focusTitle}`,
        'Give me a problem walkthrough',
        'Mark unit complete'
      ];
    } else if (text.includes('dsa') || text.includes('algorithm') || text.includes('data structure')) {
      reply = `In DSA preparation, consistency in understanding patterns beats memorizing code. Focus on the progression: **Arrays/Strings → Two Pointers & Sliding Window → Hash Maps → Trees & Graphs → Dynamic Programming**.\n\nNever rush to read solutions—give yourself at least 20 minutes of active whiteboard reasoning before checking hints.`;
      suggestions = [
        'How to master Sliding Window?',
        'How to tackle Graph BFS vs DFS?',
        'How important is DP for 2026/2027 placements?'
      ];
    } else if (text.includes('system design') || text.includes('architecture') || text.includes('scale')) {
      reply = `For system design at your stage, start with practical building blocks: **Client-Server communication, Caching (Redis), Load Balancing, Database Indexing & Sharding, and Asynchronous Queues (Kafka/RabbitMQ)**.\n\nCheck out today's **Industry Topic** calendar to see real-world architectural deep-dives used by Uber, Netflix, and Discord!`;
      suggestions = [
        'Explain Redis caching strategies',
        'When should I use SQL vs NoSQL?',
        'What is horizontal vs vertical scaling?'
      ];
    } else if (text.includes('opportunity') || text.includes('internship') || text.includes('job') || text.includes('resume')) {
      reply = `Your CIE match engine scans our verified opportunities pipeline against your **${domain}** profile. To stand out for Tier-1 product roles:\n1. Highlight 2 deep full-stack or systems projects with live URLs.\n2. Quantify results (e.g., "reduced query latency by 40% using Redis cache").\n3. Match key technical keywords present in the opportunity feed.`;
      suggestions = [
        'Show my top matched internships',
        'How can I improve my CIE match score?',
        'What skills should I add to my profile?'
      ];
    } else {
      reply = `Hello! I'm your BeyondCGPA AI Mentor. I have full context on your **${domain}** goals, your **${weeklyHours} hours/week** availability, and your current focus on **${focusTitle}**.\n\nHow can I help you accelerate your technical preparation or clarify concepts today?`;
      suggestions = [
        'What should I study next?',
        'Explain Today\'s Topic in simple terms',
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
