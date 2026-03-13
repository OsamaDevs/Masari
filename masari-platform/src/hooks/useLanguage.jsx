import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'masariLanguage'

const translations = {
  en: {
    app: {
      language: 'العربية',
      logout: 'Logout',
      brand: 'مساري',
    },
    nav: {
      dashboard: 'Dashboard',
      job: 'Job Details',
      roadmap: 'Roadmap',
      courseAnalysis: 'Course Analysis',
    },
    login: {
      badge: 'Masari Platform',
      heading: 'Welcome back, future-ready student.',
      subtitle:
        'Sign in with your Prince Sattam Bin Abdulaziz University student account.',
      cardTitle: 'Student Login',
      allowedEmail: 'Allowed email format:',
      dummyAccounts: 'Dummy accounts:',
      passwordHint: 'Password:',
      email: 'University Email',
      password: 'Password',
      emailPlaceholder: 'e.g. ahmad.2022@std.psau.edu.sa',
      passwordPlaceholder: 'Enter password',
      login: 'Login',
      signUp: 'Sign Up',
      featureOne: 'PSAU student authentication',
      featureTwo: 'Career dashboard and roadmap',
      requiredError: 'Please enter your university email and password.',
      invalidDomain: 'Use your university email ending with @std.psau.edu.sa to sign in.',
      invalidCredentials: 'Invalid email or password. Try one of the dummy student accounts.',
    },
    dashboard: {
      badge: 'Student Dashboard',
      title: 'Recommended Jobs for Your Major',
      subtitle: 'Welcome {{name}}. Explore careers aligned with your major and current academic profile.',
      university: 'University',
      college: 'College',
      major: 'Major',
      collegeYear: 'College Year',
      semester: 'Semester',
      studentId: 'Student ID',
      gpa: 'GPA',
      careerGoal: 'Career Goal',
      applicationPriority: 'Application Priority',
      applyCareer: 'Apply for this career',
      noCareers: 'No careers found for this major. Please adjust the dummy profile later if needed.',
    },
    job: {
      notFoundTitle: 'Career Not Found',
      notFoundDesc: 'Please return to the dashboard and select an available career.',
      goDashboard: 'Go to Dashboard',
      badge: 'Job Details',
      yourCollege: 'Your College',
      descriptionTitle: 'Job Description',
      personalizedDesc: 'This recommendation is personalized from your selected college and major to maximize your internship readiness.',
      skillsTitle: 'Required Skills',
      prepareTitle: 'Ready to prepare for this role?',
      prepareDesc: 'Generate a personalized learning roadmap with milestones, courses, and projects tailored to this job opportunity.',
      generateRoadmap: 'Generate Career Roadmap',
    },
    roadmap: {
      unavailableTitle: 'Roadmap Unavailable',
      unavailableDesc: 'Please choose a career from dashboard first to generate a roadmap.',
      careerRoadmap: 'Career Roadmap',
      roadmapFor: 'Roadmap for {{title}}',
      generatedFrom: 'Generated from your profile: {{major}}{{college}}. Compare each semester course against role requirements and close skill gaps.',
      student: 'Student',
      involvedCourses: 'Involved Courses',
      remainingCourses: 'Remaining Courses',
      current: 'Current',
      completed: 'Completed',
      ongoing: 'Ongoing',
      remaining: 'Remaining',
      matchToJob: 'Match to job requirements',
      detectedGaps: 'Detected Gaps',
      extraResources: 'Extra Resources',
    },
    course: {
      badge: 'Masari Course Analysis',
      title: 'Compare Courses with Job Skill Requirements',
      subtitle: 'Understand how your university courses align with real industry roles, identify skill gaps, and follow recommended learning resources.',
      searchPlaceholder: 'Search by course name or code',
      majorFilter: 'Major',
      semesterFilter: 'Semester',
      allSemesters: 'All Semesters',
      marketRequirementsTitle: 'Saudi Market Requirements',
      companiesContributing: 'Companies contributing requirements',
      currentSemester: 'Current Semester',
      activeRequirements: 'Active Requirements',
      requirementWindow: 'Semester Window',
      companyWeight: 'Company Weight',
      role: 'Target Role',
      demandSkills: 'Demanded Skills',
      details: 'Details',
      companiesSuggesting: 'Companies Suggesting This Course',
      noCompanyMatches: 'No matching companies for this course at the current level.',
      totalCourses: 'Total Courses',
      averageMatch: 'Average Match',
      topCompanies: 'Top Market Companies',
      sortHigh: 'Sort: Match High to Low',
      sortLow: 'Sort: Match Low to High',
      sortAZ: 'Sort: Course A-Z',
      sortSemester: 'Sort: Semester Asc',
      track: 'Track',
      matchingPercentage: 'Matching Percentage',
      skillsGained: 'Skills Gained',
      missingSkills: 'Missing Skills',
      suggestedResources: 'Suggested Learning Resources',
      closeDetails: 'Close Details',
      noCourses: 'No courses found for the selected filter.',
      all: 'All',
    },
    landing: {
      demo: 'Request Demo',
      badge: 'AI Career Navigation for Students',
      title: 'Turn every course into a career advantage.',
      subtitle: 'Masari uses AI to map university courses to real-world job paths, internships, and in-demand skills so students can plan smarter from day one.',
      primary: 'Start Exploring Roles',
      secondary: 'See How It Works',
      semester: 'This Semester',
      course: 'Data Structures and Algorithms',
      suggestedRole: 'Suggested role',
      role: 'Backend Engineer Intern',
      gapTitle: 'Skill gap to close',
      gap: 'API design and system thinking',
      why: 'Why Students Choose Masari',
      featureOneTitle: 'Course-to-Job Mapping',
      featureOneDesc: 'Instantly see which careers align with your current subjects and degree pathway.',
      featureTwoTitle: 'Personalized Skill Plan',
      featureTwoDesc: 'AI recommends projects, certifications, and electives to close skill gaps before graduation.',
      featureThreeTitle: 'Opportunity Matching',
      featureThreeDesc: 'Discover internships and entry roles that match your coursework, interests, and progress level.',
      ctaTitle: 'Build your future while you study.',
      ctaDesc: 'Join Masari and get AI-powered career guidance that evolves with every semester.',
      ctaButton: 'Join Masari Free',
      footerOne: '2026 Masari Platform. Built for ambitious students.',
      footerTwo: 'Connect courses, skills, and career opportunities in one place.',
    },
  },
  ar: {
    app: {
      language: 'English',
      logout: 'تسجيل الخروج',
      brand: 'مساري',
    },
    nav: {
      dashboard: 'لوحة التحكم',
      job: 'تفاصيل الوظيفة',
      roadmap: 'الخريطة المهنية',
      courseAnalysis: 'تحليل المقررات',
    },
    login: {
      badge: 'منصة مساري',
      heading: 'مرحباً بعودتك، أيها الطالب المستعد للمستقبل.',
      subtitle: 'سجّل الدخول باستخدام حسابك الطلابي في جامعة الأمير سطام بن عبدالعزيز.',
      cardTitle: 'دخول الطالب',
      allowedEmail: 'صيغة البريد المسموحة:',
      dummyAccounts: 'الحسابات التجريبية:',
      passwordHint: 'كلمة المرور:',
      email: 'البريد الجامعي',
      password: 'كلمة المرور',
      emailPlaceholder: 'مثال: ahmad.2022@std.psau.edu.sa',
      passwordPlaceholder: 'أدخل كلمة المرور',
      login: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      featureOne: 'توثيق طلاب جامعة الأمير سطام',
      featureTwo: 'لوحة مهنية وخارطة طريق',
      requiredError: 'يرجى إدخال البريد الجامعي وكلمة المرور.',
      invalidDomain: 'يجب استخدام بريد الجامعة المنتهي بـ @std.psau.edu.sa.',
      invalidCredentials: 'البريد أو كلمة المرور غير صحيحة. جرّب أحد الحسابات التجريبية.',
    },
    dashboard: {
      badge: 'لوحة الطالب',
      title: 'الوظائف المناسبة لتخصصك',
      subtitle: 'مرحباً {{name}}. استكشف الوظائف المتوافقة مع تخصصك وملفك الأكاديمي الحالي.',
      university: 'الجامعة',
      college: 'الكلية',
      major: 'التخصص',
      collegeYear: 'السنة الدراسية',
      semester: 'الفصل الدراسي',
      studentId: 'الرقم الجامعي',
      gpa: 'المعدل',
      careerGoal: 'الهدف المهني',
      applicationPriority: 'أولوية التقديم',
      applyCareer: 'التقديم على هذا المسار',
      noCareers: 'لا توجد وظائف مطابقة لهذا التخصص حالياً. يمكنك تعديل البيانات التجريبية لاحقاً.',
    },
    job: {
      notFoundTitle: 'الوظيفة غير موجودة',
      notFoundDesc: 'يرجى العودة إلى لوحة التحكم واختيار وظيفة متاحة.',
      goDashboard: 'العودة إلى اللوحة',
      badge: 'تفاصيل الوظيفة',
      yourCollege: 'كليتك',
      descriptionTitle: 'وصف الوظيفة',
      personalizedDesc: 'تم تخصيص هذا الترشيح بناءً على كليتك وتخصصك لزيادة جاهزيتك للتدريب والعمل.',
      skillsTitle: 'المهارات المطلوبة',
      prepareTitle: 'هل أنت مستعد للاستعداد لهذه الوظيفة؟',
      prepareDesc: 'أنشئ خارطة طريق تعليمية مخصصة تتضمن مراحل ومقررات ومشاريع ملائمة لهذه الفرصة.',
      generateRoadmap: 'إنشاء الخريطة المهنية',
    },
    roadmap: {
      unavailableTitle: 'الخريطة غير متاحة',
      unavailableDesc: 'يرجى اختيار وظيفة من لوحة التحكم أولاً لإنشاء الخريطة.',
      careerRoadmap: 'الخريطة المهنية',
      roadmapFor: 'الخريطة المهنية لـ {{title}}',
      generatedFrom: 'تم الإنشاء بناءً على ملفك: {{major}}{{college}}. قارن كل مقرر بمتطلبات الوظيفة وأغلق فجوات المهارات.',
      student: 'الطالب',
      involvedCourses: 'المقررات التي درسها',
      remainingCourses: 'المقررات المتبقية',
      current: 'الحالي',
      completed: 'مكتمل',
      ongoing: 'جاري',
      remaining: 'متبقي',
      matchToJob: 'نسبة التطابق مع الوظيفة',
      detectedGaps: 'الفجوات المكتشفة',
      extraResources: 'موارد إضافية',
    },
    course: {
      badge: 'تحليل مقررات مساري',
      title: 'قارن المقررات مع متطلبات الوظائف',
      subtitle: 'افهم كيف تتوافق مقرراتك الجامعية مع الأدوار المهنية الحقيقية وحدد فجوات المهارات واتبع الموارد المقترحة.',
      searchPlaceholder: 'ابحث باسم المقرر أو رمزه',
      majorFilter: 'التخصص',
      semesterFilter: 'الفصل',
      allSemesters: 'كل الفصول',
      marketRequirementsTitle: 'متطلبات سوق العمل السعودي',
      companiesContributing: 'الشركات التي وضعت هذه المتطلبات',
      currentSemester: 'الفصل الحالي',
      activeRequirements: 'المتطلبات النشطة',
      requirementWindow: 'نطاق الفصول',
      companyWeight: 'وزن الشركة',
      role: 'الدور الوظيفي المستهدف',
      demandSkills: 'المهارات المطلوبة',
      details: 'التفاصيل',
      companiesSuggesting: 'الشركات التي تقترح هذا المقرر',
      noCompanyMatches: 'لا توجد شركات مطابقة لهذا المقرر في المستوى الحالي.',
      totalCourses: 'إجمالي المقررات',
      averageMatch: 'متوسط التطابق',
      topCompanies: 'أبرز شركات السوق',
      sortHigh: 'الترتيب: أعلى تطابق إلى أقل',
      sortLow: 'الترتيب: أقل تطابق إلى أعلى',
      sortAZ: 'الترتيب: المقررات أبجدياً',
      sortSemester: 'الترتيب: حسب الفصل تصاعدياً',
      track: 'المسار',
      matchingPercentage: 'نسبة التطابق',
      skillsGained: 'المهارات المكتسبة',
      missingSkills: 'المهارات الناقصة',
      suggestedResources: 'الموارد التعليمية المقترحة',
      closeDetails: 'إغلاق التفاصيل',
      noCourses: 'لا توجد مقررات مطابقة للفلترة المحددة.',
      all: 'الكل',
    },
    landing: {
      demo: 'اطلب عرضاً تجريبياً',
      badge: 'إرشاد مهني ذكي للطلاب',
      title: 'حوّل كل مقرر إلى فرصة مهنية.',
      subtitle: 'تستخدم مساري الذكاء الاصطناعي لربط المقررات الجامعية بالمسارات الوظيفية الحقيقية والتدريب والمهارات المطلوبة حتى يخطط الطالب بشكل أفضل من اليوم الأول.',
      primary: 'ابدأ استكشاف الوظائف',
      secondary: 'اعرف كيف تعمل المنصة',
      semester: 'هذا الفصل',
      course: 'هياكل البيانات والخوارزميات',
      suggestedRole: 'الوظيفة المقترحة',
      role: 'متدرب مهندس برمجيات خلفية',
      gapTitle: 'فجوة مهارية تحتاج إغلاقها',
      gap: 'تصميم الواجهات البرمجية والتفكير المنظومي',
      why: 'لماذا يختار الطلاب منصة مساري',
      featureOneTitle: 'ربط المقررات بالوظائف',
      featureOneDesc: 'اعرف فوراً الوظائف التي تتوافق مع مقرراتك الحالية وخطتك الدراسية.',
      featureTwoTitle: 'خطة مهارية مخصصة',
      featureTwoDesc: 'يقترح الذكاء الاصطناعي مشاريع وشهادات ومقررات اختيارية لسد الفجوات قبل التخرج.',
      featureThreeTitle: 'مطابقة الفرص',
      featureThreeDesc: 'اكتشف التدريبات والوظائف المبتدئة المناسبة لمقرراتك واهتماماتك ومستواك الحالي.',
      ctaTitle: 'ابنِ مستقبلك أثناء الدراسة.',
      ctaDesc: 'انضم إلى مساري واحصل على إرشاد مهني ذكي يتطور مع كل فصل دراسي.',
      ctaButton: 'انضم إلى مساري مجاناً',
      footerOne: 'منصة مساري 2026. صممت للطلاب الطموحين.',
      footerTwo: 'اربط بين المقررات والمهارات والفرص المهنية في مكان واحد.',
    },
  },
}

const LanguageContext = createContext(null)

function getValue(object, path) {
  return path.split('.').reduce((current, key) => current?.[key], object)
}

function interpolate(text, values = {}) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), value ?? ''),
    text
  )
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'ar' ? 'ar' : 'en'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
  }, [language])

  const value = useMemo(() => {
    const t = (path, values) => {
      const current = getValue(translations[language], path)
      const fallback = getValue(translations.en, path)
      const text = current ?? fallback ?? path
      return typeof text === 'string' ? interpolate(text, values) : text
    }

    return {
      language,
      isArabic: language === 'ar',
      setLanguage,
      toggleLanguage: () => setLanguage((previous) => (previous === 'en' ? 'ar' : 'en')),
      t,
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
