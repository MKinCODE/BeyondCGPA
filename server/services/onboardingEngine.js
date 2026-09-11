const aiService = require('./ai/aiService');

/**
 * Domain-Specific Knowledge Base for Dynamic Question & Option Generation
 * Defines contextually accurate technologies, concepts, and project milestones per domain.
 */
const DOMAIN_KNOWLEDGE = {
  'Cloud/DevOps': {
    label: 'Cloud & DevOps Infrastructure',
    proficiencyTitle: 'What is your current hands-on baseline in Cloud & DevOps tooling?',
    proficiencySubtitle: 'CIE calibrates starting effort units to avoid basic tutorials if you already know containerization.',
    proficiencyOptions: [
      { value: 'Beginner', label: 'Beginner / Starting Fresh', description: 'New to containers, cloud and DevOps; comfortable with basic command line' },
      { value: 'Intermediate', label: 'Intermediate / Built Deployments', description: 'Built Dockerfiles, deployed web apps on cloud VPS, or configured basic CI/CD' },
      { value: 'Advanced', label: 'Advanced / Production Experience', description: 'Hands-on with Kubernetes, Terraform IaC, multi-stage pipelines, and monitoring' }
    ],
    skillsTitle: 'Which Cloud & DevOps tools and practices have you ALREADY worked with?',
    skillsSubtitle: 'CIE will tailor your roadmap to skip tools you already know and focus on your skill gaps.',
    skillsOptions: [
      { value: 'Docker', label: 'Docker & Containerization' },
      { value: 'Kubernetes', label: 'Kubernetes Container Orchestration' },
      { value: 'CI_CD', label: 'CI/CD Pipelines (GitHub Actions / GitLab CI)' },
      { value: 'Linux_Shell', label: 'Linux Systems & Shell Scripting' },
      { value: 'Terraform_IaC', label: 'Infrastructure as Code (Terraform)' },
      { value: 'Cloud_Platforms', label: 'Cloud Platforms (AWS, GCP, or Azure)' },
      { value: 'Observability', label: 'Prometheus, Grafana & Logging' },
      { value: 'None', label: 'None of these yet (Starting fresh in DevOps)' }
    ],
    projectsTitle: 'What scale of infrastructure or deployments have you managed so far?',
    projectsSubtitle: 'Differentiates between local lab experimentation and production reliability.',
    projectsOptions: [
      { value: 'Local_Experiments', label: 'Local Experiments', description: 'CLI commands, basic scripts, or introductory Docker tutorials locally' },
      { value: 'Docker_Compose_Apps', label: 'Multi-container Setups', description: 'Configured Docker Compose with multi-container web apps and databases' },
      { value: 'Cloud_VPS_Deployments', label: 'Cloud Deployments', description: 'Provisioned cloud VMs (EC2/DigitalOcean), configured reverse proxies & SSL' },
      { value: 'Production_GitOps', label: 'Automated CI/CD / Kubernetes', description: 'Deployed live automated pipelines or managed cluster environments' }
    ]
  },

  'Frontend': {
    label: 'Frontend Engineering',
    proficiencyTitle: 'What is your current practical baseline in Frontend & Web Architecture?',
    proficiencySubtitle: 'CIE calibrates starting effort units so you never waste time on basics you already know.',
    proficiencyOptions: [
      { value: 'Beginner', label: 'Beginner / Starting Fresh', description: 'Familiar with HTML/CSS/basic JS syntax; new to modern frontend frameworks' },
      { value: 'Intermediate', label: 'Intermediate / Built Web Apps', description: 'Built functioning responsive apps with React; comfortable with hooks and state' },
      { value: 'Advanced', label: 'Advanced / Production Experience', description: 'Architected reusable component design systems, performance profiling, and SSR' }
    ],
    skillsTitle: 'Which Frontend technologies and concepts have you ALREADY worked with?',
    skillsSubtitle: 'CIE will tailor your roadmap to skip concepts you already know and focus on your skill gaps.',
    skillsOptions: [
      { value: 'React', label: 'Modern React & Component Architecture' },
      { value: 'State_Management', label: 'State Systems (Context, Zustand, or Redux)' },
      { value: 'TypeScript_Web', label: 'TypeScript for Frontend Development' },
      { value: 'CSS_Tailwind', label: 'Tailwind CSS & Responsive Layout Algorithms' },
      { value: 'Web_Performance', label: 'DOM Performance & Core Web Vitals (LCP/INP)' },
      { value: 'NextJS_SSR', label: 'Next.js & Server-Side Rendering (SSR/SSG)' },
      { value: 'None', label: 'None of these yet (Starting fresh in Frontend)' }
    ],
    projectsTitle: 'What kind of web applications or interfaces have you built so far?',
    projectsSubtitle: 'Differentiates between static pages and complex production client applications.',
    projectsOptions: [
      { value: 'Static_Pages', label: 'Coursework / Static Pages', description: 'Built static landing pages or basic course assignments' },
      { value: 'Interactive_SPAs', label: 'Interactive Single-Page Apps', description: 'Built dynamic apps with client-side routing, API fetching, and forms' },
      { value: 'Full_Frontend_Products', label: 'Complete Web Products', description: 'Built full production frontend products with auth, dashboards, and error handling' },
      { value: 'High_Perf_Apps', label: 'High-Performance / Scaled Apps', description: 'Optimized complex apps with virtualization, code-splitting, and accessibility' }
    ]
  },

  'Backend': {
    label: 'Backend & Distributed Systems',
    proficiencyTitle: 'What is your current practical baseline in Backend & Server Systems?',
    proficiencySubtitle: 'CIE calibrates starting effort units to tailor your API and database curriculum.',
    proficiencyOptions: [
      { value: 'Beginner', label: 'Beginner / Starting Fresh', description: 'Familiar with basic programming; new to HTTP, server architecture, or database design' },
      { value: 'Intermediate', label: 'Intermediate / Built APIs', description: 'Built authenticated REST APIs; comfortable with database schemas and CRUD' },
      { value: 'Advanced', label: 'Advanced / Production Experience', description: 'Designed high-throughput microservices, caching layers, and database optimization' }
    ],
    skillsTitle: 'Which Backend technologies and patterns have you ALREADY worked with?',
    skillsSubtitle: 'CIE will tailor your roadmap to skip patterns you already know and focus on your skill gaps.',
    skillsOptions: [
      { value: 'REST_APIs', label: 'Production REST APIs (Node/Express, Django, etc.)' },
      { value: 'SQL_Databases', label: 'Relational Databases & SQL (Postgres / MySQL)' },
      { value: 'NoSQL_Databases', label: 'NoSQL Databases (MongoDB)' },
      { value: 'Redis_Caching', label: 'In-Memory Caching (Redis / Memcached)' },
      { value: 'Message_Brokers', label: 'Message Queues (Kafka / RabbitMQ)' },
      { value: 'Microservices', label: 'Microservices & Distributed Transactions' },
      { value: 'None', label: 'None of these yet (Starting fresh in Backend)' }
    ],
    projectsTitle: 'What scale of server architecture or APIs have you deployed so far?',
    projectsSubtitle: 'Differentiates between small script APIs and scalable backend architectures.',
    projectsOptions: [
      { value: 'Basic_Scripts', label: 'Scripting / Coursework', description: 'Basic console utilities or introductory academic assignments' },
      { value: 'Monolithic_APIs', label: 'Monolithic CRUD APIs', description: 'Built backend services connected to a relational or document database' },
      { value: 'Layered_Services', label: 'Production Layered APIs', description: 'Built APIs with JWT auth, validation, rate limiting, and caching' },
      { value: 'Distributed_Backends', label: 'Distributed / Event-Driven Systems', description: 'Deployed microservices communicating via message queues or gRPC' }
    ]
  },

  'AI/ML': {
    label: 'AI & Machine Learning Engineering',
    proficiencyTitle: 'What is your current practical baseline in Machine Learning & AI?',
    proficiencySubtitle: 'CIE calibrates your learning track between statistical basics and deep architectures.',
    proficiencyOptions: [
      { value: 'Beginner', label: 'Beginner / Starting Fresh', description: 'Basic Python syntax; learning linear algebra, probability, and core statistics' },
      { value: 'Intermediate', label: 'Intermediate / Trained Models', description: 'Trained supervised ML models with Scikit-learn; comfortable with data preparation' },
      { value: 'Advanced', label: 'Advanced / Production Experience', description: 'Built deep learning models in PyTorch, deployed RAG vector systems, or fine-tuned LLMs' }
    ],
    skillsTitle: 'Which AI/ML technologies and frameworks have you ALREADY worked with?',
    skillsSubtitle: 'CIE will tailor your roadmap to skip tools you already know and focus on your skill gaps.',
    skillsOptions: [
      { value: 'Python_Data', label: 'Python Data Science Stack (NumPy, Pandas, Matplotlib)' },
      { value: 'Scikit_Learn', label: 'Classical Machine Learning (Scikit-Learn Pipelines)' },
      { value: 'PyTorch_ML', label: 'Deep Learning with PyTorch or TensorFlow' },
      { value: 'Vector_Databases', label: 'Vector Databases & Embeddings (Chroma, Pinecone)' },
      { value: 'LLM_Frameworks', label: 'LLM Engineering (LangChain, LlamaIndex, RAG)' },
      { value: 'Model_Deployment', label: 'Model Serving & Inference APIs (FastAPI)' },
      { value: 'None', label: 'None of these yet (Starting fresh in AI/ML)' }
    ],
    projectsTitle: 'What kind of Machine Learning projects have you developed so far?',
    projectsSubtitle: 'Differentiates between notebook exploration and real-world inference systems.',
    projectsOptions: [
      { value: 'Jupyter_Exploration', label: 'Notebook Data Analysis', description: 'Exploratory data analysis, cleaning datasets, and generating graphs' },
      { value: 'Trained_Classifiers', label: 'End-to-End ML Pipelines', description: 'Trained classification/regression models with cross-validation' },
      { value: 'Generative_AI_Apps', label: 'Generative AI & RAG Apps', description: 'Built document question-answering systems with vector search' },
      { value: 'Production_ML_Pipelines', label: 'Production ML Systems', description: 'Trained deep neural networks or deployed scalable model inference APIs' }
    ]
  },

  'Fullstack': {
    label: 'Full Stack Engineering',
    proficiencyTitle: 'What is your current practical baseline across Full Stack Engineering?',
    proficiencySubtitle: 'CIE calibrates starting effort units across client, server, and database layers.',
    proficiencyOptions: [
      { value: 'Beginner', label: 'Beginner / Starting Fresh', description: 'Familiar with basic programming; new to connecting frontends with databases' },
      { value: 'Intermediate', label: 'Intermediate / Built Full Apps', description: 'Built complete functioning web apps with React, Express, and a database' },
      { value: 'Advanced', label: 'Advanced / Production Experience', description: 'Shipped production fullstack apps with auth, state systems, caching, and CI/CD' }
    ],
    skillsTitle: 'Which Full Stack engineering layers have you ALREADY worked with?',
    skillsSubtitle: 'CIE will tailor your roadmap to focus on your weakest layer and accelerate strong ones.',
    skillsOptions: [
      { value: 'React', label: 'Modern React & Component Architecture' },
      { value: 'REST_APIs', label: 'Production REST APIs (Node/Express)' },
      { value: 'Databases_SQL', label: 'Database Design & Indexing (SQL / MongoDB)' },
      { value: 'Fullstack_Auth', label: 'Authentication & Session Security (JWT, OAuth)' },
      { value: 'Docker', label: 'Containerization with Docker' },
      { value: 'None', label: 'None of these yet (Starting fresh in Full Stack)' }
    ],
    projectsTitle: 'What kind of full stack applications have you shipped so far?',
    projectsSubtitle: 'Differentiates between tutorial projects and production web systems.',
    projectsOptions: [
      { value: 'Tutorial_Clones', label: 'Coursework / Tutorial Clones', description: 'Followed tutorials or built simple single-tier web pages' },
      { value: 'CRUD_Applications', label: 'Functional CRUD Applications', description: 'Built complete web apps with frontend UI, backend API, and database' },
      { value: 'Deployed_SaaS', label: 'Live Deployed Products', description: 'Shipped web applications with authentication, live databases, and domain hosting' },
      { value: 'Scaled_Platforms', label: 'Production Scaled Platforms', description: 'Built platforms with automated testing, caching, and background jobs' }
    ]
  },

  'Undecided': {
    label: 'Cross-Domain Exploration',
    proficiencyTitle: 'What is your current general practical baseline in programming?',
    proficiencySubtitle: 'CIE will build a balanced discovery track without premature career locking.',
    proficiencyOptions: [
      { value: 'Beginner', label: 'Beginner / Starting Fresh', description: 'New to programming or just starting to learn syntax and variables' },
      { value: 'Intermediate', label: 'Intermediate / Built Exercises', description: 'Comfortable with basic syntax, functions, and small code exercises' },
      { value: 'Advanced', label: 'Advanced / Multi-language Experience', description: 'Fluent in at least one language; ready to survey different career specializations' }
    ],
    skillsTitle: 'Which foundational programming areas have you explored so far?',
    skillsSubtitle: 'CIE will balance your exploration topics across areas you haven\'t surveyed yet.',
    skillsOptions: [
      { value: 'Web_Basics', label: 'Web Basics (HTML, CSS, or JavaScript)' },
      { value: 'Python_Scripting', label: 'Python Scripting & Data Handling' },
      { value: 'OOP_Core', label: 'Object-Oriented Programming (Java, C++)' },
      { value: 'DSA_Basics', label: 'Basic Array & String Problem Solving' },
      { value: 'Database_Basics', label: 'Basic SQL or Database Queries' },
      { value: 'None', label: 'None of these yet (Starting completely fresh)' }
    ],
    projectsTitle: 'What practical coding projects have you experimented with so far?',
    projectsSubtitle: 'Helps determine whether you learn better through visual apps or algorithms.',
    projectsOptions: [
      { value: 'No_Projects', label: 'No Projects Yet', description: 'Focused on coursework, theory, or just getting started' },
      { value: 'Command_Line', label: 'CLI / Script Utilities', description: 'Built command-line tools, calculators, or text games' },
      { value: 'Small_Web_Pages', label: 'Basic Web Pages', description: 'Created simple interactive web pages or course assignments' },
      { value: 'Independent_Apps', label: 'Independent Projects', description: 'Built working independent projects in any programming language' }
    ]
  }
};

/**
 * Dynamic Onboarding Engine
 * 
 * Generates runtime questions and domain-specific options dynamically from the student's accumulated state.
 * Employs adaptive information-gap evaluation: asks ONLY what is missing and relevant.
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
   * Resolves the canonical domain key from answers (handling free-text if provided)
   */
  resolveDomain(previousAnswers = {}) {
    if (previousAnswers.targetDomain && DOMAIN_KNOWLEDGE[previousAnswers.targetDomain]) {
      return previousAnswers.targetDomain;
    }

    const freeText = (previousAnswers.targetDomain_other || previousAnswers.targetDomain || '').toLowerCase();
    if (freeText) {
      if (/\b(devops|cloud|docker|kubernetes|k8s|ci\/cd|infrastructure|terraform)\b/i.test(freeText)) return 'Cloud/DevOps';
      if (/\b(ai|artificial intelligence|machine learning|ml|llm|pytorch|deep learning|data science)\b/i.test(freeText)) return 'AI/ML';
      if (/\b(frontend|ui\/ux|react|client-side|css|tailwind|vue|angular)\b/i.test(freeText)) return 'Frontend';
      if (/\b(backend|api|apis|microservice|microservices|server|express|django|spring boot)\b/i.test(freeText)) return 'Backend';
      if (/\b(fullstack|full stack|mern|mean|web development)\b/i.test(freeText)) return 'Fullstack';
      if (/\b(undecided|not sure|explore|general)\b/i.test(freeText)) return 'Undecided';
    }

    return previousAnswers.targetDomain || null;
  }

  /**
   * Evaluates current student state and determines what high-value information is still missing.
   * Generates ONE relevant question + dynamically tailored options.
   */
  getNextQuestion(previousAnswers = {}) {
    const answeredKeys = Object.keys(previousAnswers);
    const answeredCount = answeredKeys.length;

    // Safety hard limit: strictly cap at 15 questions
    if (answeredCount >= 15) {
      return {
        completed: true,
        reason: 'Internal safety limit reached. Calibration complete.'
      };
    }

    const resolvedDomain = this.resolveDomain(previousAnswers);
    const domainData = DOMAIN_KNOWLEDGE[resolvedDomain] || DOMAIN_KNOWLEDGE['Fullstack'];
    const gradYears = this.getDynamicGraduationYears();

    // =========================================================================
    // Dimension 1: Primary Career Direction / Domain
    // =========================================================================
    if (!resolvedDomain) {
      return {
        id: 'targetDomain',
        title: 'What is your primary career target or focus?',
        subtitle: 'This anchors your curriculum phases, prerequisite trees, and opportunity matching.',
        type: 'single_select',
        options: [
          { value: 'Cloud/DevOps', label: 'Cloud & DevOps Infrastructure', description: 'Docker, Kubernetes, CI/CD pipelines, Terraform, and cloud reliability' },
          { value: 'Frontend', label: 'Frontend Engineering', description: 'Modern React, performance optimization, UI architecture & state systems' },
          { value: 'Backend', label: 'Backend & Distributed Systems', description: 'High-concurrency microservices, caching, Kafka, databases & Express' },
          { value: 'AI/ML', label: 'AI & Machine Learning Engineering', description: 'PyTorch pipelines, LLM agents, vector databases & model deployment' },
          { value: 'Fullstack', label: 'Full Stack Engineering', description: 'End-to-end React + Node/Express APIs, databases & full application lifecycle' },
          { value: 'Undecided', label: 'General / Exploration Mode', description: 'Sample Web, Systems, and Problem Solving before committing to a single track' }
        ],
        allowOther: true,
        otherPlaceholder: 'Describe your custom goal (e.g., Mobile Apps with Flutter, Cybersecurity, Game Dev)...',
        required: true,
        canFinishEarly: false
      };
    }

    // Branch A: If Undecided, clarify initial cross-sampling preference
    if (resolvedDomain === 'Undecided' && !previousAnswers.explorationInterest) {
      return {
        id: 'explorationInterest',
        title: 'What areas sound most intriguing to explore first?',
        subtitle: 'CIE will build a cross-domain discovery roadmap with balanced foundational topics.',
        type: 'single_select',
        options: [
          { value: 'BuildingVisualApps', label: 'Interactive Web & UI Exploration', description: 'Component architecture, responsive UI, and state management' },
          { value: 'SystemAndDataPlumbing', label: 'Server Logic & Data Foundations', description: 'REST APIs, relational databases, and server patterns' },
          { value: 'CloudAndContainers', label: 'Cloud & Containerization', description: 'Docker, cloud servers, and automated pipelines' },
          { value: 'AIAndDataExploration', label: 'AI & Intelligent Models', description: 'Python data pipelines, vector search, and intelligent agents' },
          { value: 'BroadFoundations', label: 'Balanced Cross-Domain Sampler', description: 'A balanced survey across Web, Server, Algorithms, and Systems' }
        ],
        allowOther: true,
        otherPlaceholder: 'Other specific area you are curious about...',
        required: true,
        canFinishEarly: false
      };
    }

    // =========================================================================
    // Dimension 2: Domain-Specific Baseline Proficiency
    // =========================================================================
    if (!previousAnswers.domainProficiency) {
      return {
        id: 'domainProficiency',
        title: domainData.proficiencyTitle,
        subtitle: domainData.proficiencySubtitle,
        type: 'single_select',
        options: domainData.proficiencyOptions,
        allowOther: true,
        otherPlaceholder: `Describe your hands-on background in ${resolvedDomain}...`,
        required: true,
        canFinishEarly: false
      };
    }

    // =========================================================================
    // Dimension 3: Domain-Specific Technical Knowledge & Prior Skills
    // Dynamically generated options STRICTLY relevant to the chosen domain!
    // =========================================================================
    const hasReportedSkills = previousAnswers.domainSkills !== undefined || previousAnswers.priorSkills !== undefined;
    if (!hasReportedSkills) {
      return {
        id: 'domainSkills',
        title: domainData.skillsTitle,
        subtitle: domainData.skillsSubtitle,
        type: 'multi_select',
        options: domainData.skillsOptions,
        allowOther: true,
        otherPlaceholder: `List any other tools, frameworks or libraries in ${resolvedDomain} you already know...`,
        required: false,
        canFinishEarly: false
      };
    }

    // =========================================================================
    // Dimension 4: Strategic DSA Alignment
    // =========================================================================
    if (!previousAnswers.dsaPreference) {
      return {
        id: 'dsaPreference',
        title: 'How should Data Structures & Algorithms (DSA) fit into your preparation?',
        subtitle: 'CIE adapts phase ordering and workload units based on your explicit priority.',
        type: 'single_select',
        options: [
          {
            value: 'Balanced',
            label: 'Balanced Pace',
            description: 'Standard engineering mix: algorithm problem-solving in parallel with practical engineering'
          },
          {
            value: 'Minimal',
            label: 'Minimal / Practical Focus (Deprioritize DSA)',
            description: 'Put domain engineering & production projects first; defer algorithms to later optional units'
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

    // =========================================================================
    // Dimension 5: DSA Problem-Solving Depth
    // STRICT RULE: If student selected SkipForNow, NEVER ASK THIS QUESTION!
    // =========================================================================
    const wantsDSA = previousAnswers.dsaPreference !== 'SkipForNow';
    if (wantsDSA && !previousAnswers.dsaProficiency) {
      return {
        id: 'dsaProficiency',
        title: 'What is your current problem-solving and coding challenge comfort level?',
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
        canFinishEarly: true
      };
    }

    // =========================================================================
    // Dimension 6: Domain-Specific Practical Project / Architecture Scale
    // =========================================================================
    const hasProjectAnswer = previousAnswers.domainProjects !== undefined || previousAnswers.practicalProjects !== undefined;
    if (!hasProjectAnswer) {
      return {
        id: 'domainProjects',
        title: domainData.projectsTitle,
        subtitle: domainData.projectsSubtitle,
        type: 'single_select',
        options: domainData.projectsOptions,
        allowOther: true,
        otherPlaceholder: `Briefly describe notable projects or systems you have deployed in ${resolvedDomain}...`,
        required: false,
        canFinishEarly: true
      };
    }

    // =========================================================================
    // Dimension 7: Weekly Availability Commitment
    // =========================================================================
    if (!previousAnswers.weeklyHours) {
      return {
        id: 'weeklyHours',
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

    // =========================================================================
    // Dimension 8: Academic Timeline & Graduation Year
    // =========================================================================
    if (!previousAnswers.graduationYear) {
      return {
        id: 'graduationYear',
        title: 'What is your expected graduation year?',
        subtitle: 'Used to calculate your readiness horizon and internship eligibility.',
        type: 'year_select',
        options: gradYears.map(y => ({ value: y, label: `Class of ${y}` })),
        required: true,
        canFinishEarly: true
      };
    }

    // =========================================================================
    // All high-value calibration signals satisfied! Complete early.
    // =========================================================================
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
    let targetDomain = this.resolveDomain(rawAnswers) || extracted.detectedDomain || 'Fullstack';

    // 4. Resolve DSA Preference
    let dsaPreference = rawAnswers.dsaPreference || extracted.dsaPreference || 'Balanced';
    if (rawAnswers.dsaPreference_other) {
      dsaPreference = extracted.dsaPreference || rawAnswers.dsaPreference || 'Balanced';
    }

    // 5. Resolve Weekly Hours & Pace
    const weeklyHours = Number(rawAnswers.weeklyHours) || 14;
    const preferredPace = rawAnswers.preferredPace || 'Balanced';

    // 6. Resolve Estimated Proficiency Across Relevant Areas
    let domainProf = rawAnswers.domainProficiency || extracted.developmentProficiency || 'Beginner';
    let dsaProf = rawAnswers.dsaProficiency || extracted.dsaComfort || (dsaPreference === 'Intensive' ? 'Intermediate' : 'Beginner');

    const domainProjects = rawAnswers.domainProjects || rawAnswers.practicalProjects || (extracted.hasProductionExperience ? 'Production_GitOps' : null);
    if (domainProjects === 'Production_GitOps' || domainProjects === 'High_Perf_Apps' || domainProjects === 'Distributed_Backends' || domainProjects === 'ProductionExperience') {
      if (domainProf === 'Beginner') domainProf = 'Intermediate';
      else domainProf = 'Advanced';
    }

    const estimatedProficiency = {
      dsa: dsaPreference === 'SkipForNow' ? 'Beginner' : dsaProf,
      development: domainProf,
      coreCS: (domainProf === 'Advanced' || dsaProf === 'Advanced') ? 'Intermediate' : 'Beginner',
      systemDesign: domainProf === 'Advanced' ? 'Intermediate' : 'Beginner'
    };

    // 7. Resolve Self-Reported Skills (Separated from verified mastery!)
    const reportedSkills = Array.isArray(rawAnswers.domainSkills)
      ? rawAnswers.domainSkills
      : Array.isArray(rawAnswers.priorSkills)
        ? rawAnswers.priorSkills
        : [];

    const selfReportedSkills = [...(extracted.detectedSkills || [])];

    // Map domain skill keys to topic titles
    reportedSkills.forEach(skillKey => {
      // Cloud/DevOps skills
      if (skillKey === 'Docker') selfReportedSkills.push('Containerization with Docker & Container Orchestration');
      if (skillKey === 'Kubernetes') selfReportedSkills.push('Containerization with Docker & Container Orchestration');
      if (skillKey === 'CI_CD') selfReportedSkills.push('CI/CD Automation Pipelines & Cloud Infrastructure');
      if (skillKey === 'Linux_Shell') selfReportedSkills.push('Concurrency, Threads & Process Synchronization');
      
      // Frontend skills
      if (skillKey === 'React') selfReportedSkills.push('Modern React, Component Architecture & State Systems');
      if (skillKey === 'State_Management') selfReportedSkills.push('Modern React, Component Architecture & State Systems');
      if (skillKey === 'Web_Performance') selfReportedSkills.push('Web Performance, DOM Mechanics & Responsive UI Architecture');
      
      // Backend skills
      if (skillKey === 'REST_APIs') selfReportedSkills.push('Production REST API Architecture & Express.js');
      if (skillKey === 'SQL_Databases' || skillKey === 'Databases_SQL') selfReportedSkills.push('Database Indexing & Query Optimization (SQL vs NoSQL)');
      if (skillKey === 'Redis_Caching') selfReportedSkills.push('Distributed Caching & High Availability (Redis)');
      if (skillKey === 'Message_Brokers') selfReportedSkills.push('Microservices & Event-Driven Message Brokers');
      
      // AI/ML skills
      if (skillKey === 'Python_Data' || skillKey === 'PyTorch_ML') selfReportedSkills.push('Applied Machine Learning Pipelines & PyTorch/Scikit-Learn');
      if (skillKey === 'Vector_Databases' || skillKey === 'LLM_Frameworks') selfReportedSkills.push('LLM Application Engineering, Vector DBs & RAG Architecture');
      
      // DSA skills
      if (skillKey === 'Arrays_TwoPointers') selfReportedSkills.push('Arrays & Two Pointers');
    });

    // 8. Interests & Languages
    const interests = [...(extracted.extractedInterests || [])];
    if (rawAnswers.interests && Array.isArray(rawAnswers.interests)) {
      interests.push(...rawAnswers.interests);
    }
    if (targetDomain === 'Frontend') interests.push('React', 'CSS Architecture', 'UI Performance');
    else if (targetDomain === 'Backend') interests.push('REST APIs', 'SQL Databases', 'Distributed Systems');
    else if (targetDomain === 'AI/ML') interests.push('Machine Learning', 'Python', 'LLM Agents');
    else if (targetDomain === 'Cloud/DevOps') interests.push('Docker', 'CI/CD', 'Kubernetes');
    else if (targetDomain === 'Undecided') interests.push(rawAnswers.explorationInterest || 'Cross-Domain Exploration');
    else interests.push(`${targetDomain} Engineering`, 'Modern Systems Architecture');

    const knownLanguages = rawAnswers.primaryLanguage
      ? [rawAnswers.primaryLanguage]
      : (targetDomain === 'AI/ML' ? ['Python'] : (targetDomain === 'Cloud/DevOps' ? ['Bash', 'Python', 'Go'] : ['JavaScript', 'Python']));

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
        domainProjects: domainProjects || 'None',
        domainProjectsDescription: rawAnswers.domainProjects_other || rawAnswers.practicalProjects_other || '',
        reportedSkills,
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
