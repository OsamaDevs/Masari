import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  buildCareerRoadmap,
  getCareerById,
  getCourseDescription,
  getLocalizedCourseTitle,
  getMajorLabel,
  getRecommendedCareers,
  getSkillExplanation,
  majors,
} from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { getCurrentUser } from '../services/auth'
import AICoachChat from '../components/AICoachChat'
import {
  buildRoadmapProgressKey,
  getRoadmapCompletionPercent,
  getRoadmapProgress,
  upsertRoadmapCourseProgress,
} from '../services/roadmapProgress'

const externalResourcesBySkill = {
  'API Design': [
    { type: 'article', title: 'REST API Design Best Practices', url: 'https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/' },
    { type: 'video', title: 'Designing Great APIs (YouTube)', url: 'https://www.youtube.com/watch?v=7YcW25PHnAA' },
    { type: 'course', title: 'API Design Fundamentals', url: 'https://www.udemy.com/course/rest-api/' },
  ],
  'Node.js': [
    { type: 'article', title: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs' },
    { type: 'video', title: 'Node.js Crash Course (YouTube)', url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4' },
    { type: 'course', title: 'Node.js Path', url: 'https://www.codecademy.com/learn/learn-node-js' },
  ],
  SQL: [
    { type: 'article', title: 'SQLBolt Interactive SQL', url: 'https://sqlbolt.com/' },
    { type: 'video', title: 'SQL Tutorial for Beginners (YouTube)', url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY' },
    { type: 'course', title: 'Databases and SQL for Data Science', url: 'https://www.coursera.org/learn/sql-data-science' },
  ],
  Testing: [
    { type: 'article', title: 'Software Testing Fundamentals', url: 'https://www.guru99.com/software-testing.html' },
    { type: 'video', title: 'Testing JavaScript (YouTube)', url: 'https://www.youtube.com/watch?v=r9HdJ8P6GQI' },
    { type: 'course', title: 'Automated Testing Bootcamp', url: 'https://testautomationu.applitools.com/' },
  ],
  Communication: [
    { type: 'article', title: 'Effective Technical Communication', url: 'https://www.atlassian.com/blog/productivity/effective-communication' },
    { type: 'video', title: 'Communication Skills (YouTube)', url: 'https://www.youtube.com/watch?v=HAnw168huqA' },
    { type: 'course', title: 'Communication Skills for Engineers', url: 'https://www.coursera.org/learn/wharton-communication-skills' },
  ],
}

function dedupeResources(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = `${item.type}-${item.title}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function RoadMap() {
  const { jobId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t, isArabic } = useLanguage()

  const major = searchParams.get('major') ?? ''
  const college = searchParams.get('college') ?? t('roadmap.psauCollege')
  const queryCollegeYear = searchParams.get('collegeYear') ?? ''
  const querySemesterYear = searchParams.get('semesterYear') ?? ''
  const queryName = searchParams.get('name') ?? ''

  const authUser = getCurrentUser()

  const [guestStep, setGuestStep] = useState(1)
  const [guestMajor, setGuestMajor] = useState(majors.includes(major) ? major : majors[0])
  const [guestCollegeYear, setGuestCollegeYear] = useState(queryCollegeYear || '3rd Year')
  const [guestSemesterYear, setGuestSemesterYear] = useState(querySemesterYear || 'First Semester 2026')
  const [guestCareerId, setGuestCareerId] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [analysisMode, setAnalysisMode] = useState('gap')

  const guestJobs = useMemo(() => {
    return getRecommendedCareers(t('roadmap.psauCollege'), guestMajor)
  }, [guestMajor, t])

  const profile = useMemo(() => {
    if (authUser?.profile) {
      return authUser.profile
    }

    if (!jobId) {
      return null
    }

    if (!majors.includes(major)) {
      return null
    }

    return {
      fullName: queryName || t('roadmap.guestStudent'),
      college: college || t('roadmap.psauCollege'),
      major,
      collegeYear: queryCollegeYear || '3rd Year',
      semesterYear: querySemesterYear || 'First Semester 2026',
    }
  }, [authUser, jobId, major, queryName, college, queryCollegeYear, querySemesterYear, t])

  const career = useMemo(() => getCareerById(jobId), [jobId])
  const roadmapView = useMemo(() => buildCareerRoadmap(profile, career), [profile, career])
  const semesters = roadmapView.semesters
  const summary = roadmapView.summary
  const roadmapMajor = major || profile?.major || career?.major || ''
  const ownerId = authUser?.email || 'guest'
  const totalCourses = useMemo(
    () => semesters.reduce((count, semester) => count + semester.courses.length, 0),
    [semesters]
  )
  const [completedCourseTokens, setCompletedCourseTokens] = useState([])

  const roadmapProgressKey = useMemo(() => {
    if (!career?.id || !roadmapMajor) {
      return ''
    }

    return buildRoadmapProgressKey({
      ownerId,
      major: roadmapMajor,
      careerId: career.id,
    })
  }, [career?.id, ownerId, roadmapMajor])

  useEffect(() => {
    if (!roadmapProgressKey) {
      setCompletedCourseTokens([])
      return
    }

    const progress = getRoadmapProgress(roadmapProgressKey)
    setCompletedCourseTokens(progress?.completedTokens ?? [])
  }, [roadmapProgressKey])

  const completionPercent = useMemo(() => {
    return getRoadmapCompletionPercent({
      totalCourses,
      completedTokens: completedCourseTokens,
    })
  }, [completedCourseTokens, totalCourses])

  const completedCount = completedCourseTokens.length

  const buildCourseToken = (course) => `${roadmapMajor}:${course.code}`

  const isCourseChecked = (course) => completedCourseTokens.includes(buildCourseToken(course))

  const toggleCourseCompleted = (course, semesterLabel) => {
    if (!roadmapProgressKey || !career) {
      return
    }

    const token = buildCourseToken(course)
    const isCurrentlyCompleted = completedCourseTokens.includes(token)
    const nextCompleted = !isCurrentlyCompleted
    const nextTokens = nextCompleted
      ? Array.from(new Set([...completedCourseTokens, token]))
      : completedCourseTokens.filter((item) => item !== token)

    setCompletedCourseTokens(nextTokens)

    upsertRoadmapCourseProgress({
      roadmapKey: roadmapProgressKey,
      ownerId,
      major: roadmapMajor,
      careerId: career.id,
      careerTitle: career.title,
      totalCourses,
      courseToken: token,
      courseInfo: {
        code: course.code,
        title: course.title,
        titleAr: course.titleAr,
        semesterLabel,
      },
      completed: nextCompleted,
    })
  }

  const selectedCourseInsight = useMemo(() => {
    if (!selectedCourse || !career) {
      return null
    }

    const requiredSkills = career.requiredSkills ?? []
    const matchedRequiredSkills = requiredSkills.filter((skill) => selectedCourse.skills.includes(skill))
    const gapSkills = selectedCourse.gapSkills ?? []
    const requiredSkillGuide = requiredSkills.map((skill) => ({
      skill,
      covered: selectedCourse.skills.includes(skill),
      explanation: getSkillExplanation(skill, isArabic),
    }))

    const externalPool = gapSkills.flatMap((skill) => externalResourcesBySkill[skill] ?? [])
    const fallbackPool = (selectedCourse.supplemental ?? []).map((resource) => ({
      type: 'article',
      title: resource,
      url: 'https://www.google.com/search?q=' + encodeURIComponent(resource),
    }))

    const externalResources = dedupeResources([...externalPool, ...fallbackPool]).slice(0, 9)

    return {
      matchedRequiredSkills,
      gapSkills,
      requiredSkillGuide,
      externalResources,
      marketNeedScore: selectedCourse.matchPercent,
      simpleDescription: getCourseDescription(selectedCourse, isArabic),
      universityCoverageNote:
        selectedCourse.matchPercent >= 70
          ? t('roadmap.coverageHigh')
          : selectedCourse.matchPercent >= 45
            ? t('roadmap.coverageMedium')
            : t('roadmap.coverageLow'),
    }
  }, [career, selectedCourse, t, isArabic])

  const handleGuestGenerate = () => {
    if (!guestCareerId) {
      return
    }

    const params = new URLSearchParams({
      major: guestMajor,
      college: t('roadmap.psauCollege'),
      collegeYear: guestCollegeYear,
      semesterYear: guestSemesterYear,
      name: t('roadmap.guestStudent'),
    })

    navigate(`/roadmap/${guestCareerId}?${params.toString()}`)
  }

  if (!jobId) {
    return (
      <div className="min-h-screen bg-emerald-100 px-6 py-10 text-emerald-950 md:px-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-emerald-300 bg-white p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            {t('roadmap.careerRoadmap')}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-emerald-950">{t('roadmap.guestTitle')}</h1>
          <p className="mt-3 text-emerald-900">{t('roadmap.guestDesc')}</p>
          <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-900">
            {t('roadmap.servingCollege')}: {t('roadmap.psauCollege')}
          </p>

          {guestStep === 1 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <select
                value={guestMajor}
                onChange={(event) => {
                  setGuestMajor(event.target.value)
                  setGuestCareerId('')
                }}
                className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm text-emerald-950 outline-none ring-emerald-300/40 transition focus:ring-2"
              >
                {majors.map((majorOption) => (
                  <option key={majorOption} value={majorOption}>
                    {t('roadmap.major')}: {getMajorLabel(majorOption, isArabic)}
                  </option>
                ))}
              </select>

              <select
                value={guestCollegeYear}
                onChange={(event) => setGuestCollegeYear(event.target.value)}
                className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm text-emerald-950 outline-none ring-emerald-300/40 transition focus:ring-2"
              >
                <option value="1st Year">{t('roadmap.yearLabel')}: 1</option>
                <option value="2nd Year">{t('roadmap.yearLabel')}: 2</option>
                <option value="3rd Year">{t('roadmap.yearLabel')}: 3</option>
                <option value="4th Year">{t('roadmap.yearLabel')}: 4</option>
              </select>

              <select
                value={guestSemesterYear}
                onChange={(event) => setGuestSemesterYear(event.target.value)}
                className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm text-emerald-950 outline-none ring-emerald-300/40 transition focus:ring-2"
              >
                <option value="First Semester 2026">{t('roadmap.firstSemester')}</option>
                <option value="Second Semester 2026">{t('roadmap.secondSemester')}</option>
              </select>

              <button
                type="button"
                onClick={() => setGuestStep(2)}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-emerald-400"
              >
                {t('roadmap.showCareers')}
              </button>
            </div>
          )}

          {guestStep === 2 && (
            <>
              <p className="mt-6 text-sm font-semibold text-emerald-900">
                {t('roadmap.closestCareers')}: {getMajorLabel(guestMajor, isArabic)}
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {guestJobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setGuestCareerId(job.id)}
                    className={`rounded-xl border px-4 py-3 text-start transition ${
                      guestCareerId === job.id
                        ? 'border-emerald-300 bg-emerald-500/15 text-emerald-950'
                        : 'border-emerald-300 bg-emerald-100/80 text-emerald-900 hover:border-emerald-500/60'
                    }`}
                  >
                    <p className="font-semibold">{job.title}</p>
                    <p className="mt-1 text-xs text-emerald-900">{job.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setGuestStep(1)}
                  className="rounded-xl border border-emerald-300 px-5 py-2.5 font-semibold text-emerald-900 transition hover:border-emerald-400 hover:text-emerald-900"
                >
                  {t('roadmap.backToStepOne')}
                </button>

                <button
                  type="button"
                  onClick={handleGuestGenerate}
                  disabled={!guestCareerId}
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-slate-950 transition enabled:hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('roadmap.generateGuestRoadmap')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (!career || !profile) {
    return (
      <div className="min-h-screen bg-emerald-100 px-6 py-10 text-emerald-950 md:px-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-emerald-300 bg-white p-8 text-center">
          <h1 className="font-display text-3xl font-bold text-emerald-950">{t('roadmap.unavailableTitle')}</h1>
          <p className="mt-3 text-emerald-900">{t('roadmap.unavailableDesc')}</p>
          <button
            type="button"
            onClick={() => navigate('/roadmap')}
            className="mt-6 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            {t('roadmap.generateGuestRoadmap')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-emerald-100 px-6 py-10 text-emerald-950 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-2xl border border-emerald-300 bg-white p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            {t('roadmap.careerRoadmap')}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-emerald-950 md:text-4xl">
            {t('roadmap.roadmapFor', { title: career.title })}
          </h1>
          <p className="mt-3 max-w-3xl text-emerald-900">
            {t('roadmap.generatedFrom', {
              major: getMajorLabel(major || career.major, isArabic),
              college: ` - ${college}`,
            })}
          </p>
          <div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
            <p className="rounded-lg border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-emerald-900">
              <span className="font-semibold text-emerald-300">{t('roadmap.student')}:</span> {profile.fullName}
            </p>
            <p className="rounded-lg border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-emerald-900">
              <span className="font-semibold text-emerald-300">{t('roadmap.involvedCourses')}:</span> {summary.involved}
            </p>
            <p className="rounded-lg border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-emerald-900">
              <span className="font-semibold text-emerald-300">{t('roadmap.remainingCourses')}:</span> {summary.remaining}
            </p>
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-900 md:col-span-3">
              {t('roadmap.importantCoursesFocus')}: {summary.importantCourses}
            </p>
            <div className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-3 text-sky-950 md:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold">{t('roadmap.progressTitle')}</p>
                <p className="text-sm font-semibold">
                  {completedCount}/{totalCourses} - {completionPercent}%
                </p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-sky-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-sky-900">{t('roadmap.progressHint')}</p>
            </div>
          </div>
        </header>

        <section className="mt-8 overflow-x-auto pb-2">
          <div className="flex min-w-max items-start gap-6 pr-2">
            {semesters.map((semester, index) => (
              <div key={semester.label} className="relative w-[320px]">
                {index > 0 && (
                  <div className="pointer-events-none absolute -left-6 top-7 h-[2px] w-6 bg-emerald-400/40" />
                )}
                <div className="rounded-2xl border border-emerald-300 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-900">
                      {semester.label}
                    </p>
                    {summary.currentSemester === semester.semesterNumber && (
                      <span className="text-xs font-semibold text-amber-300">{t('roadmap.current')}</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {semester.courses.map((course) => (
                      <article
                        key={course.code}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCourse({ ...course, semesterLabel: semester.label })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            setSelectedCourse({ ...course, semesterLabel: semester.label })
                            setAnalysisMode('gap')
                          }
                        }}
                        className={`rounded-xl border p-3 ${
                          course.isImportant
                            ? 'border-emerald-400/50 bg-emerald-500/10'
                            : 'border-emerald-300 bg-emerald-100/80'
                        } cursor-pointer transition hover:-translate-y-0.5 hover:border-emerald-500/70`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-emerald-300">{course.code}</p>
                            <h3 className="text-sm font-semibold text-emerald-950">
                              {getLocalizedCourseTitle(course, isArabic)}
                            </h3>
                            {course.isImportant && (
                              <span className="mt-1 inline-block rounded-full border border-emerald-300/40 bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-900">
                                {t('roadmap.importantForRole')}
                              </span>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              course.status === 'completed'
                                ? 'bg-emerald-400/20 text-emerald-900'
                                : course.status === 'ongoing'
                                  ? 'bg-amber-400/20 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {t(`roadmap.${course.status}`)}
                          </span>
                        </div>

                        <label
                          className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-900"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isCourseChecked(course)}
                            onChange={() => toggleCourseCompleted(course, semester.label)}
                            className="h-3.5 w-3.5 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                          />
                          {t('roadmap.markAsDone')}
                        </label>

                        <div className="mt-2 h-1.5 rounded-full bg-emerald-200">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                            style={{ width: `${course.matchPercent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-emerald-900">
                          {t('roadmap.matchToJob')}: {course.matchPercent}%
                        </p>

                        {course.gapSkills.length > 0 && (
                          <>
                            <p className="mt-2 text-[11px] font-semibold text-amber-700">
                              {t('roadmap.detectedGaps')}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {course.gapSkills.map((gap) => (
                                <span
                                  key={gap}
                                  className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-800"
                                >
                                  {gap}
                                </span>
                              ))}
                            </div>
                          </>
                        )}

                        <p className="mt-2 text-[11px] font-semibold text-teal-700">
                          {t('roadmap.extraResources')}
                        </p>
                        <ul className="mt-1 space-y-1 text-[11px] text-emerald-900">
                          {course.supplemental.map((resource) => (
                            <li key={resource}>- {resource}</li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedCourse({ ...course, semesterLabel: semester.label })
                            setAnalysisMode('gap')
                          }}
                          className="mt-3 rounded-lg border border-emerald-400/40 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-900 transition hover:bg-emerald-100"
                        >
                          {t('roadmap.viewCourseAnalysis')}
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <AICoachChat
          career={career}
          profile={profile}
          semesters={semesters}
        />

        {selectedCourse && selectedCourseInsight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-emerald-300 bg-white p-5 shadow-2xl shadow-emerald-300/30">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-emerald-200 pb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">{selectedCourse.semesterLabel}</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-emerald-950">
                    {selectedCourse.code} - {getLocalizedCourseTitle(selectedCourse, isArabic)}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                    <span className="font-semibold">{t('roadmap.courseDescriptionLabel')}:</span>{' '}
                    {selectedCourseInsight.simpleDescription}
                  </p>
                  <p className="mt-2 text-sm text-emerald-900">
                    <span className="font-semibold">{t('roadmap.courseRelationship')}:</span> {career.title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-200"
                >
                  {t('roadmap.closeDetails')}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAnalysisMode('gap')}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    analysisMode === 'gap'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  {t('roadmap.aiModeGap')}
                </button>

                <button
                  type="button"
                  onClick={() => setAnalysisMode('full')}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    analysisMode === 'full'
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  {t('roadmap.aiModeFull')}
                </button>
              </div>

              {analysisMode === 'gap' && (
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <article className="rounded-xl border border-emerald-300 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-900">{t('roadmap.marketNeedLevel')}</p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-950">{selectedCourseInsight.marketNeedScore}%</p>
                    <p className="mt-2 text-sm text-emerald-900">{selectedCourseInsight.universityCoverageNote}</p>
                  </article>

                  <article className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">{t('roadmap.marketGapSkills')}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCourseInsight.gapSkills.length > 0 ? (
                        selectedCourseInsight.gapSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-amber-400/40 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-900">{t('roadmap.noGapNow')}</span>
                      )}
                    </div>
                  </article>

                  <article className="rounded-xl border border-sky-300 bg-sky-50 p-4 lg:col-span-2">
                    <p className="text-sm font-semibold text-sky-900">{t('roadmap.requiredSkillsWhyTitle')}</p>
                    <p className="mt-1 text-xs text-sky-900">{t('roadmap.requiredSkillsWhyHint')}</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {selectedCourseInsight.requiredSkillGuide.map((item) => (
                        <div key={item.skill} className="rounded-lg border border-sky-200 bg-white px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-emerald-950">{item.skill}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                item.covered
                                  ? 'bg-emerald-500/15 text-emerald-900'
                                  : 'bg-amber-400/20 text-amber-900'
                              }`}
                            >
                              {item.covered ? t('roadmap.skillCovered') : t('roadmap.skillMissing')}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-700">{item.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-xl border border-emerald-300 bg-white p-4 lg:col-span-2">
                    <p className="text-sm font-semibold text-emerald-900">{t('roadmap.aiRecommendationNarrative')}</p>
                    <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                      {t('roadmap.universityContentLabel')}: {selectedCourse.skills.join(' - ')}.
                      {' '}
                      {t('roadmap.marketMissingLabel')}: {(selectedCourseInsight.gapSkills.length ? selectedCourseInsight.gapSkills.join(' - ') : t('roadmap.noGapNow'))}.
                      {' '}
                      {t('roadmap.addedContentLabel')}
                    </p>
                  </article>
                </div>
              )}

              {analysisMode === 'full' && (
                <div className="mt-4 grid gap-4">
                  <article className="rounded-xl border border-emerald-300 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-900">{t('roadmap.fullPlanTitle')}</p>
                    <ul className="mt-2 space-y-1 text-sm text-emerald-900">
                      {selectedCourse.skills.map((skill) => (
                        <li key={skill}>- {skill}</li>
                      ))}
                      {selectedCourseInsight.gapSkills.map((skill) => (
                        <li key={`gap-${skill}`}>- {t('roadmap.addModulePrefix')} {skill}</li>
                      ))}
                    </ul>
                  </article>

                  <article className="rounded-xl border border-sky-300 bg-sky-50 p-4">
                    <p className="text-sm font-semibold text-sky-900">{t('roadmap.requiredSkillsWhyTitle')}</p>
                    <p className="mt-1 text-xs text-sky-900">{t('roadmap.requiredSkillsWhyHint')}</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {selectedCourseInsight.requiredSkillGuide.map((item) => (
                        <div key={item.skill} className="rounded-lg border border-sky-200 bg-white px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-emerald-950">{item.skill}</p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                item.covered
                                  ? 'bg-emerald-500/15 text-emerald-900'
                                  : 'bg-amber-400/20 text-amber-900'
                              }`}
                            >
                              {item.covered ? t('roadmap.skillCovered') : t('roadmap.skillMissing')}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-700">{item.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-xl border border-emerald-300 bg-white p-4">
                    <p className="text-sm font-semibold text-emerald-900">{t('roadmap.recommendedExternalResources')}</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {selectedCourseInsight.externalResources.map((resource) => (
                        <a
                          key={resource.title + resource.type}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 transition hover:border-emerald-500"
                        >
                          <span className="mr-2 inline-block rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                            {resource.type}
                          </span>
                          {resource.title}
                        </a>
                      ))}
                    </div>
                  </article>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoadMap
