import { useLanguage } from '../hooks/useLanguage.jsx'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

function Landing() {
  const { t } = useLanguage()

  return (
    <div className="relative overflow-hidden pb-6">
      <div className="pointer-events-none absolute -left-28 top-24 h-64 w-64 animate-floaty rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-52 h-72 w-72 animate-floaty rounded-full bg-teal-400/20 blur-3xl [animation-delay:1.2s]" />

      <header className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-6 md:px-10 lg:flex-row lg:items-center">
        <BrandLogo compact withSubtitle className="shrink-0" to="/home" />
        <button className="rounded-full border border-emerald-300/50 bg-emerald-200/40 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200/60">
          {t('landing.demo')}
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <section className="mb-6 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-300/30 to-teal-300/30 p-4 md:p-5">
          <p className="text-sm font-bold text-emerald-950 md:text-base">{t('landing.welcomeHeadline')}</p>
          <p className="mt-1 text-xs text-emerald-900 md:text-sm">{t('landing.welcomeSubline')}</p>
        </section>

        <section className="grid items-start gap-10 pb-16 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-10">
          <div className="max-w-2xl space-y-6 animate-fadeUp">
            <p className="inline-flex rounded-full border border-emerald-300 bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-900">
              {t('landing.badge')}
            </p>
            <h1 className="font-display text-3xl font-extrabold leading-[1.15] text-emerald-950 md:text-5xl lg:text-6xl">
              {t('landing.title')}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-emerald-900 md:text-lg">
              {t('landing.subtitle')}
            </p>
            <p className="max-w-2xl rounded-xl border border-emerald-400/40 bg-emerald-200/40 px-4 py-3 text-sm leading-relaxed text-emerald-950">
              {t('landing.introMessage')}
            </p>
            <div className="grid gap-3 rounded-2xl border border-emerald-300 bg-white/95 p-4 text-sm text-emerald-900 sm:grid-cols-2">
              <p className="rounded-lg bg-emerald-100 px-3 py-2 leading-relaxed font-semibold">{t('landing.welcomeLineOne')}</p>
              <p className="rounded-lg bg-emerald-100 px-3 py-2 leading-relaxed font-semibold">{t('landing.welcomeLineTwo')}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link to="/roadmap" className="rounded-xl bg-emerald-500 px-6 py-3 text-center font-bold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400">
                {t('landing.primary')}
              </Link>
              <Link to="/login" className="rounded-xl border border-emerald-300 px-6 py-3 text-center font-semibold text-emerald-950 transition hover:border-emerald-400 hover:text-emerald-900">
                {t('landing.secondary')}
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-emerald-300 bg-white/95 p-3 text-center">
                <p className="text-xl font-extrabold text-emerald-900">4</p>
                <p className="text-xs font-semibold text-emerald-900">{t('landing.statMajors')}</p>
              </article>
              <article className="rounded-xl border border-emerald-300 bg-white/95 p-3 text-center">
                <p className="text-xl font-extrabold text-emerald-900">12+</p>
                <p className="text-xs font-semibold text-emerald-900">{t('landing.statCareers')}</p>
              </article>
              <article className="rounded-xl border border-emerald-300 bg-white/95 p-3 text-center">
                <p className="text-xl font-extrabold text-emerald-900">1:1</p>
                <p className="text-xs font-semibold text-emerald-900">{t('landing.statRoadmap')}</p>
              </article>
            </div>
          </div>

          <div className="animate-fadeUp [animation-delay:160ms] lg:pt-3">
            <div className="mx-auto w-full max-w-xl rounded-3xl border border-emerald-300/80 bg-white p-6 shadow-2xl shadow-emerald-200/40 backdrop-blur">
              <div className="mb-4 rounded-2xl border border-emerald-300 bg-emerald-100/80 p-3">
                <BrandLogo compact={false} withSubtitle={false} to="/home" />
              </div>
              <p className="text-sm font-semibold text-emerald-900">{t('landing.semester')}</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-emerald-950">
                {t('landing.course')}
              </h2>
              <div className="mt-5 grid gap-3">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
                    {t('landing.suggestedRole')}
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-950">
                    {t('landing.role')}
                  </p>
                </div>
                <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                    {t('landing.gapTitle')}
                  </p>
                  <p className="mt-1 font-semibold text-emerald-950">
                    {t('landing.gap')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-300/80 bg-white/95 p-6 md:p-10">
          <h3 className="font-display text-2xl font-bold text-emerald-950 md:text-3xl">
            {t('landing.why')}
          </h3>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-emerald-300 bg-emerald-100/90 p-5">
              <p className="text-sm font-bold text-emerald-900">
                {t('landing.featureOneTitle')}
              </p>
              <p className="mt-2 text-emerald-900">
                {t('landing.featureOneDesc')}
              </p>
            </article>
            <article className="rounded-2xl border border-emerald-300 bg-emerald-100/90 p-5">
              <p className="text-sm font-bold text-emerald-900">
                {t('landing.featureTwoTitle')}
              </p>
              <p className="mt-2 text-emerald-900">
                {t('landing.featureTwoDesc')}
              </p>
            </article>
            <article className="rounded-2xl border border-emerald-300 bg-emerald-100/90 p-5">
              <p className="text-sm font-bold text-emerald-900">
                {t('landing.featureThreeTitle')}
              </p>
              <p className="mt-2 text-emerald-900">
                {t('landing.featureThreeDesc')}
              </p>
            </article>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-emerald-300/30 bg-gradient-to-r from-emerald-400/20 via-emerald-100/70 to-teal-300/20 p-8 text-center md:p-10">
          <h4 className="font-display text-2xl font-bold text-emerald-950 md:text-4xl">
            {t('landing.ctaTitle')}
          </h4>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-emerald-900 md:text-base">
            {t('landing.ctaDesc')}
          </p>
          <Link to="/roadmap" className="mt-6 inline-block rounded-xl bg-white px-7 py-3 font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100">
            {t('landing.ctaButton')}
          </Link>
        </section>
      </main>

      <footer className="border-t border-emerald-300/90 bg-emerald-100/80 px-6 py-6 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-sm text-emerald-900 md:flex-row">
          <p>{t('landing.footerOne')}</p>
          <p>{t('landing.footerTwo')}</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
