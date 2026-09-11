const PreparationTopic = require('../models/PreparationTopic');
const IndustryTopic = require('../models/IndustryTopic');
const Opportunity = require('../models/Opportunity');
const opportunityService = require('./opportunityService');

const initialPreparationTopics = [
  // DSA
  {
    title: 'Arrays & Two Pointers',
    slug: 'arrays-and-two-pointers',
    category: 'DSA',
    domainRelevance: ['Fullstack', 'Backend', 'Frontend', 'AI/ML', 'Cloud/DevOps', 'All'],
    difficulty: 'Beginner',
    allocatedEffortUnits: 3,
    order: 1,
    prerequisites: [],
    summary: 'Master array traversal, in-place manipulation, two pointers (converging and fast-slow), and two-sum patterns.',
    keyConcepts: [
      {
        title: 'Two Pointers Technique',
        description: 'Using left and right indices to reduce O(N^2) brute force to O(N) linear time on sorted arrays.'
      },
      {
        title: 'Fast & Slow Pointers',
        description: 'Floyd\'s Cycle detection and in-place duplicate removal.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Two Sum II - Input Array Is Sorted',
        difficulty: 'Medium',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
        description: 'Find two numbers such that they add up to a specific target number.'
      },
      {
        title: 'Container With Most Water',
        difficulty: 'Medium',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/container-with-most-water/',
        description: 'Calculate max area by moving the shorter bar inward.'
      },
      {
        title: '3Sum',
        difficulty: 'Medium',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/3sum/',
        description: 'Find all unique triplets in the array which gives the sum of zero.'
      }
    ],
    actionableChecklist: [
      'Understand sorted vs unsorted pointer movement',
      'Solve 3 two-pointer problems on LeetCode',
      'Analyze time & space complexity tradeoffs'
    ]
  },
  {
    title: 'Sliding Window & Hash Maps',
    slug: 'sliding-window-and-hashmaps',
    category: 'DSA',
    domainRelevance: ['Fullstack', 'Backend', 'Frontend', 'AI/ML', 'Cloud/DevOps', 'All'],
    difficulty: 'Intermediate',
    allocatedEffortUnits: 3,
    order: 2,
    prerequisites: ['arrays-and-two-pointers'],
    summary: 'Fixed and variable sized sliding window patterns for contiguous subarrays and substrings.',
    keyConcepts: [
      {
        title: 'Variable Size Sliding Window',
        description: 'Expand right pointer until condition violates, then shrink left pointer.'
      },
      {
        title: 'Frequency Maps',
        description: 'Using hash maps to maintain frequency counts in constant time.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
        description: 'Find the length of the longest substring without repeating characters.'
      },
      {
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/minimum-window-substring/',
        description: 'Find the minimum window in s which will contain all the characters in t.'
      }
    ],
    actionableChecklist: [
      'Differentiate fixed vs dynamic window expansion',
      'Handle edge cases with empty strings or single elements'
    ]
  },
  {
    title: 'Trees, BST & Traversals',
    slug: 'trees-and-traversals',
    category: 'DSA',
    domainRelevance: ['Fullstack', 'Backend', 'Frontend', 'AI/ML', 'Cloud/DevOps', 'All'],
    difficulty: 'Intermediate',
    allocatedEffortUnits: 4,
    order: 3,
    prerequisites: ['arrays-and-two-pointers'],
    summary: 'Binary trees, Binary Search Trees (BST), BFS level-order traversal, and DFS recursion patterns.',
    keyConcepts: [
      {
        title: 'Recursive Tree DFS',
        description: 'Pre-order, In-order, Post-order traversals and bottom-up height/depth computations.'
      },
      {
        title: 'Queue-based BFS',
        description: 'Level order traversal with queue for shortest path on unweighted structures.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Binary Tree Level Order Traversal',
        difficulty: 'Medium',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
        description: 'Return level order traversal of tree node values.'
      },
      {
        title: 'Validate Binary Search Tree',
        difficulty: 'Medium',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/validate-binary-search-tree/',
        description: 'Validate strict BST property across all subtrees using min/max bounds.'
      }
    ],
    actionableChecklist: [
      'Implement in-order, pre-order, and level-order traversals',
      'Solve LCA (Lowest Common Ancestor)'
    ]
  },
  {
    title: 'Graph Algorithms (BFS/DFS & Shortest Path)',
    slug: 'graph-algorithms',
    category: 'DSA',
    domainRelevance: ['Fullstack', 'Backend', 'AI/ML', 'All'],
    difficulty: 'Advanced',
    allocatedEffortUnits: 4,
    order: 4,
    prerequisites: ['trees-and-traversals'],
    summary: 'Adjacency lists, cycle detection, topological sort, and Dijkstra algorithm for weighted graphs.',
    keyConcepts: [
      {
        title: 'Topological Sort (Kahn\'s Algorithm)',
        description: 'In-degree queue tracking for DAG task scheduling.'
      },
      {
        title: 'Shortest Path with Priority Queue',
        description: 'Dijkstra greedy expansion for non-negative edge graphs.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Course Schedule II',
        difficulty: 'Medium',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/course-schedule-ii/',
        description: 'Return the ordering of courses you should take to finish all courses.'
      },
      {
        title: 'Number of Connected Components',
        difficulty: 'Medium',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/number-of-islands/',
        description: 'Count isolated components in an undirected matrix/graph.'
      }
    ],
    actionableChecklist: [
      'Convert 2D grids to graph adjacency',
      'Implement cycle detection using visited array'
    ]
  },

  // Frontend Development
  {
    title: 'Modern React, Component Architecture & State Systems',
    slug: 'modern-react-and-state-architecture',
    category: 'Development',
    domainRelevance: ['Frontend', 'Fullstack'],
    difficulty: 'Beginner',
    allocatedEffortUnits: 3,
    order: 5,
    prerequisites: [],
    summary: 'Component composition, hook lifecycles (useEffect, useMemo, useCallback), context state management, and unidirectional data flow.',
    keyConcepts: [
      {
        title: 'Component Lifecycle & Hook Invariants',
        description: 'Predictable state updates, dependency arrays, and avoiding unnecessary re-renders with memoization.'
      },
      {
        title: 'Custom Hooks & State Lifting',
        description: 'Encapsulating reusable business and network logic into custom hooks.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Build Search Filter with Debounced State',
        difficulty: 'Medium',
        platform: 'React Lab',
        url: 'https://react.dev/learn/managing-state',
        description: 'Implement a real-time search component with debounced queries and optimistic UI updates.'
      },
      {
        title: 'Design Infinite Scroll List with Virtualization',
        difficulty: 'Hard',
        platform: 'TanStack Lab',
        url: 'https://tanstack.com/virtual/latest',
        description: 'Render 10,000 items smoothly without degrading frame rate or DOM node count.'
      }
    ],
    actionableChecklist: [
      'Master hook dependency arrays to avoid memory leaks',
      'Implement state lifting between sibling components',
      'Profile React component renders with React DevTools'
    ]
  },
  {
    title: 'Web Performance, DOM Mechanics & Responsive UI Architecture',
    slug: 'web-performance-and-dom-mechanics',
    category: 'Development',
    domainRelevance: ['Frontend', 'Fullstack'],
    difficulty: 'Intermediate',
    allocatedEffortUnits: 3,
    order: 6,
    prerequisites: ['modern-react-and-state-architecture'],
    summary: 'Critical rendering path, Core Web Vitals (LCP, INP, CLS), modern CSS layout algorithms (Flexbox/Grid), and virtual DOM reconciliation.',
    keyConcepts: [
      {
        title: 'Critical Rendering Path',
        description: 'HTML parsing, CSSOM construction, render tree calculation, layout reflow, and pixel painting.'
      },
      {
        title: 'Core Web Vitals Optimization',
        description: 'Eliminating layout shifts, deferring non-critical scripts, and optimizing image assets.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Audit and Eliminate Unused CSS/JS Bundles',
        difficulty: 'Medium',
        platform: 'Web.dev Lab',
        url: 'https://web.dev/articles/reduce-javascript-payloads-with-code-splitting',
        description: 'Achieve a 90+ Lighthouse score by tree-shaking and dynamic import code-splitting.'
      }
    ],
    actionableChecklist: [
      'Measure LCP and INP using performance APIs',
      'Apply CSS content-visibility for offscreen elements',
      'Implement responsive breakpoints without layout shifts'
    ]
  },

  // Backend Development
  {
    title: 'Production REST API Architecture & Express.js',
    slug: 'production-rest-api-architecture',
    category: 'Development',
    domainRelevance: ['Backend', 'Fullstack'],
    difficulty: 'Intermediate',
    allocatedEffortUnits: 3,
    order: 7,
    prerequisites: [],
    summary: 'Building maintainable Express APIs with Controller-Service patterns, middleware, JWT auth, and centralized error handling.',
    keyConcepts: [
      {
        title: 'Layered Architecture',
        description: 'Separation of HTTP routes, business services, and database ODM queries.'
      },
      {
        title: 'Rate Limiting & Security Headers',
        description: 'Using Helmet, CORS, and Express rate limiters to protect endpoints.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Build Authenticated CRUD Micro-service',
        difficulty: 'Medium',
        platform: 'Node Best Practices',
        url: 'https://github.com/goldbergyoni/nodebestpractices',
        description: 'Create an Express REST API with JWT verification middleware and Mongoose models.'
      }
    ],
    actionableChecklist: [
      'Write clean centralized error middleware',
      'Implement JWT Bearer token authentication flow',
      'Validate request bodies with Joi or custom middleware'
    ]
  },
  {
    title: 'Microservices & Event-Driven Message Brokers',
    slug: 'microservices-and-event-brokers',
    category: 'Development',
    domainRelevance: ['Backend'],
    difficulty: 'Advanced',
    allocatedEffortUnits: 4,
    order: 8,
    prerequisites: ['production-rest-api-architecture'],
    summary: 'Asynchronous event decoupling, pub/sub topologies, Kafka/RabbitMQ consumer groups, idempotency, and saga distributed transactions.',
    keyConcepts: [
      {
        title: 'Pub/Sub Decoupling',
        description: 'Producers publish events without knowledge of downstream consumers or latency.'
      },
      {
        title: 'Idempotent Consumer Pattern',
        description: 'Ensuring duplicate messages cause zero side effects using unique request idempotency keys.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Design Async Order Processing Queue',
        difficulty: 'Hard',
        platform: 'Confluent Event Lab',
        url: 'https://github.com/confluentinc/examples',
        description: 'Design a resilient payment and order fulfillment service decoupled via message queue.'
      }
    ],
    actionableChecklist: [
      'Design event schemas with backwards compatibility',
      'Handle poison pill dead letter queues (DLQ)'
    ]
  },

  // AI & Machine Learning Development
  {
    title: 'Applied Machine Learning Pipelines & PyTorch/Scikit-Learn',
    slug: 'applied-ml-pipelines-pytorch',
    category: 'Development',
    domainRelevance: ['AI/ML'],
    difficulty: 'Intermediate',
    allocatedEffortUnits: 4,
    order: 9,
    prerequisites: [],
    summary: 'Feature engineering, data normalization, model evaluation metrics (Precision/Recall/F1, ROC-AUC), and PyTorch tensor architectures.',
    keyConcepts: [
      {
        title: 'Data Leakage Prevention & K-Fold Cross Validation',
        description: 'Ensuring test sets remain strictly unseen during feature preprocessing.'
      },
      {
        title: 'Gradient Descent & Backpropagation',
        description: 'Loss function optimization, learning rate schedules, and vanishing gradients.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Build End-to-End Classification Pipeline',
        difficulty: 'Medium',
        platform: 'Scikit-Learn Lab',
        url: 'https://scikit-learn.org/stable/modules/compose.html',
        description: 'Train a tabular classifier with Scikit-learn Pipeline and hyperparameter grid search.'
      }
    ],
    actionableChecklist: [
      'Evaluate confusion matrix and ROC curves',
      'Standardize features using fit_transform vs transform correctly'
    ]
  },
  {
    title: 'LLM Application Engineering, Vector DBs & RAG Architecture',
    slug: 'llm-engineering-vector-databases',
    category: 'Development',
    domainRelevance: ['AI/ML'],
    difficulty: 'Advanced',
    allocatedEffortUnits: 4,
    order: 10,
    prerequisites: ['applied-ml-pipelines-pytorch'],
    summary: 'Retrieval-Augmented Generation (RAG), vector embeddings, semantic search, prompt orchestration, and agent tool execution.',
    keyConcepts: [
      {
        title: 'Vector Embeddings & Cosine Similarity',
        description: 'Dense vector representations and Approximate Nearest Neighbor (ANN) index lookups.'
      },
      {
        title: 'Context Window Management & Chunking',
        description: 'Optimizing token limits, recursive text splitters, and semantic retrieval relevance.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Build RAG Document Search Assistant',
        difficulty: 'Hard',
        platform: 'LangChain AI Lab',
        url: 'https://github.com/langchain-ai/rag-from-scratch',
        description: 'Ingest PDF documents into vector store and generate grounded citations with LLM.'
      }
    ],
    actionableChecklist: [
      'Implement chunking with overlap',
      'Prevent prompt injection and validate structured outputs'
    ]
  },

  // Cloud & DevOps Development
  {
    title: 'Containerization with Docker & Container Orchestration',
    slug: 'containerization-docker-orchestration',
    category: 'Development',
    domainRelevance: ['Cloud/DevOps'],
    difficulty: 'Intermediate',
    allocatedEffortUnits: 3,
    order: 11,
    prerequisites: [],
    summary: 'Multi-stage Docker builds, layer caching, container networking, volume persistence, and docker-compose service definition.',
    keyConcepts: [
      {
        title: 'Immutable Image Layers',
        description: 'Ordering Dockerfile instructions to leverage build cache and minimize final container footprint.'
      },
      {
        title: 'Container Networking & DNS',
        description: 'Bridge networks, port mapping, and inter-service container resolution.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Containerize Multi-tier Application with Docker Compose',
        difficulty: 'Medium',
        platform: 'Docker Lab',
        url: 'https://docs.docker.com/compose/gettingstarted/',
        description: 'Compose frontend, Express API, and Postgres with healthchecks and persistent volumes.'
      }
    ],
    actionableChecklist: [
      'Build non-root unprivileged container images',
      'Optimize image size using multi-stage builds'
    ]
  },
  {
    title: 'CI/CD Automation Pipelines & Cloud Infrastructure',
    slug: 'cicd-pipelines-cloud-infrastructure',
    category: 'Development',
    domainRelevance: ['Cloud/DevOps'],
    difficulty: 'Advanced',
    allocatedEffortUnits: 4,
    order: 12,
    prerequisites: ['containerization-docker-orchestration'],
    summary: 'Automated GitHub Actions workflows, linting/test gates, artifact registries, Terraform infrastructure as code, and zero-downtime deployments.',
    keyConcepts: [
      {
        title: 'Continuous Delivery Invariants',
        description: 'Automated build, test verification, security scanning, and staged rolling deployment.'
      },
      {
        title: 'Infrastructure as Code (IaC)',
        description: 'Declarative resource provisioning, state locking, and drift detection.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Build Automated CI/CD Pipeline with Deployment Gate',
        difficulty: 'Hard',
        platform: 'GitHub Actions Lab',
        url: 'https://docs.github.com/en/actions/quickstart',
        description: 'Set up GitHub Actions to run unit tests, build Docker image, and deploy to staging.'
      }
    ],
    actionableChecklist: [
      'Implement environment secret management',
      'Configure rolling deployment with automated rollback on failure'
    ]
  },

  // DBMS
  {
    title: 'Database Indexing & Query Optimization (SQL vs NoSQL)',
    slug: 'database-indexing-optimization',
    category: 'DBMS',
    domainRelevance: ['Fullstack', 'Backend', 'AI/ML', 'Cloud/DevOps'],
    difficulty: 'Intermediate',
    allocatedEffortUnits: 3,
    order: 13,
    prerequisites: [],
    summary: 'B-Tree indexes, compound indexes, execution plans (EXPLAIN), normalization vs denormalization tradeoffs.',
    keyConcepts: [
      {
        title: 'B-Tree & Hash Indexes',
        description: 'How database engines find rows in O(log N) rather than full table scans.'
      },
      {
        title: 'ACID Properties & Transactions',
        description: 'Atomicity, Consistency, Isolation, Durability across distributed data engines.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Optimize Slow Aggregation Query',
        difficulty: 'Medium',
        platform: 'SQL Index Lab',
        url: 'https://use-the-index-luke.com/sql/explain-plan',
        description: 'Analyze an EXPLAIN output and add compound index to eliminate COLLSCAN.'
      }
    ],
    actionableChecklist: [
      'Analyze query execution plans',
      'Design compound indexes considering prefix order'
    ]
  },

  // System Design
  {
    title: 'Distributed Caching & High Availability (Redis)',
    slug: 'distributed-caching-redis',
    category: 'SystemDesign',
    domainRelevance: ['Fullstack', 'Backend', 'Cloud/DevOps'],
    difficulty: 'Advanced',
    allocatedEffortUnits: 3,
    order: 14,
    prerequisites: ['production-rest-api-architecture'],
    summary: 'Cache-Aside, Write-Through patterns, Cache Stampede prevention, Redis cluster replication and invalidation strategies.',
    keyConcepts: [
      {
        title: 'Cache-Aside (Lazy Loading)',
        description: 'Application checks cache first; upon cache miss, queries DB and populates cache with TTL.'
      },
      {
        title: 'Cache Stampede & Eviction Policies',
        description: 'LRU/LFU memory policies and mutex locks for high concurrency.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Design Scalable URL Shortener with Redis Cache',
        difficulty: 'Medium',
        platform: 'System Design Primer',
        url: 'https://github.com/donnemartin/system-design-primer#design-pastebin',
        description: 'Design TinyURL handling 100M daily clicks with 99.9% read-through cache hit rate.'
      }
    ],
    actionableChecklist: [
      'Draw cache-aside architecture diagram',
      'Explain cache invalidation tradeoffs in interviews'
    ]
  },

  // Operating Systems
  {
    title: 'Concurrency, Threads & Process Synchronization',
    slug: 'concurrency-and-synchronization',
    category: 'OS',
    domainRelevance: ['Fullstack', 'Backend', 'Cloud/DevOps', 'All'],
    difficulty: 'Intermediate',
    allocatedEffortUnits: 2,
    order: 15,
    prerequisites: [],
    summary: 'Processes vs Threads, Mutexes, Semaphores, Deadlock conditions, and Race conditions.',
    keyConcepts: [
      {
        title: 'Coffman Deadlock Conditions',
        description: 'Mutual exclusion, Hold and wait, No preemption, Circular wait.'
      },
      {
        title: 'Event Loop vs Multi-Threading',
        description: 'Non-blocking I/O in Node.js vs worker threads in Java/C++.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Print in Order (Concurrency Problem)',
        difficulty: 'Medium',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problems/print-in-order/',
        description: 'Implement thread synchronization using mutexes/semaphores.'
      }
    ],
    actionableChecklist: [
      'Explain Event Loop microtasks vs macrotasks',
      'Identify race conditions in concurrent data access'
    ]
  },

  // OOP / Clean Architecture
  {
    title: 'Object-Oriented Design & Clean Architecture Patterns',
    slug: 'oop-design-patterns-clean-architecture',
    category: 'OOP',
    domainRelevance: ['Fullstack', 'Backend', 'Frontend', 'AI/ML', 'All'],
    difficulty: 'Intermediate',
    allocatedEffortUnits: 3,
    order: 16,
    prerequisites: [],
    summary: 'SOLID principles, Factory, Strategy, Observer design patterns, and Dependency Inversion in modern software engineering.',
    keyConcepts: [
      {
        title: 'Dependency Inversion Principle (DIP)',
        description: 'High-level modules should not depend on low-level modules; both should depend on abstractions.'
      },
      {
        title: 'Strategy & Observer Patterns',
        description: 'Runtime algorithm selection and decoupled event listeners.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Design Parking Lot System (OOP)',
        difficulty: 'Medium',
        platform: 'Refactoring Guru',
        url: 'https://refactoring.guru/design-patterns/catalog',
        description: 'Design extensible classes, interfaces, and spot allocation strategy.'
      }
    ],
    actionableChecklist: [
      'Refactor tightly coupled code to use dependency injection',
      'Apply Single Responsibility Principle across modules'
    ]
  },

  // Projects
  {
    title: 'Production Fullstack Capstone & System Integration',
    slug: 'fullstack-capstone-project',
    category: 'Projects',
    domainRelevance: ['Fullstack', 'Backend'],
    difficulty: 'Advanced',
    allocatedEffortUnits: 5,
    order: 17,
    prerequisites: ['production-rest-api-architecture'],
    summary: 'Building an end-to-end distributed web application with OAuth, real-time WebSockets, cloud database, and CI/CD deployment.',
    keyConcepts: [
      {
        title: 'End-to-End System Reliability',
        description: 'Zero-downtime deployment, graceful error boundaries, and observable health monitoring.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Deploy Production Web App with Custom Domain & SSL',
        difficulty: 'Hard',
        platform: 'Fullstack Project Showcase',
        url: 'https://github.com/topics/fullstack-project',
        description: 'Ship a fullstack application with automated tests and monitoring.'
      }
    ],
    actionableChecklist: [
      'Set up production environment variables',
      'Implement responsive UI with smooth UX',
      'Add end-to-end authentication and API verification'
    ]
  },
  {
    title: 'Frontend Production Capstone: High-Performance Web App',
    slug: 'frontend-production-capstone',
    category: 'Projects',
    domainRelevance: ['Frontend'],
    difficulty: 'Advanced',
    allocatedEffortUnits: 4,
    order: 18,
    prerequisites: ['web-performance-and-dom-mechanics'],
    summary: 'Building a rich, accessible, highly responsive frontend product with client-side routing, offline caching, and responsive design.',
    keyConcepts: [
      {
        title: 'Accessible & Responsive Architecture',
        description: 'WCAG compliance, ARIA attributes, keyboard navigation, and zero-shift layout.'
      }
    ],
    practiceQuestions: [
      {
        title: 'Ship High-Performance Interactive Analytics Dashboard',
        difficulty: 'Hard',
        platform: 'React Capstone Showcase',
        url: 'https://github.com/topics/react-dashboard',
        description: 'Create a client-side analytics UI with interactive SVG charts and theme toggling.'
      }
    ],
    actionableChecklist: [
      'Implement keyboard navigation and ARIA landmarks',
      'Optimize client asset bundles with dynamic imports'
    ]
  }
];

const initialIndustryTopics = [
  {
    title: 'Why Kafka is Used for High-Throughput Event Streaming',
    slug: 'kafka-event-streaming',
    date: '2026-08-27', // Today
    category: 'Backend',
    headline: 'Event-driven architectures at massive scale with persistent commit logs',
    summary: 'Apache Kafka decouples producers and consumers using partitioned, distributed append-only logs that achieve millions of messages per second with disk persistence.',
    deepDiveContent: `Traditional message queues (like RabbitMQ) delete messages once acknowledged. Apache Kafka operates on a radically different premise: it treats messages as an immutable, append-only distributed commit log stored on disk with OS page cache optimizations.\n\nKey Architectural Concepts:\n1. **Topics & Partitions**: A topic is split into partitions distributed across cluster brokers. Partitions enable horizontal scale because consumers read distinct partitions concurrently.\n2. **Consumer Groups & Offsets**: Consumers track their own read position (offset). This allows replayability (e.g. reprocessing events after a bug fix).\n3. **Sequential I/O**: Kafka writes sequentially to disk, which modern NVMe and OS page caches execute at memory-like speeds without random seek overhead.\n4. **Zero-Copy Transfer**: Uses Linux \`sendfile()\` syscall to pipe data directly from OS page cache to network socket without copying into application memory space.`,
    whyItMattersInIndustry: 'Companies like Uber, LinkedIn, Netflix, and Swiggy use Kafka to process driver telematics, payment events, fraud detection, and real-time activity feeds reliably.',
    realWorldUseCases: [
      { company: 'Uber', useCase: 'Streaming GPS locations from millions of active drivers to compute dynamic surge pricing and ETA calculations in real time.' },
      { company: 'Netflix', useCase: 'Collecting video playback quality metrics from billions of streaming devices to detect CDN degradation automatically.' }
    ],
    keyTakeaways: [
      'Kafka stores messages as an append-only log with configurable retention rather than deleting upon consumption.',
      'Partitions are the fundamental unit of parallelism in Kafka.',
      'Sequential disk I/O and zero-copy data transfer provide immense throughput.',
      'Consumer groups maintain independent offsets, making event replay simple.'
    ],
    furtherReadingLinks: [
      { title: 'The Log: What every software engineer should know about real-time data\'s unifying abstraction', url: 'https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying' }
    ]
  },
  {
    title: 'Redis Internal Memory Architecture & Caching Invalidation',
    slug: 'redis-memory-and-caching',
    date: '2026-08-26', // Yesterday
    category: 'Databases',
    headline: 'Single-threaded event loops, in-memory data structures, and cache invalidation strategies',
    summary: 'Redis achieves microsecond latency through in-memory storage, non-blocking I/O multiplexing, and rich native data structures like Hashes, Sets, and Sorted Sets.',
    deepDiveContent: `Redis (Remote Dictionary Server) runs in-memory with optional asynchronous background persistence (RDB snapshots + AOF append-only files). Because all operations reside in RAM, memory lookups take sub-millisecond time.\n\nCaching Patterns:\n- **Cache-Aside (Lazy Loading)**: Read DB on miss, write back to cache with TTL. High resiliency, but initial read has latency.\n- **Write-Through / Write-Behind**: Application writes directly to cache; cache writes synchronously or asynchronously to DB.\n- **Cache Stampede Prevention**: When a hot key expires, thousands of concurrent requests might hit the primary database at once. Solution: probabilistic early expiration (XFetch algorithm) or distributed mutex lock around cache repopulation.`,
    whyItMattersInIndustry: 'Critical for session storage, leaderboard rankings (ZSET), rate limiters, and fast primary database caching in all modern scalable web apps.',
    realWorldUseCases: [
      { company: 'Twitter / X', useCase: 'Caching user timeline IDs in Redis lists to deliver sub-50ms home feeds.' },
      { company: 'GitHub', useCase: 'Storing authenticated session tokens and rate limit quotas.' }
    ],
    keyTakeaways: [
      'Single-threaded execution avoids mutex lock contention while multiplexing socket I/O.',
      'Always set TTLs (Time-To-Live) on cached data to prevent memory leaks.',
      'Use Sorted Sets (ZSET) for efficient real-time ranking and sliding window rate limiters.'
    ],
    furtherReadingLinks: [
      { title: 'Redis Documentation - Caching Strategies', url: 'https://redis.io/docs/manual/client-side-caching/' }
    ]
  },
  {
    title: 'WebSockets vs HTTP/2 Server-Sent Events (SSE) for Real-Time',
    slug: 'websockets-vs-sse',
    date: '2026-08-25',
    category: 'Backend',
    headline: 'Comparing full-duplex TCP streams vs lightweight unidirectional streaming',
    summary: 'Understanding when bidirectional WebSockets are necessary vs when lightweight HTTP/2 Server-Sent Events (SSE) offer simpler, more resilient unidirectional streams.',
    deepDiveContent: `When designing real-time features, choosing between WebSockets and SSE has major architectural implications:\n\n1. **WebSockets (ws:// / wss://)**:\n   - Full-duplex bidirectional communication over a single TCP connection.\n   - Upgrades from HTTP via \`Upgrade: websocket\` header.\n   - Best for: Multiplayer games, interactive collaborative whiteboards, chat apps where client and server frequently exchange messages.\n   - Challenges: Requires custom load balancing sticky sessions, custom reconnection logic, and doesn't natively leverage HTTP/2 multiplexing.\n\n2. **Server-Sent Events (SSE)**:\n   - Unidirectional (Server → Client) text streaming over standard HTTP with \`Content-Type: text/event-stream\`.\n   - Best for: AI LLM token streaming (ChatGPT style), live financial ticker prices, stock alerts, notification feeds.\n   - Advantages: Built-in automatic reconnection, HTTP/2 multiplexing support out of the box, standard corporate firewall friendliness.`,
    whyItMattersInIndustry: 'Modern AI interfaces (like OpenAI and Claude) use SSE for token streaming because of simple HTTP semantics and native browser EventSource support.',
    realWorldUseCases: [
      { company: 'OpenAI', useCase: 'Streaming LLM completion tokens via Server-Sent Events to render responses instantaneously.' },
      { company: 'Figma', useCase: 'Using WebSockets for full-duplex collaborative multiplayer canvas cursor synchronization.' }
    ],
    keyTakeaways: [
      'Use SSE when data flows primarily from server to client (e.g. LLM streaming, notifications).',
      'Use WebSockets when low-latency bidirectional messaging is strictly required.',
      'SSE works over standard HTTP/2 and handles auto-reconnect seamlessly.'
    ],
    furtherReadingLinks: [
      { title: 'MDN WebSockets API Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' }
    ]
  },
  {
    title: 'Docker Container Isolation: Namespaces & Cgroups Under the Hood',
    slug: 'docker-namespaces-cgroups',
    date: '2026-08-24',
    category: 'DevOps',
    headline: 'How the Linux Kernel creates container isolation without virtualization overhead',
    summary: 'Containers are not lightweight Virtual Machines; they are regular Linux processes isolated using kernel Namespaces (visibility) and Cgroups (resource limits).',
    deepDiveContent: `A virtual machine runs a complete guest operating system with a Hypervisor emulating hardware. In contrast, a Docker container runs directly on the host Linux kernel.\n\nTwo core Linux kernel mechanisms power containers:\n1. **Namespaces (What you can see)**:\n   - \`pid\` namespace: Isolates process IDs (process inside container sees itself as PID 1).\n   - \`net\` namespace: Isolates network interfaces and IP routing tables.\n   - \`mnt\` namespace: Isolates filesystem mount points.\n   - \`ipc\`, \`uts\`, \`user\` namespaces: Isolate inter-process communication, hostnames, and user mappings.\n2. **Control Groups / Cgroups (What you can use)**:\n   - Enforces strict CPU, memory, disk I/O, and network bandwidth quotas so a runaway container cannot crash the host.`,
    whyItMattersInIndustry: 'Understanding namespaces and cgroups helps engineers debug container memory limits (OOM killed errors), security vulnerabilities, and Kubernetes pod scheduling.',
    realWorldUseCases: [
      { company: 'Google', useCase: 'Borg (predecessor to Kubernetes) running billions of isolated containers weekly across global data centers.' }
    ],
    keyTakeaways: [
      'Containers share the host OS kernel and have near-zero CPU/memory virtualization overhead.',
      'Namespaces provide process and network isolation; Cgroups enforce resource limits.',
      'OOM (Out Of Memory) kills occur when a process exceeds its cgroup memory limit.'
    ],
    furtherReadingLinks: [
      { title: 'Linux Containers Internals', url: 'https://man7.org/linux/man-pages/man7/namespaces.7.html' }
    ]
  },
  {
    title: 'OAuth 2.0 & PKCE Security Flow for Single-Page Applications',
    slug: 'oauth-pkce-flow',
    date: '2026-08-23',
    category: 'Security',
    headline: 'Securing public client authentication without exposing client secrets',
    summary: 'Proof Key for Code Exchange (PKCE) eliminates authorization code interception attacks in React, mobile, and desktop applications.',
    deepDiveContent: `In traditional OAuth 2.0 Authorization Code flow, the server backend securely holds a \`client_secret\` to exchange the authorization code for an access token. However, Single Page Applications (React, Vue) and mobile apps cannot safely keep a secret because JavaScript code runs entirely in the user's browser.\n\nPKCE (RFC 7636) solves this with dynamic cryptographic verification:\n1. Client generates a random secret: \`code_verifier\`.\n2. Client hashes it using SHA-256: \`code_challenge = SHA256(code_verifier)\`.\n3. Client sends user to Google/Auth Provider with \`code_challenge\` and \`code_challenge_method=S256\`.\n4. After login, Google redirects with an \`authorization_code\`.\n5. Client sends the \`authorization_code\` AND the original \`code_verifier\` to the token endpoint.\n6. The Auth server hashes the \`code_verifier\` and verifies it matches the initial \`code_challenge\`.`,
    whyItMattersInIndustry: 'PKCE is the gold standard modern security recommendation for all Google OAuth, GitHub OAuth, and Okta/Auth0 client logins.',
    realWorldUseCases: [
      { company: 'Google Identity', useCase: 'Mandating PKCE for all modern web and mobile OAuth 2.0 integrations to block interception attacks.' }
    ],
    keyTakeaways: [
      'Never embed client secrets in frontend React/mobile applications.',
      'PKCE dynamically binds authorization requests to token exchanges using SHA-256 verifiers.',
      'Modern security specifications mandate PKCE for both public and confidential clients.'
    ],
    furtherReadingLinks: [
      { title: 'RFC 7636 - Proof Key for Code Exchange', url: 'https://datatracker.ietf.org/doc/html/rfc7636' }
    ]
  }
];

const currentYear = new Date().getFullYear();

const initialOpportunities = [
  {
    source: 'Greenhouse',
    sourceId: `gh-cred-swe-intern-${currentYear + 1}`,
    title: `Software Engineer Intern (Summer ${currentYear + 1} / Winter ${currentYear + 1})`,
    company: 'CRED',
    companyLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=CRED',
    location: 'Bengaluru, India',
    type: 'Internship',
    workplaceType: 'Hybrid',
    domain: 'Fullstack',
    targetGraduationYears: [currentYear + 1, currentYear + 2],
    description: 'Join CRED\'s high-scale backend & payments platform team. Build low-latency microservices handling millions of financial transactions daily with 99.999% uptime.',
    responsibilities: [
      'Design clean REST and gRPC endpoints in Go or Node.js / Java',
      'Optimize database queries and implement distributed caching with Redis',
      'Collaborate with product designers and senior staff engineers on user-facing features'
    ],
    requiredSkills: ['Data Structures', 'Node.js', 'Algorithms', 'SQL'],
    preferredSkills: ['Redis', 'Docker', 'System Design', 'React'],
    applyUrl: 'https://boards.greenhouse.io/cred/jobs/4829103',
    salaryRange: '₹60,000 - ₹1,00,000 / month stipend',
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    postedDate: new Date()
  },
  {
    source: 'Lever',
    sourceId: `lev-razorpay-backend-${currentYear + 1}`,
    title: 'Backend Engineering Intern',
    company: 'Razorpay',
    companyLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Razorpay',
    location: 'Bengaluru, India / Remote',
    type: 'Internship',
    workplaceType: 'Remote',
    domain: 'Backend',
    targetGraduationYears: [currentYear + 1, currentYear + 2, currentYear + 3],
    description: 'Work on India\'s payment gateway infrastructure. You will work on payment routing algorithms, settlement engines, and high-concurrency API gateways.',
    responsibilities: [
      'Write robust, unit-tested backend code',
      'Participate in design reviews and system scalability discussions',
      'Monitor API latencies and investigate performance bottlenecks'
    ],
    requiredSkills: ['Backend Development', 'Databases', 'Problem Solving', 'JavaScript'],
    preferredSkills: ['Kafka', 'Microservices', 'PostgreSQL', 'Express.js'],
    applyUrl: 'https://jobs.lever.co/razorpay/9384729',
    salaryRange: '₹50,000 - ₹85,000 / month stipend',
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    postedDate: new Date()
  },
  {
    source: 'Ashby',
    sourceId: `ash-postman-fullstack-${currentYear + 1}`,
    title: 'Early Career Full Stack Software Engineer',
    company: 'Postman',
    companyLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Postman',
    location: 'Bengaluru / Hyderabad',
    type: 'EarlyCareer',
    workplaceType: 'Hybrid',
    domain: 'Fullstack',
    targetGraduationYears: [currentYear, currentYear + 1],
    description: 'Help build the world\'s leading API platform used by 30+ million developers. Build frontend UI experiences and resilient cloud microservices.',
    responsibilities: [
      'Develop modern React UI workflows with state-of-the-art UX',
      'Build scalable backend services for API schema generation and mock servers',
      'Ensure high code quality with automated unit and integration tests'
    ],
    requiredSkills: ['React', 'Node.js', 'JavaScript', 'REST APIs'],
    preferredSkills: ['TypeScript', 'Cloud Architecture', 'Testing'],
    applyUrl: 'https://jobs.ashbyhq.com/postman/6129841',
    salaryRange: '₹18,00,000 - ₹26,00,000 / year',
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    postedDate: new Date()
  },
  {
    source: 'StructuredExternal',
    sourceId: `ext-swiggy-ai-intern-${currentYear + 1}`,
    title: 'AI / Machine Learning Engineering Intern',
    company: 'Swiggy',
    companyLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Swiggy',
    location: 'Bengaluru, India',
    type: 'Internship',
    workplaceType: 'Onsite',
    domain: 'AI/ML',
    targetGraduationYears: [currentYear + 1, currentYear + 2],
    description: 'Work with the Swiggy AI Research team on real-time delivery time prediction, recommendation algorithms, and conversational search agents.',
    responsibilities: [
      'Train and evaluate ML models on large-scale logistics datasets',
      'Deploy inference models with low latency SLAs',
      'Analyze A/B experiment metrics'
    ],
    requiredSkills: ['Python', 'Data Structures', 'Machine Learning', 'SQL'],
    preferredSkills: ['PyTorch', 'FastAPI', 'Pandas', 'Docker'],
    applyUrl: 'https://careers.swiggy.com/jobs/102948',
    salaryRange: '₹65,000 / month stipend',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    postedDate: new Date()
  },
  {
    source: 'Greenhouse',
    sourceId: `gh-uber-cloud-${currentYear + 1}`,
    title: 'Cloud & Infrastructure Engineer Intern',
    company: 'Uber',
    companyLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=Uber',
    location: 'Hyderabad / Bengaluru',
    type: 'Internship',
    workplaceType: 'Hybrid',
    domain: 'Cloud/DevOps',
    targetGraduationYears: [currentYear + 1, currentYear + 2],
    description: 'Scale Uber\'s global infrastructure. Build tooling for Kubernetes cluster orchestration, service mesh routing, and automated reliability testing.',
    responsibilities: [
      'Automate cloud infrastructure provisioning',
      'Build observability dashboards and alert pipelines',
      'Work on containerized deployment workflows'
    ],
    requiredSkills: ['Linux', 'Networking', 'Python / Go', 'Algorithms'],
    preferredSkills: ['Kubernetes', 'Docker', 'Terraform', 'Kafka'],
    applyUrl: 'https://boards.greenhouse.io/uber/jobs/5910243',
    salaryRange: '₹1,20,000 / month stipend',
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    postedDate: new Date()
  }
];

const seedDatabase = async () => {
  try {
    // 1. Seed & Sync Preparation Topics
    for (const topic of initialPreparationTopics) {
      await PreparationTopic.findOneAndUpdate(
        { slug: topic.slug },
        { $set: topic },
        { upsert: true }
      );
    }
    console.log(`✅ Synced ${initialPreparationTopics.length} Preparation Topics.`);

    // 2. Seed Industry Topics for Historical Calendar
    const industryCount = await IndustryTopic.countDocuments();
    if (industryCount === 0) {
      console.log('🌱 Seeding Industry Topics for calendar history...');
      for (const item of initialIndustryTopics) {
        await IndustryTopic.findOneAndUpdate(
          { slug: item.slug },
          { $set: item },
          { upsert: true }
        );
      }
      console.log(`✅ Seeded ${initialIndustryTopics.length} Industry Topics.`);
    }

    // 3. Seed Structured Opportunities
    const oppCount = await Opportunity.countDocuments();
    if (oppCount === 0) {
      console.log('🌱 Seeding verified Opportunities pipeline...');
      for (const opp of initialOpportunities) {
        await opportunityService.ingestOpportunity({ ...opp, notify: false });
      }
      console.log(`✅ Seeded ${initialOpportunities.length} Opportunities.`);
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};

module.exports = {
  seedDatabase
};
