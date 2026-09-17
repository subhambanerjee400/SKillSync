import { RECOMMENDATIONS } from '../data/recommendations.js';
import { TRADE_INSTITUTES, ROLE_REQUIRED_SKILLS, GOVT_SKILL_PORTALS } from '../data/demoData.js';

/**
 * Normalizes strings for robust, case-insensitive matching.
 */
function normalize(str) {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/[\.\-_]/g, '').replace(/\s+/g, ' ');
}

// Curated comprehensive software courses mapped to industry skills
export const SOFTWARE_COURSES = [
  {
    id: 'course-fullstack-react-ts',
    title: 'Enterprise React, TypeScript & REST Architecture',
    provider: 'Frontend Masters',
    skillsCovered: ['React', 'TypeScript', 'REST APIs', 'Git', 'Testing'],
    duration: '16 hrs',
    url: 'https://frontendmasters.com/courses/enterprise-react-typescript/',
    demandRelevance: 'rising',
    role: 'Frontend Developer',
  },
  {
    id: 'course-modern-frontend-core',
    title: 'Modern Frontend Foundations: HTML, CSS & JavaScript',
    provider: 'freeCodeCamp',
    skillsCovered: ['HTML', 'CSS', 'JavaScript', 'Git'],
    duration: '22 hrs',
    url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/',
    demandRelevance: 'stable',
    role: 'Frontend Developer',
  },
  {
    id: 'course-sql-python-data',
    title: 'Practical SQL & Python for Data Analytics',
    provider: 'Kaggle & freeCodeCamp',
    skillsCovered: ['SQL', 'Python for Data Analysis', 'Statistics Basics', 'MS Excel'],
    duration: '18 hrs',
    url: 'https://www.kaggle.com/learn/intro-to-sql',
    demandRelevance: 'rising',
    role: 'Data Analyst',
  },
  {
    id: 'course-powerbi-tableau-viz',
    title: 'Interactive Data Visualization with Power BI & Tableau',
    provider: 'Microsoft Learn',
    skillsCovered: ['Data Visualization (Power BI/Tableau)', 'MS Excel', 'Statistics Basics'],
    duration: '14 hrs',
    url: 'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/',
    demandRelevance: 'rising',
    role: 'Data Analyst',
  },
  {
    id: 'course-figma-design-systems',
    title: 'Figma Auto-Layout, Components & Design Systems',
    provider: 'Figma Academy',
    skillsCovered: ['Figma', 'Design Systems', 'Prototyping', 'Wireframing'],
    duration: '12 hrs',
    url: 'https://help.figma.com/hc/en-us/categories/360002051613-Figma-tutorials',
    demandRelevance: 'rising',
    role: 'UI/UX Designer',
  },
  {
    id: 'course-ux-research-wireframing',
    title: 'User Research Methods & Rapid Wireframing',
    provider: 'Google Career Certificates',
    skillsCovered: ['User Research', 'Wireframing', 'Prototyping'],
    duration: '20 hrs',
    url: 'https://grow.google/certificates/ux-design/',
    demandRelevance: 'rising',
    role: 'UI/UX Designer',
  },
  {
    id: 'course-performance-marketing-ga4',
    title: 'Performance Marketing (Google & Meta Ads) + GA4 Mastery',
    provider: 'Google Skillshop',
    skillsCovered: ['Performance Marketing (Google/Meta Ads)', 'Analytics Tools (GA4)', 'SEO'],
    duration: '15 hrs',
    url: 'https://skillshop.exceedlms.com/student/catalog/browse',
    demandRelevance: 'rising',
    role: 'Digital Marketing Specialist',
  },
  {
    id: 'course-inbound-seo-ai-marketing',
    title: 'Inbound SEO, Social Media & Generative AI Marketing',
    provider: 'HubSpot Academy',
    skillsCovered: ['SEO', 'AI Marketing Tools', 'Social Media Posting'],
    duration: '10 hrs',
    url: 'https://academy.hubspot.com/courses/seo-training',
    demandRelevance: 'rising',
    role: 'Digital Marketing Specialist',
  },
];

/**
 * Generate course recommendations for Software users.
 *
 * @param {string[]} missingSkills - from scoring engine
 * @param {string[]} risingMissingSkills - from scoring engine
 * @param {string} targetRole - user's target role
 * @returns {Array} Top 3-5 qualifying courses with explanation
 */
export function generateCourseRecommendations(missingSkills = [], risingMissingSkills = [], targetRole = '') {
  if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
    return [];
  }

  const missingNormSet = new Set(missingSkills.map(normalize));
  const risingNormSet = new Set(risingMissingSkills.map(normalize));

  // 1. Filter courses with at least 1 overlapping missing skill
  const qualifyingCourses = [];

  for (const course of SOFTWARE_COURSES) {
    const overlappingSkills = (course.skillsCovered || []).filter((skill) =>
      missingNormSet.has(normalize(skill))
    );

    if (overlappingSkills.length === 0) continue;

    const overlappingRising = overlappingSkills.filter((skill) =>
      risingNormSet.has(normalize(skill))
    );

    const isTargetRoleDirect =
      course.role && targetRole && normalize(course.role) === normalize(targetRole);

    // Build deterministic explanation template
    const skillListStr = overlappingSkills.slice(0, 3).join(', ');
    const risingCount = overlappingRising.length;
    const explanation = `Covers ${overlappingSkills.length} of your missing skills (${skillListStr})${
      risingCount > 0 ? `, including ${risingCount} rising-demand skill(s)` : ''
    }.`;

    qualifyingCourses.push({
      ...course,
      overlappingCount: overlappingSkills.length,
      risingOverlapCount: risingCount,
      isTargetRoleDirect,
      overlappingSkills,
      description: explanation,
      link: course.url,
    });
  }

  // 2. Deterministic ranking:
  // Primary: missingSkills overlap count (descending)
  // Secondary: risingMissingSkills overlap count (descending)
  // Tertiary: role alignment (descending)
  qualifyingCourses.sort((a, b) => {
    if (b.overlappingCount !== a.overlappingCount) {
      return b.overlappingCount - a.overlappingCount;
    }
    if (b.risingOverlapCount !== a.risingOverlapCount) {
      return b.risingOverlapCount - a.risingOverlapCount;
    }
    return (b.isTargetRoleDirect ? 1 : 0) - (a.isTargetRoleDirect ? 1 : 0);
  });

  return qualifyingCourses.slice(0, 5);
}

/**
 * Generate trade-professional training recommendations.
 *
 * @param {string[]} missingSkills - from scoring engine
 * @param {object} profile - user profile with role/trade and location
 * @returns {{ recommendations: Array, govtPortals: Array, disclaimer: string|null, notice: string|null, isFallback: boolean }}
 */
export function generateTradeRecommendations(missingSkills = [], profile = {}) {
  const userTrade = profile?.role || '';
  const userLocation = (profile?.location || '').trim();
  const normLoc = userLocation.toLowerCase();

  if (!userTrade) {
    return { recommendations: [], govtPortals: [], disclaimer: null, notice: null, isFallback: false };
  }

  // Location analysis: check if location indicates Kolkata or West Bengal
  const isKolkataOrWB =
    normLoc.includes('kolkata') ||
    normLoc.includes('calcutta') ||
    normLoc.includes('west bengal') ||
    normLoc.includes('howrah') ||
    (/\b(wb|w\.b\.|bengal)\b/.test(normLoc) && !normLoc.includes('bengaluru'));

  // Major cities and states outside West Bengal
  const outsideWBCities = [
    'bengaluru', 'bangalore', 'mumbai', 'delhi', 'new delhi', 'pune', 'chennai', 'hyderabad',
    'bhubaneswar', 'cuttack', 'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'indore',
    'bhopal', 'nagpur', 'coimbatore', 'kochi', 'visakhapatnam', 'surat', 'patna',
    'vadodara', 'guwahati', 'dehradun', 'thiruvananthapuram', 'ranchi', 'noida', 'gurugram', 'gurgaon',
  ];

  const outsideWBStates = [
    'karnataka', 'maharashtra', 'odisha', 'orissa', 'tamil nadu', 'telangana', 'andhra',
    'gujarat', 'rajasthan', 'uttar pradesh', 'madhya pradesh', 'kerala', 'bihar',
    'punjab', 'haryana', 'jharkhand', 'assam', 'uttarakhand',
  ];

  const isOutsideWB =
    !isKolkataOrWB &&
    normLoc !== '' &&
    (outsideWBCities.some((city) => normLoc.includes(city)) ||
      outsideWBStates.some((st) => normLoc.includes(st)));

  const missingNormSet = new Set((missingSkills || []).map(normalize));

  // 1. Trade match (exact match, case-insensitive)
  let tradeInstitutes = (TRADE_INSTITUTES || []).filter(
    (inst) => normalize(inst.trade) === normalize(userTrade)
  );

  // Requirement: "don't show WB-specific institutes to users outside WB"
  if (isOutsideWB) {
    tradeInstitutes = tradeInstitutes.filter(
      (inst) =>
        !inst.city?.toLowerCase().includes('kolkata') &&
        !inst.state?.toLowerCase().includes('west bengal') &&
        !inst.name?.toLowerCase().includes('west bengal')
    );
  }

  // 2. Skill gap overlap
  const skillMatchingInstitutes = [];
  for (const inst of tradeInstitutes) {
    const overlappingSkills = (inst.skillsOffered || []).filter((s) =>
      missingNormSet.has(normalize(s))
    );
    if (overlappingSkills.length > 0 || missingSkills.length === 0) {
      skillMatchingInstitutes.push({
        ...inst,
        overlappingSkills: overlappingSkills.length > 0 ? overlappingSkills : inst.skillsOffered,
        targetSkill:
          overlappingSkills[0] ||
          (inst.skillsOffered ? inst.skillsOffered[0] : 'trade proficiency'),
      });
    }
  }

  // 3. Location check
  let finalInstitutes = [];
  let isCityFiltered = false;

  if (normLoc) {
    if (isKolkataOrWB) {
      finalInstitutes = skillMatchingInstitutes.filter(
        (inst) =>
          inst.city?.toLowerCase().includes('kolkata') ||
          inst.state?.toLowerCase().includes('west bengal')
      );
      isCityFiltered = true;
    } else {
      const cityMatches = skillMatchingInstitutes.filter(
        (inst) =>
          normLoc.includes(inst.city.toLowerCase()) ||
          inst.city.toLowerCase().includes(normLoc)
      );

      if (cityMatches.length > 0) {
        finalInstitutes = cityMatches;
        isCityFiltered = true;
      } else if (!isOutsideWB) {
        // Default fallback if no city-specific match is found and location is not outside WB
        finalInstitutes = skillMatchingInstitutes.filter((inst) =>
          inst.city?.toLowerCase().includes('kolkata')
        );
        isCityFiltered = false;
      } else {
        // User is known to be outside WB and has no local city institute
        finalInstitutes = [];
        isCityFiltered = false;
      }
    }
  } else {
    // Default fallback if no location is specified
    finalInstitutes = skillMatchingInstitutes.filter((inst) =>
      inst.city?.toLowerCase().includes('kolkata')
    );
    if (finalInstitutes.length === 0) {
      finalInstitutes = skillMatchingInstitutes;
    }
    isCityFiltered = false;
  }

  // Check if Kolkata / WB recommendations are being shown
  const isWBResult =
    isKolkataOrWB ||
    (!isOutsideWB &&
      finalInstitutes.some(
        (inst) =>
          inst.city?.toLowerCase().includes('kolkata') ||
          inst.state?.toLowerCase().includes('west bengal')
      ));

  const disclaimerText =
    'Seat availability, addresses and contact details may change yearly — please verify on the official ITI portal before applying.';

  // Case A: At least 1 matching institute exists
  if (finalInstitutes.length > 0) {
    const mapped = finalInstitutes.map((inst) => {
      const locationLabel = isCityFiltered ? `Nearby in ${inst.city}` : 'Available in India';
      const skillName = inst.targetSkill || inst.overlappingSkills[0] || 'trade proficiency';
      const explanation = `Recommended because this institute offers training related to your missing skill: ${skillName}.`;

      return {
        id: inst.id,
        name: inst.name,
        title: inst.name,
        type: inst.type || 'Government ITI',
        city: inst.city,
        state: inst.state,
        trade: inst.trade,
        relevanceTag: inst.relevanceTag || inst.trade,
        subtitle: `${inst.type} • ${inst.city} (${locationLabel})`,
        provider: `${inst.type} Training Center`,
        description: explanation,
        skillsOffered: inst.skillsOffered,
        link: inst.website,
        website: inst.website,
        ctaText:
          inst.ctaText ||
          (inst.type === 'Private Institute' || inst.type === 'Private'
            ? 'Visit Institute Website'
            : 'Visit Official Website'),
        distanceKm: inst.distanceKm,
        isGovernment:
          inst.type === 'Government ITI' ||
          inst.type === 'Government' ||
          inst.type === 'Govt. Portal',
      };
    });

    // Provide Government Skill Portals separately when in Kolkata / West Bengal for Electrician trade
    let portals = [];
    if (isWBResult && normalize(userTrade) === 'electrician') {
      portals = (GOVT_SKILL_PORTALS || []).map((portal) => ({
        id: portal.id,
        name: portal.name,
        title: portal.title || portal.name,
        type: portal.type, // 'Govt. Portal'
        city: portal.city,
        state: portal.state,
        trade: portal.trade,
        relevanceTag: portal.relevanceTag,
        subtitle: `${portal.type} • ${portal.relevanceTag || 'West Bengal'}`,
        provider: 'Government of West Bengal / India',
        description: portal.description,
        skillsOffered: portal.skillsOffered,
        link: portal.website,
        website: portal.website,
        ctaText: portal.ctaText || 'Visit Official Website',
        isGovernment: true,
      }));
    }

    return {
      recommendations: mapped,
      govtPortals: portals,
      disclaimer: isWBResult ? disclaimerText : null,
      notice: null,
      isFallback: false,
    };
  }

  // Case B: 0 matching institutes found -> Government skilling fallback
  const firstMissing = missingSkills[0] || '';
  const isEmerging =
    firstMissing.includes('EV') ||
    firstMissing.includes('Solar') ||
    firstMissing.includes('Smart') ||
    firstMissing.includes('Modern') ||
    firstMissing.includes('Battery');

  const fallbackCard = isEmerging
    ? {
        id: 'fallback-skill-india',
        name: 'Skill India Digital — National EV & Emerging Skills Portal',
        title: 'Skill India Digital — National EV & Emerging Skills Portal',
        type: 'Govt. Portal',
        subtitle: 'Government of India • Nationwide Training Centers',
        provider: 'Skill India Digital / NSDC',
        description:
          'No nearby training institute found for your current skill gap. Access accredited national training centers and specialized green-energy skilling schemes.',
        link: 'https://www.skillindiadigital.gov.in',
        website: 'https://www.skillindiadigital.gov.in',
        ctaText: 'Explore Government Training',
        isGovernment: true,
      }
    : {
        id: 'fallback-pmkvy',
        name: 'PMKVY (Pradhan Mantri Kaushal Vikas Yojana)',
        title: 'PMKVY (Pradhan Mantri Kaushal Vikas Yojana)',
        type: 'Govt. Portal',
        subtitle: 'Ministry of Skill Development • Subsidized Certification',
        provider: 'PMKVY Official',
        description:
          'No nearby training institute found for your current skill gap. Enroll in government-certified vocational training centers across India.',
        link: 'https://www.pmkvyofficial.org',
        website: 'https://www.pmkvyofficial.org',
        ctaText: 'Explore Government Training',
        isGovernment: true,
      };

  return {
    recommendations: [fallbackCard],
    govtPortals: [],
    disclaimer: null,
    notice: normLoc
      ? `No nearby training institute found for your current skill gap in ${userLocation}.`
      : 'No nearby training institute found for your current skill gap.',
    isFallback: true,
  };
}
