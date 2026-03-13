import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage.jsx'
import { demoCredentials, getCurrentUser, loginWithDummyData } from '../services/auth'

function Login() {
  const navigate = useNavigate()
  const { t, isArabic } = useLanguage()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (getCurrentUser()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const updateField = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }))
  }

  const handleContinue = () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError(t('login.requiredError'))
      return
    }

    const result = loginWithDummyData(form.email, form.password)
    if (!result.ok) {
      setError(
        result.errorCode === 'invalid_domain'
          ? t('login.invalidDomain')
          : t('login.invalidCredentials')
      )
      return
    }

    setError('')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 md:px-10">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-2">
        <section className="space-y-5">
          <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
            {t('login.badge')}
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-white md:text-5xl">
            {t('login.heading')}
          </h1>
          <p className="max-w-xl text-base text-slate-300 md:text-lg">{t('login.subtitle')}</p>
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              {t('login.featureOne')}
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              {t('login.featureTwo')}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 shadow-2xl shadow-black/30 md:p-8">
          <h2 className="font-display text-2xl font-bold text-white">
            {t('login.cardTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-400">{t('login.subtitle')}</p>
          <p className="mt-3 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
            {t('login.allowedEmail')} <span className="font-semibold">name@std.psau.edu.sa</span>
          </p>
          <p className="mt-3 text-xs text-slate-400">
            {t('login.dummyAccounts')} {demoCredentials.map((item) => item.email).join(' , ')} {' '}
            | {t('login.passwordHint')} <span className="font-semibold">psau1234</span>
          </p>
          {error && (
            <p className="mt-3 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200">
              {error}
            </p>
          )}

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              handleContinue()
            }}
          >
            <div>
              <label htmlFor="email" className={`mb-1 block text-sm font-semibold text-slate-200 ${isArabic ? 'text-right' : ''}`}>
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={updateField('email')}
                placeholder={t('login.emailPlaceholder')}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-cyan-300/40 transition focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="password" className={`mb-1 block text-sm font-semibold text-slate-200 ${isArabic ? 'text-right' : ''}`}>
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={updateField('password')}
                placeholder={t('login.passwordPlaceholder')}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-cyan-300/40 transition focus:ring-2"
              />
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <button
                type="submit"
                className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                {t('login.login')}
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-bold text-white transition hover:border-cyan-300 hover:text-cyan-200"
              >
                {t('login.signUp')}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export default Login
