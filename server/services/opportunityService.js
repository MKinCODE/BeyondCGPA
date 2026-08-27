const crypto = require('crypto');
const Opportunity = require('../models/Opportunity');
const OpportunityMatch = require('../models/OpportunityMatch');
const CareerProfile = require('../models/CareerProfile');
const User = require('../models/User');
const cieService = require('./cieService');

class OpportunityService {
  /**
   * Generates a deterministic deduplication hash
   */
  generateDeduplicationHash({ company, title, location, type }) {
    const raw = `${company.toLowerCase().trim()}_${title.toLowerCase().trim()}_${location.toLowerCase().trim()}_${type.toLowerCase().trim()}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Ingests, normalizes, validates, and deduplicates an opportunity item
   */
  async ingestOpportunity(rawItem) {
    // Normalization
    const normalized = {
      source: rawItem.source || 'StructuredExternal',
      sourceId: String(rawItem.sourceId || rawItem.id || `ext-${Date.now()}-${Math.random()}`),
      title: (rawItem.title || '').trim(),
      company: (rawItem.company || '').trim(),
      companyLogo: rawItem.companyLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(rawItem.company || 'tech')}`,
      location: rawItem.location || 'Remote / India',
      type: ['Internship', 'FullTime', 'EarlyCareer'].includes(rawItem.type) ? rawItem.type : 'Internship',
      workplaceType: ['Remote', 'Hybrid', 'Onsite'].includes(rawItem.workplaceType) ? rawItem.workplaceType : 'Remote',
      domain: rawItem.domain || 'SoftwareEngineering',
      targetGraduationYears: rawItem.targetGraduationYears || [2025, 2026, 2027, 2028],
      description: rawItem.description || 'Exciting software engineering role working on scalable systems.',
      responsibilities: rawItem.responsibilities || ['Design and implement features', 'Write clean unit tests', 'Collaborate with senior engineers'],
      requiredSkills: rawItem.requiredSkills || ['JavaScript', 'Data Structures', 'Problem Solving'],
      preferredSkills: rawItem.preferredSkills || ['React', 'Node.js', 'Docker'],
      applyUrl: rawItem.applyUrl || 'https://jobs.lever.co/example',
      salaryRange: rawItem.salaryRange || '₹40,000 - ₹80,000 / month',
      deadline: rawItem.deadline ? new Date(rawItem.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      postedDate: rawItem.postedDate ? new Date(rawItem.postedDate) : new Date(),
      isActive: true
    };

    // Validation
    if (!normalized.title || !normalized.company || !normalized.applyUrl) {
      throw new Error('Invalid opportunity: Missing title, company, or applyUrl');
    }

    normalized.deduplicationHash = this.generateDeduplicationHash(normalized);

    // Upsert / Deduplicate
    const opportunity = await Opportunity.findOneAndUpdate(
      { deduplicationHash: normalized.deduplicationHash },
      { $set: normalized },
      { upsert: true, new: true }
    );

    return opportunity;
  }

  /**
   * Generates student-specific opportunity feed with CIE match scores
   */
  async getStudentOpportunityFeed(userId, filters = {}) {
    const user = await User.findById(userId);
    const profile = await CareerProfile.findOne({ user: userId });

    const query = { isActive: true };
    if (filters.type && filters.type !== 'All') {
      query.type = filters.type;
    }
    if (filters.workplaceType && filters.workplaceType !== 'All') {
      query.workplaceType = filters.workplaceType;
    }

    const opportunities = await Opportunity.find(query).sort({ postedDate: -1 });

    // Match with user
    const existingMatches = await OpportunityMatch.find({ user: userId });
    const matchMap = new Map(existingMatches.map(m => [m.opportunity.toString(), m]));

    const feed = [];
    for (const opp of opportunities) {
      let match = matchMap.get(opp._id.toString());

      if (!match) {
        // Calculate CIE match score
        const { matchScore, matchReasons } = cieService.calculateOpportunityMatch(opp, profile || {}, user);
        match = await OpportunityMatch.create({
          user: userId,
          opportunity: opp._id,
          matchScore,
          matchReasons,
          status: 'Discovered'
        });
      }

      feed.push({
        opportunity: opp,
        matchScore: match.matchScore,
        matchReasons: match.matchReasons,
        status: match.status,
        studentNotes: match.studentNotes,
        appliedDate: match.appliedDate
      });
    }

    // Sort by CIE match score descending
    feed.sort((a, b) => b.matchScore - a.matchScore);

    return feed;
  }

  /**
   * Update application tracking status
   */
  async updateApplicationStatus(userId, opportunityId, { status, notes }) {
    let match = await OpportunityMatch.findOne({ user: userId, opportunity: opportunityId });
    if (!match) {
      const opp = await Opportunity.findById(opportunityId);
      const user = await User.findById(userId);
      const profile = await CareerProfile.findOne({ user: userId });
      const { matchScore, matchReasons } = cieService.calculateOpportunityMatch(opp, profile || {}, user);

      match = new OpportunityMatch({
        user: userId,
        opportunity: opportunityId,
        matchScore,
        matchReasons
      });
    }

    match.status = status || match.status;
    if (notes !== undefined) match.studentNotes = notes;
    if (status === 'Applied' && !match.appliedDate) {
      match.appliedDate = new Date();
    }

    await match.save();
    return match;
  }
}

module.exports = new OpportunityService();
