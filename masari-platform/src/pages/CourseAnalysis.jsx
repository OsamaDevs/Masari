import { useMemo, useState } from 'react'
import {
  getCurriculumForMajor,
  getCurrentSemesterFromProfile,
  getLocalizedCourseTitle,
  getMarketRequirementsForMajor,
  getMarketRequirementsForStudentLevel,
  majors,
} from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { getCurrentUser } from '../services/auth'

function unique(items) {
  return Array.from(new Set(items))
}

function CourseAnalysis() {
  const { t, isArabic } = useLanguage()
  const user = getCurrentUser()
  const defaultMajor = majors.includes(user?.profile?.major) ? user.profile.major : majors[0]

  const [majorFilter, setMajorFilter] = useState(defaultMajor)
  const [semesterFilter, setSemesterFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('matching-desc')
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState(null)

  const curriculum = useMemo(() => getCurriculumForMajor(majorFilter), [majorFilter])
  const currentSemester = useMemo(
    () => getCurrentSemesterFromProfile(user?.profile),
    [user?.profile]
  )
  const allMarketRequirements = useMemo(
    () => getMarketRequirementsForMajor(majorFilter),
    [majorFilter]
  )
  const marketRequirements = useMemo(() => {
    const levelAware = getMarketRequirementsForStudentLevel(majorFilter, currentSemester)
    return levelAware.length ? levelAware : allMarketRequirements
  }, [allMarketRequirements, currentSemester, majorFilter])

  const allDemandSkills = useMemo(
    () => unique(marketRequirements.flatMap((item) => item.requiredSkills)),
    [marketRequirements]
  )
  const skillWeightMap = useMemo(() => {
    const weights = new Map()

    marketRequirements.forEach((item) => {
      const itemWeight = item.weight ?? 1
      item.requiredSkills.forEach((skill) => {
        const previous = weights.get(skill) ?? 0
        weights.set(skill, previous + itemWeight)
      })
    })

    return weights
  }, [marketRequirements])
  const totalDemandWeight = useMemo(() => {
    return Array.from(skillWeightMap.values()).reduce((sum, weight) => sum + weight, 0)
  }, [skillWeightMap])

  const semesterOptions = useMemo(() => {
    return unique(curriculum.map((course) => String(course.semester))).sort(
      (a, b) => Number(a) - Number(b)
    )
  }, [curriculum])

  const analyzedCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const mapped = curriculum.map((course) => {
      const matchedSkills = allDemandSkills.filter((skill) => course.skills.includes(skill))
      const missingSkills = allDemandSkills.filter((skill) => !course.skills.includes(skill))
      const matchedWeight = matchedSkills.reduce(
        (sum, skill) => sum + (skillWeightMap.get(skill) ?? 0),
        0
      )
      const matching = totalDemandWeight
        ? Math.round((matchedWeight / totalDemandWeight) * 100)
        : 0

      const companyMatches = marketRequirements
        .map((companyReq) => {
          const overlap = companyReq.requiredSkills.filter((skill) =>
            course.skills.includes(skill)
          ).length
          const weight = companyReq.weight ?? 1
          return {
            ...companyReq,
            overlap,
            weightedOverlap: overlap * weight,
          }
        })
        .filter((item) => item.overlap > 0)
        .sort((a, b) => b.weightedOverlap - a.weightedOverlap)

      return {
        ...course,
        matching,
        matchedSkills,
        missingSkills,
        companyMatches,
      }
    })

    const filtered = mapped.filter((course) => {
      const localizedTitle = getLocalizedCourseTitle(course, isArabic).toLowerCase()
      const matchesSemester =
        semesterFilter === 'all' || String(course.semester) === semesterFilter
      const matchesSearch =
        normalizedSearch.length === 0 ||
        course.code.toLowerCase().includes(normalizedSearch) ||
        course.title.toLowerCase().includes(normalizedSearch) ||
        localizedTitle.includes(normalizedSearch)

      return matchesSemester && matchesSearch
    })

    const sorted = [...filtered]
    if (sortBy === 'matching-desc') {
      sorted.sort((a, b) => b.matching - a.matching)
    }
    if (sortBy === 'matching-asc') {
      sorted.sort((a, b) => a.matching - b.matching)
    }
    if (sortBy === 'title-asc') {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    }
    if (sortBy === 'semester-asc') {
      sorted.sort((a, b) => a.semester - b.semester)
    }

    return sorted
  }, [
    allDemandSkills,
    curriculum,
    isArabic,
    marketRequirements,
    search,
    semesterFilter,
    skillWeightMap,
    sortBy,
    totalDemandWeight,
  ])

  const averageMatch = useMemo(() => {
    if (analyzedCourses.length === 0) {
      return 0
    }

    const total = analyzedCourses.reduce((sum, course) => sum + course.matching, 0)
    return Math.round(total / analyzedCourses.length)
  }, [analyzedCourses])

  const topCompanies = useMemo(() => {
    const companyScores = new Map()

    analyzedCourses.forEach((course) => {
      course.companyMatches.forEach((company) => {
        const previous = companyScores.get(company.company) ?? 0
        companyScores.set(company.company, previous + company.weightedOverlap)
      })
    })

    return Array.from(companyScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name)
  }, [analyzedCourses])

  return (
    <div className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            {t('course.badge')}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
            {t('course.title')}
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">{t('course.subtitle')}</p>

          <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
            <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
              <span className="font-semibold text-cyan-300">{t('course.totalCourses')}:</span> {analyzedCourses.length}
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
              <span className="font-semibold text-cyan-300">{t('course.averageMatch')}:</span> {averageMatch}%
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
              <span className="font-semibold text-cyan-300">{t('course.topCompanies')}:</span> {topCompanies.join(' , ') || '-'}
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6">
          <div className="grid gap-3 md:grid-cols-4">
            <select
              value={majorFilter}
              onChange={(event) => setMajorFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-300/40 transition focus:ring-2"
            >
              {majors.map((major) => (
                <option key={major} value={major}>
                  {t('course.majorFilter')}: {major}
                </option>
              ))}
            </select>

            <select
              value={semesterFilter}
              onChange={(event) => setSemesterFilter(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-300/40 transition focus:ring-2"
            >
              <option value="all">{t('course.allSemesters')}</option>
              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  {t('course.semesterFilter')}: {semester}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-cyan-300/40 transition focus:ring-2"
            >
              <option value="matching-desc">{t('course.sortHigh')}</option>
              <option value="matching-asc">{t('course.sortLow')}</option>
              <option value="title-asc">{t('course.sortAZ')}</option>
              <option value="semester-asc">{t('course.sortSemester')}</option>
            </select>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('course.searchPlaceholder')}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none ring-cyan-300/40 transition focus:ring-2"
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="font-display text-2xl font-bold text-white">{t('course.marketRequirementsTitle')}</h2>
          <p className="mt-2 text-sm text-slate-300">{t('course.companiesContributing')}</p>
          <p className="mt-2 text-xs text-slate-400">
            {t('course.currentSemester')}: {currentSemester} · {t('course.activeRequirements')}: {marketRequirements.length}/{allMarketRequirements.length}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {marketRequirements.map((item) => (
              <article key={item.company + item.role} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm font-bold text-cyan-300">{item.company}</p>
                <p className="mt-1 text-sm text-slate-200">{t('course.role')}: {item.role}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {t('course.requirementWindow')}: {item.minSemester ?? 1}-{item.maxSemester ?? 8}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {t('course.companyWeight')}: {(item.weight ?? 1).toFixed(2)}x
                </p>
                <p className="mt-3 text-xs font-semibold text-emerald-200">{t('course.demandSkills')}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {item.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">{t('course.details')}: {item.details}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          {analyzedCourses.map((course) => (
            <article
              key={course.code + course.semester}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-cyan-300">{course.code} · {t('course.semesterFilter')} {course.semester}</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-white">
                    {getLocalizedCourseTitle(course, isArabic)}
                  </h2>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-bold text-cyan-200">
                  {course.matching}%
                </span>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-300">
                  <span>{t('course.matchingPercentage')}</span>
                  <span>{course.matching}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300"
                    style={{ width: `${course.matching}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-bold text-emerald-200">{t('course.skillsGained')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {course.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-amber-200">{t('course.missingSkills')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {course.missingSkills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm font-bold text-sky-200">{t('course.companiesSuggesting')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {course.companyMatches.map((item) => (
                    <button
                      key={item.company}
                      type="button"
                      onClick={() => setSelectedCompanyDetails({ course, company: item })}
                      className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100 transition hover:bg-sky-400/20"
                    >
                      {item.company} · {Math.round(item.weightedOverlap * 100) / 100}
                    </button>
                  ))}
                  {course.companyMatches.length === 0 && (
                    <span className="text-xs text-slate-400">{t('course.noCompanyMatches')}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {analyzedCourses.length === 0 && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-slate-300">
            {t('course.noCourses')}
          </div>
        )}

        {selectedCompanyDetails && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">
                {selectedCompanyDetails.company.company}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">
                {selectedCompanyDetails.company.role}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {t('course.details')}: {selectedCompanyDetails.company.details}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {t('course.requirementWindow')}: {selectedCompanyDetails.company.minSemester ?? 1}-{selectedCompanyDetails.company.maxSemester ?? 8}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {t('course.companyWeight')}: {(selectedCompanyDetails.company.weight ?? 1).toFixed(2)}x
              </p>

              <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                <p className="text-xs font-semibold text-emerald-200">{t('course.demandSkills')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCompanyDetails.company.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-3">
                <p className="text-xs font-semibold text-cyan-200">{t('course.track')}:</p>
                <p className="mt-1 text-sm text-slate-200">
                  {selectedCompanyDetails.course.code} - {getLocalizedCourseTitle(selectedCompanyDetails.course, isArabic)}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {t('course.matchingPercentage')}: {selectedCompanyDetails.course.matching}%
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCompanyDetails(null)}
                className="mt-5 w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                {t('course.closeDetails')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseAnalysis
