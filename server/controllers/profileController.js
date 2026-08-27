const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const cieService = require('../services/cieService');
const Notification = require('../models/Notification');

/**
 * Submit dynamic onboarding questionnaire
 */
const submitOnboarding = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      targetDomain,
      targetCompaniesCategory,
      weeklyHours,
      preferredPace,
      currentProficiency,
      interests,
      knownLanguages,
      college,
      branch,
      graduationYear,
      rawAnswers
    } = req.body;

    // 1. Update user baseline details
    const user = await User.findById(userId);
    if (college) user.college = college;
    if (branch) user.branch = branch;
    if (graduationYear) user.graduationYear = Number(graduationYear);
    user.onboardingCompleted = true;
    await user.save();

    // 2. Update CareerProfile preserving raw answers distinctly from structured data
    let profile = await CareerProfile.findOne({ user: userId });
    if (!profile) {
      profile = new CareerProfile({ user: userId });
    }

    profile.targetDomain = targetDomain || profile.targetDomain || 'Fullstack';
    if (targetCompaniesCategory) profile.targetCompaniesCategory = targetCompaniesCategory;
    if (weeklyHours) profile.weeklyHours = Number(weeklyHours);
    if (preferredPace) profile.preferredPace = preferredPace;
    if (currentProficiency) profile.currentProficiency = currentProficiency;
    if (interests) profile.interests = interests;
    if (knownLanguages) profile.knownLanguages = knownLanguages;
    if (rawAnswers) profile.rawAnswers = rawAnswers;

    await profile.save();

    // 3. Trigger CIE to orchestrate baseline roadmap & readiness horizon
    const roadmap = await cieService.generateBaselineRoadmap(userId, profile);

    // 4. Create welcome notification
    await Notification.create({
      user: userId,
      title: 'Career Intelligence Engine Activated',
      message: `Your adaptive roadmap for ${profile.targetDomain} is ready with ${roadmap.totalAllocatedUnits} total workload units.`,
      type: 'RoadmapMilestone',
      link: '/dashboard/roadmap'
    });

    const updatedProfile = await CareerProfile.findOne({ user: userId });

    res.status(200).json({
      success: true,
      message: 'Onboarding completed and adaptive roadmap generated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        onboardingCompleted: user.onboardingCompleted
      },
      profile: updatedProfile,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get profile and CIE derived state
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await CareerProfile.findOne({ user: req.user._id });
    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update career preferences (e.g. changing weekly hours or target domain)
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { weeklyHours, targetDomain, targetCompaniesCategory, knownLanguages, interests } = req.body;

    const profile = await CareerProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Career profile not found' });
    }

    let hoursChanged = false;
    let domainChanged = false;

    if (weeklyHours && Number(weeklyHours) !== profile.weeklyHours) {
      profile.weeklyHours = Number(weeklyHours);
      hoursChanged = true;
    }

    if (targetDomain && targetDomain !== profile.targetDomain) {
      profile.targetDomain = targetDomain;
      domainChanged = true;
    }

    if (targetCompaniesCategory) profile.targetCompaniesCategory = targetCompaniesCategory;
    if (knownLanguages) profile.knownLanguages = knownLanguages;
    if (interests) profile.interests = interests;

    await profile.save();

    let roadmap;
    if (domainChanged) {
      // Re-generate roadmap for new domain
      roadmap = await cieService.generateBaselineRoadmap(userId, profile);
    } else if (hoursChanged) {
      // Adapt readiness horizon for adjusted time
      const result = await cieService.adaptRoadmapToTimeChange(userId, profile.weeklyHours);
      roadmap = result.roadmap;
    }

    const updatedProfile = await CareerProfile.findOne({ user: userId });

    res.status(200).json({
      success: true,
      message: 'Profile updated and CIE adaptations synced.',
      profile: updatedProfile,
      roadmap
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitOnboarding,
  getProfile,
  updateProfile
};
