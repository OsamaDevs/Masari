import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getRecommendedCareers, majors } from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { getCurrentUser } from '../services/auth'
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
  const [selectedRoadmapKey, setSelectedRoadmapKey] = useState('')
  const [activeTab, setActiveTab] = useState('progress')
  const [completedCourseQuery, setCompletedCourseQuery] = useState('')

  if (!authUser) {
    return <Navigate to="/login" replace />
  }

  const profile = authUser.profile
  const university = profile.university ?? ''
  const college = profile.college ?? ''
  const majorCandidate = profile.major ?? ''
  const major = majors.includes(majorCandidate) ? majorCandidate : 'Computer Science'
  const collegeYear = profile.collegeYear ?? ''
  const semesterYear = profile.semesterYear ?? ''
  const studentId = profile.studentId ?? 'N/A'
  const gpa = profile.gpa ?? 'N/A'
  const fullName = profile.fullName ?? 'Student'

  const recommendedJobs = useMemo(() => {
    return getRecommendedCareers(college, major)
  }, [college, major])

  const roadmapProgress = useMemo(() => {
    return listRoadmapProgressForOwner(authUser.email)
  }, [authUser.email])

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
    <div className="min-h-screen bg-emerald-100 px-6 py-10 text-emerald-950 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-emerald-300 bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            {t('dashboard.badge')}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-emerald-950 md:text-4xl">
            {t('dashboard.title')}
          </h1>
          <p className="mt-3 max-w-2xl text-emerald-900">
            {t('dashboard.subtitle', { name: fullName })}
          </p>

          <div className="mt-6 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
            <p className="rounded-lg border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-emerald-900">
              <span className="font-semibold text-emerald-300">{t('dashboard.university')}:</span> {university}
            </p>
            <p className="rounded-lg border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-emerald-900">
              <span className="font-semibold text-emerald-300">{t('dashboard.college')}:</span> {college || '-'}
            </p>
            <p className="rounded-lg border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-emerald-900">
              <span className="font-semibold text-emerald-300">{t('dashboard.major')}:</span> {major}
            </p>
            <p className="rounded-lg border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-emerald-900">
              <span className="font-semibold text-emerald-300">{t('dashboard.collegeYear')}:</span> {collegeYear}
            </p>
            <p className="rounded-lg border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-emerald-900">
              <span className="font-semibold text-emerald-300">{t('dashboard.semester')}:</span> {semesterYear}
            </p>
            <p className="rounded-lg border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-emerald-900">
              <span className="font-semibold text-emerald-300">{t('dashboard.studentId')}:</span> {studentId}
            </p>
            <p className="rounded-lg border border-emerald-300 bg-emerald-100/80 px-3 py-2 text-emerald-900 md:col-span-2 xl:col-span-3">
              <span className="font-semibold text-emerald-300">{t('dashboard.gpa')}:</span> {gpa}{' '}
              <span className="ml-4 font-semibold text-emerald-300">{t('dashboard.careerGoal')}:</span> {profile.careerGoal || '-'}
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
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            {t('dashboard.tabProgress')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('careers')}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              activeTab === 'careers'
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            {t('dashboard.tabCareers')}
          </button>
        </section>

        {activeTab === 'progress' && (
          <section className="rounded-2xl border border-emerald-300 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-emerald-950">{t('dashboard.progressSectionTitle')}</h2>
                <p className="mt-1 text-sm text-emerald-900">{t('dashboard.progressSectionHint')}</p>
              </div>

              <button
                type="button"
                onClick={openSelectedRoadmap}
                disabled={!selectedProgress?.careerId}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition enabled:hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
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
            <section className="mb-6 rounded-2xl border border-emerald-300 bg-white p-5">
              <h2 className="font-display text-xl font-bold text-emerald-950">{t('dashboard.careersSectionTitle')}</h2>
              <p className="mt-2 text-sm text-emerald-900">{t('dashboard.careersSectionHint')}</p>
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {recommendedJobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-emerald-300 bg-white p-5 shadow-lg shadow-emerald-200/40"
                >
                  <h2 className="font-display text-xl font-bold text-emerald-950">{job.title}</h2>
                  {job.priority && (
                    <p className="mt-2 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-900">
                      {t('dashboard.applicationPriority')}: {job.priority}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-900"
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
                    className="mt-6 w-full rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
                  >
                    {t('dashboard.applyCareer')}
                  </button>
                </article>
              ))}
            </section>

            {recommendedJobs.length === 0 && (
              <div className="rounded-xl border border-emerald-300 bg-white p-6 text-center text-emerald-900">
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
