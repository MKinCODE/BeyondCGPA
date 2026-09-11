const aiService = require('./ai/aiService');

/**
 * Onboarding Questionnaire Engine
 * 
 * Implements a dynamic questionnaire with:
 * - Dynamic graduation years based on current calendar year
 * - High-value adaptive questioning targeting domain, baselines, DSA preferences, and prior skills
 * - "Other / Not listed + free text" on every predefined list
 * - Early stopping when sufficient calibration data is acquired
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

    const gradYears = this.getDynamicGraduationYears();

    // 1. Primary Career Domain / Target
    if (!previousAnswers.targetDomain) {
      return {
        id: 'targetDomain',
        questionNumber: answeredCount + 1,
        title: 'What is your primary career target or focus?',
        subtitle: 'This anchors your curriculum phases, prerequisite trees, and opportunity matching.',
        type: 'single_select',
        options: [
          { value: 'Frontend', label: 'Frontend Engineering', description: 'Modern React, performance optimization, UI architecture & state systems' },
          { value: 'Backend', label: 'Backend & Distributed Systems', description: 'High-concurrency microservices, caching, Kafka, databases & Express' },
          { value: 'Fullstack', label: 'Full Stack Engineering', description: 'End-to-end React + Node/Express APIs, databases & full application lifecycle' },
          { value: 'AI/ML', label: 'AI & Machine Learning Engineering', description: 'PyTorch/Scikit pipelines, LLM agents, vector databases & model deployment' },
          { value: 'Cloud/DevOps', label: 'Cloud & DevOps Infrastructure', description: 'Docker, Kubernetes, CI/CD pipelines, and cloud reliability' },
          { value: 'Undecided', label: 'General / Exploration Mode', description: 'Sample Web, Systems, and Problem Solving before committing to a single track' }
        ],
        allowOther: true,
        otherPlaceholder: 'Describe your custom goal (e.g., Mobile Apps with Flutter, Data Engineering, Cybersecurity)...',
        required: true,
        canFinishEarly: false
      };
    }

    // Branch A: If Undecided / Exploration, probe what areas to sample first
    if (previousAnswers.targetDomain === 'Undecided' && !previousAnswers.explorationInterest) {
      return {
        id: 'explorationInterest',
        questionNumber: answeredCount + 1,
        title: 'What areas sound most intriguing to explore first?',
        subtitle: 'CIE will build a cross-domain discovery roadmap with balanced foundational topics.',
        type: 'single_select',
        options: [
          { value: 'BuildingVisualApps', label: 'Interactive Web & UI Exploration', description: 'Component architecture, responsive UI, and state management' },
          { value: 'SystemAndDataPlumbing', label: 'Server Logic & Data Foundations', description: 'REST APIs, relational databases, and server patterns' },
          { value: 'AIAndDataExploration', label: 'AI & Intelligent Models', description: 'Python data pipelines, vector search, and intelligent agents' },
          { value: 'BroadFoundations', label: 'Balanced Cross-Domain Sampler', description: 'A balanced survey across Web, Server, Algorithms, and Systems' }
        ],
        allowOther: true,
        otherPlaceholder: 'Other specific area you are curious about...',
        required: true,
        canFinishEarly: false
      };
    }

    // 2. Domain Baseline Proficiency
    if (!previousAnswers.domainProficiency) {
      const target = previousAnswers.targetDomain === 'Undecided'
        ? 'General Programming'
        : `${previousAnswers.targetDomain}`;

      return {
        id: 'domainProficiency',
        questionNumber: answeredCount + 1,
        title: `What is your current practical baseline in ${target}?`,
        subtitle: 'CIE calibrates starting effort units so you never waste time on basics you already know.',
        type: 'single_select',
        options: [
          { value: 'Beginner', label: 'Beginner / Starting Fresh', description: 'Familiar with basic syntax or just starting to learn' },
          { value: 'Intermediate', label: 'Intermediate / Built Projects', description: 'Have built functioning projects; comfortable with core patterns' },
          { value: 'Advanced', label: 'Advanced / Production Experience', description: 'Solid project experience, design patterns, and debugging fluency' }
        ],
        allowOther: true,
        otherPlaceholder: 'Describe your current practical experience in free text...',
        required: true,
        canFinishEarly: false
      };
    }

    // 3. DSA Priority Strategy
    if (!previousAnswers.dsaPreference) {
      return {
        id: 'dsaPreference',
        questionNumber: answeredCount + 1,
        title: 'How should Data Structures & Algorithms (DSA) be prioritized?',
        subtitle: 'CIE adapts phase ordering and workload units based on your explicit priority.',
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
            description: 'Put domain engineering & production projects first; defer DSA to later optional units'
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
        allowOther: true,
        otherPlaceholder: 'Specify any custom algorithm priority or preference...',
        required: true,
        canFinishEarly: false
      };
    }

    // 4. Current DSA Comfort / Experience
    if (!previousAnswers.dsaProficiency && previousAnswers.dsaPreference !== 'SkipForNow') {
      return {
        id: 'dsaProficiency',
        questionNumber: answeredCount + 1,
        title: 'What is your current problem-solving and DSA comfort level?',
        subtitle: 'Allows CIE to skip introductory arrays if you are already comfortable with two pointers.',
        type: 'single_select',
        options: [
          { value: 'Beginner', label: 'Beginner (0–20 problems solved)', description: 'New to algorithmic problem solving or need structured foundations' },
          { value: 'Intermediate', label: 'Intermediate (30–80 problems solved)', description: 'Comfortable with Arrays, Strings, Two Pointers, and Hash Maps' },
          { value: 'Advanced', label: 'Advanced (100+ problems solved)', description: 'Fluent in Trees, BSTs, Graphs, and computational complexity' }
        ],
        allowOther: true,
        otherPlaceholder: 'Describe your problem solving background (e.g. LeetCode count, contest rating)...',
        required: true,
        canFinishEarly: true // At question 4-5, baseline sufficiency is reached!
      };
    }

    // 5. Existing Known Skills / Prior Completed Areas
    if (!previousAnswers.priorSkills) {
      return {
        id: 'priorSkills',
        questionNumber: answeredCount + 1,
        title: 'Which technologies or topics have you ALREADY completed or built with?',
        subtitle: 'CIE will mark mastered topics as completed and immediately unblock advanced units.',
        type: 'multi_select',
        options: [
          { value: 'React', label: 'Modern React & Component Architecture' },
          { value: 'REST_APIs', label: 'Production REST APIs (Node/Express)' },
          { value: 'Databases_SQL', label: 'Database Indexing & SQL/NoSQL' },
          { value: 'Arrays_TwoPointers', label: 'Arrays, Two Pointers & Sliding Window' },
          { value: 'Docker', label: 'Docker Containerization' },
          { value: 'PyTorch_ML', label: 'Python & Applied Machine Learning' },
          { value: 'None', label: 'None of these yet (Starting fresh)' }
        ],
        allowOther: true,
        otherPlaceholder: 'List any other tools, frameworks or libraries you already know well...',
        required: false,
        canFinishEarly: true
      };
    }

    // 6. Weekly Time Commitment
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
        canFinishEarly: true
      };
    }

    // 7. Academic Timeline & Graduation Year
    if (!previousAnswers.graduationYear) {
      return {
        id: 'graduationYear',
        questionNumber: answeredCount + 1,
        title: 'What is your expected graduation year?',
        subtitle: 'Used to calculate your readiness horizon and internship eligibility.',
        type: 'year_select',
        options: gradYears.map(y => ({ value: y, label: `Class of ${y}` })),
        required: true,
        canFinishEarly: true
      };
    }

    // 8. Primary Programming Language
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
        allowOther: true,
        otherPlaceholder: 'Specify other language (e.g. Rust, Kotlin, Swift)...',
        required: false,
        canFinishEarly: true
      };
    }

    // 9. Target Companies
    if (!previousAnswers.targetCompaniesCategory) {
      return {
        id: 'targetCompaniesCategory',
        questionNumber: answeredCount + 1,
        title: 'What types of companies are you targeting?',
        subtitle: 'Allows CIE to calibrate between deep system interview rounds vs rapid product engineering.',
        type: 'multi_select',
        options: [
          { value: 'Product-based', label: 'Product-based Tech (Mid to Large)' },
          { value: 'Startups', label: 'High-growth Startups' },
          { value: 'Tech Giants', label: 'Tier-1 Tech Giants (FAANG/MAMAA)' },
          { value: 'Remote-first', label: 'Global Remote-First Companies' }
        ],
        allowOther: true,
        otherPlaceholder: 'Specify any specific companies or industries...',
        required: false,
        canFinishEarly: true
      };
    }

    // All high-value questions satisfied!
    return {
      completed: true,
      reason: 'Optimal calibration achieved with sufficient profile depth.'
    };
  }

  /**
   * Synthesizes raw dynamic answers into a structured profile payload
   */
  async synthesizeProfile(rawAnswers = {}) {
    // 1. Identify any free-text responses
    const freeTextAnswers = {};
    for (const [k, v] of Object.entries(rawAnswers)) {
      if (k.endsWith('_other') || k === 'customGoal' || (typeof v === 'string' && v.startsWith('Other:'))) {
        freeTextAnswers[k] = v;
      }
    }

    // 2. Selectively invoke LLM / Heuristic extractor if free-text is present
    let extracted = {};
    if (Object.keys(freeTextAnswers).length > 0) {
      extracted = await aiService.extractStructuredStateFromFreeText(freeTextAnswers);
    }

    // 3. Resolve Target Domain
    let targetDomain = rawAnswers.targetDomain || extracted.detectedDomain || 'Fullstack';
    if (rawAnswers.targetDomain_other) {
      targetDomain = extracted.detectedDomain || rawAnswers.targetDomain || 'Fullstack';
    }

    // 4. Resolve DSA Preference
    let dsaPreference = rawAnswers.dsaPreference || extracted.dsaPreference || 'Balanced';
    if (rawAnswers.dsaPreference_other) {
      dsaPreference = extracted.dsaPreference || 'Balanced';
    }

    // 5. Resolve Weekly Hours & Pace
    const weeklyHours = Number(rawAnswers.weeklyHours) || 14;
    const preferredPace = rawAnswers.preferredPace || 'Balanced';

    // 6. Resolve Estimated Proficiency Across Relevant Areas
    const domainProf = rawAnswers.domainProficiency || extracted.developmentProficiency || 'Beginner';
    const dsaProf = rawAnswers.dsaProficiency || extracted.dsaComfort || (dsaPreference === 'Intensive' ? 'Intermediate' : 'Beginner');

    const estimatedProficiency = {
      dsa: dsaProf,
      development: domainProf,
      coreCS: (domainProf === 'Advanced' || dsaProf === 'Advanced') ? 'Intermediate' : 'Beginner',
      systemDesign: domainProf === 'Advanced' ? 'Intermediate' : 'Beginner'
    };

    // 7. Resolve Self-Reported Skills (Separated from verified mastery!)
    const priorSkills = Array.isArray(rawAnswers.priorSkills) ? rawAnswers.priorSkills : [];
    const selfReportedSkills = [...(extracted.detectedSkills || [])];

    if (priorSkills.includes('React')) selfReportedSkills.push('Modern React, Component Architecture & State Systems');
    if (priorSkills.includes('REST_APIs')) selfReportedSkills.push('Production REST API Architecture & Express.js');
    if (priorSkills.includes('Arrays_TwoPointers')) selfReportedSkills.push('Arrays & Two Pointers');
    if (priorSkills.includes('Databases_SQL')) selfReportedSkills.push('Database Indexing & Query Optimization (SQL vs NoSQL)');
    if (priorSkills.includes('Docker')) selfReportedSkills.push('Containerization with Docker & Container Orchestration');
    if (priorSkills.includes('PyTorch_ML')) selfReportedSkills.push('Applied Machine Learning Pipelines & PyTorch/Scikit-Learn');

    // 8. Interests & Languages
    const interests = [...(extracted.extractedInterests || [])];
    if (targetDomain === 'Frontend') interests.push('React', 'CSS Architecture', 'UI Performance');
    else if (targetDomain === 'Backend') interests.push('REST APIs', 'SQL Databases', 'Distributed Systems');
    else if (targetDomain === 'AI/ML') interests.push('Machine Learning', 'Python', 'LLM Agents');
    else if (targetDomain === 'Cloud/DevOps') interests.push('Docker', 'CI/CD', 'Kubernetes');
    else if (targetDomain === 'Undecided') interests.push(rawAnswers.explorationInterest || 'Cross-Domain Exploration');
    else interests.push('Full Stack Development', 'REST APIs', 'Modern Web');

    const knownLanguages = rawAnswers.primaryLanguage
      ? [rawAnswers.primaryLanguage]
      : (targetDomain === 'AI/ML' ? ['Python'] : ['JavaScript', 'Python']);

    return {
      targetDomain,
      dsaPreference,
      weeklyHours,
      preferredPace,
      estimatedProficiency,
      currentProficiency: estimatedProficiency,
      selfReportedSkills: Array.from(new Set(selfReportedSkills)),
      selfReportedExperience: {
        domainProficiency: domainProf,
        dsaProficiency: dsaProf,
        priorSkills,
        extracted
      },
      interests: Array.from(new Set(interests)),
      knownLanguages: Array.from(new Set(knownLanguages)),
      targetCompaniesCategory: rawAnswers.targetCompaniesCategory || ['Product-based', 'Startups'],
      rawAnswers
    };
  }
}

module.exports = new OnboardingEngine();
