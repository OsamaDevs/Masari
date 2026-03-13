import { useLanguage } from '../hooks/useLanguage.jsx'

function Landing() {
  const { t } = useLanguage()

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-28 top-24 h-64 w-64 animate-floaty rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-52 h-72 w-72 animate-floaty rounded-full bg-amber-400/20 blur-3xl [animation-delay:1.2s]" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <p className="font-display text-xl font-bold tracking-tight text-white">
          {t('app.brand')}
        </p>
        <button className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20">
          {t('landing.demo')}
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <section className="grid items-center gap-10 pb-16 pt-8 md:grid-cols-2 md:pt-14">
          <div className="space-y-6 animate-fadeUp">
            <p className="inline-flex rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              {t('landing.badge')}
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white md:text-6xl">
              {t('landing.title')}
            </h1>
            <p className="max-w-xl text-base text-slate-300 md:text-lg">
              {t('landing.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-400/30 transition hover:-translate-y-0.5 hover:bg-cyan-300">
                {t('landing.primary')}
              </button>
              <button className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200">
                {t('landing.secondary')}
              </button>
            </div>
          </div>

          <div className="animate-fadeUp [animation-delay:160ms]">
            <div className="rounded-3xl border border-slate-700/80 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
              <p className="text-sm font-semibold text-cyan-300">{t('landing.semester')}</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">
                {t('landing.course')}
              </h2>
              <div className="mt-5 grid gap-3">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                    {t('landing.suggestedRole')}
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {t('landing.role')}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                    {t('landing.gapTitle')}
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {t('landing.gap')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700/80 bg-slate-900/60 p-6 md:p-10">
          <h3 className="font-display text-3xl font-bold text-white">
            {t('landing.why')}
          </h3>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-700 bg-slate-950/50 p-5">
              <p className="text-sm font-bold text-cyan-300">
                {t('landing.featureOneTitle')}
              </p>
              <p className="mt-2 text-slate-300">
                {t('landing.featureOneDesc')}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-700 bg-slate-950/50 p-5">
              <p className="text-sm font-bold text-cyan-300">
                {t('landing.featureTwoTitle')}
              </p>
              <p className="mt-2 text-slate-300">
                {t('landing.featureTwoDesc')}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-700 bg-slate-950/50 p-5">
              <p className="text-sm font-bold text-cyan-300">
                {t('landing.featureThreeTitle')}
              </p>
              <p className="mt-2 text-slate-300">
                {t('landing.featureThreeDesc')}
              </p>
            </article>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400/20 via-slate-900/60 to-amber-300/20 p-8 text-center md:p-12">
          <h4 className="font-display text-3xl font-bold text-white md:text-4xl">
            {t('landing.ctaTitle')}
          </h4>
          <p className="mx-auto mt-3 max-w-2xl text-slate-200">
            {t('landing.ctaDesc')}
          </p>
          <button className="mt-6 rounded-xl bg-white px-7 py-3 font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100">
            {t('landing.ctaButton')}
          </button>
        </section>
      </main>

      <footer className="border-t border-slate-800/90 bg-slate-950/60 px-6 py-6 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-sm text-slate-400 md:flex-row">
          <p>{t('landing.footerOne')}</p>
          <p>{t('landing.footerTwo')}</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
