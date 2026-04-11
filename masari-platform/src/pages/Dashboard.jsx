/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buildCareerRoadmap, getCareerById, getCurriculumForMajor, getLocalizedCourseTitle, getMajorLabel, getRecommendedCareers, majors } from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { getCurrentUser } from '../services/auth'
import { guestDataService } from '../services/guestDataService'
import { listRoadmapProgressForOwner, upsertRoadmapCourseProgress } from '../services/roadmapProgress'

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
  const [roadmapRefreshTick, setRoadmapRefreshTick] = useState(0)
  const [favoriteRoadmaps] = useState(guestDataService.getFavoriteRoadmaps())
  const [defaultRoadmapCareerId] = useState(guestDataService.getDefaultRoadmap())
  const isGuest = !authUser
  const isLoggedIn = !!authUser

  // Determine profile data source
  const profile = useMemo(() => {
    return isLoggedIn ? authUser?.profile : guestData?.profile || {}
  }, [isLoggedIn, authUser, guestData])

  const university = useMemo(() => profile.university ?? 'N/A', [profile])
  const college = useMemo(() => profile.college ?? 'N/A', [profile])
  const majorCandidate = useMemo(() => profile.major ?? '', [profile])
  const major = useMemo(() => majors.includes(majorCandidate) ? majorCandidate : 'N/A', [majorCandidate])
  const collegeYear = useMemo(() => profile.collegeYear ?? 'N/A', [profile])
  const semesterYear = useMemo(() => profile.semesterYear ?? 'N/A', [profile])
  const studentId = useMemo(() => profile.studentId ?? 'N/A', [profile])
  const gpa = useMemo(() => profile.gpa ?? 'N/A', [profile])
  const fullName = useMemo(() => profile.fullName ?? (isGuest ? t('dashboard.guestUser') : 'Student'), [profile, isGuest, t])

  const recommendedJobs = useMemo(() => {
    return getRecommendedCareers(college, major)
  }, [college, major])

  const defaultRoadmapCareer = useMemo(() => {
    return defaultRoadmapCareerId ? getRecommendedCareers(college, major).find((c) => c.id === defaultRoadmapCareerId) : null
  }, [defaultRoadmapCareerId, college, major])

  const favoriteRoadmapCareers = useMemo(() => {
    if (!favoriteRoadmaps.length) return []
    const allCareers = getRecommendedCareers(college, major)
    return favoriteRoadmaps
      .map((id) => allCareers.find((career) => career.id === id) || getRecommendedCareers(college, major).find((career) => career.id === id))
      .filter(Boolean)
  }, [favoriteRoadmaps, college, major])

  const roadmapOwnerId = isLoggedIn ? authUser.email : 'guest'

  // Load roadmap progress for the current owner, including guest users
  const roadmapProgress = useMemo(() => {
    return listRoadmapProgressForOwner(roadmapOwnerId)
  }, [roadmapOwnerId, roadmapRefreshTick])

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
  const selectedCurriculum = useMemo(() => {
    if (!selectedProgress?.major) {
      return []
    }

    return getCurriculumForMajor(selectedProgress.major)
  }, [selectedProgress?.major])

  const selectedCompletedTokens = useMemo(() => {
    return new Set(selectedProgress?.completedTokens ?? [])
  }, [selectedProgress])

  const selectedCareerDetails = useMemo(() => {
    if (!selectedProgress?.careerId) {
      return null
    }

    return getCareerById(selectedProgress.careerId)
  }, [selectedProgress?.careerId])

  const selectedRoadmapPlan = useMemo(() => {
    if (!selectedProgress || !selectedCareerDetails) {
      return null
    }

    return buildCareerRoadmap(
      {
        major: selectedProgress.major,
        collegeYear: profile.collegeYear,
        semesterYear: profile.semesterYear,
      },
      selectedCareerDetails
    )
  }, [profile.collegeYear, profile.semesterYear, selectedCareerDetails, selectedProgress])

  const gapResourceCourses = useMemo(() => {
    const semesters = selectedRoadmapPlan?.semesters ?? []

    return semesters
      .flatMap((semester) => semester.courses.map((course) => ({
        ...course,
        semesterLabel: semester.label,
      })))
      .filter((course) => course.gapSkills?.length > 0)
      .slice(0, 5)
  }, [selectedRoadmapPlan])

  const selectedCurriculumSemesters = useMemo(() => {
    const grouped = selectedCurriculum.reduce((acc, course) => {
      const key = course.semester ?? 0
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(course)
      return acc
    }, {})

    return Object.entries(grouped)
      .map(([semester, courses]) => ({ semester: Number(semester), courses }))
      .sort((a, b) => a.semester - b.semester)
  }, [selectedCurriculum])

  const handleToggleDashboardCourse = (course) => {
    if (!selectedProgress?.roadmapKey) {
      return
    }

    const courseToken = course.code
    const completed = !selectedCompletedTokens.has(courseToken)

    upsertRoadmapCourseProgress({
      roadmapKey: selectedProgress.roadmapKey,
      ownerId: selectedProgress.ownerId || roadmapOwnerId,
      major: selectedProgress.major,
      careerId: selectedProgress.careerId,
      careerTitle: selectedProgress.careerTitle,
      totalCourses: selectedProgress.totalCourses,
      courseToken,
      courseInfo: {
        code: course.code,
        title: course.title,
        titleAr: course.titleAr,
        semester: course.semester,
        semesterLabel: `Semester ${course.semester}`,
        skills: course.skills || [],
      },
      completed,
    })

    setRoadmapRefreshTick((value) => value + 1)
  }

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

            <Link
              to="/craft-roadmap"
              className="mt-6 inline-flex justify-center rounded-lg bg-masari-primary px-6 py-3 font-bold text-white transition hover:bg-masari-accent"
            >
              {t('dashboard.startCrafting')}
            </Link>
          </header>
        </div>
      </div>
    )
  }

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
      openRoadmap: '1',
      fromDashboard: '1',
    })

    navigate(`/roadmap/${selectedProgress.careerId}?${params.toString()}`)
  }

  const openRoadmapDetailsFromItem = (item) => {
    if (!item?.careerId) {
      return
    }

    const params = new URLSearchParams({
      major: item.major || major,
      college,
      collegeYear,
      semesterYear,
      name: fullName,
      openRoadmap: '1',
      fromDashboard: '1',
    })

    navigate(`/roadmap/${item.careerId}?${params.toString()}`)
  }

  return (
    <div
      className="min-h-screen px-6 py-10 text-masari-light md:px-10"
      style={{
        backgroundColor: '#0b1220',
        backgroundImage: 'linear-gradient(180deg, #0b1220 0%, #0e1728 52%, #101b2d 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-[#2d3c58] bg-[#121d31] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-masari-accent">
            {t('dashboard.badge')}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-masari-light md:text-4xl">
            {t('dashboard.title')}
          </h1>
          <p className="mt-3 max-w-2xl text-gray-300">
            {t('dashboard.subtitle', { name: fullName })}
          </p>

          {defaultRoadmapCareer && (
            <section className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-950/10 p-4">
              <h3 className="text-lg font-semibold text-emerald-200">{t('roadmap.defaultRoadmap')}</h3>
              <p className="text-sm text-emerald-100">{isArabic && defaultRoadmapCareer.arTitle ? defaultRoadmapCareer.arTitle : defaultRoadmapCareer.title}</p>
              <p className="text-xs text-emerald-200">{defaultRoadmapCareer.category}</p>
            </section>
          )}

          {favoriteRoadmapCareers.length > 0 && (
            <section className="mb-4 rounded-lg border border-masari-accent bg-gray-800 p-4">
              <h3 className="text-lg font-semibold text-white">{t('roadmap.favoriteRoadmaps')}</h3>
              <ul className="mt-2 space-y-1 text-gray-300">
                {favoriteRoadmapCareers.map((career) => (
                  <li key={career.id}>• {isArabic && career.arTitle ? career.arTitle : career.title} ({career.major})</li>
                ))}
              </ul>
            </section>
          )}

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

              {roadmapProgress.length > 0 && (
                <div className="mt-3 rounded-lg border border-sky-200 bg-white/80 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800">{t('dashboard.savedRoadmaps')}</p>
                  <ul className="mt-2 space-y-2">
                    {roadmapProgress.map((item) => {
                      const isCurrent = item.roadmapKey === selectedRoadmapKey
                      return (
                        <li key={item.roadmapKey} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-sky-100 bg-white px-3 py-2">
                          <div>
                            <p className={`text-sm font-semibold ${isCurrent ? 'text-sky-700' : 'text-sky-950'}`}>
                              {item.careerTitle || item.careerId || t('dashboard.unnamedRoadmap')}
                            </p>
                            <p className="text-xs text-sky-900">{item.completionPercent ?? 0}%</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openRoadmapDetailsFromItem(item)}
                            className="rounded-md border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 transition hover:bg-sky-100"
                          >
                            {t('dashboard.openRoadmapDetails')}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

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

                  <div className="mt-4 rounded-xl border border-sky-200 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800">
                          {isArabic ? 'الخريطة الكاملة للمقررات' : 'Full roadmap courses'}
                        </p>
                        <p className="text-xs text-sky-900">
                          {isArabic
                            ? 'يمكنك تحديد كل مقرر كمنجز من هنا، وستتحدث النسبة تلقائيًا.'
                            : 'Mark each course here to update the completion percentage automatically.'}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-sky-900">
                        {selectedCurriculum.length}{' '}
                        {isArabic ? 'مقرر' : 'courses'}
                      </p>
                    </div>

                    {selectedCurriculumSemesters.length > 0 ? (
                      <div className="mt-4 space-y-4">
                        {selectedCurriculumSemesters.map((semesterGroup) => (
                          <div key={semesterGroup.semester} className="rounded-lg border border-sky-100 bg-sky-50/80 p-3">
                            <h4 className="text-sm font-bold text-sky-950">
                              {isArabic ? `الفصل ${semesterGroup.semester}` : `Semester ${semesterGroup.semester}`}
                            </h4>
                            <ul className="mt-3 space-y-2">
                              {semesterGroup.courses.map((course) => {
                                const completed = selectedCompletedTokens.has(course.code)
                                return (
                                  <li key={course.code} className="flex items-start gap-3 rounded-md border border-sky-100 bg-white px-3 py-2">
                                    <input
                                      type="checkbox"
                                      checked={completed}
                                      onChange={() => handleToggleDashboardCourse(course)}
                                      className="mt-1 h-4 w-4 rounded border-sky-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className={`text-sm font-semibold ${completed ? 'text-emerald-700 line-through' : 'text-sky-950'}`}>
                                        {course.code} - {getLocalizedCourseTitle(course, isArabic)}
                                      </p>
                                      <p className="text-xs text-sky-900">
                                        {course.skills?.length ? course.skills.join(' • ') : isArabic ? 'لا توجد مهارات مضافة' : 'No skills listed'}
                                      </p>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${completed ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                                      {completed ? (isArabic ? 'مكتمل' : 'Done') : (isArabic ? 'غير مكتمل' : 'Open')}
                                    </span>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-sky-900">
                        {isArabic ? 'لا توجد خريطة جاهزة لهذا التخصص بعد.' : 'No curriculum is available for this major yet.'}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
                          {t('dashboard.gapResourcesTitle')}
                        </p>
                        <p className="text-xs text-amber-900">
                          {t('dashboard.gapResourcesHint')}
                        </p>
                      </div>
                    </div>

                    {gapResourceCourses.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {gapResourceCourses.map((course) => (
                          <div key={`${course.code}-${course.semester}`} className="rounded-lg border border-amber-200 bg-white p-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-amber-950">
                                  {course.code} - {getLocalizedCourseTitle(course, isArabic)}
                                </p>
                                <p className="text-xs text-amber-800">
                                  {course.semesterLabel}
                                </p>
                              </div>
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                {t('dashboard.gapMissingSkills')}: {course.gapSkills.join(' • ')}
                              </span>
                            </div>

                            <div className="mt-3">
                              <p className="text-xs font-semibold text-amber-900">
                                {isArabic ? 'الموارد المقترحة' : 'Suggested resources'}
                              </p>
                              {Array.isArray(course.supplemental) && course.supplemental.length > 0 ? (
                                <ul className="mt-2 flex flex-wrap gap-2">
                                  {course.supplemental.map((resource) => (
                                    <li key={resource} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-950">
                                      {resource}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="mt-2 text-xs text-amber-900">
                                  {t('dashboard.gapNoResources')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-amber-900">
                        {isArabic ? 'لا توجد فجوات واضحة الآن في الخريطة المختارة.' : 'No clear gaps are detected in the selected roadmap right now.'}
                      </p>
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
            <section className="mb-6 rounded-2xl border border-[#31415f] bg-gradient-to-br from-[#131f34] to-[#0f1829] p-5">
              <h2 className="font-display text-xl font-bold text-[#eef4ff]">{t('dashboard.careersSectionTitle')}</h2>
                <p className="mt-2 text-sm text-[#b8c4da]">{t('dashboard.careersSectionHint')}</p>
              <div className="mt-4 flex gap-4">
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                    className="rounded-lg border border-[#3d4f73] bg-[#16253d] px-3 py-2 text-sm text-[#e2eaf7] outline-none focus:border-[#7dd3c8] focus:ring-2 focus:ring-[#7dd3c8]/30"
                >
                  <option value="all">{isArabic ? 'جميع الوظائف' : 'All Jobs'}</option>
                  <option value="major">{isArabic ? 'حسب التخصص' : 'By Specialization'}</option>
                  <option value="interests">{isArabic ? 'حسب الاهتمامات' : 'By Interests'}</option>
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
                  className="rounded-2xl border border-[#35496b] bg-gradient-to-br from-[#15243d] to-[#192e4a] p-5 shadow-lg shadow-[#091325]/70"
                >
                  <h2 className="font-display text-xl font-bold text-masari-light">{isArabic && job.arTitle ? job.arTitle : job.title}</h2>
                  {job.priority && (
                    <p className="mt-2 inline-block rounded-full border border-[#4a688f] bg-[#1d3150] px-2.5 py-1 text-xs font-semibold text-[#d7e6ff]">
                      {t('dashboard.applicationPriority')}: {job.priority}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-[#456187] bg-[#1c2f4d] px-3 py-1 text-xs font-semibold text-[#d8e3f5]"
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
                    className="mt-6 w-full rounded-lg bg-[#2f7f79] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#256965]"
                  >
                    {t('dashboard.applyCareer')}
                  </button>
                </article>
              ))}
            </section>

            {recommendedJobs.length === 0 && (
              <div className="rounded-xl border border-[#324666] bg-[#15243b] p-6 text-center text-[#e0e9f8]">
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
