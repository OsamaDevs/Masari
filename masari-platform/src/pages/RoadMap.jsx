import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCurriculumForMajor,
  getMajorLabel,
  getRecommendedCareers,
  getAllCareers,
  majors,
  careersByMajor,
} from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { getCurrentUser } from '../services/auth'
import { guestDataService } from '../services/guestDataService'

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
    text: 'If you were given a mysterious black box that performs a task, what is your first move?',
    options: {
      A: 'Decorate the box and make the interface easier to use.',
      B: 'Open it up to see the circuit boards and microchips inside.',
      C: 'Write a script to automate what the box does.',
      D: 'Feed it data to see if it can predict the next outcome.',
      E: 'Hack into it to see if it’s vulnerable.',
    },
  },
  {
    text: 'Which of these sounds like a fun Saturday project?',
    options: {
      A: 'Designing a personal brand logo or a sleek website landing page.',
      B: 'Building a smart mirror using a Raspberry Pi and soldering wires.',
      C: 'Building a high-performance web server or a mobile app.',
      D: 'Creating a bot that identifies objects in your room using a camera.',
      E: 'Setting up a home lab with firewalls and secure file storage.',
    },
  },
  {
    text: 'When a device stops working, what do you suspect first?',
    options: {
      A: 'The user interface is confusing.',
      B: 'A physical component burned out.',
      C: 'There is a bug in the software logic.',
      D: 'The algorithm is biased or lacks enough data.',
      E: 'A background process is being throttled or attacked.',
    },
  },
  {
    text: 'In a Smart City project, which role would you grab?',
    options: {
      A: 'Designing how citizens interact with the city app.',
      B: 'Designing sensors and controllers on streetlights.',
      C: 'Writing the backend system connecting services.',
      D: 'Analyzing traffic patterns to optimize flow.',
      E: 'Ensuring the power grid cannot be remotely shut down.',
    },
  },
  {
    text: 'Which subject peaks your curiosity?',
    options: {
      A: 'Human-Computer Interaction (HCI).',
      B: 'Digital Logic Design and VLSI.',
      C: 'Data Structures and Algorithms.',
      D: 'Probability and Neural Networks.',
      E: 'Network Security and Cryptography.',
    },
  },
  {
    text: 'What is your favorite level of technology?',
    options: {
      A: 'The Surface: what the user sees and touches.',
      B: 'The Metal: physical chips and electrical signals.',
      C: 'The Logic: code and instructions.',
      D: 'The Brain: patterns and learning.',
      E: 'The Shield: walls and permissions.',
    },
  },
  {
    text: 'If you were at a Hackathon, you’d spend the most time...',
    options: {
      A: 'Perfecting the CSS and user journey.',
      B: 'Debugging a microcontroller or Arduino.',
      C: 'Architecting the API and database.',
      D: 'Training a model on a large dataset.',
      E: 'Stress-testing the system for leaks.',
    },
  },
  {
    text: 'Pick a tool that sounds interesting:',
    options: {
      A: 'Figma or Adobe XD.',
      B: 'Oscilloscope or Multimeter.',
      C: 'VS Code or IntelliJ.',
      D: 'Jupyter Notebook or PyTorch.',
      E: 'Wireshark or Kali Linux.',
    },
  },
  {
    text: 'What does Efficiency mean to you?',
    options: {
      A: 'Reducing the number of clicks a user makes.',
      B: 'Reducing power consumption and heat in a chip.',
      C: 'Making code run in O(n log n) instead of O(n^2).',
      D: 'Increasing prediction accuracy from 85% to 95%.',
      E: 'Reducing the attack surface of a network.',
    },
  },
  {
    text: 'When you hear Apple, what do you think of?',
    options: {
      A: 'Beautiful, minimalist design.',
      B: 'Incredible chip architecture.',
      C: 'Seamless app ecosystem.',
      D: 'FaceID and Siri intelligence.',
      E: 'End-to-end encryption security.',
    },
  },
  {
    text: 'Do you prefer working with things you can...',
    options: {
      A: 'Visualize.',
      B: 'Touch.',
      C: 'Build.',
      D: 'Analyze.',
      E: 'Protect.',
    },
  },
  {
    text: 'Which Problem irritates you the most?',
    options: {
      A: 'Ugly responsive website.',
      B: 'Remote control battery drain.',
      C: 'App crashes under load.',
      D: 'Bad recommendation engine.',
      E: 'Password leak notification.',
    },
  },
  {
    text: 'In a car, you are most interested in:',
    options: {
      A: 'Dashboard display and comfort.',
      B: 'ECU and hardware sensors.',
      C: 'Infotainment software and navigation.',
      D: 'Self-driving features and lane detection.',
      E: 'Security of keyless entry system.',
    },
  },
  {
    text: 'What is your ideal work environment?',
    options: {
      A: 'Creative agency with whiteboards.',
      B: 'Lab with hardware kits and soldering.',
      C: 'High-growth startup building big products.',
      D: 'Research center for new insights.',
      E: 'Security operations center.',
    },
  },
  {
    text: 'If you were learning a new language, you’d pick:',
    options: {
      A: 'CSS/Swift (UI).',
      B: 'Verilog/Assembly (Hardware).',
      C: 'Java/Go (Backend/Systems).',
      D: 'Python/R (Data/AI).',
      E: 'C/Bash (Security/Scripting).',
    },
  },
  {
    text: 'How do you feel about Complexity?',
    options: {
      A: 'Hide it from users.',
      B: 'Fit more transistors in small space.',
      C: 'Manage modules communication.',
      D: 'Find signal in the noise.',
      E: 'Find vulnerabilities to shore up.',
    },
  },
  {
    text: 'Which Magic trick is coolest?',
    options: {
      A: 'Dark mode switch.',
      B: 'Tiny chip billions calc/s.',
      C: 'Deploy code to 1M users.',
      D: 'Computer writes poems.',
      E: 'Sending unbreakable secret message.',
    },
  },
  {
    text: 'Your favorite Optimization is:',
    options: {
      A: 'Aesthetic/usability.',
      B: 'Clock speed/thermal.',
      C: 'Scalability/memory.',
      D: 'Model weight/hyperparams.',
      E: 'Firewall/permission.',
    },
  },
  {
    text: 'What kind of Legacy do you want?',
    options: {
      A: 'Made tech feel human.',
      B: 'Built hardware era.',
      C: 'Built platforms world runs on.',
      D: 'Solved complex data problems.',
      E: 'Kept digital life safe.',
    },
  },
  {
    text: 'Finish: The best part of tech is...',
    options: {
      A: 'How it looks and feels.',
      B: 'Physics and engineering.',
      C: 'Logic and code power.',
      D: 'Intelligence and possibilities.',
      E: 'Privacy and resilience.',
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

function scoreCareerByCriteria(career, selectedMajor, preferenceCategory, sortMode) {
  const matchesMajor = career.major === selectedMajor ? 1 : 0.3
  const matchesPref = career.category === preferenceCategory ? 1 : 0.4
  const demand = (career.marketDemand ?? 70) / 100

  const overall = 0.45 * matchesMajor + 0.35 * matchesPref + 0.2 * demand
  const majorScore = matchesMajor
  const prefScore = matchesPref
  const demandScore = demand

  if (sortMode === 'major') return majorScore
  if (sortMode === 'preference') return prefScore
  if (sortMode === 'demand') return demandScore
  return overall
}

function gradientColor(value) {
  const hue = 120 - Math.round(120 * value)
  return `hsl(${hue}, 80%, 45%)`
}

function buildCareerPool(fieldSelected, selectedMajor) {
  const allCareers = getAllCareers()

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
  const navigate = useNavigate()
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
  const [knowsField, setKnowsField] = useState(null)
  const [fieldSelected, setFieldSelected] = useState('')
  const [quizConsent, setQuizConsent] = useState(null)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSelectedOption, setQuizSelectedOption] = useState('')
  const [quizResult, setQuizResult] = useState('')
  const [sortBy, setSortBy] = useState('overall')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [selectedMajor, setSelectedMajor] = useState(userProfile.major)

  const careerPool = useMemo(() => {
    const pool = buildCareerPool(fieldSelected, selectedMajor)
    return pool
  }, [fieldSelected, selectedMajor])

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

  const careerList = showRoadmap ? [] : scoredCareers

  const recommendedFieldFromQuiz = pres => {
    if (!pres) return ''
    return pres
  }

  const submitQuiz = (step, option) => {
    const newAnswers = { ...quizAnswers, [step]: option }
    setQuizAnswers(newAnswers)

    if (step + 1 >= quizQuestions.length) {
      const computed = Object.entries(newAnswers).reduce((acc, [_, value]) => {
        acc[value] = (acc[value] || 0) + 1
        return acc
      }, {})
      const maxOption = Object.entries(computed).sort((a, b) => b[1] - a[1])[0]
      const category = maxOption ? answerToCategory[maxOption[0]] : ''
      setQuizResult(category)
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

  const majorSkills = useMemo(() => {
    const skills = new Set()
    allMajorCourses.forEach((course) => {
      ;(course.skills || []).forEach((s) => skills.add(s))
    })
    return Array.from(skills)
  }, [allMajorCourses])

  const selectedCareerDetails = selectedJob ? getAllCareers().find((c) => c.id === selectedJob.id) : null

  const skillsNeeded = selectedCareerDetails?.requiredSkills || []
  const matchingSkills = skillsNeeded.filter((skill) => majorSkills.includes(skill))
  const missingSkills = skillsNeeded.filter((skill) => !majorSkills.includes(skill))
  const gapPct = skillsNeeded.length ? Math.round((missingSkills.length / skillsNeeded.length) * 100) : 0

  const gatedCareerList = careerList.length ? careerList : getAllCareers()

  return (
    <div className="min-h-screen bg-masari-deep px-6 py-10 text-masari-light md:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-masari-accent bg-gray-900/80 p-6">
          <h1 className="font-display text-3xl font-bold text-white">Craft your Road Map</h1>
          <p className="mt-2 text-gray-300">
            Hello {userProfile.fullName}, {userProfile.major} | GPA: {userProfile.gpa} | Semester: {userProfile.semester}
          </p>
          <p className="mt-3 text-gray-300">
            {t('roadmap.guestDesc')}
          </p>
        </header>

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
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
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
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
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
                onClick={() => {
                  setKnowsField(true)
                  setPhase('fieldSelect')
                }}
                className="rounded-xl bg-masari-primary px-5 py-2 font-bold text-white"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setKnowsField(false)
                  setPhase('quizOffer')
                }}
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
                  setQuizConsent(true)
                  setPhase('quiz')
                  setQuizStep(0)
                }}
                className="rounded-xl bg-masari-primary px-5 py-2 font-bold text-white"
              >
                Yes, start quiz
              </button>
              <button
                onClick={() => {
                  setQuizConsent(false)
                  setPhase('careerList')
                }}
                className="rounded-xl border border-masari-accent px-5 py-2 font-semibold text-masari-light"
              >
                No, skip quiz
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
              {['overall', 'major', 'preference', 'demand'].map((type) => (
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
                    : type === 'preference'
                    ? 'Nearest to your preferences'
                    : 'Market demand'}
                </button>
              ))}
            </div>

            <div className="mb-4 rounded-xl border border-masari-accent bg-gray-900 p-3 text-xs">
              <p className="font-semibold">Color scale explanation</p>
              <p>Green = most suitable, Red = least suitable (based on current sort).</p>
              <div className="mt-2 h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
            </div>

            <div className="space-y-3">
              {scoredCareers.length === 0 && <p className="text-gray-300">No careers matched yet. Expand selection or choose a different field/major.</p>}
              {scoredCareers.map((career, index) => {
                const ratio = scoredCareers.length > 1 ? index / (scoredCareers.length - 1) : 0
                return (
                  <article
                    key={career.id}
                    onClick={() => setSelectedJob(career)}
                    className="cursor-pointer rounded-xl border bg-gray-900 p-4 transition hover:-translate-y-0.5"
                    style={{ borderColor: gradientColor(1 - ratio) }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">{career.title}</h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: gradientColor(1 - ratio), color: '#000' }}
                      >
                        {Math.round((career.score ?? 0) * 100)}%
                      </span>
                    </div>
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
            <h2 className="font-semibold text-xl">Masari: The Tech & Engineering DNA Quiz</h2>
            <p className="mt-2 text-gray-300">Question {quizStep + 1} of {quizQuestions.length}</p>
            <p className="mt-4 text-gray-100">{quizQuestions[quizStep].text}</p>

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
                Back
              </button>

              <button
                onClick={() => {
                  if (!quizSelectedOption) return
                  submitQuiz(quizStep, quizSelectedOption)
                }}
                disabled={!quizSelectedOption}
                className="rounded-lg bg-masari-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {quizStep === quizQuestions.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </section>
        )}

        {selectedJob && phase !== 'quiz' && (
          <section className="rounded-2xl border border-masari-accent bg-gray-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg border border-masari-accent px-3 py-1 text-sm text-gray-100"
              >
                Back to jobs
              </button>
            </div>
            <p className="mt-2 text-gray-300">{selectedJob.description}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-masari-accent bg-gray-800 p-4">
                <p className="font-semibold text-white">Least requirements for entry level</p>
                <ul className="mt-2 space-y-1 text-sm text-gray-300">
                  {selectedJob.requiredSkills?.map((skill) => (
                    <li key={skill}>• {skill}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-masari-accent bg-gray-800 p-4">
                <p className="font-semibold text-white">Your major skills for this job</p>
                <p className="mt-2 text-sm text-gray-300">Matched: {matchingSkills.length} / {skillsNeeded.length}</p>
                <p className="text-sm text-gray-300">Missing: {missingSkills.length}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-masari-accent bg-gray-800 p-4">
              <p className="font-semibold text-white">Gap percentage</p>
              <p className="mt-1 text-lg font-bold" style={{ color: gapPct < 30 ? '#34d399' : gapPct < 60 ? '#f59e0b' : '#ef4444' }}>
                {gapPct}%
              </p>
            </div>

            <button
              onClick={() => setShowRoadmap((value) => !value)}
              className="mt-4 rounded-xl bg-masari-primary px-5 py-2 font-bold text-white"
            >
              {showRoadmap ? 'Hide' : 'Show'} roadmap for this job
            </button>

            {showRoadmap && (
              <div className="mt-5 space-y-3 rounded-xl border border-masari-accent bg-gray-800 p-4">
                <h3 className="font-semibold text-lg">Roadmap Steps (based on {selectedMajor} curriculum)</h3>
                <p className="text-sm text-gray-300">This is a simplified roadmap for the selected career with gap courses and suggested learning.</p>

                {allMajorCourses.map((course) => {
                  const hasRelevantSkill = (course.skills || []).some((skill) => skillsNeeded.includes(skill))
                  const degree = hasRelevantSkill ? 'high' : 'normal'
                  return (
                    <article key={course.code} className="rounded-lg border border-gray-700 bg-gray-900 p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">{course.code} - {course.title}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${hasRelevantSkill ? 'bg-emerald-500 text-black' : 'bg-gray-700 text-gray-100'}`}>
                          {degree === 'high' ? 'Relates to target job' : 'Foundational'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">Skills: {(course.skills || []).join(', ')}</p>
                      {(course.skills || []).filter((skill) => missingSkills.includes(skill)).length > 0 && (
                        <p className="mt-1 text-xs text-yellow-300">✔ Helps fill gap: {course.skills.filter((skill) => missingSkills.includes(skill)).join(', ')}</p>
                      )}
                    </article>
                  )
                })}

                <div className="rounded-xl border border-masari-accent bg-gray-900 p-3">
                  <p className="font-semibold text-white">Recommended learning to close gaps</p>
                  <ul className="mt-2 text-sm text-gray-300 space-y-1">
                    {selectedJob.resources?.map((resource) => (
                      <li key={resource}>• {resource}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        )}

        {phase !== 'askKnown' && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setPhase('askKnown')
                setKnowsField(null)
                setFieldSelected('')
                setQuizConsent(null)
                setQuizStep(0)
                setQuizAnswers({})
                setQuizResult('')
                setSelectedJob(null)
                setShowRoadmap(false)
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
