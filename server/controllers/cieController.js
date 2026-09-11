const CareerProfile = require('../models/CareerProfile');
const Roadmap = require('../models/Roadmap');
const PreparationProgress = require('../models/PreparationProgress');
const cieService = require('../services/cieService');

/**
 * Get comprehensive Career Intelligence Engine analysis
 */
const getReadinessAnalysis = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await CareerProfile.findOne({ user: userId });
    const roadmap = await Roadmap.findOne({ user: userId });
    const progressList = await PreparationProgress.find({ user: userId }).populate('topic');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Career profile not found' });
    }

    const totalAllocated = roadmap?.totalAllocatedUnits || 0;
    const completed = roadmap?.completedUnits || 0;
    const remaining = roadmap?.remainingUnits || totalAllocated;
    const velocityMultiplier = profile.cieDerived?.velocityMultiplier || 1.0;

    const readinessHorizon = cieService.calculateReadinessHorizon({
      totalUnits: totalAllocated,
      completedUnits: completed,
      weeklyHours: profile.weeklyHours || 14,
      velocityMultiplier
    });

    const pacingHealth = cieService.calculatePacingHealth(
      profile.weeklyHours || 14,
      totalAllocated,
      completed,
      progressList[0]?.lastEngagedAt
    );

    // Compute category level breakdown
    const categoryStats = {};
    progressList.forEach(p => {
      if (p.topic) {
        const cat = p.topic.category;
        if (!categoryStats[cat]) {
          categoryStats[cat] = { total: 0, completed: 0, remaining: 0 };
        }
        categoryStats[cat].total += p.totalAllocatedUnits;
        categoryStats[cat].completed += p.completedUnits;
        categoryStats[cat].remaining += p.remainingUnits;
      }
    });

    res.status(200).json({
      success: true,
      analysis: {
        targetDomain: profile.targetDomain,
        dsaPreference: profile.dsaPreference,
        weeklyHours: profile.weeklyHours,
        readinessHorizon,
        pacingHealth,
        velocityMultiplier,
        focusRecommendation: profile.cieDerived?.focusRecommendation,
        masteredSkills: profile.cieDerived?.masteredSkills || [],
        totalAllocatedUnits: totalAllocated,
        completedUnits: completed,
        remainingUnits: remaining,
        categoryStats,
        lastAdaptedAt: roadmap?.lastAdaptedAt,
        adaptationReason: roadmap?.lastAdaptedReason
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReadinessAnalysis
};
