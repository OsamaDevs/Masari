import { Link } from 'react-router-dom'
import logoImage from '../assets/hero.png'

function BrandLogo({ compact = false, withSubtitle = true, className = '', to = '/home' }) {
  const sizeClass = compact ? 'h-10 w-10' : 'h-14 w-14'

  return (
    <Link to={to} className={`inline-flex items-center gap-3 ${className}`}>
      <span className={`overflow-hidden rounded-2xl border border-emerald-300 bg-white shadow-md shadow-emerald-200/50 ${sizeClass}`}>
        <img src={logoImage} alt="Masari logo" className="h-full w-full object-cover" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-xl font-bold text-emerald-950">مساري</span>
        {withSubtitle && (
          <span className="block text-xs font-semibold text-emerald-900">
            PSAU Career Guidance Platform
          </span>
        )}
      </span>
    </Link>
  )
}

export default BrandLogo
