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
}

module.exports = new HeuristicProvider();
