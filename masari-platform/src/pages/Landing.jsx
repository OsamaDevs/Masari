import { useLanguage } from '../hooks/useLanguage.jsx'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

function Landing() {
  const { t } = useLanguage()

  return (
    <div className="relative overflow-hidden pb-6 bg-masari-deep">
      <div className="pointer-events-none absolute -left-28 top-24 h-64 w-64 animate-floaty rounded-full bg-masari-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-52 h-72 w-72 animate-floaty rounded-full bg-masari-secondary/20 blur-3xl [animation-delay:1.2s]" />

      <header className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-6 md:px-10 lg:flex-row lg:items-center">
        <BrandLogo compact withSubtitle className="shrink-0" to="/home" />
        <button className="rounded-full border border-masari-accent/50 bg-masari-primary/40 px-4 py-2 text-sm font-semibold text-masari-light transition hover:bg-masari-primary/60">
          {t('landing.demo')}
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <section className="mb-6 rounded-2xl border border-masari-accent bg-gradient-to-r from-masari-primary/30 to-masari-secondary/30 p-4 md:p-5">
          <p className="text-sm font-bold text-masari-light md:text-base">{t('landing.welcomeHeadline')}</p>
          <p className="mt-1 text-xs text-gray-300 md:text-sm">{t('landing.welcomeSubline')}</p>
        </section>

        <section className="grid items-start gap-10 pb-16 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-10">
          <div className="max-w-2xl space-y-6 animate-fadeUp">
            <p className="inline-flex rounded-full border border-masari-accent bg-gray-800/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-masari-light">
              {t('landing.badge')}
            </p>
            <h1 className="font-display text-3xl font-extrabold leading-[1.15] text-masari-light md:text-5xl lg:text-6xl">
              {t('landing.title')}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-gray-300 md:text-lg">
              {t('landing.subtitle')}
            </p>
            <p className="max-w-2xl rounded-xl border border-masari-primary/40 bg-masari-primary/40 px-4 py-3 text-sm leading-relaxed text-masari-light">
              {t('landing.introMessage')}
            </p>
            <div className="grid gap-3 rounded-2xl border border-masari-accent bg-gray-800/95 p-4 text-sm text-gray-300 sm:grid-cols-2">
              <p className="rounded-lg bg-masari-primary px-3 py-2 leading-relaxed font-semibold">{t('landing.welcomeLineOne')}</p>
              <p className="rounded-lg bg-masari-primary px-3 py-2 leading-relaxed font-semibold">{t('landing.welcomeLineTwo')}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link to="/craft-roadmap" className="rounded-xl bg-masari-primary px-6 py-3 text-center font-bold text-white shadow-lg shadow-masari-primary/30 transition hover:-translate-y-0.5 hover:bg-masari-accent">
                {t('landing.primary')}
              </Link>
              <Link to="/login" className="rounded-xl border border-masari-accent px-6 py-3 text-center font-semibold text-masari-light transition hover:border-masari-primary hover:text-masari-primary">
                {t('landing.secondary')}
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-masari-accent bg-gray-800 p-3 text-center">
                <p className="text-xl font-extrabold text-masari-light">4</p>
                <p className="text-xs font-semibold text-masari-light">{t('landing.statMajors')}</p>
              </article>
              <article className="rounded-xl border border-masari-accent bg-gray-800 p-3 text-center">
                <p className="text-xl font-extrabold text-masari-light">12+</p>
                <p className="text-xs font-semibold text-masari-light">{t('landing.statCareers')}</p>
              </article>
              <article className="rounded-xl border border-masari-accent bg-gray-800 p-3 text-center">
                <p className="text-xl font-extrabold text-masari-light">1:1</p>
                <p className="text-xs font-semibold text-masari-light">{t('landing.statRoadmap')}</p>
              </article>
            </div>
          </div>

          <div className="animate-fadeUp [animation-delay:160ms] lg:pt-3">
            <div className="mx-auto w-full max-w-xl rounded-3xl border border-masari-accent/80 bg-gray-800 p-6 shadow-2xl shadow-masari-primary/40 backdrop-blur">
              <div className="mb-4 rounded-2xl border border-masari-accent bg-masari-primary/80 p-3">
                <BrandLogo compact={false} withSubtitle={false} to="/home" />
              </div>
              <p className="text-sm font-semibold text-masari-light">{t('landing.semester')}</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-masari-light">
                {t('landing.course')}
              </h2>
              <div className="mt-5 grid gap-3">
                <div className="rounded-xl border border-masari-primary/30 bg-masari-primary/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-masari-light">
                    {t('landing.suggestedRole')}
                  </p>
                  <p className="mt-1 text-lg font-bold text-masari-light">
                    {t('landing.role')}
                  </p>
                </div>
                <div className="rounded-xl border border-masari-secondary/30 bg-masari-secondary/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-masari-secondary">
                    {t('landing.gapTitle')}
                  </p>
                  <p className="mt-1 font-semibold text-masari-light">
                    {t('landing.gap')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-masari-accent/80 bg-gray-800/95 p-6 md:p-10">
          <h3 className="font-display text-2xl font-bold text-masari-light md:text-3xl">
            {t('landing.why')}
          </h3>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-masari-accent bg-gray-800/90 p-5">
              <p className="text-sm font-bold text-masari-light">
                {t('landing.featureOneTitle')}
              </p>
              <p className="mt-2 text-masari-light">
                {t('landing.featureOneDesc')}
              </p>
            </article>
            <article className="rounded-2xl border border-masari-accent bg-gray-800/90 p-5">
              <p className="text-sm font-bold text-masari-light">
                {t('landing.featureTwoTitle')}
              </p>
              <p className="mt-2 text-masari-light">
                {t('landing.featureTwoDesc')}
              </p>
            </article>
            <article className="rounded-2xl border border-masari-accent bg-gray-800/90 p-5">
              <p className="text-sm font-bold text-masari-light">
                {t('landing.featureThreeTitle')}
              </p>
              <p className="mt-2 text-masari-light">
                {t('landing.featureThreeDesc')}
              </p>
            </article>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-masari-accent/30 bg-gradient-to-r from-masari-primary/20 via-gray-800/70 to-masari-secondary/20 p-8 text-center md:p-10">
          <h4 className="font-display text-2xl font-bold text-masari-light md:text-4xl">
            {t('landing.ctaTitle')}
          </h4>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base">
            {t('landing.ctaDesc')}
          </p>
          <Link to="/assessment" className="mt-6 inline-block rounded-xl bg-gray-800 px-7 py-3 font-bold text-masari-light transition hover:-translate-y-0.5 hover:bg-gray-700">
            {t('landing.ctaButton')}
          </Link>
        </section>
      </main>

      <footer className="border-t border-masari-accent/90 bg-gray-800/80 px-6 py-6 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-sm text-masari-light md:flex-row">
          <p>{t('landing.footerOne')}</p>
          <p>{t('landing.footerTwo')}</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
