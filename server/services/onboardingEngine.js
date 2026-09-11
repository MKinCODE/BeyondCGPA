/**
 * Onboarding Questionnaire Engine
 * 
 * Implements a dynamic questionnaire with:
 * - Dynamic graduation years based on current calendar year
 * - Adaptive branching based on career goal, exploration mode, and DSA preferences
 * - Early stopping when sufficient calibration data is acquired (between 5 and 8 questions)
 * - Strict hard limit of 15 questions
 */

class OnboardingEngine {
  /**
   * Returns dynamic graduation years starting from the current year
   */
  getDynamicGraduationYears() {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];
  }

  /**
   * Evaluates current answers and returns the next dynamic question or signals sufficiency
   */
  getNextQuestion(previousAnswers = {}) {
    const answeredKeys = Object.keys(previousAnswers);
    const answeredCount = answeredKeys.length;

    // Hard limit: strictly stop at 15 questions
    if (answeredCount >= 15) {
      return {
        completed: true,
        reason: 'Maximum question limit (15) reached. Calibration complete.'
      };
    }

    // Dynamic graduation years
    const gradYears = this.getDynamicGraduationYears();

    // 1. Primary Career Domain
    if (!previousAnswers.targetDomain) {
      return {
        id: 'targetDomain',
        questionNumber: answeredCount + 1,
        title: 'What is your primary career target or focus?',
        subtitle: 'This will anchor your curriculum phases and opportunity matching.',
        type: 'single_select',
        options: [
          { value: 'Fullstack', label: 'Full Stack Engineering', description: 'React/Vue + Node/Python APIs, databases & system design' },
          { value: 'Backend', label: 'Backend & Distributed Systems', description: 'High-concurrency microservices, caching, Kafka, databases' },
          { value: 'Frontend', label: 'Frontend & Web Architecture', description: 'Modern React, performance optimization, UX & state systems' },
          { value: 'AI/ML', label: 'AI & Machine Learning Engineering', description: 'LLM agents, PyTorch, model deployment & data pipelines' },
          { value: 'Cloud/DevOps', label: 'Cloud & DevOps Infrastructure', description: 'Kubernetes, Docker, CI/CD pipelines & reliability' },
          { value: 'Undecided', label: 'Undecided / General Exploration', description: 'Sample Web Dev, Systems, and AI before committing to a single track' }
        ],
        required: true,
        canFinishEarly: false
      };
    }

    // Branch A: If Undecided, probe what aspects interest them most
    if (previousAnswers.targetDomain === 'Undecided' && !previousAnswers.explorationInterest) {
      return {
        id: 'explorationInterest',
        questionNumber: answeredCount + 1,
        title: 'What sounds most exciting to explore first?',
        subtitle: 'The CIE will design a cross-domain discovery roadmap around this.',
        type: 'single_select',
        options: [
          { value: 'BuildingVisualApps', label: 'Building Visual Web Products', description: 'Interactive frontend apps, clean UI, and state management' },
          { value: 'SystemAndDataPlumbing', label: 'System & Data Plumbing', description: 'REST APIs, relational databases, and server logic' },
          { value: 'AIAndDataExploration', label: 'AI & Data Exploration', description: 'Python, prompt engineering, and intelligent agents' },
          { value: 'BroadFoundations', label: 'Broad Foundations First', description: 'Rock-solid computer science fundamentals, OS, and clean code' }
        ],
        required: true,
        canFinishEarly: false
      };
    }

    // 2. Academic Timeline & Graduation Year
    if (!previousAnswers.graduationYear) {
      return {
        id: 'graduationYear',
        questionNumber: answeredCount + 1,
        title: 'What is your expected graduation year?',
        subtitle: 'Used to calculate your readiness horizon and internship eligibility.',
        type: 'year_select',
        options: gradYears.map(y => ({ value: y, label: `Class of ${y}` })),
        required: true,
        canFinishEarly: false
      };
    }

    // 3. Weekly Time Commitment
    if (!previousAnswers.weeklyHours) {
      return {
        id: 'weeklyHours',
        questionNumber: answeredCount + 1,
        title: 'How many hours can you realistically commit weekly?',
        subtitle: 'Workload is distributed into effort units. Missed days carry zero penalty.',
        type: 'slider',
        min: 4,
        max: 40,
        step: 2,
        default: 14,
        unitLabel: 'hours / week',
        required: true,
        canFinishEarly: false
      };
    }

    // 4. DSA Priority Strategy (Directly addressing "Not interested in DSA" / priority inversion)
    if (!previousAnswers.dsaPreference) {
      return {
        id: 'dsaPreference',
        questionNumber: answeredCount + 1,
        title: 'How should Data Structures & Algorithms (DSA) be prioritized?',
        subtitle: 'CIE will adapt your roadmap phases and Today\'s Focus accordingly.',
        type: 'single_select',
        options: [
          {
            value: 'Balanced',
            label: 'Balanced Pace',
            description: 'Standard engineering mix: algorithm foundations alongside practical development'
          },
          {
            value: 'Minimal',
            label: 'Minimal / Practical Focus (Deprioritize DSA)',
            description: 'Put Web Dev and Production Projects first; defer DSA to later optional units'
          },
          {
            value: 'SkipForNow',
            label: 'Skip DSA for Now',
            description: 'Strictly zero DSA in initial phases; focus 100% on domain engineering & portfolio'
          },
          {
            value: 'Intensive',
            label: 'Intensive DSA First',
            description: 'High priority for algorithmic problem solving and technical coding rounds'
          }
        ],
        required: true,
        canFinishEarly: false
      };
    }

    // 5. Current Baseline Proficiency
    if (!previousAnswers.primaryProficiency) {
      const isDsaPreferred = previousAnswers.dsaPreference === 'Intensive' || previousAnswers.dsaPreference === 'Balanced';
      const domainLabel = previousAnswers.targetDomain === 'Undecided'
        ? 'General Coding & Logic'
        : `${previousAnswers.targetDomain} Development`;

      return {
        id: 'primaryProficiency',
        questionNumber: answeredCount + 1,
        title: `How would you rate your current baseline in ${domainLabel}?`,
        subtitle: 'CIE adjusts starting topic effort units and recommendations based on this.',
        type: 'single_select',
        options: [
          { value: 'Beginner', label: 'Beginner', description: 'Just starting out or building foundational understanding' },
          { value: 'Intermediate', label: 'Intermediate', description: 'Comfortable with core syntax, can build small projects with guidance' },
          { value: 'Advanced', label: 'Advanced', description: 'Solid production experience, design patterns, and debugging fluency' }
        ],
        required: true,
        // At this point (Question 5 or 6), we have reached baseline sufficiency!
        canFinishEarly: true
      };
    }

    // 6. Primary Language
    if (!previousAnswers.primaryLanguage) {
      return {
        id: 'primaryLanguage',
        questionNumber: answeredCount + 1,
        title: 'What is your primary programming language of choice?',
        subtitle: 'Helps match relevant practice problems and opportunity requirements.',
        type: 'single_select',
        options: [
          { value: 'JavaScript/TypeScript', label: 'JavaScript / TypeScript' },
          { value: 'Python', label: 'Python' },
          { value: 'Java', label: 'Java' },
          { value: 'C++', label: 'C++' },
          { value: 'Go', label: 'Go' }
        ],
        required: false,
        canFinishEarly: true
      };
    }

    // 7. Preferred Target Companies
    if (!previousAnswers.targetCompaniesCategory) {
      return {
        id: 'targetCompaniesCategory',
        questionNumber: answeredCount + 1,
        title: 'What types of companies are you targeting for internships/jobs?',
        subtitle: 'Allows CIE to calibrate between deep system interview prep vs rapid product building.',
        type: 'multi_select',
        options: [
          { value: 'Product-based', label: 'Product-based Tech (Mid to Large)' },
          { value: 'Startups', label: 'High-growth Startups' },
          { value: 'Tech Giants', label: 'Tier-1 Tech Giants (FAANG/MAMAA)' },
          { value: 'Remote-first', label: 'Global Remote-First Companies' }
        ],
        required: false,
        canFinishEarly: true
      };
    }

    // 8. Learning Velocity Preference
    if (!previousAnswers.preferredPace) {
      return {
        id: 'preferredPace',
        questionNumber: answeredCount + 1,
        title: 'What pace strategy fits your current schedule?',
        subtitle: 'Adjusts horizon estimation buffer and weekly milestone expectations.',
        type: 'single_select',
        options: [
          { value: 'Balanced', label: 'Balanced & Steady', description: 'Consistent weekly progress with ample breathing room' },
          { value: 'Accelerated', label: 'Accelerated High-Impact', description: 'Prioritize highest-yield interview topics directly' },
          { value: 'DeepFoundation', label: 'Deep Foundation', description: 'Extra emphasis on under-the-hood internal mechanics' }
        ],
        required: false,
        // By Question 8, optimal calibration is achieved
        canFinishEarly: true
      };
    }

    // All calibration questions satisfied (reached between 5 and 8)
    return {
      completed: true,
      reason: 'Optimal calibration achieved with sufficient profile depth.'
    };
  }

  /**
   * Synthesizes raw dynamic answers into a structured profile payload
   */
  synthesizeProfile(rawAnswers = {}) {
    const targetDomain = rawAnswers.targetDomain || 'Fullstack';
    const dsaPreference = rawAnswers.dsaPreference || 'Balanced';
    const weeklyHours = Number(rawAnswers.weeklyHours) || 14;
    const preferredPace = rawAnswers.preferredPace || 'Balanced';
    const primaryProf = rawAnswers.primaryProficiency || 'Beginner';

    const currentProficiency = {
      dsa: dsaPreference === 'Intensive' ? 'Intermediate' : 'Beginner',
      development: primaryProf,
      coreCS: 'Beginner',
      systemDesign: primaryProf === 'Advanced' ? 'Intermediate' : 'Beginner'
    };

    const interests = [];
    if (targetDomain === 'Frontend') interests.push('React', 'CSS Architecture', 'UI Performance');
    else if (targetDomain === 'Backend') interests.push('REST APIs', 'SQL Databases', 'Distributed Systems');
    else if (targetDomain === 'AI/ML') interests.push('Machine Learning', 'Python', 'LLM Agents');
    else if (targetDomain === 'Undecided') interests.push(rawAnswers.explorationInterest || 'General Computer Science');
    else interests.push('Full Stack Development', 'REST APIs', 'Modern Web');

    const knownLanguages = rawAnswers.primaryLanguage ? [rawAnswers.primaryLanguage] : ['JavaScript', 'Python'];

    return {
      targetDomain,
      dsaPreference,
      weeklyHours,
      preferredPace,
      currentProficiency,
      interests,
      knownLanguages,
      targetCompaniesCategory: rawAnswers.targetCompaniesCategory || ['Product-based', 'Startups'],
      rawAnswers
    };
  }
}

module.exports = new OnboardingEngine();
