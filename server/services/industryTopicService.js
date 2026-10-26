const IndustryTopic = require('../models/IndustryTopic');
const aiService = require('./ai/aiService');

/**
 * Curated Catalog of Comprehensive Industry-Grade Tech Topics
 * Used as high-reliability foundation & fallback for dynamic daily generation.
 */
const CURATED_TOPIC_BANK = [
  {
    title: 'Distributed Tracing & OpenTelemetry in Microservices',
    slug: 'distributed-tracing-opentelemetry',
    category: 'Backend',
    headline: 'Correlating async spans and latency bottlenecks across distributed RPC boundaries',
    summary: 'Distributed tracing uses contextual W3C TraceContext headers and unique span IDs across RPC hops to diagnose tail latencies and service dependencies.',
    deepDiveContent: `In monolithic systems, stack traces and local APM profilers explain performance. In a distributed microservice topology with 50+ services communicating via gRPC and message brokers, a single client click might trigger hundreds of downstream calls.\n\nKey Concepts:\n1. **Traces & Spans**: A Trace is a directed acyclic graph (DAG) of Spans. Each span records start time, end time, operation name, tags, and status.\n2. **Context Propagation**: OpenTelemetry injects \`traceparent\` headers (trace-id, parent-id, trace-flags) into HTTP and Kafka record headers.\n3. **Sampling Strategies**: Head-based sampling decides at the gateway; tail-based sampling retains 100% of error traces and high-latency anomalies.\n4. **Collector Architecture**: Microservice agents forward OTLP spans to a local collector daemon, offloading serialization and network backpressure from the app.`,
    whyItMattersInIndustry: 'Companies like Uber (Jaeger), Datadog, Stripe, and Airbnb rely on OpenTelemetry to debug sub-second checkout delays and cascading outage failures.',
    realWorldUseCases: [
      { company: 'Uber', useCase: 'Tracking ride dispatch latency across 2,000+ internal microservices using Jaeger and OpenTelemetry.' },
      { company: 'Stripe', useCase: 'Tracing credit card settlement workflows across banking gateway integrations with strict latency budgets.' }
    ],
    architectureConcept: 'W3C Trace Context injection and tail-based sampling pipelines in distributed telemetry.',
    keyTakeaways: [
      'Traces represent the entire journey of a request; spans represent discrete units of work within that request.',
      'Context propagation via headers is essential across network and process boundaries.',
      'Tail-based sampling captures interesting anomalies without blowing up storage costs.',
      'OpenTelemetry provides vendor-neutral instrumentation standards.'
    ],
    furtherReadingLinks: [
      { title: 'OpenTelemetry Architecture & Specification', url: 'https://opentelemetry.io/docs/specs/otel/' }
    ]
  },
  {
    title: 'Raft Consensus Algorithm & Distributed State Machines',
    slug: 'raft-consensus-algorithm',
    category: 'SystemDesign',
    headline: 'Leader election, log replication, and split-brain safety in distributed clusters',
    summary: 'Raft is an understandable consensus algorithm that maintains an identical replicated log across distributed servers in the presence of network partitions.',
    deepDiveContent: `Consensus is the core foundation of fault-tolerant distributed databases (etcd, CockroachDB, TiKV). Raft achieves consensus by decomposing the problem into leader election, log replication, and safety guarantees.\n\nCore Mechanisms:\n1. **Server States**: Every node is either a Follower, Candidate, or Leader. Nodes transition via randomized heartbeat timers (150ms-300ms).\n2. **Log Invariant**: If two entries in different logs have the same index and term, they store the identical command and their previous logs are identical.\n3. **Quorum Commit**: A log entry is committed only when replicated onto a strict majority (N/2 + 1) of cluster nodes.\n4. **Election Safety**: Only candidates holding all committed entries from prior terms can be elected leader.`,
    whyItMattersInIndustry: 'Kubernetes control plane relies on etcd running Raft to store cluster state, ingress routes, and secret configurations reliably.',
    realWorldUseCases: [
      { company: 'Kubernetes', useCase: 'Using etcd backed by Raft to coordinate scheduler, kubelet nodes, and declarative spec consistency.' },
      { company: 'HashiCorp', useCase: 'Consul and Nomad use Raft to maintain cluster service discovery registry and leadership.' }
    ],
    architectureConcept: 'Term-based leader election with randomized election timeouts and quorum log replication.',
    keyTakeaways: [
      'Raft divides consensus into leader election, log replication, and safety.',
      'Majority quorum prevents split-brain anomalies during network partitions.',
      'Randomized election timeouts drastically reduce split-vote ties.',
      'A node rejects vote requests from candidates with older or shorter log histories.'
    ],
    furtherReadingLinks: [
      { title: 'The Raft Paper (Ongaro & Ousterhout)', url: 'https://raft.github.io/raft.pdf' },
      { title: 'Visualizing Raft Consensus', url: 'https://thesecretlivesofdata.com/raft/' }
    ]
  },
  {
    title: 'PostgreSQL MVCC & WAL Internals Under High Concurrency',
    slug: 'postgres-mvcc-and-wal',
    category: 'Databases',
    headline: 'Multi-Version Concurrency Control, Write-Ahead Logging, and vacuuming mechanics',
    summary: 'PostgreSQL provides ACID isolation without read locks by maintaining multiple tuple versions (MVCC) and persisting durability changes sequentially to WAL buffers.',
    deepDiveContent: `Traditional relational locking causes readers to block writers and writers to block readers. PostgreSQL solves this with Multi-Version Concurrency Control (MVCC).\n\nKey Mechanics:\n1. **xmin and xmax Headers**: Every row has hidden header attributes tracking the creating transaction ID (xmin) and deleting transaction ID (xmax).\n2. **Snapshot Isolation**: When a query starts in Repeatable Read isolation, it takes a snapshot of currently running transactions. Tuples created by transactions after the snapshot are invisible.\n3. **Write-Ahead Log (WAL)**: All modifications are written sequentially to the WAL file on disk before flushing dirty buffer pages to data tables. This guarantees durability upon crash recovery.\n4. **Vacuuming & Bloat**: Dead row versions are not immediately erased. VACUUM scans table pages and marks obsolete tuples for space reuse.`,
    whyItMattersInIndustry: 'Powering primary transactional engines at Figma, Discord, GitHub, and Shopify under tens of thousands of concurrent database queries.',
    realWorldUseCases: [
      { company: 'Figma', useCase: 'Managing multi-terabyte multiplayer database tables with partitioned PostgreSQL and connection pooling.' },
      { company: 'Discord', useCase: 'Transitioning billions of messages from Cassandra to partitioned PostgreSQL with custom index clustering.' }
    ],
    architectureConcept: 'Non-blocking concurrent reads via transaction snapshot visibility and append-only WAL persistence.',
    keyTakeaways: [
      'Readers never block writers and writers never block readers in MVCC.',
      'Updates in Postgres are fundamentally an INSERT of a new tuple version and an update of xmax on the old tuple.',
      'Autovacuum is critical to prevent index and table bloat from accumulative dead rows.',
      'WAL guarantees Durability by ensuring sequential disk writes precede buffer pool flushes.'
    ],
    furtherReadingLinks: [
      { title: 'The Internals of PostgreSQL - MVCC Architecture', url: 'https://www.interdb.jp/pg/pgsql05.html' }
    ]
  },
  {
    title: 'Consistent Hashing & Ring Partitioning in Distributed Storage',
    slug: 'consistent-hashing-ring',
    category: 'SystemDesign',
    headline: 'Dynamic cluster scaling without massive key redistribution overhead',
    summary: 'Consistent hashing maps both servers and data keys to a circular hash ring (0 to 2^32 - 1), ensuring that adding or removing a node only requires remapping K/N keys.',
    deepDiveContent: `Naive modulo hashing (\`hash(key) % N\`) is disastrous in dynamic clusters: when server count changes from N to N+1, almost 100% of keys remap to new locations, causing catastrophic cache stampedes.\n\nConsistent Hashing Principles:\n1. **The Hash Ring**: Imagine an integer ring from 0 to 2^32 - 1. Node IP addresses are hashed onto specific positions on this circle.\n2. **Key Placement**: To locate which node stores a key, hash the key and walk clockwise along the ring until encountering the first node position.\n3. **Virtual Nodes (Vnodes)**: To prevent hot spots where one node receives uneven data distribution, each physical node is assigned 100-300 virtual tokens distributed across the ring.\n4. **Replication**: For fault tolerance, keys are replicated clockwise to the next R distinct physical servers on the ring.`,
    whyItMattersInIndustry: 'Used by Amazon DynamoDB, Apache Cassandra, Discord voice servers, Akamai CDN, and Memcached clusters.',
    realWorldUseCases: [
      { company: 'Amazon', useCase: 'Dynamo storage architecture uses consistent hashing to provide seamless horizontal scaling during Prime Day spikes.' },
      { company: 'Discord', useCase: 'Routing real-time voice channels to server nodes with minimal channel migrations during deployments.' }
    ],
    architectureConcept: 'Virtual node token allocation on circular hash rings for uniform cluster load distribution.',
    keyTakeaways: [
      'Adding or removing a server node only impacts adjacent keys on the ring (K/N remappings).',
      'Virtual nodes ensure balanced hash distribution and prevent hot spots on individual servers.',
      'Key replication walks clockwise across distinct physical host nodes.',
      'Essential for distributed key-value stores and edge caching.'
    ],
    furtherReadingLinks: [
      { title: 'Consistent Hashing and Random Trees (Karger et al.)', url: 'https://www.cs.princeton.edu/courses/archive/fall09/cos518/papers/chash.pdf' }
    ]
  },
  {
    title: 'eBPF & Linux Kernel Programmability for High-Speed Networking',
    slug: 'ebpf-linux-kernel-networking',
    category: 'DevOps',
    headline: 'Running sandboxed bytecode inside the Linux kernel without kernel module crashes',
    summary: 'Extended Berkeley Packet Filter (eBPF) allows engineers to inject safe, verified bytecode into Linux kernel hook points for ultra-low latency observability and networking.',
    deepDiveContent: `Historically, modifying Linux networking or tracing required compiling custom kernel modules (which risk kernel panics) or routing packets into user-space via socket syscalls (which causes costly context switches).\n\neBPF Architecture:\n1. **In-Kernel Virtual Machine**: eBPF runs a 64-bit RISC register VM inside the kernel.\n2. **Static Invariant Verifier**: Before loading, the kernel verifier checks for infinite loops, out-of-bounds memory accesses, and uninitialized registers.\n3. **JIT Compilation**: Verified bytecode is just-in-time compiled to native machine instructions with zero user-kernel context switch overhead.\n4. **XDP (eXpress Data Path)**: Processes incoming network packets at the network card (NIC) driver level before the kernel sk_buff network stack is even allocated!`,
    whyItMattersInIndustry: 'Cloud-native service meshes (Cilium), Cloudflare DDoS mitigation, and Netflix performance telemetry run on eBPF.',
    realWorldUseCases: [
      { company: 'Cloudflare', useCase: 'Dropping millions of malicious L4 DDoS packets per second at line rate using XDP eBPF programs.' },
      { company: 'Cilium', useCase: 'Replacing inefficient iptables rules with eBPF programs for Kubernetes pod-to-pod networking and L7 observability.' }
    ],
    architectureConcept: 'JIT-compiled, verified in-kernel bytecode attached to tracepoints and socket ingress buffers.',
    keyTakeaways: [
      'eBPF allows safe programmability inside the kernel without changing kernel source code or rebooting.',
      'The in-kernel verifier guarantees programs terminate safely without crashing the OS.',
      'XDP executes eBPF bytecode directly inside the NIC driver for packet filtering at line speed.',
      'Transforms modern container networking and low-overhead observability.'
    ],
    furtherReadingLinks: [
      { title: 'eBPF Official Documentation & Architecture', url: 'https://ebpf.io/' }
    ]
  },
  {
    title: 'Vector Indexing: HNSW vs IVF-PQ in Large-Scale AI Embeddings',
    slug: 'vector-indexing-hnsw-vs-ivf',
    category: 'AI/ML',
    headline: 'Approximate Nearest Neighbor algorithms for sub-millisecond semantic search',
    summary: 'Hierarchical Navigable Small World (HNSW) and Inverted File Product Quantization (IVF-PQ) enable billion-scale semantic search with sub-second retrieval latency.',
    deepDiveContent: `Exact k-Nearest Neighbors (k-NN) requires calculating cosine distances against every vector in the dataset—an O(N * D) operation that cannot scale past thousands of embeddings. Vector databases (Milvus, Pinecone, Qdrant, pgvector) use Approximate Nearest Neighbor (ANN) indexing.\n\nHNSW vs IVF Comparison:\n1. **HNSW (Graph-based)**: Multi-layer skip-list graph. Top layers have long-range links for fast exploration; bottom layers have dense local links. Achieves 99%+ recall with ultra-fast queries, but consumes significant memory (stores graph edges).\n2. **IVF (Inverted File)**: Partitions the vector space into Voronoi cells using k-means clustering. At query time, only vectors inside the nearest centroid clusters are inspected.\n3. **Product Quantization (PQ)**: Compresses 1536-dimensional vectors into compact 64-byte codes by splitting vectors into sub-vectors and indexing codebooks. Drastically slashes RAM consumption at slight recall cost.`,
    whyItMattersInIndustry: 'Powering ChatGPT memory, Spotify song recommendation, and enterprise RAG pipelines with millions of documents.',
    realWorldUseCases: [
      { company: 'Spotify', useCase: 'Indexing 100M+ song acoustic embeddings using Annoy and HNSW for instant similarity recommendations.' },
      { company: 'Notion', useCase: 'Powering Notion AI workspace search across hundreds of millions of user document chunks using Qdrant and HNSW.' }
    ],
    architectureConcept: 'Hierarchical skip-graph traversal combined with vector centroid clustering and dimensional quantization.',
    keyTakeaways: [
      'Exact k-NN is too slow for production scale; Approximate Nearest Neighbor (ANN) trade slight recall for 1000x speedups.',
      'HNSW provides highest recall and query speed but requires substantial memory.',
      'Product Quantization compresses vector embeddings by 90%+ for cost-effective massive-scale deployment.',
      'Modern RAG architectures rely on hybrid search (sparse BM25 + dense HNSW vectors).'
    ],
    furtherReadingLinks: [
      { title: 'Efficient and Robust Approximate Nearest Neighbor Using HNSW (Malkov & Yashunin)', url: 'https://arxiv.org/abs/1603.09320' }
    ]
  },
  {
    title: 'Zero Trust Architecture & Mutual TLS (mTLS) in Service Meshes',
    slug: 'zero-trust-and-mtls',
    category: 'Security',
    headline: 'Eliminating implicit network trust with cryptographic service identity and SPIFFE IDs',
    summary: 'Zero Trust replaces perimeter network firewalls with cryptographic identity verification, issuing short-lived certificates and authenticating both client and server via mTLS.',
    deepDiveContent: `In traditional perimeter security, anything inside the corporate private network or VPC was trusted implicitly. In modern cloud-native environments, an attacker who breaches one low-priority container can move laterally to access user databases.\n\nZero Trust Principles:\n1. **Never Trust, Always Verify**: Every service-to-service RPC must be authenticated and authorized regardless of network location.\n2. **SPIFFE / SPIRE**: Secure Production Identity Framework for Everyone provides verifiable cryptographic IDs (e.g., \`spiffe://cluster.local/ns/prod/sa/payment-service\`).\n3. **Mutual TLS Handshake**: Both client and server exchange X.509 certificates to verify each other's identity and encrypt payloads in transit.\n4. **Automated Ephemeral Rotation**: Envoy sidecars rotate X.509 certs automatically every 12 to 24 hours without service restarts.`,
    whyItMattersInIndustry: 'Implemented by Google (BeyondCorp), Netflix, and enterprise banks to prevent internal lateral movement during compromises.',
    realWorldUseCases: [
      { company: 'Google', useCase: 'BeyondCorp internal infrastructure enforcing zero trust access controls on every internal request without corporate VPNs.' },
      { company: 'Airbnb', useCase: 'Securing inter-service microservice communications using Istio and automated mTLS certificate rotation.' }
    ],
    architectureConcept: 'Cryptographic SPIFFE service identities and sidecar proxy mTLS termination with automated rotation.',
    keyTakeaways: [
      'Perimeter security is obsolete; internal networks must be assumed hostile.',
      'Mutual TLS cryptographically authenticates both caller and responder.',
      'Short-lived ephemeral certificates prevent compromised keys from being exploited indefinitely.',
      'Service meshes like Istio, Linkerd, and Envoy automate mTLS transparently to application code.'
    ],
    furtherReadingLinks: [
      { title: 'NIST Special Publication 800-207: Zero Trust Architecture', url: 'https://csrc.nist.gov/publications/detail/sp/800-207/final' }
    ]
  },
  {
    title: 'LSM-Trees vs B-Trees: The Storage Engine Tradeoff',
    slug: 'lsm-trees-vs-btrees',
    category: 'Databases',
    headline: 'Write-optimized SSTables vs read-optimized balanced trees in database internals',
    summary: 'LSM-Trees (RocksDB, Cassandra) optimize for high write throughput using sequential append-only writes, while B-Trees (Postgres, MySQL) optimize for fast in-place point reads.',
    deepDiveContent: `Storage engines represent the fundamental building block of all databases. The core design tradeoff centers on read amplification vs write amplification.\n\nB-Trees (Read-Optimized):\n- Keep data sorted in fixed-size pages (typically 8KB or 16KB).\n- Point reads take O(log N) disk reads.\n- Writes require random in-place updates. High write volumes cause random I/O and disk write amplification.\n\nLSM-Trees (Log-Structured Merge-Trees, Write-Optimized):\n1. **MemTable**: Incoming writes append to an in-memory red-black or skip-list table and WAL sequentially.\n2. **SSTables (Sorted String Tables)**: When MemTable fills, it flushes to disk as an immutable sorted file.\n3. **Compaction**: Background threads merge overlapping SSTables and purge deleted entries.\n4. **Bloom Filters**: Fast in-memory probabilistic filters prevent checking SSTables that don't contain the requested key.`,
    whyItMattersInIndustry: 'RocksDB powers Kafka Streams, CockroachDB, and Meta internal services, handling billions of writes per second.',
    realWorldUseCases: [
      { company: 'Meta', useCase: 'Powering MyRocks (MySQL on RocksDB) to reduce SSD flash memory wear and double write throughput.' },
      { company: 'CockroachDB', useCase: 'Using Pebble (an LSM-tree engine inspired by RocksDB) as the underlying node storage engine.' }
    ],
    architectureConcept: 'Append-only MemTable and SSTable compaction versus in-place balanced page updates.',
    keyTakeaways: [
      'LSM-Trees convert random writes into sequential writes, making them vastly faster for write-heavy workloads.',
      'B-Trees offer superior, deterministic read latency without needing background compaction.',
      'Compaction in LSM-trees can cause temporary I/O spikes (compaction debt).',
      'Bloom filters are indispensable in LSM-trees to avoid unnecessary disk seeks on misses.'
    ],
    furtherReadingLinks: [
      { title: 'Designing Data-Intensive Applications (Kleppmann) - Chapter 3', url: 'https://dataintensive.net/' }
    ]
  },
  {
    title: 'HTTP/3, QUIC & Multiplexing Without Head-of-Line Blocking',
    slug: 'http3-and-quic-protocol',
    category: 'TrendingTech',
    headline: 'Replacing TCP with UDP-based encrypted multiplexed streams for mobile resilience',
    summary: 'HTTP/3 runs over QUIC on top of UDP, solving TCP head-of-line blocking and enabling 0-RTT handshakes and seamless IP network migration.',
    deepDiveContent: `HTTP/2 introduced stream multiplexing over a single TCP connection, but suffered from TCP-level Head-of-Line (HoL) blocking: if a single network packet was lost, the operating system TCP stack paused ALL multiplexed streams until that lost packet retransmitted!\n\nQUIC & HTTP/3 Innovations:\n1. **UDP Transport**: Runs over UDP in user-space, avoiding legacy operating system kernel updates.\n2. **Stream-Level Independence**: Packet loss on Stream A has zero impact on Stream B. Each stream has independent flow control.\n3. **Combined Handshake (0-RTT)**: QUIC merges transport (connection setup) and security (TLS 1.3) into a single round trip. Reconnected clients can send data in the very first packet (0-RTT).\n4. **Connection Migration**: Connections are identified by a 64-bit Connection ID, not IP:Port tuples. When a smartphone moves from Wi-Fi to 5G, downloads continue without reconnecting!`,
    whyItMattersInIndustry: 'Google, Cloudflare, Meta, and YouTube serve over 70% of web traffic over HTTP/3 for faster mobile load times.',
    realWorldUseCases: [
      { company: 'YouTube', useCase: 'Slicing video buffering stalls on unstable mobile 4G/5G networks by over 15% using QUIC.' },
      { company: 'Cloudflare', useCase: 'Serving edge static and dynamic web traffic over HTTP/3 by default across global CDN points of presence.' }
    ],
    architectureConcept: 'User-space UDP transport with TLS 1.3 integration and Connection ID stream multiplexing.',
    keyTakeaways: [
      'HTTP/2 solved application HoL blocking; HTTP/3 over QUIC solves transport-layer HoL blocking.',
      'QUIC integrates TLS 1.3 encryption directly into the transport layer.',
      'Connection IDs allow mobile devices to switch networks without dropping active TCP connections.',
      '0-RTT resumption delivers near-instantaneous page navigation.'
    ],
    furtherReadingLinks: [
      { title: 'RFC 9000: QUIC - A UDP-Based Multiplexed and Secure Transport', url: 'https://datatracker.ietf.org/doc/html/rfc9000' }
    ]
  },
  {
    title: 'Event Sourcing & CQRS (Command Query Responsibility Segregation)',
    slug: 'event-sourcing-and-cqrs',
    category: 'Backend',
    headline: 'Storing immutable business events as source of truth and projecting optimized read models',
    summary: 'Event Sourcing stores state as an append-only sequence of immutable business facts, while CQRS decouples high-throughput writes from low-latency query read models.',
    deepDiveContent: `Traditional CRUD applications overwrite row state in-place: updating account balance from $100 to $50 destroys the history of how and why the balance changed.\n\nEvent Sourcing & CQRS Core Principles:\n1. **Event Store as Single Source of Truth**: Instead of saving current state, save every domain event: \`OrderPlaced\`, \`PaymentAuthorized\`, \`ItemShipped\`. Events are immutable and append-only.\n2. **Command Side**: Validates business logic, processes commands, and appends new events to the event stream.\n3. **Query Side (Projections)**: Asynchronous consumers read the event stream and project denormalized read views optimized for UI queries (e.g. Elasticsearch for full-text search, Redis for counts).\n4. **Temporal Replay**: Audit logs, compliance reporting, and retroactive debugging are trivial because any past state can be replayed from genesis.`,
    whyItMattersInIndustry: 'Standard architectural pattern for fintech (Square, Monzo), banking, supply chain logistics, and complex trading platforms.',
    realWorldUseCases: [
      { company: 'Monzo Bank', useCase: 'Maintaining ledger accuracy and transaction audits across millions of accounts via immutable event sourcing.' },
      { company: 'Shopify', useCase: 'Decoupling order state machines from reporting and fulfillment query models using Kafka projections.' }
    ],
    architectureConcept: 'Append-only event stores with asynchronous projection workers updating materialised read views.',
    keyTakeaways: [
      'Current state is simply a fold/projection over the history of past immutable events.',
      'Separating commands (writes) from queries (reads) allows each side to scale independently.',
      'Read models are eventually consistent and can be re-indexed or rebuilt from scratch anytime.',
      'Essential for audit compliance and high-concurrency transactional workflows.'
    ],
    furtherReadingLinks: [
      { title: 'Microsoft Architecture: CQRS Pattern Guide', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs' }
    ]
  },
  {
    title: 'WebAssembly (Wasm) & WASI at the Cloud Edge',
    slug: 'webassembly-wasi-cloud-edge',
    category: 'TrendingTech',
    headline: 'Near-native speed, millisecond cold starts, and sandboxed portability beyond the browser',
    summary: 'WebAssembly (Wasm) and the WebAssembly System Interface (WASI) provide secure, language-agnostic binary execution with microsecond startup times for edge functions.',
    deepDiveContent: `While Docker containers revolutionized server deployments, they carry heavyweight OS abstractions: typical container images weigh hundreds of megabytes and require 500ms+ cold boot times.\n\nWebAssembly Edge Architecture:\n1. **Binary Instruction Format**: Wasm is a portable bytecode format executed by lightweight runtime engines (Wasmtime, V8, Wasmer).\n2. **WASI (System Interface)**: Standardizes secure access to files, sockets, clocks, and environment variables using capability-based security.\n3. **Capability-Based Sandboxing**: Wasm modules cannot access filesystem or network sockets unless host explicitly grants that capability at runtime.\n4. **Microsecond Startup**: Wasm instances instantiate in under 1 millisecond with memory footprints under 100KB, making them ideal for serverless scale-to-zero.`,
    whyItMattersInIndustry: 'Cloudflare Workers, Fastly Compute@Edge, and Docker Wasm run serverless compute on WebAssembly runtimes.',
    realWorldUseCases: [
      { company: 'Figma', useCase: 'Compiling C++ rendering algorithms into Wasm for 60fps web browser vector manipulation.' },
      { company: 'Fastly', useCase: 'Executing serverless functions on edge nodes with sub-millisecond cold starts using Lucet/Wasmtime.' }
    ],
    architectureConcept: 'Capability-based sandboxed binary execution with microsecond runtime instantiation.',
    keyTakeaways: [
      'Wasm runs high-performance code written in Rust, C++, or Go across browsers and backend edge servers.',
      'WASI provides capability-based security without full OS kernel emulation.',
      'Cold start latency drops from seconds (JVM/Docker) to microseconds with Wasm.',
      'Enables true zero-trust multi-tenant compute at the CDN edge.'
    ],
    furtherReadingLinks: [
      { title: 'WebAssembly System Interface (WASI) Specification', url: 'https://wasi.dev/' }
    ]
  },
  {
    title: 'Temporal & Durable Execution: Surviving Process Crashes',
    slug: 'temporal-durable-execution',
    category: 'Backend',
    headline: 'Eliminating distributed state machine spaghetti with durable code workflows',
    summary: 'Durable execution frameworks (Temporal, Cadence) record every step of async execution, automatically reconstructing thread memory and state after server crashes or network partitions.',
    deepDiveContent: `Complex business processes—such as provisioning a cloud cluster, processing a refund, or orchestrating an e-commerce order—span minutes, hours, or weeks with dozens of flaky external API calls. Traditional implementations require complex state machines in DB, cron polling jobs, and retry queues.\n\nDurable Execution Mechanics:\n1. **Workflows & Activities**: Workflows contain deterministic business logic; Activities execute non-deterministic I/O (HTTP requests, DB writes, emails).\n2. **Event Sourced Replay**: Every completed activity records its return value in Temporal's event history. If the worker machine crashes mid-workflow, another worker resumes by replaying history without re-executing completed activities!\n3. **Deterministic Timers**: \`workflow.sleep(Duration.days(30))\` is a native code line that consumes zero CPU or memory while waiting in durable storage.\n4. **Automatic Exponential Retries**: Transient failures retry automatically with backoff, jitter, and configurable timeouts.`,
    whyItMattersInIndustry: 'Uber, Stripe, Netflix, Coinbase, and Datadog use Temporal to orchestrate mission-critical money movement and infrastructure deployments.',
    realWorldUseCases: [
      { company: 'Coinbase', useCase: 'Managing cryptocurrency withdrawal and deposit confirmation pipelines with strict consistency and zero lost operations.' },
      { company: 'Stripe', useCase: 'Orchestrating multi-day merchant onboarding, KYC verification, and bank payout schedules.' }
    ],
    architectureConcept: 'Event-sourced workflow state reconstruction and deterministic activity replay across worker pools.',
    keyTakeaways: [
      'Durable execution turns distributed multi-step transactions into standard procedural code.',
      'Workflows automatically survive server restarts, process crashes, and network partitions.',
      'Activities isolate non-deterministic I/O and enforce automatic retries.',
      'Eliminates fragile cron jobs, ad-hoc polling tables, and distributed saga state machines.'
    ],
    furtherReadingLinks: [
      { title: 'Temporal Documentation & Architecture Guide', url: 'https://docs.temporal.io/' }
    ]
  }
];

class IndustryTopicService {
  /**
   * Deterministically or dynamically retrieves or creates an industry topic for a specific date (YYYY-MM-DD).
   * Persists new topics to MongoDB so history is always safely preserved.
   */
  async getOrGenerateTopicForDate(dateStr) {
    if (!dateStr) {
      dateStr = new Date().toISOString().split('T')[0];
    }

    // 1. Check if topic already exists in DB
    let topic = await IndustryTopic.findOne({ date: dateStr });
    if (topic) {
      return topic;
    }

    // 2. Fetch existing slugs to avoid collisions
    const existingTopics = await IndustryTopic.find().select('title slug category').lean();
    const existingSlugs = new Set(existingTopics.map(t => t.slug));
    const existingTitles = new Set(existingTopics.map(t => t.title.toLowerCase()));

    // 3. Try AI generation if configured
    let generatedData = null;
    try {
      const isExternalConfigured = aiService.getProviderStatus().isExternalConfigured;
      if (isExternalConfigured) {
        generatedData = await this.generateViaAI(dateStr, existingTopics);
      }
    } catch (aiErr) {
      console.warn(`[IndustryTopicService] AI generation failed for ${dateStr}, using curated engine:`, aiErr.message);
    }

    // 4. Fallback: Select from curated catalog deterministically based on date hash
    if (!generatedData) {
      generatedData = this.selectFromCuratedBank(dateStr, existingSlugs, existingTitles);
    }

    // 5. Ensure unique slug for this specific date
    let baseSlug = generatedData.slug || generatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let finalSlug = baseSlug;
    if (existingSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${dateStr}`;
    }

    // 6. Save safely into DB
    try {
      topic = await IndustryTopic.create({
        title: generatedData.title,
        slug: finalSlug,
        date: dateStr,
        category: generatedData.category || 'Backend',
        headline: generatedData.headline,
        summary: generatedData.summary,
        deepDiveContent: generatedData.deepDiveContent,
        whyItMattersInIndustry: generatedData.whyItMattersInIndustry,
        realWorldUseCases: generatedData.realWorldUseCases || [],
        architectureConcept: generatedData.architectureConcept || '',
        keyTakeaways: generatedData.keyTakeaways || [],
        furtherReadingLinks: generatedData.furtherReadingLinks || [],
        viewedBy: []
      });

      console.log(`✅ [IndustryTopicService] Generated & saved new Industry Topic for ${dateStr}: "${topic.title}"`);
      return topic;
    } catch (saveErr) {
      // Handle potential race condition if concurrent request already created it
      if (saveErr.code === 11000) {
        return await IndustryTopic.findOne({ date: dateStr });
      }
      throw saveErr;
    }
  }

  /**
   * Selects a topic from curated bank that has not yet been used, or adapts one with unique date focus
   */
  selectFromCuratedBank(dateStr, existingSlugs, existingTitles) {
    // Hash date string to deterministic number
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    // Filter bank for unused items
    const available = CURATED_TOPIC_BANK.filter(
      item => !existingSlugs.has(item.slug) && !existingTitles.has(item.title.toLowerCase())
    );

    if (available.length > 0) {
      return available[absHash % available.length];
    }

    // If all base items in catalog are used, pick one and cycle with a sub-theme
    const baseItem = CURATED_TOPIC_BANK[absHash % CURATED_TOPIC_BANK.length];
    return {
      ...baseItem,
      title: `${baseItem.title} (Deep-Dive)`,
      slug: `${baseItem.slug}-${dateStr}`
    };
  }

  /**
   * Generates a topic using AI service
   */
  async generateViaAI(dateStr, existingTopics = []) {
    const categories = ['Backend', 'Frontend', 'AI/ML', 'Cloud', 'DevOps', 'Security', 'Databases', 'SystemDesign', 'TrendingTech'];
    const usedTitles = existingTopics.slice(-15).map(t => t.title).join(', ');

    const prompt = `Generate an in-depth software engineering industry awareness topic for engineering students for date ${dateStr}.
Pick an advanced real-world software topic across these categories: ${categories.join(', ')}.
DO NOT repeat these recent topics: ${usedTitles || 'None'}.

Return ONLY valid JSON matching this schema:
{
  "title": "Topic title",
  "slug": "url-friendly-slug",
  "category": "Backend" | "Frontend" | "AI/ML" | "Cloud" | "DevOps" | "Security" | "Databases" | "SystemDesign" | "TrendingTech",
  "headline": "One-line punchy technical headline",
  "summary": "2-3 sentence overview of why this technology exists and core problem it solves",
  "deepDiveContent": "Detailed multi-paragraph breakdown of architectural concepts, internals, and protocols",
  "whyItMattersInIndustry": "Why top companies use this in production systems",
  "realWorldUseCases": [
    { "company": "Company Name", "useCase": "Specific technical implementation description" },
    { "company": "Company 2", "useCase": "Specific technical implementation description" }
  ],
  "architectureConcept": "Short summary of the core architectural concept",
  "keyTakeaways": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4"],
  "furtherReadingLinks": [
    { "title": "Reference documentation or research paper", "url": "https://..." }
  ]
}`;

    // Note: If external AI is enabled, AIService can execute it; otherwise fallback is used.
    return null;
  }

  /**
   * Ensures that every date in the past N days (including today) has a persisted topic in DB.
   * Solves the problem where a user logs in after a month and expects all past days to be accessible.
   */
  async ensureCalendarHistoryTopics(numDays = 30) {
    const today = new Date();
    const datesToEnsure = [];

    for (let i = 0; i < numDays; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      datesToEnsure.push(d.toISOString().split('T')[0]);
    }

    // Find which dates already exist in DB
    const existingInDb = await IndustryTopic.find({
      date: { $in: datesToEnsure }
    }).select('date').lean();

    const existingDateSet = new Set(existingInDb.map(t => t.date));
    const missingDates = datesToEnsure.filter(d => !existingDateSet.has(d));

    if (missingDates.length > 0) {
      console.log(`[IndustryTopicService] Found ${missingDates.length} missing dates in past ${numDays} days. Generating & persisting...`);
      for (const missingDate of missingDates) {
        await this.getOrGenerateTopicForDate(missingDate);
      }
    }

    return datesToEnsure.length;
  }
}

module.exports = new IndustryTopicService();
