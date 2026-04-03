import { buildExternalMarketComparison } from "./externalMarketSources.js";
import { extractSkillsFromText } from "./courseFileParser.js";

const DEFAULT_RESOURCE_CATALOG = {
  "API Design": [
    {
      title: "REST API Design Best Practices",
      url: "https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/",
      type: "article",
      durationHours: 2,
    },
    {
      title: "Build a REST API with Node.js",
      url: "https://www.youtube.com/watch?v=pKd0Rpw7O48",
      type: "video",
      durationHours: 3,
    },
  ],
  "Node.js": [
    {
      title: "Node.js Official Documentation",
      url: "https://nodejs.org/en/docs",
      type: "docs",
      durationHours: 4,
    },
    {
      title: "Node.js Full Course",
      url: "https://www.youtube.com/watch?v=Oe421EPjeBE",
      type: "video",
      durationHours: 6,
    },
  ],
  SQL: [
    {
      title: "SQLBolt Interactive SQL",
      url: "https://sqlbolt.com/",
      type: "interactive",
      durationHours: 4,
    },
    {
      title: "Mode SQL Tutorial",
      url: "https://mode.com/sql-tutorial/",
      type: "tutorial",
      durationHours: 5,
    },
  ],
  Testing: [
    {
      title: "Testing JavaScript",
      url: "https://testingjavascript.com/",
      type: "course",
      durationHours: 5,
    },
    {
      title: "Playwright Documentation",
      url: "https://playwright.dev/docs/intro",
      type: "docs",
      durationHours: 3,
    },
  ],
  Python: [
    {
      title: "Python Official Docs",
      url: "https://docs.python.org/3/tutorial/",
      type: "docs",
      durationHours: 5,
    },
    {
      title: "Python for Everybody",
      url: "https://www.coursera.org/specializations/python",
      type: "course",
      durationHours: 8,
    },
  ],
  Statistics: [
    {
      title: "Khan Academy Statistics",
      url: "https://www.khanacademy.org/math/statistics-probability",
      type: "course",
      durationHours: 8,
    },
  ],
  "Data Analysis": [
    {
      title: "Data Analysis with Python",
      url: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
      type: "course",
      durationHours: 10,
    },
  ],
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeGrade(grade) {
  if (grade === null || grade === undefined || grade === "") {
    return 0.7;
  }

  if (typeof grade === "string") {
    const upper = grade.trim().toUpperCase();
    if (upper === "A+") return 1;
    if (upper === "A") return 0.95;
    if (upper === "B+") return 0.88;
    if (upper === "B") return 0.82;
    if (upper === "C+") return 0.75;
    if (upper === "C") return 0.68;
    if (upper === "D") return 0.55;
    if (upper === "F") return 0.2;
  }

  const numeric = normalizeNumber(grade, 70);
  return clamp(numeric / 100, 0, 1);
}

function normalizeRecency(semester, currentSemester) {
  if (!semester || !currentSemester) {
    return 0.7;
  }

  const distance = Math.max(0, currentSemester - semester);
  if (distance <= 1) return 1;
  if (distance <= 2) return 0.9;
  if (distance <= 3) return 0.8;
  if (distance <= 4) return 0.7;
  return 0.6;
}

function normalizeDepth(course) {
  const creditHours = normalizeNumber(course?.creditHours, 3);
  return clamp(creditHours / 4, 0.5, 1);
}

function buildSkillDemandWeights(marketRequirements = []) {
  const weights = new Map();

  marketRequirements.forEach((item) => {
    const itemWeight = normalizeNumber(item.weight, 1);
    const requiredSkills = Array.isArray(item.requiredSkills) ? item.requiredSkills : [];

    requiredSkills.forEach((skill) => {
      const key = String(skill || "").trim();
      if (!key) return;
      const previous = weights.get(key) || 0;
      weights.set(key, previous + itemWeight);
    });
  });

  return weights;
}

function buildSkillCoverage({ courses, demandSkills, currentSemester }) {
  const coverage = new Map();

  demandSkills.forEach((skill) => {
    const relatedCourses = courses.filter((course) =>
      Array.isArray(course.skills) && course.skills.some((item) => String(item).trim().toLowerCase() === skill.toLowerCase())
    );

    if (!relatedCourses.length) {
      coverage.set(skill, 0);
      return;
    }

    const courseScores = relatedCourses.map((course) => {
      const gradeScore = normalizeGrade(course.grade);
      const recencyScore = normalizeRecency(course.semester, currentSemester);
      const depthScore = normalizeDepth(course);
      const score = (0.45 * gradeScore) + (0.35 * recencyScore) + (0.2 * depthScore);
      return clamp(score, 0, 1);
    });

    // Keep strongest evidence from student's transcript while smoothing by average.
    const sorted = [...courseScores].sort((a, b) => b - a);
    const top = sorted.slice(0, 3);
    const avg = top.reduce((sum, value) => sum + value, 0) / top.length;
    coverage.set(skill, clamp(avg, 0, 1));
  });

  return coverage;
}

function fallbackResourcesForSkill(skill) {
  const query = encodeURIComponent(skill);
  return [
    {
      title: `${skill} - free learning path`,
      url: `https://www.coursera.org/search?query=${query}`,
      type: "course",
      durationHours: 6,
    },
    {
      title: `${skill} tutorials`,
      url: `https://www.youtube.com/results?search_query=${query}+tutorial`,
      type: "video",
      durationHours: 4,
    },
  ];
}

function toActionPlan(skillGaps, resourceCatalog) {
  return skillGaps
    .filter((item) => item.gap > 0.15)
    .sort((a, b) => b.weightedGap - a.weightedGap)
    .slice(0, 8)
    .map((item) => {
      const resources = resourceCatalog[item.skill] || DEFAULT_RESOURCE_CATALOG[item.skill] || fallbackResourcesForSkill(item.skill);
      return {
        skill: item.skill,
        gapPercent: item.gapPercent,
        priority: item.priority,
        recommendedResources: resources.slice(0, 4),
      };
    });
}

function priorityLabel(gap) {
  if (gap >= 0.7) return "critical";
  if (gap >= 0.45) return "high";
  if (gap >= 0.25) return "medium";
  return "low";
}

export function analyzeSkillGap(payload = {}) {
  const courses = Array.isArray(payload.courses) ? payload.courses : [];
  const marketRequirements = Array.isArray(payload.marketRequirements) ? payload.marketRequirements : [];
  const resourceCatalog = payload.resourceCatalog && typeof payload.resourceCatalog === "object"
    ? payload.resourceCatalog
    : {};
  const options = payload.options && typeof payload.options === "object" ? payload.options : {};

  const demandWeightMap = buildSkillDemandWeights(marketRequirements);
  const demandSkills = Array.from(demandWeightMap.keys());
  const currentSemester = normalizeNumber(options.currentSemester, 6);

  const coverageMap = buildSkillCoverage({
    courses,
    demandSkills,
    currentSemester,
  });

  const skillGaps = demandSkills.map((skill) => {
    const required = 1;
    const current = coverageMap.get(skill) || 0;
    const gap = Math.max(0, required - current);
    const weight = demandWeightMap.get(skill) || 1;
    const weightedGap = weight * gap;

    return {
      skill,
      requiredLevel: required,
      currentLevel: Number(current.toFixed(3)),
      gap: Number(gap.toFixed(3)),
      gapPercent: Math.round(gap * 100),
      marketWeight: Number(weight.toFixed(3)),
      weightedGap: Number(weightedGap.toFixed(3)),
      priority: priorityLabel(gap),
    };
  });

  const totalRequiredWeighted = demandSkills.reduce((sum, skill) => {
    const weight = demandWeightMap.get(skill) || 1;
    return sum + weight;
  }, 0);

  const totalWeightedGap = skillGaps.reduce((sum, item) => sum + item.weightedGap, 0);
  const gapPercent = totalRequiredWeighted
    ? Math.round((totalWeightedGap / totalRequiredWeighted) * 100)
    : 0;

  const readinessPercent = Math.max(0, 100 - gapPercent);
  const actionPlan = toActionPlan(skillGaps, resourceCatalog);

  return {
    formula: {
      perSkill: "G_s = max(0, R_s - C_s)",
      total: "Gap% = 100 * sum(w_s * G_s) / sum(w_s * R_s)",
      currentLevel: "C_s = 0.45*grade + 0.35*recency + 0.2*courseDepth",
    },
    summary: {
      demandedSkillsCount: demandSkills.length,
      analyzedCoursesCount: courses.length,
      gapPercent,
      readinessPercent,
      totalWeightedGap: Number(totalWeightedGap.toFixed(3)),
    },
    skillGaps: skillGaps.sort((a, b) => b.weightedGap - a.weightedGap),
    actionPlan,
  };
}

function buildSaudiOutlook(job = {}, marketRequirements = [], gapPercent = 0) {
  const demandBase = normalizeNumber(job.marketDemand ?? job.demand, 70);
  const activeCompanies = marketRequirements.length;
  const weightedDemand = marketRequirements.reduce((sum, item) => sum + normalizeNumber(item.weight, 1), 0);

  const momentumScore = clamp((demandBase / 100) * 0.55 + Math.min(weightedDemand / 6, 1) * 0.3 + Math.min(activeCompanies / 4, 1) * 0.15, 0, 1);
  const confidence = Math.round(momentumScore * 100);

  let marketStatus = "stable";
  if (confidence >= 75) marketStatus = "high-growth";
  else if (confidence < 45) marketStatus = "competitive";

  return {
    marketStatus,
    confidencePercent: confidence,
    interpretation:
      marketStatus === "high-growth"
        ? "Strong demand trend in Saudi market for this role over near-term internships and junior hiring."
        : marketStatus === "competitive"
          ? "Demand exists but market is competitive; stronger portfolio and practical skills are required."
          : "Role demand is moderate and stable in Saudi market with selective hiring windows.",
    hiringSignal: Math.max(0, 100 - Math.round(gapPercent * 0.55)),
    activeCompanies,
  };
}

export function analyzeRoadmapSelection(payload = {}) {
  const studentCourses = Array.isArray(payload.studentCourses) ? payload.studentCourses : [];
  const marketRequirements = Array.isArray(payload.marketRequirements) ? payload.marketRequirements : [];
  const targetJob = payload.targetJob && typeof payload.targetJob === "object" ? payload.targetJob : {};
  const major = payload.major || studentCourses[0]?.major || "";
  const category = targetJob?.category || payload.category || "";

  const externalComparison = buildExternalMarketComparison({
    major,
    category,
    targetRole: targetJob?.title,
    fallbackSkills: Array.isArray(targetJob?.requiredSkills) ? targetJob.requiredSkills : [],
  });

  const combinedRequirements = [...marketRequirements, ...externalComparison.externalRequirements];

  const base = analyzeSkillGap({
    courses: studentCourses,
    marketRequirements: combinedRequirements,
    resourceCatalog: payload.resourceCatalog,
    options: payload.options,
  });

  const jobSkills = Array.isArray(targetJob.requiredSkills) ? targetJob.requiredSkills : [];

  const relevantStudentCourses = studentCourses
    .map((course) => {
      const skills = Array.isArray(course.skills) ? course.skills : [];
      const overlap = skills.filter((skill) => jobSkills.includes(skill));
      return {
        code: course.code,
        title: course.title,
        semester: course.semester,
        overlapCount: overlap.length,
        overlapSkills: overlap,
      };
    })
    .filter((item) => item.overlapCount > 0)
    .sort((a, b) => b.overlapCount - a.overlapCount)
    .slice(0, 10);

  return {
    ...base,
    saudiOutlook: buildSaudiOutlook(targetJob, combinedRequirements, base.summary.gapPercent),
    externalComparison: {
      benchmarkSkills: externalComparison.benchmarkSkills,
      sources: externalComparison.sourceDetails,
      externalRequirementsCount: externalComparison.externalRequirements.length,
    },
    relevantStudentCourses,
  };
}

export function analyzeCourseFileContent(payload = {}) {
  const fileText = String(payload.fileText || "");
  const courseName = String(payload.courseName || payload.title || "Unnamed Course");
  const courseCode = String(payload.courseCode || payload.code || "");
  const major = String(payload.major || "");
  const marketRequirements = Array.isArray(payload.marketRequirements) ? payload.marketRequirements : [];

  const extractedSkills = extractSkillsFromText(fileText);
  const marketSkills = Array.from(new Set(marketRequirements.flatMap((item) => Array.isArray(item.requiredSkills) ? item.requiredSkills : [])));
  const matchedSkills = extractedSkills.filter((skill) => marketSkills.includes(skill));
  const missingSkills = marketSkills.filter((skill) => !extractedSkills.includes(skill));

  const evidence = extractedSkills.map((skill) => ({
    skill,
    confidence: 0.65,
    reason: "Extracted from course file keywords",
  }));

  const directCoverage = marketSkills.length
    ? Math.round((matchedSkills.length / marketSkills.length) * 100)
    : 0;

  const suggestedResources = missingSkills.slice(0, 6).map((skill) => ({
    skill,
    resources: (DEFAULT_RESOURCE_CATALOG[skill] || fallbackResourcesForSkill(skill)).slice(0, 3),
  }));

  const externalComparison = buildExternalMarketComparison({
    major,
    category: payload.category || "",
    targetRole: courseName,
    fallbackSkills: extractedSkills,
  });

  return {
    course: {
      code: courseCode,
      title: courseName,
      major,
    },
    extractedSkills,
    evidence,
    matchedSkills,
    missingSkills,
    directCoverage,
    externalComparison: {
      benchmarkSkills: externalComparison.benchmarkSkills,
      sources: externalComparison.sourceDetails,
    },
    suggestedResources,
  };
}
