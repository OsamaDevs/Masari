export const careersByMajor = {
  "Computer Science": [
    {
      id: "backend-engineer-intern",
      title: "Backend Engineer Intern",
      description:
        "Build APIs, optimize databases, and collaborate with product teams to deliver scalable features.",
      requiredSkills: ["Node.js", "SQL", "API Design", "Git", "Testing"],
      resources: [
        "Node.js Official Docs",
        "REST API Design Best Practices",
        "SQLBolt Interactive SQL",
      ],
    },
    {
      id: "ml-assistant",
      title: "Machine Learning Assistant",
      description:
        "Support model training workflows, data preprocessing, and evaluation experiments for AI products.",
      requiredSkills: ["Python", "Pandas", "Model Evaluation", "Statistics"],
      resources: [
        "Kaggle Micro-Courses",
        "Hands-On Machine Learning",
        "Google ML Crash Course",
      ],
    },
    {
      id: "qa-automation-analyst",
      title: "QA Automation Analyst",
      description:
        "Create automated test coverage, detect regressions early, and improve release quality.",
      requiredSkills: ["Playwright", "Test Design", "CI/CD", "Debugging"],
      resources: [
        "Playwright Docs",
        "Testing JavaScript Guide",
        "GitHub Actions Basics",
      ],
    },
  ],
  Business: [
    {
      id: "operations-analyst",
      title: "Operations Analyst",
      description:
        "Analyze workflows and data to improve process efficiency and operational outcomes.",
      requiredSkills: ["Excel", "Data Analysis", "Process Mapping", "Reporting"],
      resources: ["Excel Skills for Business", "Lean Six Sigma Basics", "Power BI Learning"],
    },
    {
      id: "growth-associate",
      title: "Growth Associate",
      description:
        "Run growth experiments, analyze funnel performance, and support go-to-market campaigns.",
      requiredSkills: ["Market Research", "A/B Testing", "Communication", "Analytics"],
      resources: ["Reforge Essays", "Google Analytics Academy", "Product-Led Growth Notes"],
    },
    {
      id: "sales-development-rep",
      title: "Sales Development Representative",
      description:
        "Qualify leads, manage outreach, and contribute to pipeline growth for target segments.",
      requiredSkills: ["CRM", "Lead Qualification", "Presentation", "Negotiation"],
      resources: ["HubSpot CRM Academy", "SPIN Selling Summary", "Business Communication"],
    },
  ],
  Engineering: [
    {
      id: "systems-engineering-trainee",
      title: "Systems Engineering Trainee",
      description:
        "Assist in designing and validating complex systems with multidisciplinary teams.",
      requiredSkills: ["Systems Thinking", "Simulation", "Documentation", "Problem Solving"],
      resources: [
        "Systems Engineering Fundamentals",
        "MATLAB Onramp",
        "Technical Writing Guide",
      ],
    },
    {
      id: "cad-design-technician",
      title: "CAD Design Technician",
      description:
        "Create and refine technical drawings and 3D models for engineering projects.",
      requiredSkills: ["AutoCAD", "Technical Drawing", "Manufacturing Basics"],
      resources: ["AutoCAD Essentials", "GD&T Basics", "Design for Manufacturing Intro"],
    },
    {
      id: "field-support-engineer",
      title: "Field Support Engineer",
      description:
        "Troubleshoot technical issues, support deployment, and ensure system reliability on-site.",
      requiredSkills: ["Troubleshooting", "Safety Compliance", "Client Communication"],
      resources: ["Root Cause Analysis", "Safety Engineering Basics", "Service Engineering Skills"],
    },
  ],
}

export const majors = Object.keys(careersByMajor)

export function getRecommendedCareers(college, major) {
  const careers = careersByMajor[major] ?? []

  if (!college) {
    return careers
  }

  const isEngineeringCollege = college.toLowerCase().includes("engineering")
  if (major === "Computer Science" && isEngineeringCollege) {
    return careers.map((career, index) => ({
      ...career,
      priority: index === 0 ? "High" : "Medium",
    }))
  }

  return careers.map((career) => ({ ...career, priority: "Medium" }))
}

export function getCareerById(careerId) {
  for (const major in careersByMajor) {
    const found = careersByMajor[major].find((career) => career.id === careerId)
    if (found) {
      return { ...found, major }
    }
  }

  return null
}

export function generateRoadmap(career) {
  if (!career) {
    return []
  }

  return [
    {
      phase: "Phase 1: Foundations",
      progress: 30,
      courses: ["Core coursework alignment", "Skill baseline assessment"],
      gapFocus: career.requiredSkills.slice(0, 2),
    },
    {
      phase: "Phase 2: Applied Projects",
      progress: 60,
      courses: ["Portfolio project", "Industry case practice"],
      gapFocus: career.requiredSkills.slice(1, 3),
    },
    {
      phase: "Phase 3: Job Readiness",
      progress: 85,
      courses: ["Interview preparation", "Internship applications"],
      gapFocus: career.requiredSkills.slice(2, 5),
    },
  ]
}

const curriculumByMajor = {
  "Computer Science": [
    { semester: 1, code: "CS101", title: "Programming Fundamentals", titleAr: "أساسيات البرمجة", skills: ["Python", "Problem Solving"] },
    { semester: 1, code: "MATH101", title: "Discrete Mathematics", titleAr: "الرياضيات المتقطعة", skills: ["Logic", "Mathematical Reasoning"] },
    { semester: 2, code: "CS102", title: "Object-Oriented Programming", titleAr: "البرمجة كائنية التوجه", skills: ["JavaScript", "OOP", "Debugging"] },
    { semester: 2, code: "CS120", title: "Web Basics", titleAr: "أساسيات الويب", skills: ["HTML", "CSS", "Git"] },
    { semester: 3, code: "CS201", title: "Data Structures", titleAr: "هياكل البيانات", skills: ["Data Structures", "Complexity Analysis"] },
    { semester: 3, code: "CS210", title: "Database Systems", titleAr: "نظم قواعد البيانات", skills: ["SQL", "Data Modeling"] },
    { semester: 4, code: "CS220", title: "Operating Systems", titleAr: "أنظمة التشغيل", skills: ["Systems Thinking", "Troubleshooting"] },
    { semester: 4, code: "CS230", title: "Software Engineering", titleAr: "هندسة البرمجيات", skills: ["Git", "Testing", "Documentation"] },
    { semester: 5, code: "CS301", title: "Backend Development", titleAr: "تطوير الأنظمة الخلفية", skills: ["Node.js", "API Design", "Testing"] },
    { semester: 5, code: "CS310", title: "Cloud Computing", titleAr: "الحوسبة السحابية", skills: ["Deployment", "CI/CD"] },
    { semester: 6, code: "CS320", title: "Machine Learning", titleAr: "تعلم الآلة", skills: ["Python", "Model Evaluation", "Statistics"] },
    { semester: 6, code: "CS330", title: "Distributed Systems", titleAr: "الأنظمة الموزعة", skills: ["System Design", "API Design"] },
    { semester: 7, code: "CS401", title: "Capstone Project I", titleAr: "مشروع التخرج 1", skills: ["Architecture", "Team Collaboration"] },
    { semester: 7, code: "CS410", title: "Software Testing", titleAr: "اختبار البرمجيات", skills: ["Testing", "Quality Assurance"] },
    { semester: 8, code: "CS402", title: "Capstone Project II", titleAr: "مشروع التخرج 2", skills: ["Project Delivery", "Communication"] },
    { semester: 8, code: "CS430", title: "Internship Training", titleAr: "التدريب التعاوني", skills: ["Industry Practice", "Professional Skills"] },
  ],
  Business: [
    { semester: 1, code: "BUS101", title: "Principles of Management", titleAr: "مبادئ الإدارة", skills: ["Communication", "Leadership"] },
    { semester: 2, code: "BUS120", title: "Microeconomics", titleAr: "الاقتصاد الجزئي", skills: ["Analysis", "Decision Making"] },
    { semester: 3, code: "BUS210", title: "Marketing Fundamentals", titleAr: "أساسيات التسويق", skills: ["Market Research", "Communication"] },
    { semester: 4, code: "BUS230", title: "Business Analytics", titleAr: "تحليل الأعمال", skills: ["Analytics", "Excel", "Reporting"] },
    { semester: 5, code: "BUS301", title: "Digital Marketing", titleAr: "التسويق الرقمي", skills: ["A/B Testing", "Growth Strategy"] },
    { semester: 6, code: "BUS320", title: "Operations Management", titleAr: "إدارة العمليات", skills: ["Process Mapping", "Operations"] },
    { semester: 7, code: "BUS401", title: "Strategic Management", titleAr: "الإدارة الاستراتيجية", skills: ["Strategy", "Presentation"] },
    { semester: 8, code: "BUS430", title: "Business Internship", titleAr: "التدريب العملي في الأعمال", skills: ["Client Communication", "Professional Skills"] },
  ],
  Engineering: [
    { semester: 1, code: "ENG101", title: "Engineering Mathematics", titleAr: "الرياضيات الهندسية", skills: ["Math", "Problem Solving"] },
    { semester: 2, code: "ENG120", title: "Engineering Drawing", titleAr: "الرسم الهندسي", skills: ["Technical Drawing", "Visualization"] },
    { semester: 3, code: "ENG210", title: "Mechanics", titleAr: "الميكانيكا", skills: ["Systems Thinking", "Analysis"] },
    { semester: 4, code: "ENG230", title: "Control Systems", titleAr: "أنظمة التحكم", skills: ["Simulation", "Troubleshooting"] },
    { semester: 5, code: "ENG301", title: "CAD Design", titleAr: "التصميم باستخدام الحاسب", skills: ["AutoCAD", "Design Modeling"] },
    { semester: 6, code: "ENG320", title: "Project Engineering", titleAr: "هندسة المشاريع", skills: ["Documentation", "Team Collaboration"] },
    { semester: 7, code: "ENG401", title: "Engineering Capstone I", titleAr: "مشروع هندسي 1", skills: ["System Design", "Project Planning"] },
    { semester: 8, code: "ENG430", title: "Engineering Capstone II", titleAr: "مشروع هندسي 2", skills: ["Project Delivery", "Communication"] },
  ],
}

export function getLocalizedCourseTitle(course, isArabic) {
  if (!course) {
    return ''
  }

  return isArabic && course.titleAr ? course.titleAr : course.title
}

const marketRequirementsByMajor = {
  "Computer Science": [
    {
      company: "STC",
      role: "Backend Developer Intern",
      requiredSkills: ["Node.js", "API Design", "SQL", "Testing", "Git"],
      details: "Telecom-scale backend services with focus on reliability and API quality.",
      minSemester: 4,
      maxSemester: 8,
      weight: 1.2,
    },
    {
      company: "Saudi Aramco",
      role: "Digital Solutions Intern",
      requiredSkills: ["Python", "Data Modeling", "System Design", "SQL"],
      details: "Data-driven internal tools and enterprise integration workflows.",
      minSemester: 5,
      maxSemester: 8,
      weight: 1.1,
    },
    {
      company: "SDAIA",
      role: "AI Engineering Trainee",
      requiredSkills: ["Python", "Model Evaluation", "Statistics", "MLOps"],
      details: "Applied AI pipelines and model validation in government platforms.",
      minSemester: 6,
      maxSemester: 8,
      weight: 1.3,
    },
    {
      company: "Elm",
      role: "Software Engineer Intern",
      requiredSkills: ["JavaScript", "API Design", "CI/CD", "Testing"],
      details: "Public-sector digital products with strong software quality standards.",
      minSemester: 4,
      maxSemester: 8,
      weight: 1,
    },
    {
      company: "NEOM",
      role: "Cloud Platform Intern",
      requiredSkills: ["Cloud", "CI/CD", "System Design", "Node.js"],
      details: "Cloud-native services and platform automation for smart-city operations.",
      minSemester: 5,
      maxSemester: 8,
      weight: 1.25,
    },
  ],
  Business: [
    {
      company: "STC",
      role: "Business Analyst Intern",
      requiredSkills: ["Analytics", "Excel", "Reporting", "Communication"],
      details: "Commercial reporting, KPI monitoring, and business process insights.",
      minSemester: 3,
      maxSemester: 8,
      weight: 1.2,
    },
    {
      company: "SNB",
      role: "Strategy Intern",
      requiredSkills: ["Strategy", "Presentation", "Market Research", "Analysis"],
      details: "Banking strategy support and market opportunity analysis.",
      minSemester: 5,
      maxSemester: 8,
      weight: 1.15,
    },
    {
      company: "SABIC",
      role: "Operations Analyst Trainee",
      requiredSkills: ["Process Mapping", "Operations", "Reporting", "Leadership"],
      details: "Operational efficiency analysis and process optimization.",
      minSemester: 4,
      maxSemester: 8,
      weight: 1.05,
    },
    {
      company: "Riyad Bank",
      role: "Growth and Product Associate",
      requiredSkills: ["A/B Testing", "Growth Strategy", "Analytics", "Communication"],
      details: "Growth initiatives for retail digital channels and conversion funnels.",
      minSemester: 4,
      maxSemester: 8,
      weight: 1.1,
    },
  ],
  Engineering: [
    {
      company: "Saudi Electricity Company",
      role: "Systems Engineering Intern",
      requiredSkills: ["Systems Thinking", "Troubleshooting", "Documentation", "Simulation"],
      details: "Infrastructure systems support and engineering documentation excellence.",
      minSemester: 4,
      maxSemester: 8,
      weight: 1.2,
    },
    {
      company: "Aramco",
      role: "Field Engineering Trainee",
      requiredSkills: ["Safety Compliance", "Troubleshooting", "Project Planning"],
      details: "On-site engineering support with strict safety and process requirements.",
      minSemester: 5,
      maxSemester: 8,
      weight: 1.15,
    },
    {
      company: "NEOM",
      role: "Smart Infrastructure Intern",
      requiredSkills: ["System Design", "Simulation", "Project Delivery", "Communication"],
      details: "Smart-city engineering integration and multi-system delivery collaboration.",
      minSemester: 6,
      maxSemester: 8,
      weight: 1.25,
    },
  ],
}

export function getCurriculumForMajor(major) {
  return curriculumByMajor[major] ?? []
}

export function getMarketRequirementsForMajor(major) {
  return marketRequirementsByMajor[major] ?? []
}

export function getMarketRequirementsForStudentLevel(major, currentSemester) {
  const requirements = marketRequirementsByMajor[major] ?? []
  return requirements.filter((item) => {
    const min = item.minSemester ?? 1
    const max = item.maxSemester ?? 8
    return currentSemester >= min && currentSemester <= max
  })
}

const resourcesBySkill = {
  "API Design": ["REST API Design Best Practices", "Designing Web APIs"],
  "Node.js": ["Node.js Official Docs", "Node.js Backend Path"],
  SQL: ["SQLBolt Interactive SQL", "Mode SQL Tutorial"],
  Testing: ["Testing JavaScript Guide", "Playwright Docs"],
  "CI/CD": ["GitHub Actions Basics", "CI/CD Fundamentals"],
  "System Design": ["Grokking System Design", "ByteByteGo System Design"],
  Python: ["Python Docs", "Real Python"],
  "Model Evaluation": ["Google ML Crash Course", "Model Evaluation Notes"],
  Statistics: ["Khan Academy Statistics", "Think Stats"],
  "Market Research": ["Market Research Essentials", "Growth Research Frameworks"],
  Analytics: ["Google Analytics Academy", "Data Visualization Fundamentals"],
  Communication: ["Business Communication", "Presentation Skills"],
}

function parseCurrentSemester(profile) {
  const yearText = profile?.collegeYear ?? ''
  const semesterText = (profile?.semesterYear ?? '').toLowerCase()
  const yearNumber = parseInt(yearText, 10)
  const safeYear = Number.isNaN(yearNumber) ? 1 : Math.min(Math.max(yearNumber, 1), 4)

  if (semesterText.includes('second')) {
    return safeYear * 2
  }

  return safeYear * 2 - 1
}

export function getCurrentSemesterFromProfile(profile) {
  return parseCurrentSemester(profile)
}

function dedupe(items) {
  return Array.from(new Set(items))
}

export function buildCareerRoadmap(profile, career) {
  if (!profile || !career) {
    return { semesters: [], summary: { involved: 0, remaining: 0 } }
  }

  const major = profile.major
  const curriculum = curriculumByMajor[major] ?? []
  const currentSemester = parseCurrentSemester(profile)
  const required = career.requiredSkills ?? []

  const detailedCourses = curriculum.map((course) => {
    const matchedSkills = required.filter((skill) => course.skills.includes(skill))
    const gapSkills = required.filter((skill) => !matchedSkills.includes(skill))
    const supplemental = dedupe([
      ...gapSkills.flatMap((skill) => resourcesBySkill[skill] ?? []),
      ...(career.resources ?? []),
    ]).slice(0, 4)

    const matchPercent = required.length
      ? Math.round((matchedSkills.length / required.length) * 100)
      : 0

    let status = 'remaining'
    if (course.semester < currentSemester) {
      status = 'completed'
    }
    if (course.semester === currentSemester) {
      status = 'ongoing'
    }

    return {
      ...course,
      status,
      matchedSkills,
      gapSkills,
      supplemental,
      matchPercent,
    }
  })

  const semesterMap = new Map()
  detailedCourses.forEach((course) => {
    if (!semesterMap.has(course.semester)) {
      semesterMap.set(course.semester, [])
    }
    semesterMap.get(course.semester).push(course)
  })

  const semesters = Array.from(semesterMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([semesterNumber, courses]) => ({
      semesterNumber,
      label: `Semester ${semesterNumber}`,
      courses,
    }))

  const involved = detailedCourses.filter((course) => course.status !== 'remaining').length
  const remaining = detailedCourses.filter((course) => course.status === 'remaining').length

  return {
    semesters,
    summary: { involved, remaining, currentSemester },
  }
}
