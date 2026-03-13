import { useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getRecommendedCareers, majors } from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { getCurrentUser } from '../services/auth'

function Dashboard() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const authUser = useMemo(() => getCurrentUser(), [])

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

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
            {t('dashboard.badge')}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
            {t('dashboard.title')}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            {t('dashboard.subtitle', { name: fullName })}
          </p>

          <div className="mt-6 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
            <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
              <span className="font-semibold text-cyan-300">{t('dashboard.university')}:</span> {university}
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
              <span className="font-semibold text-cyan-300">{t('dashboard.college')}:</span> {college || '-'}
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
              <span className="font-semibold text-cyan-300">{t('dashboard.major')}:</span> {major}
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
              <span className="font-semibold text-cyan-300">{t('dashboard.collegeYear')}:</span> {collegeYear}
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
              <span className="font-semibold text-cyan-300">{t('dashboard.semester')}:</span> {semesterYear}
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
              <span className="font-semibold text-cyan-300">{t('dashboard.studentId')}:</span> {studentId}
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200 md:col-span-2 xl:col-span-3">
              <span className="font-semibold text-cyan-300">{t('dashboard.gpa')}:</span> {gpa}{' '}
              <span className="ml-4 font-semibold text-cyan-300">{t('dashboard.careerGoal')}:</span> {profile.careerGoal || '-'}
            </p>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recommendedJobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
            >
              <h2 className="font-display text-xl font-bold text-white">{job.title}</h2>
              {job.priority && (
                <p className="mt-2 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                  {t('dashboard.applicationPriority')}: {job.priority}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200"
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
                className="mt-6 w-full rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                {t('dashboard.applyCareer')}
              </button>
            </article>
          ))}
        </section>

        {recommendedJobs.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center text-slate-300">
            {t('dashboard.noCareers')}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
