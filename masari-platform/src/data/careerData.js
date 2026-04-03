import { allJobs300 } from './jobs300.js'

export const majors = [
  'Software Engineering',
  'Computer Science',
  'Information Systems',
  'Computer Engineering',
]

export const majorLabels = {
  'Software Engineering': { en: 'Software Engineering', ar: 'هندسة البرمجيات' },
  'Computer Science': { en: 'Computer Science', ar: 'علوم الحاسب' },
  'Information Systems': { en: 'Information Systems', ar: 'نظم المعلومات' },
  'Computer Engineering': { en: 'Computer Engineering', ar: 'هندسة الحاسب' },
}

export function getMajorLabel(major, isArabic) {
  const labels = majorLabels[major]
  if (!labels) {
    return major
  }
  return isArabic ? labels.ar : labels.en
}

export const careersByMajor = {
  'Software Engineering': [
    {
      id: 'software-qa-engineer',
      title: 'Software QA Engineer',
      description:
        'Design quality plans, automate tests, and verify releases for reliability and performance.',
      requiredSkills: ['Testing', 'Test Design', 'Git', 'CI/CD', 'Debugging'],
      resources: [
        'Playwright Docs',
        'Testing JavaScript Guide',
        'CI/CD Fundamentals',
      ],
    },
    {
      id: 'fullstack-junior-developer',
      title: 'Fullstack Junior Developer',
      description:
        'Build and maintain modern web features across frontend and backend services.',
      requiredSkills: ['JavaScript', 'API Design', 'Node.js', 'SQL', 'Git'],
      resources: [
        'Node.js Official Docs',
        'MDN JavaScript Guide',
        'SQLBolt Interactive SQL',
      ],
    },
    {
      id: 'devops-associate',
      title: 'DevOps Associate',
      description:
        'Support deployment pipelines, monitoring, and release automation across environments.',
      requiredSkills: ['CI/CD', 'Cloud', 'Scripting', 'Monitoring', 'Git'],
      resources: [
        'GitHub Actions Basics',
        'Cloud Fundamentals',
        'DevOps Roadmap',
      ],
    },
  ],
  'Computer Science': [
    {
      id: 'backend-engineer-intern',
      title: 'Backend Engineer Intern',
      description:
        'Build APIs, optimize databases, and collaborate with teams on scalable backend services.',
      requiredSkills: ['Node.js', 'SQL', 'API Design', 'Git', 'Testing'],
      resources: [
        'Node.js Official Docs',
        'REST API Design Best Practices',
        'SQLBolt Interactive SQL',
      ],
    },
    {
      id: 'ml-assistant',
      title: 'Machine Learning Assistant',
      description:
        'Support model training workflows, data preparation, and evaluation experiments.',
      requiredSkills: ['Python', 'Statistics', 'Model Evaluation', 'Data Analysis'],
      resources: [
        'Google ML Crash Course',
        'Hands-On Machine Learning',
        'Kaggle Micro-Courses',
      ],
    },
    {
      id: 'data-analyst-junior',
      title: 'Data Analyst Junior',
      description:
        'Transform raw data into insights and dashboards that support product and business decisions.',
      requiredSkills: ['SQL', 'Data Analysis', 'Visualization', 'Python'],
      resources: [
        'Mode SQL Tutorial',
        'Pandas Documentation',
        'Data Visualization Fundamentals',
      ],
    },
  ],
  'Information Systems': [
    {
      id: 'business-systems-analyst',
      title: 'Business Systems Analyst',
      description:
        'Bridge business needs and technical solutions through process analysis and documentation.',
      requiredSkills: ['Requirements Analysis', 'Process Mapping', 'Communication', 'SQL'],
      resources: [
        'Business Analysis Fundamentals',
        'SQLBolt Interactive SQL',
        'Process Mapping Guide',
      ],
    },
    {
      id: 'erp-support-specialist',
      title: 'ERP Support Specialist',
      description:
        'Support enterprise systems, improve workflows, and resolve configuration issues.',
      requiredSkills: ['ERP Basics', 'Troubleshooting', 'Reporting', 'Communication'],
      resources: [
        'ERP Essentials Course',
        'Root Cause Analysis',
        'Business Communication',
      ],
    },
    {
      id: 'it-project-coordinator',
      title: 'IT Project Coordinator',
      description:
        'Coordinate project milestones, track deliverables, and support agile team execution.',
      requiredSkills: ['Project Planning', 'Documentation', 'Communication', 'Reporting'],
      resources: [
        'Project Management Basics',
        'Agile Fundamentals',
        'Technical Writing Guide',
      ],
    },
  ],
  'Computer Engineering': [
    {
      id: 'embedded-systems-junior',
      title: 'Embedded Systems Junior Engineer',
      description:
        'Develop low-level firmware and integrate software with hardware components.',
      requiredSkills: ['C/C++', 'Embedded Programming', 'Microcontrollers', 'Debugging'],
      resources: [
        'Embedded C Basics',
        'Microcontroller Labs',
        'Hardware Debugging Guide',
      ],
    },
    {
      id: 'network-engineer-trainee',
      title: 'Network Engineer Trainee',
      description:
        'Support network setup, monitoring, and reliability across campus and enterprise systems.',
      requiredSkills: ['Networking', 'Security Basics', 'Troubleshooting', 'Linux'],
      resources: [
        'Cisco Networking Basics',
        'Linux Essentials',
        'Network Troubleshooting Handbook',
      ],
    },
    {
      id: 'iot-solutions-intern',
      title: 'IoT Solutions Intern',
      description:
        'Build connected prototypes combining sensors, firmware, and cloud integrations.',
      requiredSkills: ['IoT Fundamentals', 'Embedded Programming', 'Cloud', 'API Design'],
      resources: [
        'IoT for Beginners',
        'Cloud Fundamentals',
        'Designing Web APIs',
      ],
    },
  ],
}

export function getRecommendedCareers(_college, major) {
  const careers = getAllCareers()
  return careers
    .filter((job) => job.match?.closestMajor === major)
    .sort((a, b) => (b.match?.matchPercent ?? 0) - (a.match?.matchPercent ?? 0))
}

export function getAllCareers() {
  return allJobs300.map((career) => enrichCareerWithMajorMatch(career))
}

export function getCareerById(careerId) {
  const career = allJobs300.find((job) => job.id === careerId) || null
  return career ? enrichCareerWithMajorMatch(career) : null
}

const majorSkillKeywords = {
  'Software Engineering': [
    'api', 'backend', 'frontend', 'full-stack', 'fullstack', 'web', 'software', 'app', 'application',
    'node', 'javascript', 'typescript', 'java', 'spring', 'testing', 'qa', 'devops', 'cloud', 'ci/cd', 'sre',
  ],
  'Computer Science': [
    'data', 'machine learning', 'ml', 'ai', 'artificial intelligence', 'algorithms', 'distributed',
    'analysis', 'analytics', 'model', 'python', 'recommendation', 'research', 'optimization',
  ],
  'Information Systems': [
    'business', 'systems', 'process', 'erp', 'reporting', 'documentation', 'planning', 'coordination',
    'requirements', 'project', 'bi', 'bi developer', 'governance', 'compliance', 'information',
  ],
  'Computer Engineering': [
    'embedded', 'hardware', 'iot', 'microcontroller', 'microcontrollers', 'fpga', 'asic', 'chip',
    'circuit', 'network', 'electronics', 'firmware', 'sensor', 'signal', 'pcb', 'soc', 'linux',
  ],
}

const majorPreferenceByCategory = {
  'Software Engineering': {
    'Software Engineering': 1,
    'Computer Science': 0.82,
    'Information Systems': 0.6,
    'Computer Engineering': 0.45,
  },
  'Computer Engineering (Hardware)': {
    'Computer Engineering': 1,
    'Software Engineering': 0.58,
    'Computer Science': 0.5,
    'Information Systems': 0.35,
  },
  'Artificial Intelligence & Data Science': {
    'Computer Science': 1,
    'Software Engineering': 0.72,
    'Information Systems': 0.55,
    'Computer Engineering': 0.4,
  },
  Cybersecurity: {
    'Computer Science': 0.94,
    'Software Engineering': 0.86,
    'Information Systems': 0.7,
    'Computer Engineering': 0.52,
  },
  'Cloud & Infrastructure': {
    'Software Engineering': 0.96,
    'Computer Science': 0.84,
    'Information Systems': 0.6,
    'Computer Engineering': 0.48,
  },
  'Networking & Communications': {
    'Computer Engineering': 1,
    'Computer Science': 0.72,
    'Software Engineering': 0.6,
    'Information Systems': 0.4,
  },
  'User Experience (UX) & Design': {
    'Software Engineering': 0.88,
    'Information Systems': 0.82,
    'Computer Science': 0.58,
    'Computer Engineering': 0.3,
  },
  'Information Systems & IT Management': {
    'Information Systems': 1,
    'Software Engineering': 0.68,
    'Computer Science': 0.55,
    'Computer Engineering': 0.32,
  },
  'Embedded Systems & IoT': {
    'Computer Engineering': 1,
    'Software Engineering': 0.63,
    'Computer Science': 0.5,
    'Information Systems': 0.28,
  },
}

function normalizeText(text) {
  return `${text || ''}`.toLowerCase()
}

function getJobSearchText(career) {
  return normalizeText([career?.title, career?.description, career?.category, career?.major].filter(Boolean).join(' '))
}

function getJobSkillList(career) {
  const explicit = Array.isArray(career?.requiredSkills) ? career.requiredSkills.filter(Boolean) : []
  if (explicit.length > 0) {
    return explicit
  }

  const text = getJobSearchText(career)
  const derived = []
  if (text.includes('backend') || text.includes('api') || text.includes('web') || text.includes('app')) {
    derived.push('API Design', 'Node.js', 'JavaScript')
  }
  if (text.includes('data') || text.includes('ai') || text.includes('machine learning') || text.includes('analytics')) {
    derived.push('Python', 'Data Analysis', 'Statistics')
  }
  if (text.includes('security') || text.includes('penetration') || text.includes('soc') || text.includes('audit')) {
    derived.push('Security Basics', 'Networking', 'Linux')
  }
  if (text.includes('embedded') || text.includes('hardware') || text.includes('firmware') || text.includes('iot')) {
    derived.push('Embedded Programming', 'Microcontrollers', 'C/C++')
  }

  return Array.from(new Set(derived)).slice(0, 6)
}

function scoreMajorForCareer(career, major) {
  const categoryScore = majorPreferenceByCategory[career?.category]?.[major] ?? 0.35
  const text = getJobSearchText(career)
  const keywordHits = (majorSkillKeywords[major] || []).reduce((count, keyword) => (
    text.includes(keyword) ? count + 1 : count
  ), 0)
  const skillTokens = getJobSkillList(career)
  const skillHits = skillTokens.reduce((count, skill) => {
    const skillText = normalizeText(skill)
    return majorSkillKeywords[major]?.some((keyword) => skillText.includes(keyword) || keyword.includes(skillText))
      ? count + 1
      : count
  }, 0)

  const keywordScore = Math.min(keywordHits / 4, 1)
  const skillScore = Math.min(skillHits / 4, 1)
  const demandScore = Math.min(((career?.demand ?? career?.marketDemand ?? 70) / 100), 1)

  const finalScore = (0.5 * categoryScore) + (0.25 * keywordScore) + (0.2 * skillScore) + (0.05 * demandScore)

  return Math.round(finalScore * 100)
}

export function getClosestMajorForCareer(career) {
  let bestMajor = majors[0]
  let bestScore = -1

  majors.forEach((major) => {
    const score = scoreMajorForCareer(career, major)
    if (score > bestScore) {
      bestScore = score
      bestMajor = major
    }
  })

  return {
    closestMajor: bestMajor,
    matchPercent: Math.max(15, Math.min(bestScore, 99)),
  }
}

export function enrichCareerWithMajorMatch(career) {
  const match = getClosestMajorForCareer(career)
  return {
    ...career,
    match,
    requiredSkills: getJobSkillList(career),
  }
}


const curriculumByMajor = {
  'Software Engineering': [
    { semester: 1, code: 'SE101', title: 'Programming Fundamentals', titleAr: 'أساسيات البرمجة', skills: ['Problem Solving', 'JavaScript'] },
    { semester: 2, code: 'SE120', title: 'Object Oriented Programming', titleAr: 'البرمجة كائنية التوجه', skills: ['OOP', 'Debugging'] },
    { semester: 3, code: 'SE201', title: 'Data Structures', titleAr: 'هياكل البيانات', skills: ['Data Structures', 'Complexity Analysis'] },
    { semester: 4, code: 'SE230', title: 'Software Engineering', titleAr: 'هندسة البرمجيات', skills: ['Documentation', 'Git', 'Testing'] },
    { semester: 5, code: 'SE301', title: 'Web Application Development', titleAr: 'تطوير تطبيقات الويب', skills: ['JavaScript', 'API Design', 'Node.js'] },
    { semester: 6, code: 'SE320', title: 'Software Quality Assurance', titleAr: 'ضمان جودة البرمجيات', skills: ['Testing', 'Test Design', 'CI/CD'] },
    { semester: 7, code: 'SE401', title: 'Software Project Management', titleAr: 'إدارة مشاريع البرمجيات', skills: ['Project Planning', 'Communication'] },
    { semester: 8, code: 'SE430', title: 'Graduation Project', titleAr: 'مشروع التخرج', skills: ['Project Delivery', 'Team Collaboration'] },
  ],
  'Computer Science': [
    { semester: 1, code: 'CS101', title: 'Programming Fundamentals', titleAr: 'أساسيات البرمجة', skills: ['Python', 'Problem Solving'] },
    { semester: 2, code: 'CS120', title: 'Discrete Mathematics', titleAr: 'الرياضيات المتقطعة', skills: ['Logic', 'Mathematical Reasoning'] },
    { semester: 3, code: 'CS201', title: 'Data Structures', titleAr: 'هياكل البيانات', skills: ['Data Structures', 'Complexity Analysis'] },
    { semester: 4, code: 'CS210', title: 'Database Systems', titleAr: 'نظم قواعد البيانات', skills: ['SQL', 'Data Modeling'] },
    { semester: 5, code: 'CS301', title: 'Backend Development', titleAr: 'تطوير الأنظمة الخلفية', skills: ['Node.js', 'API Design', 'Testing'] },
    { semester: 6, code: 'CS320', title: 'Machine Learning', titleAr: 'تعلم الآلة', skills: ['Python', 'Model Evaluation', 'Statistics'] },
    { semester: 7, code: 'CS401', title: 'Distributed Systems', titleAr: 'الأنظمة الموزعة', skills: ['System Design', 'Cloud'] },
    { semester: 8, code: 'CS430', title: 'Graduation Project', titleAr: 'مشروع التخرج', skills: ['Project Delivery', 'Communication'] },
  ],
  'Information Systems': [
    { semester: 1, code: 'IS101', title: 'Introduction to Information Systems', titleAr: 'مقدمة في نظم المعلومات', skills: ['IS Foundations', 'Communication'] },
    { semester: 2, code: 'IS120', title: 'Business Process Modeling', titleAr: 'نمذجة العمليات التجارية', skills: ['Process Mapping', 'Requirements Analysis'] },
    { semester: 3, code: 'IS201', title: 'Database Management', titleAr: 'إدارة قواعد البيانات', skills: ['SQL', 'Reporting'] },
    { semester: 4, code: 'IS230', title: 'Systems Analysis and Design', titleAr: 'تحليل وتصميم النظم', skills: ['Requirements Analysis', 'Documentation'] },
    { semester: 5, code: 'IS301', title: 'Enterprise Systems', titleAr: 'الأنظمة المؤسسية', skills: ['ERP Basics', 'Troubleshooting'] },
    { semester: 6, code: 'IS320', title: 'IT Project Management', titleAr: 'إدارة مشاريع تقنية المعلومات', skills: ['Project Planning', 'Communication'] },
    { semester: 7, code: 'IS401', title: 'Business Intelligence', titleAr: 'ذكاء الأعمال', skills: ['Data Analysis', 'Visualization'] },
    { semester: 8, code: 'IS430', title: 'Field Training', titleAr: 'التدريب الميداني', skills: ['Professional Skills', 'Reporting'] },
  ],
  'Computer Engineering': [
    { semester: 1, code: 'CE101', title: 'Digital Logic Design', titleAr: 'تصميم المنطق الرقمي', skills: ['Digital Design', 'Problem Solving'] },
    { semester: 2, code: 'CE120', title: 'Programming for Engineers', titleAr: 'برمجة للمهندسين', skills: ['C/C++', 'Debugging'] },
    { semester: 3, code: 'CE201', title: 'Computer Organization', titleAr: 'تنظيم الحاسب', skills: ['Architecture', 'Systems Thinking'] },
    { semester: 4, code: 'CE230', title: 'Microprocessors', titleAr: 'المعالجات الدقيقة', skills: ['Microcontrollers', 'Embedded Programming'] },
    { semester: 5, code: 'CE301', title: 'Embedded Systems', titleAr: 'الأنظمة المضمنة', skills: ['Embedded Programming', 'Troubleshooting'] },
    { semester: 6, code: 'CE320', title: 'Computer Networks', titleAr: 'شبكات الحاسب', skills: ['Networking', 'Linux'] },
    { semester: 7, code: 'CE401', title: 'IoT Systems', titleAr: 'أنظمة إنترنت الأشياء', skills: ['IoT Fundamentals', 'API Design'] },
    { semester: 8, code: 'CE430', title: 'Engineering Project', titleAr: 'المشروع الهندسي', skills: ['Project Delivery', 'Communication'] },
    { semester: 9, code: 'CE490', title: 'Advanced Capstone', titleAr: 'مشروع التخرج المتقدم', skills: ['Project Delivery', 'System Integration', 'Communication'] },
  ],
}

export function getCurriculumForMajor(major) {
  return curriculumByMajor[major] ?? []
}

export function getLocalizedCourseTitle(course, isArabic) {
  if (!course) {
    return ''
  }

  return isArabic && course.titleAr ? course.titleAr : course.title
}

const courseDescriptionByCode = {
  SE101: {
    en: 'Introduces programming basics and structured thinking to build a strong foundation for software development.',
    ar: 'يقدم أساسيات البرمجة والتفكير المنهجي لبناء قاعدة قوية في تطوير البرمجيات.',
  },
  SE120: {
    en: 'Trains students to design maintainable applications using object-oriented concepts and clean class structures.',
    ar: 'يدرّب الطالب على تصميم تطبيقات قابلة للصيانة باستخدام مفاهيم البرمجة كائنية التوجه.',
  },
  SE201: {
    en: 'Builds problem-solving depth through efficient data structures and algorithmic analysis.',
    ar: 'يعزز عمق حل المشكلات عبر هياكل البيانات والتحليل الخوارزمي بكفاءة.',
  },
  SE230: {
    en: 'Covers software lifecycle practices including documentation, collaboration, and testing workflows.',
    ar: 'يغطي ممارسات دورة حياة البرمجيات مثل التوثيق والتعاون وسير عمل الاختبار.',
  },
  SE301: {
    en: 'Focuses on building end-to-end web applications with modern frontend-backend integration.',
    ar: 'يركز على بناء تطبيقات ويب متكاملة تربط الواجهة الأمامية بالخلفية بأسلوب حديث.',
  },
  SE320: {
    en: 'Develops quality assurance mindset through test planning, automation, and release validation.',
    ar: 'يطور عقلية ضمان الجودة عبر تخطيط الاختبارات وأتمتتها والتحقق من الإصدار.',
  },
  SE401: {
    en: 'Prepares students to manage software projects, teams, schedules, and technical communication.',
    ar: 'يؤهل الطالب لإدارة مشاريع البرمجيات والفرق والجداول والتواصل التقني.',
  },
  SE430: {
    en: 'Applies accumulated knowledge in a capstone project that reflects real market delivery expectations.',
    ar: 'يوظف المعرفة المتراكمة في مشروع تخرج يعكس توقعات التسليم الفعلية في السوق.',
  },
  CS101: {
    en: 'Builds core programming ability and computational problem-solving using practical coding exercises.',
    ar: 'يبني مهارات البرمجة الأساسية وحل المشكلات الحاسوبية عبر تطبيقات عملية.',
  },
  CS120: {
    en: 'Strengthens logical and mathematical reasoning required for algorithms, security, and system design.',
    ar: 'يقوي المنطق والاستدلال الرياضي الضروري للخوارزميات والأمن وتصميم الأنظمة.',
  },
  CS201: {
    en: 'Teaches efficient organization of data to improve software speed, scalability, and reliability.',
    ar: 'يعلم تنظيم البيانات بكفاءة لتحسين السرعة والقابلية للتوسع واعتمادية الأنظمة.',
  },
  CS210: {
    en: 'Develops database design and SQL querying skills for building robust data-driven applications.',
    ar: 'يطور مهارات تصميم قواعد البيانات وكتابة SQL لبناء تطبيقات معتمدة على البيانات.',
  },
  CS301: {
    en: 'Prepares students to implement APIs and backend services with attention to testing and maintainability.',
    ar: 'يجهز الطالب لبناء واجهات API وخدمات خلفية مع التركيز على الاختبار وقابلية الصيانة.',
  },
  CS320: {
    en: 'Introduces machine learning workflows from data preparation to model evaluation and iteration.',
    ar: 'يقدم مسارات تعلم الآلة من تجهيز البيانات إلى تقييم النماذج والتحسين المستمر.',
  },
  CS401: {
    en: 'Explains distributed architecture concepts for scalable systems and cloud-ready services.',
    ar: 'يشرح مفاهيم الأنظمة الموزعة لبناء خدمات قابلة للتوسع وجاهزة للسحابة.',
  },
  CS430: {
    en: 'Integrates computer science knowledge into a final project aligned with applied industry scenarios.',
    ar: 'يدمج معارف علوم الحاسب في مشروع نهائي مرتبط بسيناريوهات تطبيقية من سوق العمل.',
  },
  IS101: {
    en: 'Introduces the role of information systems in business operations and digital transformation.',
    ar: 'يعرّف بدور نظم المعلومات في تشغيل الأعمال والتحول الرقمي.',
  },
  IS120: {
    en: 'Trains students to analyze and model business processes for system improvement and automation.',
    ar: 'يدرّب الطالب على تحليل ونمذجة العمليات التجارية لتحسين الأنظمة وأتمتتها.',
  },
  IS201: {
    en: 'Builds practical skills for managing enterprise data and producing useful operational reports.',
    ar: 'يبني مهارات عملية لإدارة بيانات المؤسسة وإنتاج تقارير تشغيلية مفيدة.',
  },
  IS230: {
    en: 'Covers requirements gathering, system analysis, and design documentation for solution delivery.',
    ar: 'يغطي جمع المتطلبات وتحليل النظم وتوثيق التصميم لتسليم حلول فعالة.',
  },
  IS301: {
    en: 'Focuses on enterprise platforms and support workflows used in large organizations.',
    ar: 'يركز على الأنظمة المؤسسية ومسارات الدعم المستخدمة في الجهات الكبيرة.',
  },
  IS320: {
    en: 'Develops planning and coordination skills to execute IT projects with clear milestones.',
    ar: 'يطور مهارات التخطيط والتنسيق لتنفيذ مشاريع تقنية المعلومات بمراحل واضحة.',
  },
  IS401: {
    en: 'Introduces analytics and visualization techniques to support data-informed business decisions.',
    ar: 'يقدم تقنيات التحليل والتصور لدعم القرارات المبنية على البيانات في الأعمال.',
  },
  IS430: {
    en: 'Provides field training experience to bridge academic knowledge with workplace expectations.',
    ar: 'يوفر خبرة تدريب ميداني تربط المعرفة الأكاديمية بتوقعات بيئة العمل.',
  },
  CE101: {
    en: 'Builds foundation in digital circuit logic used in hardware systems and embedded devices.',
    ar: 'يبني أساسًا في المنطق الرقمي المستخدم في العتاد والأجهزة المضمنة.',
  },
  CE120: {
    en: 'Teaches engineering-oriented programming with focus on performance, control, and debugging.',
    ar: 'يعلم البرمجة للمهندسين مع التركيز على الأداء والتحكم وتتبع الأخطاء.',
  },
  CE201: {
    en: 'Explains computer architecture and how hardware-software interaction affects system behavior.',
    ar: 'يشرح تنظيم الحاسب وتأثير تفاعل العتاد والبرمجيات على سلوك النظام.',
  },
  CE230: {
    en: 'Introduces microprocessor concepts and low-level programming for embedded applications.',
    ar: 'يقدم مفاهيم المعالجات الدقيقة والبرمجة منخفضة المستوى للتطبيقات المضمنة.',
  },
  CE301: {
    en: 'Develops embedded systems skills through firmware integration, testing, and troubleshooting.',
    ar: 'يطور مهارات الأنظمة المضمنة عبر تكامل البرمجيات الثابتة والاختبار واستكشاف الأعطال.',
  },
  CE320: {
    en: 'Builds networking knowledge for configuring, maintaining, and diagnosing modern network systems.',
    ar: 'يبني معرفة شبكية لإعداد وصيانة وتشخيص أنظمة الشبكات الحديثة.',
  },
  CE401: {
    en: 'Focuses on IoT architecture connecting devices, sensors, and services through reliable interfaces.',
    ar: 'يركز على معمارية إنترنت الأشياء لربط الأجهزة والحساسات والخدمات بواجهات موثوقة.',
  },
  CE430: {
    en: 'Applies engineering competencies in a final project that simulates real technical delivery.',
    ar: 'يوظف الكفاءات الهندسية في مشروع نهائي يحاكي التسليم التقني الواقعي.',
  },
  CE490: {
    en: 'Extends the capstone into a more advanced integration project with system-level delivery and presentation.',
    ar: 'يمد مشروع التخرج إلى مستوى أكثر تقدمًا مع تكامل الأنظمة والتسليم والعرض النهائي.',
  },
}

const skillExplanationByName = {
  Testing: {
    en: 'Ensures software quality and reduces production bugs through structured validation.',
    ar: 'تضمن جودة البرمجيات وتقلل أخطاء الإنتاج عبر تحقق منظم.',
  },
  'Test Design': {
    en: 'Helps create effective test scenarios that cover edge cases and critical user flows.',
    ar: 'تساعد على بناء سيناريوهات اختبار فعالة تغطي الحالات الحرجة والاستثنائية.',
  },
  Git: {
    en: 'Enables team collaboration, version tracking, and safe code integration in real projects.',
    ar: 'تمكن من التعاون وتتبع الإصدارات ودمج الكود بأمان في المشاريع الفعلية.',
  },
  'CI/CD': {
    en: 'Automates build, test, and deployment pipelines for faster and safer releases.',
    ar: 'تؤتمت البناء والاختبار والنشر لإصدارات أسرع وأكثر أمانًا.',
  },
  Debugging: {
    en: 'Improves ability to diagnose root causes and fix issues efficiently under pressure.',
    ar: 'ترفع القدرة على تشخيص السبب الجذري وحل المشكلات بكفاءة تحت الضغط.',
  },
  JavaScript: {
    en: 'Core language for modern web interfaces and many backend ecosystems.',
    ar: 'لغة أساسية للواجهات الحديثة وبيئات كثيرة في الأنظمة الخلفية.',
  },
  'API Design': {
    en: 'Critical for building clear service contracts between frontend, backend, and external systems.',
    ar: 'مهمة لبناء عقود خدمة واضحة بين الواجهة الأمامية والخلفية والأنظمة الخارجية.',
  },
  'Node.js': {
    en: 'Widely used runtime for scalable backend services and API development.',
    ar: 'بيئة تشغيل مستخدمة على نطاق واسع لبناء خدمات خلفية قابلة للتوسع.',
  },
  SQL: {
    en: 'Essential for querying, validating, and analyzing structured business data.',
    ar: 'أساسية للاستعلام عن البيانات المنظمة والتحقق منها وتحليلها.',
  },
  Cloud: {
    en: 'Required for deploying and operating applications in modern production environments.',
    ar: 'مطلوبة لنشر وتشغيل التطبيقات في بيئات الإنتاج الحديثة.',
  },
  Scripting: {
    en: 'Automates repetitive technical tasks and improves operational efficiency.',
    ar: 'تؤتمت المهام التقنية المتكررة وتحسن كفاءة التشغيل.',
  },
  Monitoring: {
    en: 'Provides visibility into system health to detect failures before users are impacted.',
    ar: 'توفر رؤية لصحة الأنظمة لاكتشاف الأعطال قبل تأثر المستخدمين.',
  },
  Python: {
    en: 'Key language for data work, automation, and machine learning pipelines.',
    ar: 'لغة محورية لأعمال البيانات والأتمتة ومسارات تعلم الآلة.',
  },
  Statistics: {
    en: 'Supports evidence-based model evaluation and data-driven decisions.',
    ar: 'تدعم تقييم النماذج واتخاذ القرار المبني على الأدلة والبيانات.',
  },
  'Model Evaluation': {
    en: 'Ensures ML models are accurate, reliable, and suitable for deployment.',
    ar: 'تضمن أن نماذج تعلم الآلة دقيقة وموثوقة ومناسبة للتطبيق.',
  },
  'Data Analysis': {
    en: 'Transforms raw datasets into actionable insights for teams and stakeholders.',
    ar: 'تحول البيانات الخام إلى رؤى قابلة للتنفيذ للفرق وأصحاب المصلحة.',
  },
  Visualization: {
    en: 'Communicates complex findings clearly through dashboards and visual storytelling.',
    ar: 'توضح النتائج المعقدة عبر لوحات معلومات وعرض بصري فعال.',
  },
  'Requirements Analysis': {
    en: 'Aligns business needs with technical implementation to avoid costly rework.',
    ar: 'توائم احتياج العمل مع التنفيذ التقني وتقلل إعادة العمل المكلفة.',
  },
  'Process Mapping': {
    en: 'Helps identify bottlenecks and optimize operational workflows.',
    ar: 'تساعد في اكتشاف الاختناقات وتحسين تدفق العمليات التشغيلية.',
  },
  Communication: {
    en: 'Essential to explain technical decisions and coordinate effectively across teams.',
    ar: 'أساسية لشرح القرارات التقنية والتنسيق الفعال بين الفرق.',
  },
  'ERP Basics': {
    en: 'Builds understanding of enterprise workflows and integrated business systems.',
    ar: 'تبني فهمًا لدورات العمل المؤسسية والأنظمة المتكاملة.',
  },
  Troubleshooting: {
    en: 'Develops practical capability to isolate issues and restore service quickly.',
    ar: 'تطور القدرة العملية على عزل الأعطال واستعادة الخدمة بسرعة.',
  },
  Reporting: {
    en: 'Enables clear progress tracking and decision support through structured reporting.',
    ar: 'تمكن من تتبع التقدم ودعم القرار عبر تقارير منظمة.',
  },
  'Project Planning': {
    en: 'Ensures scope, priorities, and timelines are managed for predictable delivery.',
    ar: 'تضمن إدارة النطاق والأولويات والجداول لتسليم متوقع ومنضبط.',
  },
  Documentation: {
    en: 'Preserves team knowledge and reduces onboarding and maintenance friction.',
    ar: 'تحفظ معرفة الفريق وتقلل صعوبات التأهيل والصيانة.',
  },
  'C/C++': {
    en: 'Fundamental for performance-critical and hardware-near software development.',
    ar: 'أساسية لتطوير برمجيات عالية الأداء وقريبة من العتاد.',
  },
  'Embedded Programming': {
    en: 'Required for controlling constrained devices and real-time hardware behavior.',
    ar: 'مطلوبة للتحكم في الأجهزة محدودة الموارد والسلوك اللحظي للعتاد.',
  },
  Microcontrollers: {
    en: 'Core for building firmware solutions in IoT and industrial hardware systems.',
    ar: 'محورية لبناء حلول برمجيات ثابتة في إنترنت الأشياء والأنظمة الصناعية.',
  },
  Networking: {
    en: 'Critical for reliable connectivity, infrastructure operation, and system integration.',
    ar: 'مهمة للاتصال الموثوق وتشغيل البنية التحتية وتكامل الأنظمة.',
  },
  'Security Basics': {
    en: 'Protects systems and data by applying foundational cybersecurity practices.',
    ar: 'تحمي الأنظمة والبيانات عبر تطبيق أساسيات الأمن السيبراني.',
  },
  Linux: {
    en: 'Common operating environment for servers, networking tools, and automation.',
    ar: 'بيئة تشغيل شائعة للخوادم وأدوات الشبكات والأتمتة.',
  },
  'IoT Fundamentals': {
    en: 'Connects hardware, communication protocols, and cloud services in smart solutions.',
    ar: 'تربط العتاد وبروتوكولات الاتصال والخدمات السحابية في حلول ذكية.',
  },
}

export function getCourseDescription(course, isArabic) {
  if (!course) {
    return ''
  }

  const byCode = courseDescriptionByCode[course.code]
  if (byCode) {
    return isArabic ? byCode.ar : byCode.en
  }

  const topSkills = (course.skills ?? []).slice(0, 3)
  if (isArabic) {
    return `يركز هذا المقرر على ${topSkills.join('، ')}، ويساعد الطالب على بناء أساس عملي يخدم المسار الوظيفي المستهدف.`
  }

  return `This course focuses on ${topSkills.join(', ')}, helping the student build practical foundations for the target career path.`
}

export function getSkillExplanation(skill, isArabic) {
  const entry = skillExplanationByName[skill]
  if (entry) {
    return isArabic ? entry.ar : entry.en
  }

  return isArabic
    ? 'هذه المهارة مطلوبة لأنها تدعم جاهزيتك المهنية وتزيد فرص القبول في التدريب والعمل.'
    : 'This skill is required because it increases your job readiness and improves internship and hiring opportunities.'
}

const marketRequirementsByMajor = {
  'Software Engineering': [
    {
      company: 'STC',
      role: 'Software QA Intern',
      requiredSkills: ['Testing', 'Test Design', 'CI/CD', 'Git'],
      details: 'Focus on release quality and automated test coverage.',
      minSemester: 4,
      maxSemester: 8,
      weight: 1.2,
    },
    {
      company: 'Elm',
      role: 'Junior Fullstack Engineer',
      requiredSkills: ['JavaScript', 'Node.js', 'API Design', 'SQL'],
      details: 'Public-sector digital products with strong engineering standards.',
      minSemester: 5,
      maxSemester: 8,
      weight: 1.1,
    },
  ],
  'Computer Science': [
    {
      company: 'SDAIA',
      role: 'AI Engineering Trainee',
      requiredSkills: ['Python', 'Model Evaluation', 'Statistics', 'Data Analysis'],
      details: 'Applied AI pipelines and practical model evaluation.',
      minSemester: 5,
      maxSemester: 8,
      weight: 1.3,
    },
    {
      company: 'Aramco Digital',
      role: 'Backend Intern',
      requiredSkills: ['Node.js', 'SQL', 'API Design', 'Testing'],
      details: 'Data-heavy backend services and reliable API operations.',
      minSemester: 4,
      maxSemester: 8,
      weight: 1.2,
    },
  ],
  'Information Systems': [
    {
      company: 'SNB',
      role: 'Business Systems Analyst Intern',
      requiredSkills: ['Requirements Analysis', 'Process Mapping', 'Communication', 'SQL'],
      details: 'Support banking process optimization and systems analysis.',
      minSemester: 4,
      maxSemester: 8,
      weight: 1.15,
    },
    {
      company: 'Riyad Bank',
      role: 'IT Project Coordinator Intern',
      requiredSkills: ['Project Planning', 'Documentation', 'Reporting', 'Communication'],
      details: 'Coordinate project delivery and support digital initiatives.',
      minSemester: 5,
      maxSemester: 8,
      weight: 1.1,
    },
  ],
  'Computer Engineering': [
    {
      company: 'Saudi Electricity Company',
      role: 'Embedded and Network Trainee',
      requiredSkills: ['Embedded Programming', 'Networking', 'Troubleshooting', 'Linux'],
      details: 'Field systems support with embedded and network operations.',
      minSemester: 4,
      maxSemester: 9,
      weight: 1.2,
    },
    {
      company: 'NEOM',
      role: 'IoT Infrastructure Intern',
      requiredSkills: ['IoT Fundamentals', 'Microcontrollers', 'API Design', 'Cloud'],
      details: 'Smart infrastructure and connected systems projects.',
      minSemester: 5,
      maxSemester: 9,
      weight: 1.25,
    },
  ],
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
  'API Design': ['REST API Design Best Practices', 'Designing Web APIs'],
  'Node.js': ['Node.js Official Docs', 'Node.js Backend Path'],
  SQL: ['SQLBolt Interactive SQL', 'Mode SQL Tutorial'],
  Testing: ['Testing JavaScript Guide', 'Playwright Docs'],
  'CI/CD': ['GitHub Actions Basics', 'CI/CD Fundamentals'],
  'System Design': ['Grokking System Design', 'ByteByteGo System Design'],
  Python: ['Python Docs', 'Real Python'],
  'Model Evaluation': ['Google ML Crash Course', 'Model Evaluation Notes'],
  Statistics: ['Khan Academy Statistics', 'Think Stats'],
  'Data Analysis': ['Data Analysis with Python', 'Pandas Essentials'],
  Communication: ['Business Communication', 'Presentation Skills'],
  'Requirements Analysis': ['Business Analysis Basics', 'Requirements Elicitation'],
  'Embedded Programming': ['Embedded C Basics', 'STM32 Getting Started'],
  Networking: ['Cisco Networking Basics', 'Network+ Notes'],
  Linux: ['Linux Essentials', 'Linux Command Line Basics'],
  Cloud: ['Cloud Fundamentals', 'Cloud Practitioner Notes'],
}

function parseCurrentSemester(profile) {
  const yearText = profile?.collegeYear ?? ''
  const semesterText = (profile?.semesterYear ?? '').toLowerCase()
  const yearNumber = parseInt(yearText, 10)
  const safeYear = Number.isNaN(yearNumber) ? 1 : Math.min(Math.max(yearNumber, 1), 4)

  if (semesterText.includes('second') || semesterText.includes('الثاني')) {
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
      isImportant: matchPercent >= 50,
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
  const importantCourses = detailedCourses.filter((course) => course.isImportant).length

  return {
    semesters,
    summary: { involved, remaining, currentSemester, importantCourses },
  }
}
