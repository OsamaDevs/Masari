export const TRUSTED_EXTERNAL_SOURCES = [
  {
    id: "linkedin-saudi",
    name: "LinkedIn Jobs - Saudi Arabia",
    type: "job-board",
    trustWeight: 0.9,
    url: "https://www.linkedin.com/jobs",
  },
  {
    id: "saudi-digital-academy",
    name: "Saudi Digital Academy",
    type: "saudi-training",
    trustWeight: 0.88,
    url: "https://sda.edu.sa/",
  },
  {
    id: "onet",
    name: "O*NET Online",
    type: "skills-taxonomy",
    trustWeight: 0.92,
    url: "https://www.onetonline.org/",
  },
  {
    id: "esco",
    name: "ESCO Skills Classification",
    type: "skills-taxonomy",
    trustWeight: 0.9,
    url: "https://esco.ec.europa.eu/",
  },
  {
    id: "mcit-saudi",
    name: "MCIT Saudi ICT Reports",
    type: "saudi-report",
    trustWeight: 0.86,
    url: "https://www.mcit.gov.sa/",
  },
];

const EXTERNAL_SKILL_BENCHMARKS = {
  "Software Engineering": {
    common: ["API Design", "Node.js", "Testing", "CI/CD", "Git", "Cloud"],
    byCategory: {
      "Software Engineering": ["JavaScript", "API Design", "Testing", "CI/CD", "SQL"],
      "Cloud & Infrastructure": ["Cloud", "Linux", "Scripting", "Monitoring"],
      Cybersecurity: ["Security Basics", "Networking", "Linux"],
    },
  },
  "Computer Science": {
    common: ["Python", "Data Analysis", "Statistics", "System Design", "SQL"],
    byCategory: {
      "Artificial Intelligence & Data Science": ["Python", "Statistics", "Model Evaluation", "Data Analysis"],
      "Software Engineering": ["Node.js", "API Design", "Testing"],
      Cybersecurity: ["Security Basics", "Networking", "Linux"],
    },
  },
  "Information Systems": {
    common: ["Requirements Analysis", "Process Mapping", "SQL", "Reporting", "Communication"],
    byCategory: {
      "Information Systems & IT Management": ["Requirements Analysis", "Project Planning", "Documentation", "Reporting"],
      "Software Engineering": ["SQL", "API Design", "Testing"],
    },
  },
  "Computer Engineering": {
    common: ["Embedded Programming", "Microcontrollers", "Networking", "Linux", "Troubleshooting"],
    byCategory: {
      "Computer Engineering (Hardware)": ["Embedded Programming", "Microcontrollers", "C/C++", "Troubleshooting"],
      "Embedded Systems & IoT": ["IoT Fundamentals", "Embedded Programming", "API Design", "Cloud"],
      "Networking & Communications": ["Networking", "Linux", "Security Basics"],
    },
  },
};

function uniq(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function getSourceById(id) {
  return TRUSTED_EXTERNAL_SOURCES.find((source) => source.id === id) || null;
}

function pickBenchmarkSkills({ major, category, fallbackSkills = [] }) {
  const majorPack = EXTERNAL_SKILL_BENCHMARKS[major];
  if (!majorPack) {
    return uniq(fallbackSkills);
  }

  const categorySkills = majorPack.byCategory?.[category] || [];
  return uniq([...majorPack.common, ...categorySkills, ...fallbackSkills]);
}

export function buildExternalMarketComparison({ major, category, targetRole, fallbackSkills = [] }) {
  const benchmarkSkills = pickBenchmarkSkills({ major, category, fallbackSkills });

  const linkedInSource = getSourceById("linkedin-saudi");
  const taxonomySources = [getSourceById("onet"), getSourceById("esco")].filter(Boolean);
  const saudiReportSource = getSourceById("mcit-saudi");

  const externalRequirements = [
    {
      company: linkedInSource?.name || "LinkedIn Jobs - Saudi Arabia",
      role: targetRole || "Target Role",
      requiredSkills: benchmarkSkills.slice(0, 8),
      weight: 1.15,
      externalSource: true,
      sourceIds: ["linkedin-saudi"],
      details: "Aggregated market demand references from Saudi job postings.",
    },
    {
      company: "Skill Taxonomy Benchmarks",
      role: targetRole || "Target Role",
      requiredSkills: benchmarkSkills.slice(0, 10),
      weight: 1,
      externalSource: true,
      sourceIds: taxonomySources.map((source) => source.id),
      details: "Normalized skill taxonomy baseline for role comparison.",
    },
    {
      company: saudiReportSource?.name || "Saudi ICT Reports",
      role: targetRole || "Target Role",
      requiredSkills: benchmarkSkills.slice(0, 7),
      weight: 1.05,
      externalSource: true,
      sourceIds: ["mcit-saudi"],
      details: "Saudi digital sector direction and capability demand indicators.",
    },
  ];

  const sourceDetails = uniq(externalRequirements.flatMap((item) => item.sourceIds || []))
    .map((id) => getSourceById(id))
    .filter(Boolean)
    .map((source) => ({
      id: source.id,
      name: source.name,
      type: source.type,
      trustWeight: source.trustWeight,
      url: source.url,
    }));

  return {
    benchmarkSkills,
    externalRequirements,
    sourceDetails,
  };
}
