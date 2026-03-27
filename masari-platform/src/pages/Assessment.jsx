import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../services/auth'

function Assessment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const authUser = getCurrentUser()

  const questions = [
    { key: 'interests', text: 'What are your main interests?', type: 'text' },
    { key: 'hobbies', text: 'What are your hobbies?', type: 'text' },
    { key: 'desiredField', text: 'What field do you want to work in?', type: 'text' },
  ]

  const handleAnswer = (key, value) => {
    setAnswers({ ...answers, [key]: value })
  }

  const nextStep = () => {
    if (step < questions.length) {
      setStep(step + 1)
    } else {
      // Decision point
      setStep(step + 1)
    }
  }

  const handleKnowWhat = (know) => {
    if (know) {
      navigate('/fields')
    } else {
      navigate('/interest-assessment')
    }
  }

  if (authUser) {
    // If logged in, show upload option or skip
    return (
      <div className="min-h-screen bg-masari-deep px-6 py-10 text-masari-light md:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-3xl font-bold">Welcome back, {authUser.profile.fullName}!</h1>
          <p className="mt-4">Upload your university plan to auto-detect your specialization.</p>
          <input type="file" className="mt-4" />
          <button onClick={() => navigate('/dashboard')} className="mt-4 rounded-xl bg-masari-primary px-6 py-3 font-bold text-white">
            Continue to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (step <= questions.length) {
    const currentQuestion = questions[step - 1]
    return (
      <div className="min-h-screen bg-masari-deep px-6 py-10 text-masari-light md:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-3xl font-bold">Personal Assessment</h1>
          {step > 0 && (
            <div className="mt-6">
              <p className="text-lg">{currentQuestion.text}</p>
              <input
                type={currentQuestion.type}
                value={answers[currentQuestion.key] || ''}
                onChange={(e) => handleAnswer(currentQuestion.key, e.target.value)}
                className="mt-2 w-full rounded-xl border border-masari-accent bg-gray-800 p-3 text-masari-light"
              />
            </div>
          )}
          <button onClick={nextStep} className="mt-6 rounded-xl bg-masari-primary px-6 py-3 font-bold text-white">
            {step === 0 ? 'Start' : step === questions.length ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    )
  }

  // Decision point
  return (
    <div className="min-h-screen bg-masari-deep px-6 py-10 text-masari-light md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-bold">Do you know what you want?</h1>
        <div className="mt-6 flex gap-4">
          <button onClick={() => handleKnowWhat(true)} className="rounded-xl bg-masari-primary px-6 py-3 font-bold text-white">
            Yes, go to fields
          </button>
          <button onClick={() => handleKnowWhat(false)} className="rounded-xl border border-masari-accent px-6 py-3 font-bold text-masari-light">
            No, assess interests
          </button>
        </div>
      </div>
    </div>
  )
}

export default Assessment