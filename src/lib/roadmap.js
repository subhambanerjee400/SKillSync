/**
 * ============================================================================
 * SkillSync Deterministic Skill Roadmap Engine
 * ============================================================================
 * 
 * Generates an ordered, step-based learning path towards full role readiness,
 * visually inspired by roadmap.sh:
 * 
 * 1. "done": Competencies already mastered by the user (matchedSkills).
 * 2. "next": The single highest-weight missing skill (most critical/impactful).
 * 3. "upcoming": Remaining missing skills ordered by descending weight & market trajectory.
 * ============================================================================
 */

function normalize(str) {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/[\.\-_]/g, '').replace(/\s+/g, ' ');
}

/**
 * Generates an ordered sequence of roadmap milestones.
 *
 * @param {string[]} matchedSkills - User's currently acquired skills
 * @param {string[]} missingSkills - Gaps needed for target role
 * @param {Array<{name: string, weight: number, demandStatus: string}>} requiredSkillsForRole - Target role matrix
 * @returns {Array<{
 *   skill: string,
 *   status: "done" | "next" | "upcoming",
 *   weight: number,
 *   demandStatus: string
 * }>}
 */
export function generateRoadmap(matchedSkills = [], missingSkills = [], requiredSkillsForRole = []) {
  // Create quick lookup map for required skill metadata (weight, demandStatus)
  const reqMap = new Map();
  if (Array.isArray(requiredSkillsForRole)) {
    for (const req of requiredSkillsForRole) {
      if (req && req.name) {
        reqMap.set(normalize(req.name), req);
      }
    }
  }

  // 1. Process "done" skills (skills already matched)
  const doneSteps = (Array.isArray(matchedSkills) ? matchedSkills : []).map((skillName) => {
    const meta = reqMap.get(normalize(skillName));
    return {
      skill: meta ? meta.name : skillName,
      status: 'done',
      weight: typeof meta?.weight === 'number' ? meta.weight : 5,
      demandStatus: meta?.demandStatus || 'stable',
    };
  });

  // 2. Process missing skills with metadata
  const missingCandidates = (Array.isArray(missingSkills) ? missingSkills : []).map((skillName) => {
    const meta = reqMap.get(normalize(skillName));
    return {
      skill: meta ? meta.name : skillName,
      weight: typeof meta?.weight === 'number' ? meta.weight : 5,
      demandStatus: meta?.demandStatus || 'stable',
    };
  });

  // 3. Sort missing skills by weight descending (highest impact first; tiebreak on 'rising' status)
  missingCandidates.sort((a, b) => {
    if (b.weight !== a.weight) {
      return b.weight - a.weight;
    }
    if (a.demandStatus === 'rising' && b.demandStatus !== 'rising') return -1;
    if (b.demandStatus === 'rising' && a.demandStatus !== 'rising') return 1;
    return a.skill.localeCompare(b.skill);
  });

  // 4. Assign single highest-weight missing skill as "next", rest as "upcoming"
  const pendingSteps = missingCandidates.map((candidate, index) => ({
    skill: candidate.skill,
    status: index === 0 ? 'next' : 'upcoming',
    weight: candidate.weight,
    demandStatus: candidate.demandStatus,
  }));

  return [...doneSteps, ...pendingSteps];
}
