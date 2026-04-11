import { useMemo, useState } from 'react'
import {
  getCurriculumForMajor,
  getAllCareers,
  getMajorLabel,
  getFieldLabel,
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

const getQuizQuestions = (t) => Array.from({ length: 20 }, (_, i) => ({
  text: t(`quiz.q${i + 1}`),
  options: {
    A: t(`quiz.q${i + 1}a`),
    B: t(`quiz.q${i + 1}b`),
    C: t(`quiz.q${i + 1}c`),
    D: t(`quiz.q${i + 1}d`),
    E: t(`quiz.q${i + 1}e`),
  }
}))

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
  const { t, isArabic } = useLanguage()
  const authUser = getCurrentUser()
  const guestData = guestDataService.getGuestData()
  const isGuest = !authUser
  const questions = useMemo(() => getQuizQuestions(t), [t])

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
  const [selectedMajor, setSelectedMajor] = useState(userProfile.major)
  const [defaultRoadmapCareer, setDefaultRoadmapCareer] = useState(guestDataService.getDefaultRoadmap())
  const [favoriteRoadmaps, setFavoriteRoadmaps] = useState(guestDataService.getFavoriteRoadmaps())

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

  const submitQuiz = (step, option) => {
    const newAnswers = { ...quizAnswers, [step]: option }
    setQuizAnswers(newAnswers)

    if (step + 1 >= questions.length) {
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

  const allMajorCourses = useMemo(() => getCurriculumForMajor(selectedMajor), [selectedMajor])

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

  const gatedCareerList = careerList.length ? careerList : getAllCareers()

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-masari-deep px-6 py-10 text-masari-light md:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-masari-accent bg-gray-900/80 p-6">
          <h1 className="font-display text-3xl font-bold text-white">{t('roadmap.title')}</h1>
          <p className="mt-2 text-gray-300">
            {t('roadmap.hello', { name: userProfile.fullName })}, {getMajorLabel(userProfile.major, isArabic)} | {t('roadmap.gpa')}: {userProfile.gpa} | {t('roadmap.semester')}: {userProfile.semester}
          </p>
          {defaultRoadmapCareer && (
            <p className="mt-1 text-sm text-emerald-300">{t('roadmap.defaultRoadmapSet')} {defaultRoadmapCareer}</p>
          )}
          <p className="mt-3 text-gray-300">
            {t('roadmap.guestDesc')}
          </p>
        </header>

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
                {t('roadmap.yes')}
              </button>
              <button
                onClick={() => setPhase('quizOffer')}
                className="rounded-xl border border-masari-accent px-5 py-2 font-semibold text-masari-light"
              >
                {t('roadmap.no')}
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
                {t('roadmap.yesStartQuiz')}
              </button>
              <button
                onClick={() => setPhase('careerList')}
                className="rounded-xl border border-masari-accent px-5 py-2 font-semibold text-masari-light"
              >
                {t('roadmap.noSkipQuiz')}
              </button>
            </div>
          </section>
        )}

        {phase === 'fieldSelect' && (
          <section className="rounded-2xl border border-masari-accent bg-gray-800 p-6">
            <div>
              <h2 className="font-semibold text-xl">{t('roadmap.fieldQuestion')}</h2>
              <p className="text-gray-300">{t('roadmap.pickField')}</p>
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
                  {getFieldLabel(field, isArabic)}
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
              <h2 className="font-semibold text-xl">{t('roadmap.sortCareersBy')}</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPhase('fieldSelect')}
                  className="rounded-lg border border-masari-accent px-3 py-1 text-sm text-gray-100"
                >
                  {t('roadmap.changeField')}
                </button>
                <button
                  onClick={() => setPhase('quizOffer')}
                  className="rounded-lg border border-masari-accent px-3 py-1 text-sm text-gray-100"
                >
                  {t('roadmap.retakeQuiz')}
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="font-semibold">{t('roadmap.sortingMode')}</p>
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
                    ? t('roadmap.sortIndex')
                    : type === 'major'
                    ? t('roadmap.sortNearestMajor')
                    : type === 'preference'
                    ? t('roadmap.sortNearestPref')
                    : t('roadmap.sortDemand')}
                </button>
              ))}
            </div>

            <div className="mb-4 rounded-xl border border-masari-accent bg-gray-900 p-3 text-xs">
              <p className="font-semibold">{t('roadmap.colorScaleExpl')}</p>
              <p>{t('roadmap.colorScaleDesc')}</p>
              <div className="mt-2 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
            </div>

            <div className="space-y-3">
              {gatedCareerList.length === 0 && <p className="text-gray-300">{t('roadmap.noCareersMatch')}</p>}
              {gatedCareerList.map((career) => {
                return (
                  <article
                    key={career.id}
                    onClick={() => setSelectedJob(career)}
                    className="cursor-pointer rounded-xl border bg-gray-900 p-4 transition hover:-translate-y-0.5"
                    style={{ borderColor: gradientColor(career.score ?? 0) }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">{isArabic && career.arTitle ? career.arTitle : career.title}</h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: gradientColor(career.score ?? 0), color: '#000' }}
                      >
                        {Math.round((career.score ?? 0) * 100)}%
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-300">{isArabic && career.arDescription ? career.arDescription : career.description}</p>
                    <p className="mt-2 text-xs text-gray-400">{t('roadmap.cardMajor')}: {getMajorLabel(career.major, isArabic)} • {t('roadmap.cardCategory')}: {getFieldLabel(career.category, isArabic)} • {t('roadmap.cardDemand')}: {career.marketDemand}</p>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {phase === 'quiz' && (
          <section className="rounded-2xl border border-masari-accent bg-gray-800 p-6">
            <h2 className="font-semibold text-xl">{t('roadmap.quizTitle')}</h2>
            <p className="mt-2 text-gray-300">{t('roadmap.questionOf', { current: quizStep + 1, total: questions.length })}</p>
            <p className="mt-4 text-gray-100">{questions[quizStep].text}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {Object.entries(questions[quizStep].options).map(([key, value]) => (
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
                {t('roadmap.back')}
              </button>

              <button
                onClick={() => {
                  if (!quizSelectedOption) return
                  submitQuiz(quizStep, quizSelectedOption)
                }}
                disabled={!quizSelectedOption}
                className="rounded-lg bg-masari-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {quizStep === questions.length - 1 ? t('roadmap.submit') : t('roadmap.next')}
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
                  {t('roadmap.closeBtn')}
                </button>
              </div>
              <p className="mt-2 text-gray-300">{selectedJob.description}</p>

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
                    {selectedJob.requiredSkills?.map((skill) => (
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

              <button
                onClick={() => setShowRoadmap((value) => !value)}
                className="mt-4 rounded-xl bg-masari-primary px-5 py-2 font-bold text-white hover:bg-masari-accent transition"
              >
                {showRoadmap ? t('roadmap.hide') : t('roadmap.show')} {t('roadmap.roadmapForJob')}
              </button>

              {showRoadmap && (
                <div className="mt-5 rounded-xl border border-masari-accent bg-gray-800 p-4">
                  <h3 className="font-semibold text-lg">{t('roadmap.roadmapStepsBased', { major: selectedMajor })}</h3>
                  <p className="text-sm text-gray-300">{t('roadmap.roadmapStepsDesc')}</p>

                  {/* Graphical Roadmap */}
                  <div className="mt-4 space-y-2">
                    {allMajorCourses.map((course, index) => {
                      const hasRelevantSkill = (course.skills || []).some((skill) => skillsNeeded.includes(skill))
                      const isFinal = index === allMajorCourses.length - 1
                      return (
                        <div key={course.code}>
                          <div className="flex items-start gap-3">
                            {/* Visual connector */}
                            <div className="mt-1 flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${hasRelevantSkill ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-gray-700/20 border-gray-600 text-gray-400'}`}>
                                {index + 1}
                              </div>
                              {!isFinal && <div className={`h-6 w-0.5 ${hasRelevantSkill ? 'bg-emerald-500/40' : 'bg-gray-600/40'}`} />}
                            </div>
                            
                            {/* Course card */}
                            <div className={`flex-1 rounded-lg border p-3 ${hasRelevantSkill ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-gray-700 bg-gray-900'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-white">{course.code} - {course.title}</p>
                                  <p className="mt-0.5 text-xs text-gray-400">{t('roadmap.skillsLabel')} {(course.skills || []).join(', ')}</p>
                                </div>
                                <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${hasRelevantSkill ? 'bg-emerald-500 text-black' : 'bg-gray-700 text-gray-100'}`}>
                                  {hasRelevantSkill ? t('roadmap.targetsJob') : t('roadmap.foundation')}
                                </span>
                              </div>
                              {(course.skills || []).filter((skill) => missingSkills.includes(skill)).length > 0 && (
                                <p className="mt-1.5 text-xs text-yellow-300">{t('roadmap.helpsFillGap')} {course.skills.filter((skill) => missingSkills.includes(skill)).join(', ')}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Final Goal */}
                    <div className="mt-4 flex items-start gap-3 border-t border-masari-accent/30 pt-3">
                      <div className="mt-1 flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-masari-primary bg-masari-primary/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-masari-primary">✓</span>
                        </div>
                      </div>
                      <div className="flex-1 rounded-lg border border-masari-accent/50 bg-masari-primary/10 p-3">
                        <p className="font-semibold text-white">{selectedJob.title}</p>
                        <p className="mt-1 text-xs text-gray-300">{t('roadmap.careerGoal')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-masari-accent bg-gray-900 p-3">
                    <p className="font-semibold text-white">{t('roadmap.recommendedLearning')}</p>
                    <ul className="mt-2 text-sm text-gray-300 space-y-1">
                      {selectedJob.resources?.map((resource) => (
                        <li key={resource}>• {resource}</li>
                      ))}
                    </ul>
                  </div>
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
              }}
              className="rounded-lg border border-masari-accent px-4 py-2 text-sm text-gray-200"
            >
              {t('roadmap.restartJourney')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoadMap
