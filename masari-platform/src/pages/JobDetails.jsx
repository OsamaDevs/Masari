import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getCareerById } from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'

function JobDetails() {
	const { jobId } = useParams()
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const { t } = useLanguage()
	const college = searchParams.get('college') ?? ''
	const major = searchParams.get('major') ?? ''

	const selectedCareer = useMemo(() => {
		return getCareerById(jobId)
	}, [jobId])

	if (!selectedCareer) {
		return (
			<div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 md:px-10">
				<div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
					<h1 className="font-display text-3xl font-bold text-white">{t('job.notFoundTitle')}</h1>
					<p className="mt-3 text-slate-300">
						{t('job.notFoundDesc')}
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
			<div className="mx-auto max-w-5xl">
				<header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">
					<p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
						{t('job.badge')}
					</p>
					<h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
						{selectedCareer.title}
					</h1>
					<p className="mt-2 text-sm text-slate-400">
						{major || selectedCareer.major} • {college || t('job.yourCollege')}
					</p>
				</header>

				<section className="mt-6 grid gap-6 md:grid-cols-3">
					<article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:col-span-2">
						<h2 className="font-display text-2xl font-bold text-white">
							{t('job.descriptionTitle')}
						</h2>
						<p className="mt-4 leading-relaxed text-slate-300">
							{selectedCareer.description}
						</p>
						<p className="mt-4 leading-relaxed text-slate-300">
							{t('job.personalizedDesc')}
						</p>
					</article>

					<aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
						<h3 className="font-display text-xl font-bold text-white">
							{t('job.skillsTitle')}
						</h3>
						<ul className="mt-4 space-y-2">
							{selectedCareer.requiredSkills.map((skill) => (
								<li
									key={skill}
									className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-100"
								>
									{skill}
								</li>
							))}
						</ul>
					</aside>
				</section>

				<section className="mt-6 rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-500/20 via-slate-900/70 to-emerald-400/20 p-6 md:p-8">
					<h4 className="font-display text-2xl font-bold text-white">
						{t('job.prepareTitle')}
					</h4>
					<p className="mt-2 max-w-3xl text-slate-200">
						{t('job.prepareDesc')}
					</p>
					<button
						type="button"
						onClick={() => {
							const params = new URLSearchParams({
								college,
								major: major || selectedCareer.major,
							})
							navigate(`/roadmap/${selectedCareer.id}?${params.toString()}`)
						}}
						className="mt-5 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
					>
						{t('job.generateRoadmap')}
					</button>
				</section>
			</div>
		</div>
	)
}

export default JobDetails
