const User = require('../models/User');
const CareerProfile = require('../models/CareerProfile');
const cieService = require('../services/cieService');
const onboardingEngine = require('../services/onboardingEngine');
const Notification = require('../models/Notification');

/**
 * Get next dynamic onboarding question based on previous responses
 */
const getNextOnboardingQuestion = async (req, res, next) => {
  try {
    const answers = req.body.answers || {};
    const question = onboardingEngine.getNextQuestion(answers);
    const gradYears = onboardingEngine.getDynamicGraduationYears();

    res.status(200).json({
      success: true,
      question,
      graduationYears: gradYears
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit dynamic onboarding questionnaire
 */
const submitOnboarding = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      targetDomain,
      dsaPreference,
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

    // 2. Synthesize or update CareerProfile
    let profile = await CareerProfile.findOne({ user: userId });
    if (!profile) {
      profile = new CareerProfile({ user: userId });
    }

    // If dynamic rawAnswers provided, allow engine synthesis to fill any missing structured fields
    const synthesized = await onboardingEngine.synthesizeProfile(rawAnswers || req.body);

    profile.targetDomain = targetDomain || synthesized.targetDomain || 'Fullstack';
    profile.dsaPreference = dsaPreference || synthesized.dsaPreference || 'Balanced';
    profile.weeklyHours = Number(weeklyHours || synthesized.weeklyHours || 14);
    profile.preferredPace = preferredPace || synthesized.preferredPace || 'Balanced';
    profile.currentProficiency = currentProficiency || synthesized.currentProficiency;
    profile.targetCompaniesCategory = targetCompaniesCategory || synthesized.targetCompaniesCategory;
    profile.interests = (interests && interests.length > 0) ? interests : synthesized.interests;
    profile.knownLanguages = (knownLanguages && knownLanguages.length > 0) ? knownLanguages : synthesized.knownLanguages;
    profile.rawAnswers = rawAnswers || req.body;

    profile.selfReportedSkills = synthesized.selfReportedSkills || [];
    profile.selfReportedExperience = synthesized.selfReportedExperience || {};
    profile.estimatedProficiency = synthesized.estimatedProficiency || synthesized.currentProficiency;

    if (!profile.cieDerived) profile.cieDerived = {};
    if (!profile.cieDerived.masteredSkills) profile.cieDerived.masteredSkills = [];

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
 * Update career preferences (e.g. changing weekly hours, target domain, or DSA preference)
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { weeklyHours, targetDomain, dsaPreference, targetCompaniesCategory, knownLanguages, interests } = req.body;

    const profile = await CareerProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Career profile not found' });
    }

    if (targetCompaniesCategory) profile.targetCompaniesCategory = targetCompaniesCategory;
    if (knownLanguages) profile.knownLanguages = knownLanguages;
    if (interests) profile.interests = interests;
    if (dsaPreference) profile.dsaPreference = dsaPreference;

    await profile.save();

    // Trigger CIE profile change adaptation (dynamically restructures roadmap or adjusts velocity)
    const adaptationResult = await cieService.adaptRoadmapToProfileChange(userId, {
      targetDomain,
      weeklyHours,
      dsaPreference
    });

    const updatedProfile = await CareerProfile.findOne({ user: userId });

    res.status(200).json({
      success: true,
      message: 'Career profile and CIE calibration updated successfully.',
      profile: updatedProfile,
      roadmap: adaptationResult?.roadmap
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNextOnboardingQuestion,
  submitOnboarding,
  getProfile,
  updateProfile
};
