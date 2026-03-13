import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { buildCareerRoadmap, getCareerById, getLocalizedCourseTitle } from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { getCurrentUser } from '../services/auth'

function RoadMap() {
	const { jobId } = useParams()
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const { t, isArabic } = useLanguage()
	const major = searchParams.get('major') ?? ''
	const college = searchParams.get('college') ?? ''
	const authUser = getCurrentUser()
	const profile = authUser?.profile

	const career = useMemo(() => getCareerById(jobId), [jobId])
	const roadmapView = useMemo(() => buildCareerRoadmap(profile, career), [profile, career])
	const semesters = roadmapView.semesters
	const summary = roadmapView.summary

	if (!career || !profile) {
		return (
			<div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 md:px-10">
				<div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
					<h1 className="font-display text-3xl font-bold text-white">{t('roadmap.unavailableTitle')}</h1>
					<p className="mt-3 text-slate-300">
						{t('roadmap.unavailableDesc')}
					</p>
					<button
						type="button"
						onClick={() => navigate('/dashboard')}
						className="mt-6 rounded-xl bg-cyan-400 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-cyan-300"
					>
						{t('job.goDashboard')}
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 md:px-10">
			<div className="mx-auto max-w-6xl">
				<header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
						{t('roadmap.careerRoadmap')}
					</p>
					<h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
						{t('roadmap.roadmapFor', { title: career.title })}
					</h1>
					<p className="mt-3 max-w-3xl text-slate-300">
						{t('roadmap.generatedFrom', {
							major: major || career.major,
							college: college ? ` at ${college}` : '',
						})}
					</p>
					<div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
						<p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
							<span className="font-semibold text-cyan-300">{t('roadmap.student')}:</span> {profile.fullName}
						</p>
						<p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
							<span className="font-semibold text-cyan-300">{t('roadmap.involvedCourses')}:</span> {summary.involved}
						</p>
						<p className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-slate-200">
							<span className="font-semibold text-cyan-300">{t('roadmap.remainingCourses')}:</span> {summary.remaining}
						</p>
					</div>
				</header>

				<section className="mt-8 overflow-x-auto pb-2">
					<div className="flex min-w-max items-start gap-6 pr-2">
						{semesters.map((semester, index) => (
							<div key={semester.label} className="relative w-[320px]">
								{index > 0 && (
									<div className="pointer-events-none absolute -left-6 top-7 h-[2px] w-6 bg-cyan-400/40" />
								)}
								<div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
									<div className="mb-4 flex items-center justify-between">
										<p className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200">
											{semester.label}
										</p>
										{summary.currentSemester === semester.semesterNumber && (
											<span className="text-xs font-semibold text-amber-300">{t('roadmap.current')}</span>
										)}
									</div>

									<div className="space-y-3">
										{semester.courses.map((course) => (
											<article key={course.code} className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
												<div className="flex items-start justify-between gap-2">
													<div>
														<p className="text-xs text-cyan-300">{course.code}</p>
														<h3 className="text-sm font-semibold text-white">{getLocalizedCourseTitle(course, isArabic)}</h3>
													</div>
													<span
														className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
															course.status === 'completed'
																? 'bg-emerald-400/20 text-emerald-200'
																: course.status === 'ongoing'
																	? 'bg-amber-400/20 text-amber-200'
																	: 'bg-slate-700 text-slate-200'
														}`}
													>
														{t(`roadmap.${course.status}`)}
													</span>
												</div>

												<div className="mt-2 h-1.5 rounded-full bg-slate-800">
													<div
														className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300"
														style={{ width: `${course.matchPercent}%` }}
													/>
												</div>
												<p className="mt-1 text-[11px] text-slate-300">{t('roadmap.matchToJob')}: {course.matchPercent}%</p>

												{course.gapSkills.length > 0 && (
													<>
														<p className="mt-2 text-[11px] font-semibold text-amber-200">{t('roadmap.detectedGaps')}</p>
														<div className="mt-1 flex flex-wrap gap-1">
															{course.gapSkills.map((gap) => (
																<span key={gap} className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-100">
																	{gap}
																</span>
															))}
														</div>
													</>
												)}

												<p className="mt-2 text-[11px] font-semibold text-sky-200">{t('roadmap.extraResources')}</p>
												<ul className="mt-1 space-y-1 text-[11px] text-slate-300">
													{course.supplemental.map((resource) => (
														<li key={resource}>- {resource}</li>
													))}
												</ul>
											</article>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	)
}

export default RoadMap
