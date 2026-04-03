import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  majors,
  getCurriculumForMajor,
  getAllCareers,
  getMajorLabel,
  getCourseDescription,
  getSkillExplanation,
  getMarketRequirementsForMajor,
} from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { getCurrentUser } from '../services/auth'
import { guestDataService } from '../services/guestDataService'
import { ensureRoadmapProgress, buildRoadmapProgressKey, upsertRoadmapCourseProgress } from '../services/roadmapProgress'
import { analyzeCourseFile, analyzeRoadmapSelection } from '../services/aiGapService'

const fieldList = [
  'Software Engineering',
  'Computer Engineering (Hardware)',
  'Artificial Intelligence & Data Science',
  'Cybersecurity',
  'Cloud & Infrastructure',
  'Networking & Communications',
  'User Experience (UX) & Design',
  'Robotics & Automation',
  'Game Development',
  'Information Systems & IT Management',
  'Blockchain & Web3',
  'Embedded Systems & IoT',
]

const quizQuestions = [
  {
    text: 'أي سؤال يشغلك أكثر عن مستقبلك التقني؟',
    reason: 'هذا يحدد نوع المشكلة التي تحب حلها أكثر: تجربة المستخدم، العتاد، البرمجة، البيانات، أو الأمن.',
    options: {
      A: 'كيف أصمم منتجًا سهل الاستخدام يحبّه الناس؟',
      B: 'كيف أبني أجهزة أسرع وأكفأ على مستوى العتاد؟',
      C: 'كيف أطور أنظمة وبرامج قوية قابلة للتوسع؟',
      D: 'كيف أستخدم البيانات والذكاء الاصطناعي لحل مشاكل واقعية؟',
      E: 'كيف أحمي الأنظمة والبيانات من الهجمات؟',
    },
  },
  {
    text: 'في سوق العمل الحالي، أي مهارة ترى نفسك تستثمر فيها أولاً؟',
    reason: 'يساعدنا هذا السؤال على معرفة أين تريد أن تضع وقتك أولًا بما يتوافق مع احتياج السوق.',
    options: {
      A: 'تصميم تجربة المستخدم والواجهات.',
      B: 'الأنظمة المضمنة والإلكترونيات.',
      C: 'تطوير الويب والأنظمة الخلفية.',
      D: 'تحليل البيانات وتعلم الآلة.',
      E: 'الأمن السيبراني واختبار الاختراق.',
    },
  },
  {
    text: 'لو طلب منك مشروع تخرج قوي لبناء بورتفوليو، ماذا تختار؟',
    reason: 'اختيار المشروع يوضح نوع الإنجاز الذي يلفت أصحاب العمل في ملفك.',
    options: {
      A: 'منصة تفاعلية بواجهة ممتازة وتجربة سلسة.',
      B: 'جهاز ذكي يعتمد على حساسات ومتحكمات.',
      C: 'تطبيق متكامل Frontend + Backend + API.',
      D: 'نظام تنبؤ أو توصية يعتمد على بيانات حقيقية.',
      E: 'مختبر أمني يحاكي الهجمات والدفاع.',
    },
  },
  {
    text: 'أي بيئة عمل تفضّلها غالبًا؟',
    reason: 'البيئة المفضلة تكشف ما إذا كنت تميل للعمل الإبداعي أو التحليلي أو التشغيلي.',
    options: {
      A: 'فريق منتج يركز على المستخدم وسلوكه.',
      B: 'مختبرات وتجارب عتادية مباشرة.',
      C: 'فرق هندسية تبني منتجات رقمية كبيرة.',
      D: 'فرق تحليل وذكاء أعمال مدفوعة بالبيانات.',
      E: 'مركز عمليات أمنية ومتابعة تهديدات.',
    },
  },
  {
    text: 'أي سؤال يتكرر عليك عند اختيار المجال؟',
    reason: 'هذا يقيس الميل الطبيعي لديك قبل اختيار المسار النهائي.',
    options: {
      A: 'هل عندي حس بصري وتحليل تجربة المستخدم؟',
      B: 'هل أحب الدوائر والأنظمة منخفضة المستوى؟',
      C: 'هل أستمتع بحل مشاكل البرمجة المعقدة؟',
      D: 'هل أحب الإحصاء والنماذج والتجارب؟',
      E: 'هل أحب التفكير الدفاعي واكتشاف الثغرات؟',
    },
  },
  {
    text: 'عند سماع كلمة AI، ما الدور الأقرب لك؟',
    reason: 'يساعدنا على معرفة إن كنت تميل لاستخدام الذكاء الاصطناعي أو بناءه أو حمايته.',
    options: {
      A: 'تحسين تفاعل المستخدم مع أدوات الذكاء.',
      B: 'تصميم عتاد يدعم تسريع الذكاء الاصطناعي.',
      C: 'دمج خدمات AI داخل تطبيقات الإنتاج.',
      D: 'بناء النماذج وتقييمها وتحسينها.',
      E: 'تأمين نماذج AI وحمايتها من الاستغلال.',
    },
  },
  {
    text: 'أي مصدر تعليمي تتوقع أنه سيصنع لك فارقًا أكبر؟',
    reason: 'هذا يوضح نوع التعلم الذي يناسبك: تطبيق عملي، مختبرات، أو مشاريع إنتاجية.',
    options: {
      A: 'دورات UX ومشاريع واجهات عملية.',
      B: 'مختبرات FPGA/IoT وتجارب ميدانية.',
      C: 'مسارات تطوير برمجيات ومشاريع إنتاجية.',
      D: 'مسارات Data/ML مع تطبيقات واقعية.',
      E: 'مسارات Security Labs وCTF.',
    },
  },
  {
    text: 'ما نوع الإنجاز الذي تفتخر به أكثر؟',
    reason: 'هذا يكشف نوع الأثر الذي تحب أن تتركه في سوق العمل.',
    options: {
      A: 'رفع رضا المستخدم وتقليل التعقيد.',
      B: 'تحسين أداء جهاز أو نظام مضمن.',
      C: 'نشر خدمة تعمل بثبات تحت ضغط.',
      D: 'تحسين دقة نموذج أو جودة تحليل.',
      E: 'منع ثغرة أو اكتشاف هجوم مبكرًا.',
    },
  },
  {
    text: 'عند المفاضلة بين شهادة وبورتفوليو، ماذا يخدمك أكثر؟',
    reason: 'يساعد على فهم هل أنت أقرب لبناء خبرة عملية أم التوسع عبر الشهادات.',
    options: {
      A: 'بورتفوليو تصميم حقيقي مع دراسات حالة.',
      B: 'مشاريع عتاد موثقة + شهادة تخصصية.',
      C: 'مشاريع برمجية إنتاجية على GitHub.',
      D: 'مشاريع بيانات كاملة + توثيق نتائج.',
      E: 'تقارير أمنية وتحديات موثقة.',
    },
  },
  {
    text: 'لو عندك 6 أشهر فقط للتجهيز لسوق العمل، أين تركز؟',
    reason: 'هذا يحدد أولوياتك السريعة وما المجال الذي تريد الاستثمار فيه فورًا.',
    options: {
      A: 'تحسين UX/UI + أبحاث مستخدمين.',
      B: 'Embedded/IoT + بروتوتايب يعمل فعليًا.',
      C: 'Full-stack + هندسة برمجيات + API.',
      D: 'Data/AI + نماذج قابلة للتطبيق.',
      E: 'Cybersecurity + أدوات دفاع واختبار.',
    },
  },
]

const answerToCategory = {
  A: 'User Experience (UX) & Design',
  B: 'Computer Engineering (Hardware)',
  C: 'Software Engineering',
  D: 'Artificial Intelligence & Data Science',
  E: 'Cybersecurity',
}

const quizCategoryWeights = {
  'Software Engineering': {
    'Software Engineering': 1,
    'Cloud & Infrastructure': 0.85,
    'Information Systems & IT Management': 0.65,
    Cybersecurity: 0.55,
  },
  'Computer Engineering (Hardware)': {
    'Computer Engineering (Hardware)': 1,
    'Embedded Systems & IoT': 0.9,
    'Networking & Communications': 0.7,
  },
  'Artificial Intelligence & Data Science': {
    'Artificial Intelligence & Data Science': 1,
    'Software Engineering': 0.7,
    'Cloud & Infrastructure': 0.65,
    'Information Systems & IT Management': 0.6,
  },
  Cybersecurity: {
    Cybersecurity: 1,
    'Networking & Communications': 0.8,
    'Cloud & Infrastructure': 0.7,
    'Software Engineering': 0.55,
  },
  'User Experience (UX) & Design': {
    'User Experience (UX) & Design': 1,
    'Information Systems & IT Management': 0.7,
    'Software Engineering': 0.6,
  },
}

const skillResourceLinks = {
  'API Design': [
    { title: 'REST API Design Best Practices', url: 'https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/' },
    { title: 'Designing Web APIs', url: 'https://www.oreilly.com/library/view/designing-web-apis/9781492026914/' },
  ],
  'Node.js': [
    { title: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs' },
    { title: 'Node.js Crash Course', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4' },
  ],
  SQL: [
    { title: 'SQLBolt Interactive SQL', url: 'https://sqlbolt.com/' },
    { title: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/' },
  ],
  Testing: [
    { title: 'Testing JavaScript Guide', url: 'https://testingjavascript.com/' },
    { title: 'Playwright Docs', url: 'https://playwright.dev/' },
  ],
  Python: [
    { title: 'Python Official Docs', url: 'https://docs.python.org/3/' },
    { title: 'Real Python Tutorials', url: 'https://realpython.com/' },
  ],
  Communication: [
    { title: 'Business Communication Basics', url: 'https://www.mindtools.com/communication-skills' },
    { title: 'Presentation Skills', url: 'https://www.coursera.org/learn/wharton-communication-skills' },
  ],
  'Embedded Programming': [
    { title: 'Embedded C Basics', url: 'https://www.geeksforgeeks.org/c-programming-language/' },
    { title: 'STM32 Getting Started', url: 'https://wiki.st.com/stm32mcu/wiki/STM32StepByStep:Getting_started_with_STM32_' },
  ],
  Networking: [
    { title: 'Cisco Networking Basics', url: 'https://www.netacad.com/courses/networking-basics' },
    { title: 'CompTIA Network+ Guide', url: 'https://www.comptia.org/certifications/network' },
  ],
  Linux: [
    { title: 'Linux Journey', url: 'https://linuxjourney.com/' },
    { title: 'Linux Command Line Basics', url: 'https://ubuntu.com/tutorials/command-line-for-beginners' },
  ],
}

function fallbackSearchResource(title) {
  return {
    title,
    url: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
  }
}

const categorySkillTemplates = {
  'Software Engineering': ['JavaScript', 'API Design', 'Node.js', 'Testing', 'Git'],
  'Computer Engineering (Hardware)': ['C/C++', 'Embedded Programming', 'Microcontrollers', 'Debugging'],
  'Artificial Intelligence & Data Science': ['Python', 'Data Analysis', 'Statistics', 'Model Evaluation'],
  Cybersecurity: ['Security Basics', 'Networking', 'Linux', 'Troubleshooting'],
  'Cloud & Infrastructure': ['Cloud', 'Linux', 'Scripting', 'Monitoring'],
  'Networking & Communications': ['Networking', 'Linux', 'Troubleshooting', 'Communication'],
  'User Experience (UX) & Design': ['Communication', 'Documentation', 'Process Mapping'],
  'Information Systems & IT Management': ['Requirements Analysis', 'Project Planning', 'Reporting', 'SQL'],
  'Embedded Systems & IoT': ['Embedded Programming', 'Microcontrollers', 'IoT Fundamentals', 'API Design'],
}

function getKeywordSkills(career) {
  const text = `${career?.title || ''} ${career?.description || ''}`.toLowerCase()
  const byKeyword = []

  if (text.includes('backend') || text.includes('api')) {
    byKeyword.push('API Design', 'Node.js')
  }
  if (text.includes('data') || text.includes('ai') || text.includes('ml')) {
    byKeyword.push('Python', 'Data Analysis')
  }
  if (text.includes('security') || text.includes('soc') || text.includes('threat')) {
    byKeyword.push('Security Basics', 'Networking')
  }
  if (text.includes('cloud') || text.includes('devops') || text.includes('platform')) {
    byKeyword.push('Cloud', 'Scripting')
  }
  if (text.includes('embedded') || text.includes('fpga') || text.includes('hardware')) {
    byKeyword.push('Embedded Programming', 'Microcontrollers')
  }

  return Array.from(new Set(byKeyword))
}

function getCareerRequiredSkills(career) {
  const explicit = Array.isArray(career?.requiredSkills) ? career.requiredSkills.filter(Boolean) : []
  if (explicit.length > 0) {
    return explicit
  }

  const fromCategory = categorySkillTemplates[career?.category] || []
  const fromKeywords = getKeywordSkills(career)
  const combined = Array.from(new Set([...fromCategory, ...fromKeywords]))

  return combined.length > 0 ? combined.slice(0, 6) : ['Communication', 'Problem Solving']
}

function getCareerResources(career, requiredSkills) {
  const explicit = Array.isArray(career?.resources) ? career.resources.filter(Boolean) : []
  const skillBased = requiredSkills.flatMap((skill) => (skillResourceLinks[skill] || []).map((item) => item.title))
  const combinedTitles = Array.from(new Set([...explicit, ...skillBased]))

  if (combinedTitles.length === 0) {
    combinedTitles.push(`${career.title} roadmap`, `${career.title} skills`)
  }

  return combinedTitles.slice(0, 6)
}

function parseSemesterNumber(value) {
  const normalized = `${value || ''}`.toLowerCase()
  const explicit = parseInt(normalized, 10)
  if (!Number.isNaN(explicit)) {
    return Math.min(Math.max(explicit, 1), 10)
  }

  if (normalized.includes('first year') || normalized.includes('1st year') || normalized.includes('السنة الأولى')) {
    return 2
  }
  if (normalized.includes('second year') || normalized.includes('2nd year') || normalized.includes('السنة الثانية')) {
    return 4
  }
  if (normalized.includes('third year') || normalized.includes('3rd year') || normalized.includes('السنة الثالثة')) {
    return 6
  }
  if (normalized.includes('fourth year') || normalized.includes('4th year') || normalized.includes('السنة الرابعة')) {
    return 8
  }

  return 4
}

function scoreCareerByCriteria(career, selectedMajor, preferenceCategory, sortMode) {
  const majorScore = selectedMajor ? (career.major === selectedMajor ? 1 : 0.15) : 0.5
  const quizScore = !preferenceCategory
    ? 0.35
    : career.category === preferenceCategory
      ? 1
      : (quizCategoryWeights[preferenceCategory]?.[career.category] ?? 0.2)
  const demand = (career.marketDemand ?? career.demand ?? 70) / 100

  const overall = 0.5 * majorScore + 0.3 * quizScore + 0.2 * demand
  const demandScore = demand

  if (sortMode === 'major') return majorScore
  if (sortMode === 'quiz') return quizScore
  if (sortMode === 'demand') return demandScore
  return overall
}

function gradientColor(value) {
  // value=0 (least suitable) = red (hue 0), value=1 (most suitable) = green (hue 120)
  const hue = Math.round(120 * value)
  return `hsl(${hue}, 80%, 45%)`
}

function buildCareerPool(fieldSelected, _selectedMajor) {
  const allCareers = getAllCareers()
  void _selectedMajor

  if (fieldSelected) {
    const normalizedField = fieldSelected.toLowerCase()
    return allCareers.filter((career) => {
      const combined = `${career.title} ${career.category || ''} ${career.major || ''}`.toLowerCase()
      return combined.includes(normalizedField)
    })
  }

  // All jobs in market shown, major is only used in sort weighting
  return allCareers
}

function RoadMap() {
  const { jobId } = useParams()
  const [searchParams] = useSearchParams()
  const { t, isArabic } = useLanguage()
  const authUser = getCurrentUser()
  const guestData = guestDataService.getGuestData()
  const isGuest = !authUser

  const userProfile = {
    fullName: authUser?.profile?.fullName || guestData?.profile?.fullName || 'Guest User',
    major: authUser?.profile?.major || guestData?.profile?.major || 'Software Engineering',
    semester: authUser?.profile?.semester || guestData?.profile?.semester || '3rd Year',
    gpa: authUser?.profile?.gpa || guestData?.profile?.gpa || 'Not Set',
    university: authUser?.profile?.university || guestData?.profile?.college || 'Prince Sattam Bin Abdulaziz University',
  }

  const [phase, setPhase] = useState(isGuest ? 'guestProfileForm' : 'askKnown')
  const [guestMajor, setGuestMajor] = useState('')
  const [guestGraduationDate, setGuestGraduationDate] = useState('')
  const [guestCurrentLevel, setGuestCurrentLevel] = useState('')
  const [fieldSelected, setFieldSelected] = useState('')
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSelectedOption, setQuizSelectedOption] = useState('')
  const [quizResult, setQuizResult] = useState('')
  const [showQuizSummary, setShowQuizSummary] = useState(false)
  const [quizSummary, setQuizSummary] = useState({ topFields: [], topJobs: [] })
  const [sortBy, setSortBy] = useState('overall')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [roadmapViewMode, setRoadmapViewMode] = useState('overview')
  const [actualTranscriptCourses, setActualTranscriptCourses] = useState([])
  const [selectedCourseCode, setSelectedCourseCode] = useState('')
  const [selectedCourseName, setSelectedCourseName] = useState('')
  const [selectedCourseSemester, setSelectedCourseSemester] = useState('1')
  const [uploadedCourseFile, setUploadedCourseFile] = useState(null)
  const [courseFileLoading, setCourseFileLoading] = useState(false)
  const [courseFileError, setCourseFileError] = useState('')
  const [courseFileResult, setCourseFileResult] = useState(null)
  const [roadmapAiLoading, setRoadmapAiLoading] = useState(false)
  const [roadmapAiError, setRoadmapAiError] = useState('')
  const [roadmapAiResult, setRoadmapAiResult] = useState(null)
  const [selectedMajor, setSelectedMajor] = useState(userProfile.major)
  const selectedMajorLabel = useMemo(() => getMajorLabel(selectedMajor, isArabic), [selectedMajor, isArabic])
  const maxCourseSemester = selectedMajor === 'Computer Engineering' ? 9 : 8
  const [defaultRoadmapCareer, setDefaultRoadmapCareer] = useState(guestDataService.getDefaultRoadmap())
  const [favoriteRoadmaps, setFavoriteRoadmaps] = useState(guestDataService.getFavoriteRoadmaps())

  const careerPool = useMemo(() => {
    const pool = buildCareerPool(fieldSelected, selectedMajor)
    return pool
  }, [fieldSelected, selectedMajor])

  useEffect(() => {
    const transcript = guestDataService.getStudentTranscript()
    const courses = Array.isArray(transcript?.courses) ? transcript.courses : []
    setActualTranscriptCourses(courses)
  }, [])

  useEffect(() => {
    setSelectedCourseSemester((current) => {
      const numeric = Number(current)
      if (!Number.isFinite(numeric) || numeric < 1) {
        return '1'
      }
      if (numeric > maxCourseSemester) {
        return String(maxCourseSemester)
      }
      return current
    })
  }, [maxCourseSemester])

  useEffect(() => {
    if (!jobId) {
      return
    }

    const initialMajor = searchParams.get('major')
    if (initialMajor) {
      setSelectedMajor(initialMajor)
      if (isGuest) {
        setGuestMajor(initialMajor)
      }
    }

    const targetCareer = getAllCareers().find((career) => career.id === jobId)
    if (!targetCareer) {
      return
    }

    setSelectedJob(targetCareer)
    setPhase('careerList')

    if (searchParams.get('openRoadmap') === '1') {
      setShowRoadmap(true)
      setRoadmapViewMode(searchParams.get('roadmapTab') || 'overview')
    }
  }, [isGuest, jobId, searchParams])

  const categoryCounts = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 }
    Object.values(quizAnswers).forEach((answer) => {
      if (counts[answer] !== undefined) {
        counts[answer] += 1
      }
    })
    return counts
  }, [quizAnswers])

  const computedQuizCategory = useMemo(() => {
    const max = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
    return max ? answerToCategory[max[0]] : ''
  }, [categoryCounts])

  const preferenceCategory = quizResult || computedQuizCategory

  const scoredCareers = useMemo(() => {
    if (!careerPool.length) return []

    const withScores = careerPool.map((career) => {
      const score = scoreCareerByCriteria(career, selectedMajor, preferenceCategory, sortBy)
      return { ...career, score }
    })

    const scores = withScores.map((c) => c.score)
    const minScore = Math.min(...scores)
    const maxScore = Math.max(...scores)

    const normalized = withScores.map((career) => ({
      ...career,
      score: maxScore === minScore ? 1 : (career.score - minScore) / (maxScore - minScore),
    }))

    return normalized
      .sort((a, b) => b.score - a.score)
      .map((career, index) => ({ ...career, index }))
  }, [careerPool, selectedMajor, preferenceCategory, sortBy])

  const careerList = showRoadmap ? [] : scoredCareers.slice(0, 10)

  const submitQuiz = (step, option) => {
    const newAnswers = { ...quizAnswers, [step]: option }
    setQuizAnswers(newAnswers)

    if (step + 1 >= quizQuestions.length) {
      const computed = Object.entries(newAnswers).reduce((acc, [, value]) => {
        acc[value] = (acc[value] || 0) + 1
        return acc
      }, {})
      const maxOption = Object.entries(computed).sort((a, b) => b[1] - a[1])[0]
      const category = maxOption ? answerToCategory[maxOption[0]] : ''
      setQuizResult(category)

      // Prepare summary for top fields and top jobs
      const tempCareerScores = careerPool.map((career) => {
        const score = scoreCareerByCriteria(career, selectedMajor, category, sortBy)
        return { ...career, score }
      })
      const tempMin = Math.min(...tempCareerScores.map((c) => c.score))
      const tempMax = Math.max(...tempCareerScores.map((c) => c.score))
      const normalized = tempCareerScores
        .map((career) => ({
          ...career,
          score: tempMax === tempMin ? 1 : (career.score - tempMin) / (tempMax - tempMin),
        }))
        .sort((a, b) => b.score - a.score)

      const topFields = [...new Set(normalized.map((career) => career.major))].slice(0, 3)
      const topJobs = normalized.slice(0, 10)

      setQuizSummary({ topFields, topJobs })
      setShowQuizSummary(true)
      setSortBy('quiz')

      setPhase('careerList')
      setQuizStep(0)
      setQuizSelectedOption('')
      return
    }

    setQuizStep(step + 1)
    setQuizSelectedOption(newAnswers[step + 1] || '')
  }

  const saveGuestData = (profileData) => {
    const currentData = guestDataService.getGuestData() || {}
    const updatedData = {
      ...currentData,
      profile: {
        ...currentData.profile,
        ...profileData.profile,
        fullName: 'Guest User',
        semester: profileData.profile?.currentLevel || '3rd Year',
      },
    }
    guestDataService.saveGuestData(updatedData)
  }

  const majorTranscriptCourses = useMemo(() => {
    return actualTranscriptCourses.filter((course) => {
      const majorName = `${course?.major || ''}`.trim()
      return majorName ? majorName === selectedMajor : true
    })
  }, [actualTranscriptCourses, selectedMajor])

  const allMajorCourses = useMemo(() => {
    if (majorTranscriptCourses.length > 0) {
      return majorTranscriptCourses
    }

    return getCurriculumForMajor(selectedMajor)
  }, [majorTranscriptCourses, selectedMajor])

  useEffect(() => {
    if (!selectedCourseCode && allMajorCourses.length > 0) {
      setSelectedCourseCode(allMajorCourses[0].code)
      setSelectedCourseName(allMajorCourses[0].title)
    }
  }, [allMajorCourses, selectedCourseCode])

  const currentSemesterNumber = useMemo(() => {
    const guestValue = guestCurrentLevel ? parseSemesterNumber(guestCurrentLevel) : null
    const profileValue = parseSemesterNumber(userProfile.semester)
    return guestValue || profileValue
  }, [guestCurrentLevel, userProfile.semester])
  const coveredMajorCourses = useMemo(() => {
    return allMajorCourses.filter((course) => (course.semester || 1) <= currentSemesterNumber)
  }, [allMajorCourses, currentSemesterNumber])

  const majorSkills = useMemo(() => {
    const skills = new Set()
    coveredMajorCourses.forEach((course) => {
      ;(course.skills || []).forEach((s) => skills.add(s))
    })
    return Array.from(skills)
  }, [coveredMajorCourses])

  const selectedCareerDetails = selectedJob ? getAllCareers().find((c) => c.id === selectedJob.id) : null

  const skillsNeeded = useMemo(() => getCareerRequiredSkills(selectedCareerDetails || selectedJob), [selectedCareerDetails, selectedJob])
  const selectedCareerResources = useMemo(
    () => getCareerResources(selectedCareerDetails || selectedJob || {}, skillsNeeded),
    [selectedCareerDetails, selectedJob, skillsNeeded]
  )
  const roadmapOwnerId = authUser?.email || 'guest'
  const roadmapKey = useMemo(() => {
    if (!selectedJob) {
      return ''
    }

    return buildRoadmapProgressKey({
      ownerId: roadmapOwnerId,
      major: selectedMajor,
      careerId: selectedJob.id,
    })
  }, [roadmapOwnerId, selectedJob, selectedMajor])
  const matchingSkills = skillsNeeded.filter((skill) => majorSkills.includes(skill))
  const missingSkills = skillsNeeded.filter((skill) => !majorSkills.includes(skill))
  const gapPct = skillsNeeded.length ? Math.round((missingSkills.length / skillsNeeded.length) * 100) : 0

  useEffect(() => {
    if (!roadmapKey || !selectedJob) {
      return
    }

    ensureRoadmapProgress({
      roadmapKey,
      ownerId: roadmapOwnerId,
      major: selectedMajor,
      careerId: selectedJob.id,
      careerTitle: selectedJob.title,
      totalCourses: allMajorCourses.length,
    })
  }, [allMajorCourses.length, roadmapKey, roadmapOwnerId, selectedJob, selectedMajor])

  const gapRecommendations = useMemo(() => {
    if (!selectedJob) {
      return []
    }

    return missingSkills.map((skill) => {
      const relatedCourses = allMajorCourses
        .filter((course) => (course.skills || []).includes(skill))
        .slice(0, 3)

      const linkedResources = (skillResourceLinks[skill] || []).map((item) => ({
        ...item,
        sourceType: 'market',
      }))

      const fallbackCareerResources = selectedCareerResources
        .slice(0, 2)
        .map((resource) => ({ ...fallbackSearchResource(resource), sourceType: 'career' }))

      const skillFallback = [fallbackSearchResource(`${skill} tutorial`), fallbackSearchResource(`${skill} practical exercises`)]

      const resources = [...linkedResources, ...fallbackCareerResources, ...skillFallback].slice(0, 4)

      return {
        skill,
        whyImportant: getSkillExplanation(skill, isArabic),
        relatedCourses,
        resources,
      }
    })
  }, [allMajorCourses, isArabic, missingSkills, selectedCareerResources, selectedJob])

  const runSelectedRoadmapAnalysis = async (job) => {
    if (!job) {
      return
    }

    try {
      setRoadmapAiLoading(true)
      setRoadmapAiError('')

      const currentSemester = currentSemesterNumber || 6
      const marketRequirements = getMarketRequirementsForMajor(selectedMajor)

      const result = await analyzeRoadmapSelection({
        major: selectedMajor,
        category: job.category,
        targetJob: {
          id: job.id,
          title: job.title,
          category: job.category,
          marketDemand: job.marketDemand ?? job.demand,
          requiredSkills: getCareerRequiredSkills(job),
        },
        studentCourses: allMajorCourses.map((course) => ({
          code: course.code,
          title: course.title,
          semester: course.semester,
          grade: course.grade ?? 85,
          creditHours: course.creditHours ?? 3,
          skills: course.skills || [],
        })),
        marketRequirements,
        options: {
          currentSemester,
          useOllamaSummary: false,
        },
      })

      setRoadmapAiResult(result)
    } catch (error) {
      setRoadmapAiError(error instanceof Error ? error.message : 'Failed to run roadmap AI analysis')
    } finally {
      setRoadmapAiLoading(false)
    }
  }

  const handleTranscriptUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const courses = Array.isArray(parsed?.courses) ? parsed.courses : []

      if (!courses.length) {
        throw new Error('Transcript file must include a non-empty courses array')
      }

      guestDataService.saveStudentTranscript(parsed)
      setActualTranscriptCourses(courses)
    } catch (error) {
      setRoadmapAiError(error instanceof Error ? error.message : 'Invalid transcript file')
    }
  }

  const handleAnalyzeCourseFile = async () => {
    if (!uploadedCourseFile) {
      setCourseFileError(isArabic ? 'اختر ملف المقرر أولًا.' : 'Please choose a course file first.')
      return
    }

    try {
      setCourseFileLoading(true)
      setCourseFileError('')

      const result = await analyzeCourseFile({
        file: uploadedCourseFile,
        courseCode: selectedCourseCode,
        courseName: selectedCourseName || uploadedCourseFile.name,
        major: selectedMajor,
        category: selectedJob?.category || fieldSelected,
        marketRequirements: getMarketRequirementsForMajor(selectedMajor),
      })

      setCourseFileResult(result)

      const extractedSkills = Array.isArray(result?.extractedSkills) ? result.extractedSkills : []
      const nextCourses = [...actualTranscriptCourses]
      const matchingIndex = nextCourses.findIndex((course) => {
        const courseCode = String(course?.code || '').trim()
        return selectedCourseCode ? courseCode === selectedCourseCode : false
      })

      const transcriptCourse = {
        code: selectedCourseCode || uploadedCourseFile.name,
        title: selectedCourseName || uploadedCourseFile.name,
        major: selectedMajor,
        semester: Number(selectedCourseSemester) || 1,
        creditHours: 3,
        grade: result?.summary?.coveragePercent ?? 85,
        skills: extractedSkills,
        source: 'uploaded-course-file',
        fileName: uploadedCourseFile.name,
        uploadedAt: new Date().toISOString(),
      }

      if (matchingIndex >= 0) {
        nextCourses[matchingIndex] = {
          ...nextCourses[matchingIndex],
          ...transcriptCourse,
        }
      } else {
        nextCourses.push(transcriptCourse)
      }

      setActualTranscriptCourses(nextCourses)
      guestDataService.saveStudentTranscript({
        courses: nextCourses,
        major: selectedMajor,
      })
    } catch (error) {
      setCourseFileError(error instanceof Error ? error.message : 'Failed to analyze course file')
    } finally {
      setCourseFileLoading(false)
    }
  }

  const handleSetDefaultRoadmap = (career) => {
    setDefaultRoadmapCareer(career.id)
    guestDataService.setDefaultRoadmap(career.id)
  }

  const handleToggleFavoriteRoadmap = (career) => {
    const isFavorite = favoriteRoadmaps.includes(career.id)
    if (isFavorite) {
      const updated = favoriteRoadmaps.filter((id) => id !== career.id)
      setFavoriteRoadmaps(updated)
      guestDataService.removeFavoriteRoadmap(career.id)
    } else {
      const updated = [...new Set([...favoriteRoadmaps, career.id])]
      setFavoriteRoadmaps(updated)
      guestDataService.addFavoriteRoadmap(career.id)
    }
  }

  const gatedCareerList = careerList.length ? careerList : getAllCareers().slice(0, 10)

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-masari-deep px-6 py-10 text-masari-light md:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-masari-accent bg-gray-900/80 p-6">
          <h1 className="font-display text-3xl font-bold text-white">{t('roadmap.title')}</h1>
          <p className="mt-2 text-gray-300">
            Hello {userProfile.fullName}, {userProfile.major} | GPA: {userProfile.gpa} | Semester: {userProfile.semester}
          </p>
          {defaultRoadmapCareer && (
            <p className="mt-1 text-sm text-emerald-300">Default Roadmap (from settings): {defaultRoadmapCareer}</p>
          )}
          <p className="mt-3 text-gray-300">
            {t('roadmap.guestDesc')}
          </p>
        </header>

        <section className="rounded-2xl border border-sky-400/40 bg-sky-950/20 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-xl text-white">
                {isArabic ? 'رفع ملفات التخصص قبل اختيار الوظيفة' : 'Upload specialization files first'}
              </h2>
              <p className="mt-1 text-sm text-gray-300">
                {isArabic
                  ? 'هذه الخطوة خاصة بالتخصص نفسه. ارفع ملفات المقررات أولًا، ثم سيستخرج الـ AI المهارات ويقارنها بالوظائف لاحقًا.'
                  : 'This step belongs to the specialization, not a job. Upload the course files first, then AI will extract skills and compare them to jobs later.'}
              </p>
            </div>
            <div className="rounded-lg border border-sky-400/30 bg-gray-900 px-3 py-2 text-xs text-gray-200">
              {isArabic ? 'عدد المقررات المحمّلة' : 'Loaded major courses'}: {majorTranscriptCourses.length}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-200">
                {isArabic ? 'التخصص الحالي' : 'Current specialization'}
              </label>
              <select
                value={selectedMajor}
                onChange={(event) => setSelectedMajor(event.target.value)}
                className="mt-1 w-full rounded-lg border border-sky-400/30 bg-gray-900 px-3 py-2 text-sm text-gray-100"
              >
                {majors.map((major) => (
                  <option key={major} value={major}>
                    {getMajorLabel(major, isArabic)}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-sky-200">
                {isArabic ? 'التخصص المعروض هنا هو الذي سيُستخدم في التحليل.' : 'This is the specialization used in the analysis.'}
              </p>
              <p className="mt-1 text-xs text-sky-300">
                {isArabic ? 'المسار الحالي:' : 'Current track:'} {selectedMajorLabel}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-200">
                {isArabic ? 'كود المقرر' : 'Course code'}
              </label>
              <input
                type="text"
                list="major-course-codes"
                value={selectedCourseCode}
                onChange={(event) => {
                  const code = event.target.value
                  setSelectedCourseCode(code)
                  const course = allMajorCourses.find((item) => item.code === code)
                  setSelectedCourseName(course?.title || '')
                }}
                placeholder={isArabic ? 'مثال: CS101' : 'Example: CS101'}
                className="mt-1 w-full rounded-lg border border-sky-400/30 bg-gray-900 px-3 py-2 text-sm text-gray-100"
              />
              <datalist id="major-course-codes">
                {allMajorCourses.map((course) => (
                  <option key={course.code} value={course.code}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </datalist>
              <p className="mt-2 text-xs text-sky-200">
                {isArabic ? 'غيّر الكود يدويًا أو اختره من الاقتراحات.' : 'Type the code manually or pick one from the suggestions.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-200">
                {isArabic ? 'الترم' : 'Semester'}
              </label>
              <select
                value={selectedCourseSemester}
                onChange={(event) => setSelectedCourseSemester(event.target.value)}
                className="mt-1 w-full rounded-lg border border-sky-400/30 bg-gray-900 px-3 py-2 text-sm text-gray-100"
              >
                {Array.from({ length: maxCourseSemester }, (_, index) => index + 1).map((semester) => (
                  <option key={semester} value={String(semester)}>
                    {isArabic
                      ? `الترم ${semester === 1 ? 'الأول' : semester === 2 ? 'الثاني' : semester === 3 ? 'الثالث' : semester === 4 ? 'الرابع' : semester === 5 ? 'الخامس' : semester === 6 ? 'السادس' : semester === 7 ? 'السابع' : semester === 8 ? 'الثامن' : 'التاسع'}`
                      : `${semester}${semester === 1 ? 'st' : semester === 2 ? 'nd' : semester === 3 ? 'rd' : 'th'} Semester`}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-sky-200">
                {isArabic ? 'الترم الذي يدرس فيه المقرر.' : 'The semester when this course was/will be taken.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-200">
                {isArabic ? 'ملف المقرر' : 'Course file'}
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.pptx,.txt,.md,.csv"
                onChange={(event) => setUploadedCourseFile(event.target.files?.[0] || null)}
                className="mt-1 block w-full text-xs text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-masari-primary file:px-3 file:py-1.5 file:font-semibold file:text-white"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAnalyzeCourseFile}
              disabled={courseFileLoading}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-500 disabled:opacity-60"
            >
              {courseFileLoading
                ? (isArabic ? 'جاري تحليل الملف...' : 'Analyzing file...')
                : (isArabic ? 'تحليل ملف المقرر' : 'Analyze course file')}
            </button>

            <p className="text-xs text-gray-300">
              {isArabic
                ? 'يمكنك تكرار العملية لكل مقرر في هذا التخصص حتى يكتمل التحليل.'
                : 'Repeat this for each course in the major until the analysis is complete.'}
            </p>
          </div>

          {courseFileError && (
            <p className="mt-2 text-xs text-red-300">{courseFileError}</p>
          )}

          {courseFileResult && (
            <div className="mt-4 space-y-3 text-xs text-gray-200">
              <div className="grid gap-2 sm:grid-cols-3">
                <p className="rounded-md border border-sky-400/30 bg-gray-900 px-2 py-1.5">
                  <span className="font-semibold text-sky-300">{isArabic ? 'تغطية المهارات السوقية' : 'Market coverage'}:</span> {courseFileResult.directCoverage}%
                </p>
                <p className="rounded-md border border-sky-400/30 bg-gray-900 px-2 py-1.5">
                  <span className="font-semibold text-sky-300">{isArabic ? 'المهارات المستخرجة' : 'Extracted skills'}:</span> {courseFileResult.extractedSkills?.length || 0}
                </p>
                <p className="rounded-md border border-sky-400/30 bg-gray-900 px-2 py-1.5">
                  <span className="font-semibold text-sky-300">{isArabic ? 'المهارات المطابقة' : 'Matched skills'}:</span> {courseFileResult.matchedSkills?.length || 0}
                </p>
              </div>

              <div className="rounded-md border border-sky-400/30 bg-gray-900 p-2">
                <p className="font-semibold text-sky-300">{isArabic ? 'المهارات المستخرجة من الملف' : 'Skills extracted from file'}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(courseFileResult.extractedSkills || []).map((skill) => (
                    <span key={skill} className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[11px] text-sky-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {showQuizSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-masari-accent bg-gray-900 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{t('roadmap.quizSummaryTitle')}</h2>
                <button
                  onClick={() => setShowQuizSummary(false)}
                  className="rounded-lg border border-masari-accent px-3 py-1.5 text-sm font-semibold text-masari-light"
                >
                  {t('roadmap.close')}
                </button>
              </div>
              <p className="mb-4 text-gray-300">{t('roadmap.quizSummaryDesc')}</p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-masari-accent bg-gray-800 p-4">
                  <h3 className="font-semibold text-white">{t('roadmap.topFields')}</h3>
                  <ul className="mt-2 text-gray-300">
                    {quizSummary.topFields.length ? quizSummary.topFields.map((field) => <li key={field}>• {field}</li>) : <li>{t('roadmap.noTopFields')}</li>}
                  </ul>
                </div>
                <div className="rounded-xl border border-masari-accent bg-gray-800 p-4">
                  <h3 className="font-semibold text-white">{t('roadmap.topJobs')}</h3>
                  <ol className="mt-2 space-y-1 text-gray-300">
                    {quizSummary.topJobs.length ? quizSummary.topJobs.map((job) => <li key={job.id}>{job.title}</li>) : <li>{t('roadmap.noTopJobs')}</li>}
                  </ol>
                </div>
              </div>
              <div className="mt-5 text-right">
                <button
                  onClick={() => setShowQuizSummary(false)}
                  className="rounded-xl bg-masari-primary px-4 py-2 font-bold text-white"
                >
                  {t('roadmap.continue')}
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'guestProfileForm' && !authUser && (
          <section className="rounded-2xl border border-masari-accent bg-gray-800 p-6">
            <h2 className="font-semibold text-xl">{t('roadmap.guestProfileTitle')}</h2>
            <p className="mt-2 text-gray-300">{t('roadmap.guestProfileDesc')}</p>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-100">{t('roadmap.major')}</label>
                <select
                  value={guestMajor}
                  onChange={(e) => setGuestMajor(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-masari-accent bg-gray-900 px-3 py-2 text-gray-100"
                >
                  <option value="">{t('roadmap.majorPlaceholder')}</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Systems">Information Systems</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-100">{t('roadmap.graduationDate')}</label>
                <select
                  value={guestGraduationDate}
                  onChange={(e) => setGuestGraduationDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-masari-accent bg-gray-900 px-3 py-2 text-gray-100"
                >
                  <option value="">{t('roadmap.graduationDatePlaceholder')}</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                  <option value="2031">2031</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-100">{t('roadmap.currentSemester')}</label>
                <select
                  value={guestCurrentLevel}
                  onChange={(e) => setGuestCurrentLevel(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-masari-accent bg-gray-900 px-3 py-2 text-gray-100"
                >
                  <option value="">{t('roadmap.currentSemesterPlaceholder')}</option>
                  {selectedMajor === 'Computer Engineering' ? (
                    <>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Semester {i + 1}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      {Array.from({ length: 8 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Semester {i + 1}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                if (guestMajor && guestGraduationDate && guestCurrentLevel) {
                  saveGuestData({
                    profile: {
                      major: guestMajor,
                      graduationDate: guestGraduationDate,
                      currentLevel: guestCurrentLevel,
                    },
                  })
                  setSelectedMajor(guestMajor)
                  setPhase('askKnown')
                }
              }}
              disabled={!guestMajor || !guestGraduationDate || !guestCurrentLevel}
              className="mt-6 rounded-xl bg-masari-primary px-5 py-2 font-bold text-white disabled:opacity-50"
            >
              {t('roadmap.continueButton')}
            </button>
          </section>
        )}

        {phase === 'askKnown' && (
          <section className="rounded-2xl border border-masari-accent bg-gray-800 p-6">
            <h2 className="font-semibold text-xl">{t('roadmap.askKnownQuestion')}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => setPhase('fieldSelect')}
                className="rounded-xl bg-masari-primary px-5 py-2 font-bold text-white"
              >
                Yes
              </button>
              <button
                onClick={() => setPhase('quizOffer')}
                className="rounded-xl border border-masari-accent px-5 py-2 font-semibold text-masari-light"
              >
                No
              </button>
            </div>
          </section>
        )}

        {phase === 'quizOffer' && (
          <section className="rounded-2xl border border-masari-accent bg-gray-800 p-6">
            <h2 className="font-semibold text-xl">{t('roadmap.quizOfferText')}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setPhase('quiz')
                  setQuizStep(0)
                }}
                className="rounded-xl bg-masari-primary px-5 py-2 font-bold text-white"
              >
                ابدأ الكويز الآن
              </button>
              <button
                onClick={() => setPhase('careerList')}
                className="rounded-xl border border-masari-accent px-5 py-2 font-semibold text-masari-light"
              >
                تخطي الكويز
              </button>
            </div>
          </section>
        )}

        {phase === 'fieldSelect' && (
          <section className="rounded-2xl border border-masari-accent bg-gray-800 p-6">
            <div>
              <h2 className="font-semibold text-xl">{t('roadmap.fieldQuestion')}</h2>
              <p className="text-gray-300">Pick from high-level technology fields.</p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {fieldList.map((field) => (
                <button
                  key={field}
                  onClick={() => setFieldSelected(field)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    fieldSelected === field
                      ? 'border-masari-primary bg-masari-primary/20 text-white'
                      : 'border-masari-accent bg-gray-900 text-gray-100 hover:border-masari-primary'
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <button
                onClick={() => setPhase('careerList')}
                disabled={!fieldSelected}
                className="rounded-xl bg-masari-primary px-5 py-2 font-bold text-white disabled:opacity-50"
              >
                {t('roadmap.continueToCareers')}
              </button>
            </div>
          </section>
        )}

        {phase === 'careerList' && (
          <section className="rounded-2xl border border-masari-accent bg-gray-800 p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-xl">Sort careers by</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPhase('fieldSelect')}
                  className="rounded-lg border border-masari-accent px-3 py-1 text-sm text-gray-100"
                >
                  Change field
                </button>
                <button
                  onClick={() => setPhase('quizOffer')}
                  className="rounded-lg border border-masari-accent px-3 py-1 text-sm text-gray-100"
                >
                  Retake quiz
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="font-semibold">Sorting mode:</p>
              {['overall', 'major', 'quiz', 'demand'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSortBy(type)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    sortBy === type
                      ? 'bg-masari-primary text-white'
                      : 'border border-masari-accent bg-gray-900 text-masari-light hover:bg-gray-700'
                  }`}
                >
                  {type === 'overall'
                    ? 'Index (best fit)'
                    : type === 'major'
                    ? 'Nearest to your major'
                    : type === 'quiz'
                    ? 'Nearest to your quiz answers'
                    : 'Market demand'}
                </button>
              ))}
            </div>

            <div className="mb-4 rounded-xl border border-masari-accent bg-gray-900 p-3 text-xs">
              <p className="font-semibold">Color scale explanation</p>
              <p>Green = most suitable, Red = least suitable (based on current sort).</p>
              <div className="mt-2 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
            </div>

            <div className="space-y-3">
              {gatedCareerList.length === 0 && <p className="text-gray-300">No careers matched yet. Expand selection or choose a different field/major.</p>}
              {gatedCareerList.map((career, index) => {
                const ratio = gatedCareerList.length > 1 ? index / (gatedCareerList.length - 1) : 0
                return (
                  <article
                    key={career.id}
                    onClick={() => {
                      setSelectedJob(career)
                      setRoadmapAiResult(null)
                      runSelectedRoadmapAnalysis(career)
                    }}
                    className="cursor-pointer rounded-xl border bg-gray-900 p-4 transition hover:-translate-y-0.5"
                    style={{ borderColor: gradientColor(ratio) }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">{career.title}</h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: gradientColor(ratio), color: '#000' }}
                      >
                        {Math.round((career.score ?? 0) * 100)}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-sky-300">
                      {isArabic ? 'أقرب تخصص' : 'Closest major'}: {getMajorLabel(career.match?.closestMajor || career.major, isArabic)}
                      {' '}• {isArabic ? 'نسبة التطابق' : 'Match'}: {career.match?.matchPercent ?? 0}%
                    </p>
                    <p className="mt-1 text-sm text-gray-300">{career.description}</p>
                    <p className="mt-2 text-xs text-gray-400">Major: {career.major} • Category: {career.category} • Demand: {career.marketDemand}</p>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {phase === 'quiz' && (
          <section className="rounded-2xl border border-masari-accent bg-gray-800 p-6">
            <h2 className="font-semibold text-xl">كويز مساري لتحديد المسار التقني الأنسب</h2>
            <p className="mt-1 text-xs text-gray-400">
              مبني على أكثر الأسئلة الشائعة في المجال التقني واتجاهات المهارات المطلوبة (Harvard Online + LinkedIn).
            </p>
            <p className="mt-2 text-gray-300">السؤال {quizStep + 1} من {quizQuestions.length}</p>
            <p className="mt-4 text-gray-100">{quizQuestions[quizStep].text}</p>
            <p className="mt-2 rounded-lg border border-masari-accent/40 bg-gray-900 px-3 py-2 text-sm text-gray-300">
              <span className="font-semibold text-masari-primary">سبب السؤال:</span>{' '}
              {quizQuestions[quizStep].reason}
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {Object.entries(quizQuestions[quizStep].options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setQuizSelectedOption(key)}
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    quizSelectedOption === key
                      ? 'border-masari-primary bg-masari-primary/25 text-white'
                      : 'border-masari-accent bg-gray-900 text-gray-100 hover:bg-gray-700'
                  }`}
                >
                  <span className="font-bold text-masari-primary">{key}.</span> {value}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => {
                  if (quizStep === 0) {
                    setPhase('quizOffer')
                    return
                  }
                  const previous = quizStep - 1
                  setQuizStep(previous)
                  setQuizSelectedOption(quizAnswers[previous] || '')
                }}
                className="rounded-lg border border-masari-accent px-4 py-2 text-sm text-gray-100"
              >
                السابق
              </button>

              <button
                onClick={() => {
                  if (!quizSelectedOption) return
                  submitQuiz(quizStep, quizSelectedOption)
                }}
                disabled={!quizSelectedOption}
                className="rounded-lg bg-masari-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {quizStep === quizQuestions.length - 1 ? 'إنهاء الكويز' : 'التالي'}
              </button>
            </div>
          </section>
        )}

        {selectedJob && phase !== 'quiz' && (
          <>
            {/* Modal Overlay */}
            <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSelectedJob(null)} />
            
            {/* Modal Popup */}
            <div className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto rounded-2xl border border-masari-accent bg-gray-900 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="rounded-lg border border-masari-accent px-3 py-1 text-sm text-gray-100 hover:bg-gray-800"
                >
                  ✕ Close
                </button>
              </div>
              <p className="mt-2 text-gray-300">{selectedJob.description}</p>

              <div className="mt-3 rounded-xl border border-masari-accent bg-gray-800 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                  {isArabic ? 'مقررات التخصص الفعلية' : 'Actual courses for this major'}
                </p>
                <p className="mt-1 text-xs text-gray-300">
                  {majorTranscriptCourses.length > 0
                    ? (isArabic
                      ? `تم تحميل ${majorTranscriptCourses.length} مقرر فعلي لهذا التخصص من ملف الطالب.`
                      : `${majorTranscriptCourses.length} real courses are already loaded for this major.`)
                    : (isArabic
                      ? 'ارفع ملفات مقررات التخصص من قسم التخصص بالأعلى، وليس من هنا.'
                      : 'Upload major course files from the specialization section above, not from here.')}
                </p>
              </div>

              <div className="mt-3 rounded-xl border border-masari-accent bg-gray-800 p-3">
                <p className="text-sm font-semibold text-white">{isArabic ? 'وصف الوظيفة' : 'Job Overview'}</p>
                <p className="mt-1 text-sm text-gray-300">
                  {isArabic
                    ? `هذه الوظيفة (${selectedJob.title}) ضمن مسار ${selectedJob.category || 'تقني'}، وتركز على ${skillsNeeded.slice(0, 3).join('، ')}. المطلوب هو تحويل المعرفة الأكاديمية إلى تطبيق عملي متوافق مع سوق العمل.`
                    : `This role (${selectedJob.title}) belongs to the ${selectedJob.category || 'technology'} track and focuses on ${skillsNeeded.slice(0, 3).join(', ')}. The goal is to turn academic learning into practical market-ready execution.`}
                </p>
              </div>

<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleSetDefaultRoadmap(selectedJob)}
                className="rounded-lg bg-masari-primary px-4 py-2 font-semibold text-white hover:bg-masari-accent"
              >
                {t('roadmap.setDefaultRoadmap')}
              </button>
              <button
                onClick={() => handleToggleFavoriteRoadmap(selectedJob)}
                className="rounded-lg border border-masari-accent px-4 py-2 font-semibold text-masari-light hover:bg-gray-800"
              >
                {favoriteRoadmaps.includes(selectedJob.id) ? t('roadmap.removeFavorite') : t('roadmap.addFavorite')}
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-masari-accent bg-gray-800 p-4">
                  <p className="font-semibold text-white">{t('roadmap.leastRequirements')}</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-300">
                    {skillsNeeded.map((skill) => (
                      <li key={skill}>• {skill}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-masari-accent bg-gray-800 p-4">
                  <p className="font-semibold text-white">{t('roadmap.majorSkillsForJob')}</p>
                  <p className="mt-2 text-sm text-gray-300">{t('roadmap.matched')}: {matchingSkills.length} / {skillsNeeded.length}</p>
                  <p className="text-sm text-gray-300">{t('roadmap.missing')}: {missingSkills.length}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-masari-accent bg-gray-800 p-4">
                <p className="font-semibold text-white">{t('roadmap.gapPercentage')}</p>
                <p className="mt-1 text-lg font-bold" style={{ color: gapPct < 30 ? '#34d399' : gapPct < 60 ? '#f59e0b' : '#ef4444' }}>
                  {gapPct}%
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-sky-400/40 bg-sky-950/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">
                    {isArabic ? 'تحليل AI للوظيفة المختارة (السوق السعودي + فجوة المهارات)' : 'AI job analysis (Saudi market + skill gap)'}
                  </p>
                  <button
                    type="button"
                    onClick={() => runSelectedRoadmapAnalysis(selectedJob)}
                    disabled={roadmapAiLoading}
                    className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-sky-500 disabled:opacity-60"
                  >
                    {roadmapAiLoading
                      ? (isArabic ? 'جاري التحليل...' : 'Analyzing...')
                      : (isArabic ? 'إعادة التحليل' : 'Re-run analysis')}
                  </button>
                </div>

                {roadmapAiError && (
                  <p className="mt-2 text-xs text-red-300">{roadmapAiError}</p>
                )}

                {roadmapAiResult ? (
                  <div className="mt-3 space-y-3 text-xs text-gray-200">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <p className="rounded-md border border-sky-400/30 bg-gray-900 px-2 py-1.5">
                        <span className="font-semibold text-sky-300">{isArabic ? 'نسبة الفجوة' : 'Gap'}:</span> {roadmapAiResult.summary?.gapPercent ?? 0}%
                      </p>
                      <p className="rounded-md border border-sky-400/30 bg-gray-900 px-2 py-1.5">
                        <span className="font-semibold text-sky-300">{isArabic ? 'الجاهزية' : 'Readiness'}:</span> {roadmapAiResult.summary?.readinessPercent ?? 0}%
                      </p>
                      <p className="rounded-md border border-sky-400/30 bg-gray-900 px-2 py-1.5">
                        <span className="font-semibold text-sky-300">{isArabic ? 'إشارة التوظيف' : 'Hiring signal'}:</span> {roadmapAiResult.saudiOutlook?.hiringSignal ?? 0}%
                      </p>
                    </div>

                    <p className="rounded-md border border-sky-400/30 bg-gray-900 px-2 py-2">
                      <span className="font-semibold text-sky-300">{isArabic ? 'مستقبل الوظيفة في السعودية' : 'Saudi outlook'}:</span>
                      {' '}
                      {roadmapAiResult.saudiOutlook?.interpretation}
                      {' '}
                      ({roadmapAiResult.saudiOutlook?.confidencePercent ?? 0}%)
                    </p>

                    <div className="rounded-md border border-sky-400/30 bg-gray-900 p-2">
                      <p className="font-semibold text-sky-300">
                        {isArabic ? 'المصادر الخارجية المستخدمة في المقارنة' : 'External trusted sources used for comparison'}
                      </p>
                      <ul className="mt-1 space-y-1">
                        {(roadmapAiResult.externalComparison?.sources || []).map((source) => (
                          <li key={source.id}>
                            • <a href={source.url} target="_blank" rel="noreferrer" className="text-sky-200 underline">{source.name}</a>
                            {' '}- {isArabic ? 'موثوقية' : 'trust'}: {Math.round((source.trustWeight || 0) * 100)}%
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-md border border-sky-400/30 bg-gray-900 p-2">
                      <p className="font-semibold text-sky-300">{isArabic ? 'المقررات الفعلية الأكثر ارتباطًا بهذه الوظيفة' : 'Most relevant actual student courses'}</p>
                      <ul className="mt-1 space-y-1">
                        {(roadmapAiResult.relevantStudentCourses || []).slice(0, 6).map((item) => (
                          <li key={`${item.code}-${item.semester}`}>• {item.code} - {item.title} ({item.overlapSkills.join(', ')})</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-md border border-sky-400/30 bg-gray-900 p-2">
                      <p className="font-semibold text-sky-300">{isArabic ? 'أفضل مصادر لسد الفجوة' : 'Top gap-closure resources'}</p>
                      <ul className="mt-1 space-y-1">
                        {(roadmapAiResult.actionPlan || []).slice(0, 5).map((item) => (
                          <li key={item.skill}>
                            • {item.skill} ({item.gapPercent}%): {item.recommendedResources?.[0]?.title || '-'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-300">
                    {isArabic
                      ? 'اختَر الوظيفة وسيتم التحليل تلقائيًا. يمكنك رفع ملف المقررات الفعلية لزيادة دقة النتيجة.'
                      : 'Select a job to run analysis automatically. Upload real transcript data to improve accuracy.'}
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowRoadmap((value) => !value)}
                className="mt-4 rounded-xl bg-masari-primary px-5 py-2 font-bold text-white hover:bg-masari-accent transition"
              >
                {showRoadmap ? 'Hide' : 'Show'} roadmap for this job
              </button>

              {showRoadmap && (
                <div className="mt-5 rounded-xl border border-masari-accent bg-gray-800 p-4">
                  <h3 className="text-lg font-semibold">{isArabic ? 'القائمة الثانية: تفاصيل الخريطة' : 'Second List: Roadmap Details'}</h3>
                  <p className="text-sm text-gray-300">
                    {isArabic
                      ? 'هنا تظهر تفاصيل الخريطة المختارة، مع خطة سد الفجوات بين مقررات الجامعة ومتطلبات سوق العمل.'
                      : 'This section shows the selected roadmap details with a gap-closing plan between university curriculum and market requirements.'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setRoadmapViewMode('overview')}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                        roadmapViewMode === 'overview'
                          ? 'border-masari-primary bg-masari-primary text-white'
                          : 'border-masari-accent bg-gray-900 text-gray-100'
                      }`}
                    >
                      {isArabic ? 'قائمة الخريطة' : 'Roadmap List'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoadmapViewMode('gaps')}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                        roadmapViewMode === 'gaps'
                          ? 'border-masari-primary bg-masari-primary text-white'
                          : 'border-masari-accent bg-gray-900 text-gray-100'
                      }`}
                    >
                      {isArabic ? 'مواد مقترحة لسد الفجوات' : 'Gap-Closure Courses'}
                    </button>
                  </div>

                  {roadmapViewMode === 'overview' && (
                    <>
                      <div className="mt-4 space-y-2">
                        {allMajorCourses.map((course, index) => {
                          const hasRelevantSkill = (course.skills || []).some((skill) => skillsNeeded.includes(skill))
                          const isFinal = index === allMajorCourses.length - 1
                          return (
                            <div key={course.code}>
                              <div className="flex items-start gap-3">
                                <div className="mt-1 flex flex-col items-center">
                                  <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold ${hasRelevantSkill ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : 'border-gray-600 bg-gray-700/20 text-gray-400'}`}>
                                    {index + 1}
                                  </div>
                                  {!isFinal && <div className={`h-6 w-0.5 ${hasRelevantSkill ? 'bg-emerald-500/40' : 'bg-gray-600/40'}`} />}
                                </div>

                                <div className={`flex-1 rounded-lg border p-3 ${hasRelevantSkill ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-gray-700 bg-gray-900'}`}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-white">{course.code} - {course.title}</p>
                                      <p className="mt-0.5 text-xs text-gray-400">Skills: {(course.skills || []).join(', ')}</p>
                                    </div>
                                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${hasRelevantSkill ? 'bg-emerald-500 text-black' : 'bg-gray-700 text-gray-100'}`}>
                                      {hasRelevantSkill ? 'Targets job' : 'Foundation'}
                                    </span>
                                  </div>
                                  {(course.skills || []).filter((skill) => missingSkills.includes(skill)).length > 0 && (
                                    <p className="mt-1.5 text-xs text-yellow-300">✔ Helps fill gap: {course.skills.filter((skill) => missingSkills.includes(skill)).join(', ')}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        <div className="mt-4 flex items-start gap-3 border-t border-masari-accent/30 pt-3">
                          <div className="mt-1 flex items-center justify-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-masari-primary bg-masari-primary/20">
                              <span className="text-xs font-bold text-masari-primary">✓</span>
                            </div>
                          </div>
                          <div className="flex-1 rounded-lg border border-masari-accent/50 bg-masari-primary/10 p-3">
                            <p className="font-semibold text-white">{selectedJob.title}</p>
                            <p className="mt-1 text-xs text-gray-300">Career Goal</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-masari-accent bg-gray-900 p-3">
                        <p className="font-semibold text-white">Recommended learning to close gaps</p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-300">
                          {selectedCareerResources.map((resource) => (
                            <li key={resource}>• {resource}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {roadmapViewMode === 'gaps' && (
                    <div className="mt-4 space-y-3">
                      {gapRecommendations.length > 0 ? (
                        gapRecommendations.map((item) => (
                          <article key={item.skill} className="rounded-xl border border-masari-accent bg-gray-900 p-4">
                            <h4 className="font-semibold text-white">{item.skill}</h4>
                            <p className="mt-1 text-sm text-gray-300">{item.whyImportant}</p>

                            <div className="mt-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                                {isArabic ? 'مواد جامعية مقترحة' : 'Suggested University Courses'}
                              </p>
                              {item.relatedCourses.length > 0 ? (
                                <ul className="mt-2 space-y-2">
                                  {item.relatedCourses.map((course) => (
                                    <li key={`${item.skill}-${course.code}`} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                                      <p className="text-sm font-semibold text-white">{course.code} - {course.title}</p>
                                      <p className="mt-1 text-xs text-gray-300">{getCourseDescription(course, isArabic)}</p>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="mt-2 text-sm text-gray-300">
                                  {isArabic
                                    ? 'لا يوجد مقرر مباشر يغطي هذه المهارة بالكامل، يُفضل إضافة نشاط تدريبي خارجي.'
                                    : 'No direct course fully covers this skill; consider adding external practical training.'}
                                </p>
                              )}
                            </div>

                            <div className="mt-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                                {isArabic ? 'مصادر سوق العمل المقترحة' : 'Suggested Market Resources'}
                              </p>
                              <ul className="mt-2 space-y-2">
                                {item.resources.map((resource) => (
                                  <li key={`${item.skill}-${resource.title}`}>
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-1.5 text-sm text-sky-200 transition hover:border-sky-400"
                                    >
                                      {resource.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                          {isArabic
                            ? 'ممتاز! لا توجد فجوات رئيسية حالياً بين مقررات الجامعة ومتطلبات هذه الوظيفة.'
                            : 'Great! No major gaps detected between your university curriculum and this role requirements.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {phase !== 'askKnown' && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setPhase('askKnown')
                setFieldSelected('')
                setQuizStep(0)
                setQuizAnswers({})
                setQuizResult('')
                setSelectedJob(null)
                setShowRoadmap(false)
                setRoadmapViewMode('overview')
              }}
              className="rounded-lg border border-masari-accent px-4 py-2 text-sm text-gray-200"
            >
              Restart Journey
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoadMap
