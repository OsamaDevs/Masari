import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecommendedCareers, majors } from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { getCurrentUser } from '../services/auth'
import { guestDataService } from '../services/guestDataService'
import { listRoadmapProgressForOwner } from '../services/roadmapProgress'

function formatUpdatedAt(isoDate, isArabic) {
  if (!isoDate) {
    return '-'
  }

  try {
    return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate))
  } catch {
    return isoDate
  }
}

function Dashboard() {
  const navigate = useNavigate()
  const { t, isArabic } = useLanguage()
  const authUser = useMemo(() => getCurrentUser(), [])
  const guestData = useMemo(() => (authUser ? null : guestDataService.getGuestData()), [authUser])
  const [selectedRoadmapKey, setSelectedRoadmapKey] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const [completedCourseQuery, setCompletedCourseQuery] = useState('')
  const [jobFilter, setJobFilter] = useState('all')
  const isGuest = !authUser
  const isLoggedIn = !!authUser

  // For guests: show a simple welcome message if no saved data
  if (isGuest && !guestData) {
    return (
      <div className="min-h-screen bg-masari-deep px-6 py-10 text-masari-light md:px-10">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 rounded-2xl border border-masari-accent bg-gray-800 p-6">
            <h1 className="font-display text-3xl font-bold text-masari-light md:text-4xl">
              {t('dashboard.welcomeGuest')}
            </h1>
            <p className="mt-3 text-gray-300">
              {t('dashboard.guestIntro')}
            </p>

            <button
              type="button"
              onClick={() => navigate('/craft-roadmap')}
              className="mt-6 rounded-lg bg-masari-primary px-6 py-3 font-bold text-white transition hover:bg-masari-accent"
            >
              {t('dashboard.startCrafting')}
            </button>
          </header>
        </div>
      </div>
    )
  }

  // Determine profile data source
  const profile = isLoggedIn
    ? authUser.profile
    : guestData?.profile || {}
  const university = profile.university ?? 'N/A'
  const college = profile.college ?? 'N/A'
  const majorCandidate = profile.major ?? ''
  const major = majors.includes(majorCandidate) ? majorCandidate : 'N/A'
  const collegeYear = profile.collegeYear ?? 'N/A'
  const semesterYear = profile.semesterYear ?? 'N/A'
  const studentId = profile.studentId ?? 'N/A'
  const gpa = profile.gpa ?? 'N/A'
  const fullName = profile.fullName ?? (isGuest ? t('dashboard.guestUser') : 'Student')

  const recommendedJobs = useMemo(() => {
    return getRecommendedCareers(college, major)
  }, [college, major])

  // Only load roadmap progress for logged-in users
  const roadmapProgress = useMemo(() => {
    return isLoggedIn ? listRoadmapProgressForOwner(authUser.email) : []
  }, [authUser?.email, isLoggedIn])

  useEffect(() => {
    if (!roadmapProgress.length) {
      setSelectedRoadmapKey('')
      return
    }

    if (!selectedRoadmapKey || !roadmapProgress.some((item) => item.roadmapKey === selectedRoadmapKey)) {
      setSelectedRoadmapKey(roadmapProgress[0].roadmapKey)
    }
  }, [roadmapProgress, selectedRoadmapKey])

  const selectedProgress = useMemo(() => {
    return roadmapProgress.find((item) => item.roadmapKey === selectedRoadmapKey) ?? roadmapProgress[0] ?? null
  }, [roadmapProgress, selectedRoadmapKey])

  const selectedCompletionPercent = useMemo(() => {
    if (!selectedProgress) {
      return 0
    }

    return selectedProgress.completionPercent ?? 0
  }, [selectedProgress])

  const overallCompletion = useMemo(() => {
    const total = roadmapProgress.reduce((sum, item) => sum + (item.totalCourses ?? 0), 0)
    const completed = roadmapProgress.reduce(
      (sum, item) => sum + (item.completedTokens?.length ?? 0),
      0
    )

    if (!total) {
      return 0
    }

    return Math.round((completed / total) * 100)
  }, [roadmapProgress])

  const selectedCompletedCourses = useMemo(() => {
    if (!selectedProgress) {
      return []
    }

    return (selectedProgress.completedTokens ?? []).map((token) => {
      const savedCourse = selectedProgress.courses?.[token]
      if (savedCourse) {
        return savedCourse
      }

      const codeFromToken = token.split(':').pop() || token
      return {
        code: codeFromToken,
        title: codeFromToken,
        titleAr: codeFromToken,
        semesterLabel: '-',
      }
    })
  }, [selectedProgress])

  const roadmapDisplayName = selectedProgress?.careerTitle || selectedProgress?.careerId || '-'
  const roadmapMajor = selectedProgress?.major || '-'
  const roadmapUpdatedAt = formatUpdatedAt(selectedProgress?.updatedAt, isArabic)

  const filteredSelectedCompletedCourses = useMemo(() => {
    if (!completedCourseQuery.trim()) {
      return selectedCompletedCourses
    }

    const query = completedCourseQuery.trim().toLowerCase()
    return selectedCompletedCourses.filter((course) => {
      const title = (isArabic ? course.titleAr || course.title : course.title) ?? ''
      const code = course.code ?? ''
      return title.toLowerCase().includes(query) || code.toLowerCase().includes(query)
    })
  }, [completedCourseQuery, isArabic, selectedCompletedCourses])

  const openSelectedRoadmap = () => {
    if (!selectedProgress?.careerId) {
      return
    }

    const params = new URLSearchParams({
      major: selectedProgress.major || major,
      college,
      collegeYear,
      semesterYear,
      name: fullName,
    })

    navigate(`/roadmap/${selectedProgress.careerId}?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-masari-deep px-6 py-10 text-masari-light md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-masari-accent bg-gray-800 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-masari-accent">
            {t('dashboard.badge')}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-masari-light md:text-4xl">
            {t('dashboard.title')}
          </h1>
          <p className="mt-3 max-w-2xl text-gray-300">
            {t('dashboard.subtitle', { name: fullName })}
          </p>

          <div className="mt-6 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
            <p className="rounded-lg border border-masari-accent bg-gray-800/80 px-3 py-2 text-masari-light">
              <span className="font-semibold text-masari-accent">{t('dashboard.university')}:</span> {university}
            </p>
            <p className="rounded-lg border border-masari-accent bg-gray-800/80 px-3 py-2 text-masari-light">
              <span className="font-semibold text-masari-accent">{t('dashboard.college')}:</span> {college || '-'}
            </p>
            <p className="rounded-lg border border-masari-accent bg-gray-800/80 px-3 py-2 text-masari-light">
              <span className="font-semibold text-masari-accent">{t('dashboard.major')}:</span> {major}
            </p>
            <p className="rounded-lg border border-masari-accent bg-gray-800/80 px-3 py-2 text-masari-light">
              <span className="font-semibold text-masari-accent">{t('dashboard.collegeYear')}:</span> {collegeYear}
            </p>
            <p className="rounded-lg border border-masari-accent bg-gray-800/80 px-3 py-2 text-masari-light">
              <span className="font-semibold text-masari-accent">{t('dashboard.semester')}:</span> {semesterYear}
            </p>
            <p className="rounded-lg border border-masari-accent bg-gray-800/80 px-3 py-2 text-masari-light">
              <span className="font-semibold text-masari-accent">{t('dashboard.studentId')}:</span> {studentId}
            </p>
            <p className="rounded-lg border border-masari-accent bg-gray-800/80 px-3 py-2 text-masari-light md:col-span-2 xl:col-span-3">
              <span className="font-semibold text-masari-accent">{t('dashboard.gpa')}:</span> {gpa}{' '}
              <span className="ml-4 font-semibold text-masari-accent">{t('dashboard.careerGoal')}:</span> {profile.careerGoal || '-'}
            </p>
            <div className="rounded-lg border border-sky-300 bg-sky-50 px-4 py-3 text-sky-950 md:col-span-2 xl:col-span-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold">{t('dashboard.roadmapCompletion')}</p>
                {roadmapProgress.length > 0 && (
                  <select
                    value={selectedRoadmapKey}
                    onChange={(event) => setSelectedRoadmapKey(event.target.value)}
                    className="rounded-md border border-sky-300 bg-white px-2 py-1 text-xs font-semibold text-sky-950 outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    {roadmapProgress.map((item) => (
                      <option key={item.roadmapKey} value={item.roadmapKey}>
                        {(item.careerTitle || item.careerId || t('dashboard.unnamedRoadmap')) + ` - ${item.completionPercent ?? 0}%`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedProgress ? (
                <>
                  <div className="mt-3 grid gap-2 text-xs md:grid-cols-3">
                    <p className="rounded-md border border-sky-200 bg-white px-2 py-1">
                      <span className="font-semibold">{t('dashboard.roadmapName')}:</span> {roadmapDisplayName}
                    </p>
                    <p className="rounded-md border border-sky-200 bg-white px-2 py-1">
                      <span className="font-semibold">{t('dashboard.roadmapMajor')}:</span> {roadmapMajor}
                    </p>
                    <p className="rounded-md border border-sky-200 bg-white px-2 py-1">
                      <span className="font-semibold">{t('dashboard.roadmapLastUpdate')}:</span> {roadmapUpdatedAt}
                    </p>
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    {(selectedProgress.completedTokens?.length ?? 0)}/{selectedProgress.totalCourses ?? 0} - {selectedCompletionPercent}%
                  </p>

                  <div className="mt-2 h-2 rounded-full bg-sky-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all"
                      style={{ width: `${selectedCompletionPercent}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-sky-900">
                    {t('dashboard.roadmapCompletionHint')}
                    {overallCompletion > 0 ? ` (${t('dashboard.overallCompletion')}: ${overallCompletion}%)` : ''}
                  </p>

                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
                      {t('dashboard.completedCoursesList')}
                    </p>

                    {selectedCompletedCourses.length > 0 ? (
                      <ul className="mt-2 grid gap-1 text-xs text-sky-950 md:grid-cols-2">
                        {selectedCompletedCourses.map((course) => (
                          <li key={`${course.code}-${course.semesterLabel}`}>
                            - {course.code} • {isArabic ? course.titleAr || course.title : course.title}
                            {course.semesterLabel ? ` (${course.semesterLabel})` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-sky-900">{t('dashboard.noCompletedCoursesYet')}</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm font-semibold">{t('dashboard.noRoadmapProgress')}</p>
              )}
            </div>
          </div>
        </header>

        <section className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              activeTab === 'progress'
                ? 'border-masari-primary bg-masari-primary text-white'
                : 'border-masari-accent bg-gray-800 text-masari-light hover:bg-gray-700'
            }`}
          >
            {t('dashboard.tabProgress')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('careers')}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              activeTab === 'careers'
                ? 'border-masari-primary bg-masari-primary text-white'
                : 'border-masari-accent bg-gray-800 text-masari-light hover:bg-gray-700'
            }`}
          >
            {t('dashboard.tabCareers')}
          </button>
        </section>

        {activeTab === 'progress' && (
          <section className="rounded-2xl border border-masari-accent bg-gray-800 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-masari-light">{t('dashboard.progressSectionTitle')}</h2>
                <p className="mt-1 text-sm text-gray-300">{t('dashboard.progressSectionHint')}</p>
              </div>

              <button
                type="button"
                onClick={openSelectedRoadmap}
                disabled={!selectedProgress?.careerId}
                className="rounded-lg bg-masari-primary px-4 py-2 text-sm font-bold text-white transition enabled:hover:bg-masari-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('dashboard.continueRoadmap')}
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-emerald-900">
                {t('dashboard.completedCoursesList')}
              </label>
              <input
                type="text"
                value={completedCourseQuery}
                onChange={(event) => setCompletedCourseQuery(event.target.value)}
                placeholder={t('dashboard.completedSearchPlaceholder')}
                className="mt-1 w-full rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="mt-4">
              {selectedProgress ? (
                filteredSelectedCompletedCourses.length > 0 ? (
                  <ul className="grid gap-2 text-sm text-emerald-900 md:grid-cols-2">
                    {filteredSelectedCompletedCourses.map((course) => (
                      <li key={`${course.code}-${course.semesterLabel}`} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                        <span className="font-semibold">{course.code}</span> - {isArabic ? course.titleAr || course.title : course.title}
                        {course.semesterLabel ? ` (${course.semesterLabel})` : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-emerald-900">
                    {completedCourseQuery.trim()
                      ? t('dashboard.noCoursesMatchSearch')
                      : t('dashboard.noCompletedCoursesYet')}
                  </p>
                )
              ) : (
                <p className="text-sm text-emerald-900">{t('dashboard.noRoadmapProgress')}</p>
              )}
            </div>
          </section>
        )}

        {activeTab === 'careers' && (
          <>
            <section className="mb-6 rounded-2xl border border-masari-accent bg-gray-800 p-5">
              <h2 className="font-display text-xl font-bold text-masari-light">{t('dashboard.careersSectionTitle')}</h2>
              <p className="mt-2 text-sm text-gray-300">{t('dashboard.careersSectionHint')}</p>
              <div className="mt-4 flex gap-4">
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                  className="rounded-lg border border-masari-accent bg-gray-800 px-3 py-2 text-sm text-masari-light"
                >
                  <option value="all">All Jobs</option>
                  <option value="major">By Specialization</option>
                  <option value="interests">By Interests</option>
                </select>
              </div>
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recommendedJobs
                .filter((job) => {
                  if (jobFilter === 'major') return job.major === major
                  // For interests, assume some logic, for now show all
                  return true
                })
                .map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-masari-accent bg-gray-800 p-5 shadow-lg shadow-masari-primary/40"
                >
                  <h2 className="font-display text-xl font-bold text-masari-light">{job.title}</h2>
                  {job.priority && (
                    <p className="mt-2 inline-block rounded-full border border-masari-primary/30 bg-masari-primary/10 px-2.5 py-1 text-xs font-semibold text-masari-light">
                      {t('dashboard.applicationPriority')}: {job.priority}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-masari-primary/30 bg-masari-primary/10 px-3 py-1 text-xs font-semibold text-masari-light"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams({
                        college,
                        major,
                        university,
                        year: collegeYear,
                      })
                      navigate(`/job/${job.id}?${params.toString()}`)
                    }}
                    className="mt-6 w-full rounded-lg bg-masari-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-masari-accent"
                  >
                    {t('dashboard.applyCareer')}
                  </button>
                </article>
              ))}
            </section>

            {recommendedJobs.length === 0 && (
              <div className="rounded-xl border border-masari-accent bg-gray-800 p-6 text-center text-masari-light">
                {t('dashboard.noCareers')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
