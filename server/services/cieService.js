const PreparationTopic = require('../models/PreparationTopic');
const PreparationProgress = require('../models/PreparationProgress');
const Roadmap = require('../models/Roadmap');
const CareerProfile = require('../models/CareerProfile');

class CIEService {
  /**
   * Generates a tailored adaptive roadmap for a student based on baseline profile calibration
   */
  async generateBaselineRoadmap(userId, profile) {
    const { targetDomain, weeklyHours, currentProficiency } = profile;

    // Fetch topics matching the domain or universal topics
    const topics = await PreparationTopic.find({
      domainRelevance: { $in: [targetDomain, 'All'] }
    }).sort({ order: 1 });

    if (!topics || topics.length === 0) {
      throw new Error('No curriculum topics found to build roadmap. Ensure database is seeded.');
    }

    // Group topics into logical categories / phases
    const categories = ['DSA', 'Development', 'OOP', 'DBMS', 'OS', 'SystemDesign', 'Projects', 'InterviewPrep'];
    const phases = [];
    let totalUnits = 0;

    let phaseOrder = 1;
    for (const cat of categories) {
      const catTopics = topics.filter(t => t.category === cat);
      if (catTopics.length > 0) {
        const phaseTopicItems = [];

        for (const topic of catTopics) {
          // Adjust allocated units dynamically based on student self-assessed proficiency
          let units = topic.allocatedEffortUnits;
          const proficiencyKey = cat === 'DSA' ? 'dsa' : (cat === 'Development' || cat === 'Projects') ? 'development' : (cat === 'SystemDesign') ? 'systemDesign' : 'coreCS';
          const profLevel = currentProficiency?.[proficiencyKey] || 'Beginner';

          if (profLevel === 'Advanced') {
            units = Math.max(1, Math.round(units * 0.6)); // Faster pace for advanced
          } else if (profLevel === 'Beginner') {
            units = Math.round(units * 1.2); // More foundational time
          }

          totalUnits += units;
          phaseTopicItems.push({
            topic: topic._id,
            title: topic.title,
            slug: topic.slug,
            allocatedEffortUnits: units,
            priority: (cat === 'DSA' || cat === 'Development') ? 'Critical' : 'High'
          });

          // Ensure PreparationProgress record exists for each topic
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
            { upsert: true, new: true }
          );
        }

        phases.push({
          title: `${cat} Mastery Phase`,
          category: cat,
          order: phaseOrder++,
          topics: phaseTopicItems
        });
      }
    }

    // Create or update active Roadmap
    const roadmap = await Roadmap.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        targetDomain,
        status: 'Active',
        phases,
        totalAllocatedUnits: totalUnits,
        completedUnits: 0,
        remainingUnits: totalUnits,
        adaptationCount: 0,
        lastAdaptedReason: 'Baseline profile calibration completed',
        lastAdaptedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Compute initial readiness horizon
    const readinessHorizon = this.calculateReadinessHorizon({
      totalUnits,
      completedUnits: 0,
      weeklyHours: weeklyHours || 14
    });

    // Update CareerProfile cieDerived
    await CareerProfile.findOneAndUpdate(
      { user: userId },
      {
        'cieDerived.readinessHorizon': readinessHorizon,
        'cieDerived.focusRecommendation': {
          primaryCategory: 'DSA',
          reason: 'Mastering foundational algorithmic patterns'
        },
        'cieDerived.lastEvaluatedAt': new Date()
      }
    );

    return roadmap;
  }

  /**
   * Calculates realistic readiness horizon based on total remaining workload and weekly availability.
   * Workload-based, never promises fixed placement dates.
   */
  calculateReadinessHorizon({ totalUnits, completedUnits, weeklyHours }) {
    const remainingUnits = Math.max(0, totalUnits - completedUnits);
    const avgHoursPerUnit = 2.0; // ~2 hours of focused study per effort unit
    const totalRemainingHours = remainingUnits * avgHoursPerUnit;
    const effectiveWeeklyHours = Math.max(2, weeklyHours || 14);

    const estimatedWeeks = Math.ceil(totalRemainingHours / effectiveWeeklyHours);
    const months = (estimatedWeeks / 4.33).toFixed(1);

    const completionRate = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;
    const preparednessScore = Math.min(100, Math.round(15 + (completionRate * 0.85)));

    return {
      estimatedWeeks,
      targetCompletionEstimate: `~${months} months (${estimatedWeeks} weeks)`,
      currentPreparednessScore: preparednessScore,
      rationale: `Based on ${remainingUnits} remaining workload units (${totalRemainingHours} planned hours) at ${effectiveWeeklyHours} hrs/week.`
    };
  }

  /**
   * Re-evaluates readiness when student updates weekly time or target domain
   */
  async adaptRoadmapToTimeChange(userId, newWeeklyHours) {
    const roadmap = await Roadmap.findOne({ user: userId });
    if (!roadmap) return null;

    const readinessHorizon = this.calculateReadinessHorizon({
      totalUnits: roadmap.totalAllocatedUnits,
      completedUnits: roadmap.completedUnits,
      weeklyHours: newWeeklyHours
    });

    await CareerProfile.findOneAndUpdate(
      { user: userId },
      {
        weeklyHours: newWeeklyHours,
        'cieDerived.readinessHorizon': readinessHorizon,
        'cieDerived.lastEvaluatedAt': new Date()
      }
    );

    roadmap.adaptationCount += 1;
    roadmap.lastAdaptedReason = `Adjusted study velocity to ${newWeeklyHours} hrs/week`;
    roadmap.lastAdaptedAt = new Date();
    await roadmap.save();

    return { roadmap, readinessHorizon };
  }

  /**
   * Compute CIE match score for an opportunity given a student profile
   */
  calculateOpportunityMatch(opportunity, profile, user) {
    let score = 50;
    const reasons = [];

    // 1. Domain match
    if (opportunity.domain === profile.targetDomain || opportunity.domain === 'SoftwareEngineering') {
      score += 25;
      reasons.push(`Direct alignment with your ${profile.targetDomain} career path`);
    }

    // 2. Skills match
    const studentInterests = (profile.interests || []).map(s => s.toLowerCase());
    const studentLanguages = (profile.knownLanguages || []).map(s => s.toLowerCase());
    const studentSkills = [...studentInterests, ...studentLanguages];

    const matchedReqs = (opportunity.requiredSkills || []).filter(skill =>
      studentSkills.some(s => s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))
    );

    if (matchedReqs.length > 0) {
      score += Math.min(20, matchedReqs.length * 7);
      reasons.push(`Matches your skills in ${matchedReqs.join(', ')}`);
    }

    // 3. Graduation year eligibility
    if (user?.graduationYear && opportunity.targetGraduationYears?.includes(user.graduationYear)) {
      score += 10;
      reasons.push(`Targeted for Class of ${user.graduationYear} graduates`);
    }

    // Cap score at 98 max
    const finalScore = Math.min(98, Math.max(35, score));
    return {
      matchScore: finalScore,
      matchReasons: reasons.length > 0 ? reasons : ['General Software Engineering foundational match']
    };
  }
}

module.exports = new CIEService();
