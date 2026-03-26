import { useLocation, useNavigate } from 'react-router-dom'
import { majors } from '../data/careerData'
import { useLanguage } from '../hooks/useLanguage.jsx'

function Fields() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const suggestions = location.state?.suggestions || []

  const handleSelectMajor = (major) => {
    navigate(`/roadmap?major=${major}`)
  }

  return (
    <div className="min-h-screen bg-masari-deep px-6 py-10 text-masari-light md:px-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl font-bold">Choose a Specialization</h1>
        <p className="mt-4">Select a field to see the general roadmap for basics.</p>
        {suggestions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold">Suggested for you:</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((sugg, index) => (
                <div
                  key={sugg}
                  className={`rounded-xl border p-4 cursor-pointer transition ${
                    index === 0 ? 'bg-green-200 border-green-400' :
                    index === 1 ? 'bg-yellow-200 border-yellow-400' :
                    'bg-red-200 border-red-400'
                  }`}
                  onClick={() => handleSelectMajor(sugg)}
                >
                  <p className="font-bold">{sugg}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {majors.map((major) => (
            <div
              key={major}
              className="rounded-xl border border-masari-accent bg-gray-800 p-4 cursor-pointer transition hover:bg-gray-700"
              onClick={() => handleSelectMajor(major)}
            >
              <p className="font-bold">{major}</p>
              <p className="text-sm text-gray-300">Click to view roadmap</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Fields