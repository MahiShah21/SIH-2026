import { query, isNeonConnected, memoryStore } from '../config/db.js';

/**
 * GET /api/stats/overview
 * Platform KPIs and counts across Jharkhand
 */
export async function getStatsOverview(req, res, next) {
  try {
    let problemCount = 0;
    let challengeCount = 0;
    let projectCount = 0;
    let verifiedCount = 0;

    if (isNeonConnected()) {
      try {
        const pRes = await query('SELECT count(*) as total, count(*) FILTER (WHERE is_real = true) as verified FROM problems');
        const cRes = await query('SELECT count(*) as total FROM challenges');
        const prRes = await query('SELECT count(*) as total FROM projects');

        problemCount = parseInt(pRes.rows[0]?.total || 0, 10);
        verifiedCount = parseInt(pRes.rows[0]?.verified || 0, 10);
        challengeCount = parseInt(cRes.rows[0]?.total || 0, 10);
        projectCount = parseInt(prRes.rows[0]?.total || 0, 10);
      } catch (e) {
        problemCount = memoryStore.problems.length;
        verifiedCount = memoryStore.problems.filter(p => p.is_real).length;
        challengeCount = memoryStore.challenges.length;
        projectCount = memoryStore.projects.length;
      }
    } else {
      problemCount = memoryStore.problems.length;
      verifiedCount = memoryStore.problems.filter(p => p.is_real).length;
      challengeCount = memoryStore.challenges.length;
      projectCount = memoryStore.projects.length;
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalGrievances: problemCount,
        aiVerifiedProblems: verifiedCount,
        activeGrandChallenges: challengeCount,
        ongoingResearchProjects: projectCount,
        totalStateGrantsSanctioned: '₹12.4 Cr',
        districtsCovered: 24,
        beneficiariesImpacted: '14,200+'
      }
    });
  } catch (err) {
    next(err);
  }
}
