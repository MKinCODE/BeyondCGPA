const PreparationTopic = require('../models/PreparationTopic');
const PreparationProgress = require('../models/PreparationProgress');
const Roadmap = require('../models/Roadmap');
const CareerProfile = require('../models/CareerProfile');

class CIEService {
  /**
   * Determine category phase ordering deterministically based on domain and DSA preference
   */
  getCategoryPhaseOrder(targetDomain = 'Fullstack', dsaPreference = 'Balanced') {
    let baseOrder;

    if (targetDomain === 'Frontend') {
      baseOrder = ['Development', 'Projects', 'OOP', 'DSA', 'OS', 'InterviewPrep'];
    } else if (targetDomain === 'Backend') {
      baseOrder = ['Development', 'DBMS', 'SystemDesign', 'OS', 'Projects', 'DSA', 'OOP', 'InterviewPrep'];
    } else if (targetDomain === 'AI/ML') {
      baseOrder = ['Development', 'Projects', 'DBMS', 'DSA', 'OOP', 'InterviewPrep'];
    } else if (targetDomain === 'Cloud/DevOps') {
      baseOrder = ['Development', 'OS', 'SystemDesign', 'Projects', 'DBMS', 'DSA', 'OOP', 'InterviewPrep'];
    } else if (targetDomain === 'Undecided') {
      // Exploration Mode: Cross-sampling discovery
      baseOrder = ['Development', 'DSA', 'DBMS', 'OS', 'Projects', 'OOP', 'InterviewPrep'];
    } else {
      // Fullstack or other default
      baseOrder = ['Development', 'DBMS', 'SystemDesign', 'Projects', 'DSA', 'OS', 'OOP', 'InterviewPrep'];
    }

    // Adapt to explicit DSA preference:
    if (dsaPreference === 'Intensive') {
      baseOrder = ['DSA', ...baseOrder.filter(c => c !== 'DSA')];
    } else if (dsaPreference === 'Minimal') {
      baseOrder = baseOrder.filter(c => c !== 'DSA');
      baseOrder.push('DSA'); // Defer to very end
    } else if (dsaPreference === 'SkipForNow') {
      baseOrder = baseOrder.filter(c => c !== 'DSA'); // Omit completely from primary phases
    }

    return baseOrder;
  }

  /**
   * Generates a tailored adaptive roadmap for a student based on baseline profile calibration
   */
  async generateBaselineRoadmap(userId, profile) {
    const { targetDomain, weeklyHours, currentProficiency, dsaPreference, preferredPace } = profile;

    // Fetch topics matching the domain or universal topics
    let domainQuery;
    if (targetDomain === 'Undecided') {
      // Exploration mode: Sample foundational topics across Web, Systems, Algorithms, and ML
      domainQuery = { $in: ['Frontend', 'Backend', 'AI/ML', 'Fullstack', 'All'] };
    } else {
      domainQuery = { $in: [targetDomain, 'All'] };
    }

    const topics = await PreparationTopic.find({
      domainRelevance: domainQuery
    }).sort({ order: 1 });

    if (!topics || topics.length === 0) {
      throw new Error('No curriculum topics found to build roadmap. Ensure database is seeded.');
    }

    // Determine category order dynamically based on domain & DSA preference
    const categories = this.getCategoryPhaseOrder(targetDomain, dsaPreference);
    const phases = [];
    let totalAllocatedUnits = 0;
    let initialCompletedUnits = 0;
    let phaseOrder = 1;

    const masteredSkills = (profile.cieDerived?.masteredSkills || []).map(s => s.toLowerCase());

    for (const cat of categories) {
      let catTopics = topics.filter(t => t.category === cat);

      // In Undecided/Exploration mode, limit each category to 1-2 representative sampler topics
      if (targetDomain === 'Undecided' && catTopics.length > 2) {
        catTopics = catTopics.slice(0, 2);
      }

      if (catTopics.length > 0) {
        const phaseTopicItems = [];

        for (const topic of catTopics) {
          let units = topic.allocatedEffortUnits || 3;
          const proficiencyKey = cat === 'DSA'
            ? 'dsa'
            : (cat === 'Development' || cat === 'Projects')
              ? 'development'
              : (cat === 'SystemDesign')
                ? 'systemDesign'
                : 'coreCS';

          const profLevel = currentProficiency?.[proficiencyKey] || 'Beginner';

          // Adaptive baseline unit allocation
          if (profLevel === 'Advanced') {
            units = Math.max(1, Math.round(units * 0.6)); // Accelerated pace
          } else if (profLevel === 'Beginner') {
            units = Math.round(units * 1.3); // Reinforcement buffer
          }

          // DSA priority reduction if student asked for Minimal
          if (cat === 'DSA' && dsaPreference === 'Minimal') {
            units = Math.max(1, Math.round(units * 0.6));
          }

          // Preferred pace adaptation
          if (preferredPace === 'Accelerated') {
            units = Math.max(1, units - 1);
          } else if (preferredPace === 'DeepFoundation') {
            units = units + 1;
          }

          totalAllocatedUnits += units;

          // Priority assignment
          let priority = 'Standard';
          if (phaseOrder === 1) {
            priority = 'Critical';
          } else if (phaseOrder === 2) {
            priority = 'High';
          } else if (cat === 'DSA' && (dsaPreference === 'Minimal' || dsaPreference === 'SkipForNow')) {
            priority = 'Optional';
          }

          phaseTopicItems.push({
            topic: topic._id,
            title: topic.title,
            slug: topic.slug,
            allocatedEffortUnits: units,
            priority
          });

          // Calibrate baseline effort units using self-reported skills without claiming unearned mastery
          const hasSelfReportedSkill = (profile.selfReportedSkills || []).some(
            s => s.toLowerCase() === topic.title.toLowerCase() ||
                 topic.title.toLowerCase().includes(s.toLowerCase()) ||
                 (s.toLowerCase().includes('react') && topic.slug.includes('react')) ||
                 (s.toLowerCase().includes('two pointers') && topic.slug.includes('two-pointers')) ||
                 (s.toLowerCase().includes('rest') && topic.slug.includes('rest'))
          );

          if (hasSelfReportedSkill) {
            // Streamline to verification unit (1 unit) instead of multi-unit sequence
            units = Math.max(1, Math.round(units * 0.6));
          }

          // Check if there is genuine existing verified progress from prior study sessions
          const existingProg = await PreparationProgress.findOne({ user: userId, topic: topic._id });
          if (existingProg && existingProg.status === 'Completed') {
            initialCompletedUnits += existingProg.completedUnits;
          } else {
            await PreparationProgress.findOneAndUpdate(
              { user: userId, topic: topic._id },
              {
                $setOnInsert: {
                  user: userId,
                  topic: topic._id,
                  status: 'NotStarted',
                  totalAllocatedUnits: units,
                  completedUnits: 0,
                  remainingUnits: units,
                  confidenceScore: 3
                }
              },
              { upsert: true, returnDocument: 'after' }
            );
          }
        }

        const phaseTitle = (targetDomain === 'Undecided')
          ? `Exploration: ${cat} Track`
          : `${cat} Mastery Phase`;

        phases.push({
          title: phaseTitle,
          category: cat,
          order: phaseOrder++,
          topics: phaseTopicItems
        });
      }
    }

    const remainingUnits = Math.max(0, totalAllocatedUnits - initialCompletedUnits);

    // Save active Roadmap
    const roadmap = await Roadmap.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        targetDomain,
        status: 'Active',
        phases,
        totalAllocatedUnits,
        completedUnits: initialCompletedUnits,
        remainingUnits,
        adaptationCount: 0,
        lastAdaptedReason: `Personalized calibration: ${targetDomain} (DSA: ${dsaPreference || 'Balanced'})`,
        lastAdaptedAt: new Date()
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Initial readiness horizon and pacing health
    const readinessHorizon = this.calculateReadinessHorizon({
      totalUnits: totalAllocatedUnits,
      completedUnits: initialCompletedUnits,
      weeklyHours: weeklyHours || 14,
      velocityMultiplier: 1.0
    });

    const pacingHealth = this.calculatePacingHealth(weeklyHours || 14, totalAllocatedUnits, initialCompletedUnits);

    const primaryFocusCat = phases[0]?.category || 'Development';
    const focusReason = targetDomain === 'Undecided'
      ? 'Exploring initial cross-domain interest and practical foundations'
      : (dsaPreference === 'Minimal' || dsaPreference === 'SkipForNow')
        ? `Accelerating practical ${primaryFocusCat} engineering skills`
        : `Mastering high-impact ${primaryFocusCat} core competency`;

    await CareerProfile.findOneAndUpdate(
      { user: userId },
      {
        'cieDerived.readinessHorizon': readinessHorizon,
        'cieDerived.focusRecommendation': {
          primaryCategory: primaryFocusCat,
          reason: focusReason
        },
        'cieDerived.pacingHealth': pacingHealth,
        'cieDerived.velocityMultiplier': 1.0,
        'cieDerived.lastEvaluatedAt': new Date()
      }
    );

    return roadmap;
  }

  /**
   * Calculates realistic readiness horizon based on total remaining workload, weekly availability, and velocity.
   */
  calculateReadinessHorizon({ totalUnits, completedUnits, weeklyHours, velocityMultiplier = 1.0 }) {
    const remainingUnits = Math.max(0, totalUnits - completedUnits);
    const avgHoursPerUnit = 2.0;
    const totalRemainingHours = (remainingUnits * avgHoursPerUnit) / Math.max(0.5, velocityMultiplier);
    const effectiveWeeklyHours = Math.max(2, weeklyHours || 14);

    const estimatedWeeks = Math.max(1, Math.ceil(totalRemainingHours / effectiveWeeklyHours));
    const months = (estimatedWeeks / 4.33).toFixed(1);

    const completionRate = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;
    const preparednessScore = Math.min(100, Math.round(15 + (completionRate * 0.85)));

    return {
      estimatedWeeks,
      targetCompletionEstimate: `~${months} months (${estimatedWeeks} weeks)`,
      currentPreparednessScore: preparednessScore,
      rationale: `Based on ${remainingUnits} remaining units at ${effectiveWeeklyHours} hrs/week (${velocityMultiplier.toFixed(2)}x velocity).`
    };
  }

  /**
   * Computes daily target pace and non-punitive missed workload reallocation
   */
  calculatePacingHealth(weeklyHours = 14, totalUnits = 30, completedUnits = 0, lastEngagedAt = null) {
    const remainingUnits = Math.max(0, totalUnits - completedUnits);
    // Assuming 5 active study days per week
    const studyDaysPerWeek = 5;
    const hoursPerDay = weeklyHours / studyDaysPerWeek;
    const dailyTargetUnits = Number((hoursPerDay / 2.0).toFixed(1)); // ~2 hrs per effort unit

    let driftUnits = 0;
    let status = 'OnPace';

    if (lastEngagedAt) {
      const daysSinceEngagement = (Date.now() - new Date(lastEngagedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceEngagement > 2) {
        // Missed days identified: workload is redistributed evenly over remaining horizon
        driftUnits = Number(Math.min(remainingUnits, (daysSinceEngagement - 1) * dailyTargetUnits).toFixed(1));
        status = 'Reallocated';
      }
    }

    return {
      dailyTargetUnits: Math.max(0.5, dailyTargetUnits),
      driftUnits,
      status
    };
  }

  /**
   * Dynamic adaptation triggered when student logs effort with mastery/confidence feedback
   */
  async adaptToEffortLog({ userId, topicId, confidenceScore = 3, unitsCovered = 1, durationMinutes = 45 }) {
    const roadmap = await Roadmap.findOne({ user: userId });
    const profile = await CareerProfile.findOne({ user: userId });
    const topic = await PreparationTopic.findById(topicId);

    if (!roadmap || !profile || !topic) return null;

    let velocityMultiplier = profile.cieDerived?.velocityMultiplier || 1.0;
    let adaptationReason = '';

    // 1. Evaluate Mastery & Velocity based on student's confidence and effort
    if (confidenceScore >= 4) {
      // High confidence: Faster mastery detected
      velocityMultiplier = Math.min(1.5, velocityMultiplier + 0.05);
      adaptationReason = `High mastery (${confidenceScore}/5) on ${topic.title}: accelerated subsequent workload`;

      // Scale down remaining units of next uncompleted topic in same category
      for (const phase of roadmap.phases) {
        if (phase.category === topic.category) {
          for (const item of phase.topics) {
            if (item.topic.toString() !== topicId.toString()) {
              const pendingProg = await PreparationProgress.findOne({
                user: userId,
                topic: item.topic,
                status: 'NotStarted'
              });

              if (pendingProg && pendingProg.totalAllocatedUnits > 1) {
                pendingProg.totalAllocatedUnits = Math.max(1, pendingProg.totalAllocatedUnits - 1);
                pendingProg.remainingUnits = pendingProg.totalAllocatedUnits;
                await pendingProg.save();
                item.allocatedEffortUnits = pendingProg.totalAllocatedUnits;
                break;
              }
            }
          }
        }
      }

      // Add to mastered skills
      await CareerProfile.findOneAndUpdate(
        { user: userId },
        { $addToSet: { 'cieDerived.masteredSkills': topic.title } }
      );
    } else if (confidenceScore <= 2) {
      // Struggling / low confidence: needs consolidation
      velocityMultiplier = Math.max(0.7, velocityMultiplier - 0.05);
      adaptationReason = `Low confidence (${confidenceScore}/5) on ${topic.title}: added reinforcement review buffer`;

      // Ensure current topic has remaining unit for consolidation
      const prog = await PreparationProgress.findOne({ user: userId, topic: topicId });
      if (prog && prog.remainingUnits === 0) {
        prog.totalAllocatedUnits += 1;
        prog.remainingUnits = 1;
        prog.status = 'InProgress';
        await prog.save();
      }
    } else {
      adaptationReason = `Steady progress logged on ${topic.title}`;
    }

    // 2. Recalculate Roadmap unit totals
    const allProgress = await PreparationProgress.find({ user: userId });
    const totalAllocated = allProgress.reduce((acc, p) => acc + (p.totalAllocatedUnits || 0), 0);
    const completed = allProgress.reduce((acc, p) => acc + (p.completedUnits || 0), 0);
    const remaining = Math.max(0, totalAllocated - completed);

    roadmap.totalAllocatedUnits = totalAllocated;
    roadmap.completedUnits = completed;
    roadmap.remainingUnits = remaining;
    roadmap.adaptationCount += 1;
    roadmap.lastAdaptedReason = adaptationReason;
    roadmap.lastAdaptedAt = new Date();
    await roadmap.save();

    // 3. Recalculate readiness horizon & pacing health
    const readinessHorizon = this.calculateReadinessHorizon({
      totalUnits: totalAllocated,
      completedUnits: completed,
      weeklyHours: profile.weeklyHours || 14,
      velocityMultiplier
    });

    const pacingHealth = this.calculatePacingHealth(
      profile.weeklyHours || 14,
      totalAllocated,
      completed,
      new Date()
    );

    await CareerProfile.findOneAndUpdate(
      { user: userId },
      {
        'cieDerived.readinessHorizon': readinessHorizon,
        'cieDerived.pacingHealth': pacingHealth,
        'cieDerived.velocityMultiplier': velocityMultiplier,
        'cieDerived.lastEvaluatedAt': new Date()
      }
    );

    return { roadmap, readinessHorizon, pacingHealth };
  }

  /**
   * Re-evaluates readiness when student updates weekly time or target domain
   */
  async adaptRoadmapToProfileChange(userId, newProfileData) {
    const profile = await CareerProfile.findOne({ user: userId });
    if (!profile) return null;

    if (newProfileData.targetDomain && newProfileData.targetDomain !== profile.targetDomain) {
      profile.targetDomain = newProfileData.targetDomain;
      if (newProfileData.dsaPreference) profile.dsaPreference = newProfileData.dsaPreference;
      await profile.save();

      // Full roadmap restructuring for new domain/priorities
      const updatedRoadmap = await this.generateBaselineRoadmap(userId, profile);
      return { roadmap: updatedRoadmap, restructured: true };
    }

    if (newProfileData.weeklyHours && newProfileData.weeklyHours !== profile.weeklyHours) {
      profile.weeklyHours = Number(newProfileData.weeklyHours);
      await profile.save();
    }

    const roadmap = await Roadmap.findOne({ user: userId });
    if (!roadmap) return null;

    const readinessHorizon = this.calculateReadinessHorizon({
      totalUnits: roadmap.totalAllocatedUnits,
      completedUnits: roadmap.completedUnits,
      weeklyHours: profile.weeklyHours,
      velocityMultiplier: profile.cieDerived?.velocityMultiplier || 1.0
    });

    const pacingHealth = this.calculatePacingHealth(
      profile.weeklyHours,
      roadmap.totalAllocatedUnits,
      roadmap.completedUnits
    );

    await CareerProfile.findOneAndUpdate(
      { user: userId },
      {
        'cieDerived.readinessHorizon': readinessHorizon,
        'cieDerived.pacingHealth': pacingHealth,
        'cieDerived.lastEvaluatedAt': new Date()
      }
    );

    roadmap.adaptationCount += 1;
    roadmap.lastAdaptedReason = `Adjusted study parameters: ${profile.weeklyHours} hrs/week`;
    roadmap.lastAdaptedAt = new Date();
    await roadmap.save();

    return { roadmap, readinessHorizon, pacingHealth };
  }

  /**
   * Compute CIE match score for an opportunity given student profile and actual completed progress.
   * Compares verified skills vs required skills to return genuine matchedSkills and skillGaps.
   */
  async calculateOpportunityMatch(opportunity, profile, user) {
    let score = 40;
    const reasons = [];

    // 1. Gather all student skills (verified completed topics + stated profile languages & interests)
    const completedProgress = await PreparationProgress.find({
      user: user?._id || profile?.user,
      status: 'Completed'
    }).populate('topic');

    const completedTopicNames = completedProgress
      .map(p => p.topic?.title?.toLowerCase() || '')
      .filter(Boolean);

    const completedCategories = completedProgress
      .map(p => p.topic?.category?.toLowerCase() || '')
      .filter(Boolean);

    const statedInterests = (profile?.interests || []).map(s => s.toLowerCase());
    const statedLanguages = (profile?.knownLanguages || []).map(s => s.toLowerCase());
    const studentSkillsPool = [...completedTopicNames, ...completedCategories, ...statedInterests, ...statedLanguages];

    // 2. Skill & Gap Analysis against Opportunity Required Skills
    const requiredSkills = opportunity.requiredSkills || [];
    const matchedSkills = [];
    const skillGaps = [];

    for (const req of requiredSkills) {
      const reqLower = req.toLowerCase();
      const isMatched = studentSkillsPool.some(s =>
        s.includes(reqLower) || reqLower.includes(s) ||
        (reqLower.includes('dsa') && studentSkillsPool.includes('dsa')) ||
        (reqLower.includes('sql') && (studentSkillsPool.includes('dbms') || studentSkillsPool.includes('databases'))) ||
        (reqLower.includes('react') && studentSkillsPool.some(s => s.includes('react') || s.includes('web')))
      );

      if (isMatched) {
        matchedSkills.push(req);
      } else {
        skillGaps.push(req);
      }
    }

    // 3. Domain alignment
    if (opportunity.domain === profile?.targetDomain || opportunity.domain === 'SoftwareEngineering') {
      score += 20;
      reasons.push(`Aligned with your ${profile?.targetDomain || 'Software Engineering'} track`);
    }

    // 4. Skills match scoring
    if (requiredSkills.length > 0) {
      const matchRatio = matchedSkills.length / requiredSkills.length;
      score += Math.round(matchRatio * 25);
      if (matchedSkills.length > 0) {
        reasons.push(`Verified skills: ${matchedSkills.slice(0, 3).join(', ')}`);
      }
      if (skillGaps.length > 0) {
        reasons.push(`Skill gaps to bridge: ${skillGaps.slice(0, 2).join(', ')}`);
      }
    }

    // 5. Graduation year eligibility
    if (user?.graduationYear && opportunity.targetGraduationYears?.includes(user.graduationYear)) {
      score += 15;
      reasons.push(`Direct eligibility for Class of ${user.graduationYear}`);
    }

    const finalScore = Math.min(98, Math.max(35, score));

    return {
      matchScore: finalScore,
      matchReasons: reasons.length > 0 ? reasons : ['Foundational Software Engineering match'],
      matchedSkills,
      skillGaps
    };
  }
}

module.exports = new CIEService();
