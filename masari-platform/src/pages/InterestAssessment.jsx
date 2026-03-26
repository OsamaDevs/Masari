import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage.jsx'

function InterestAssessment() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})

  const interestQuestions = [
    { key: 'problemSolving', text: 'Do you enjoy solving problems?', options: ['Yes', 'No', 'Sometimes'] },
    { key: 'teamwork', text: 'Do you prefer working in teams?', options: ['Yes', 'No', 'Sometimes'] },
    { key: 'creativity', text: 'Are you creative?', options: ['Yes', 'No', 'Sometimes'] },
  ]

  const handleAnswer = (key, value) => {
    setAnswers({ ...answers, [key]: value })
  }

  const submit = () => {
    // Simple logic to suggest fields based on answers
    const suggestions = []
    if (answers.problemSolving === 'Yes') suggestions.push('Computer Science')
    if (answers.teamwork === 'Yes') suggestions.push('Business')
    if (answers.creativity === 'Yes') suggestions.push('Design')
    // Store suggestions and navigate to fields with them
    navigate('/fields', { state: { suggestions } })
  }

  return (
    <div className="min-h-screen bg-masari-deep px-6 py-10 text-masari-light md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-bold">Interest Assessment</h1>
        <p className="mt-4">Answer these questions to find suitable fields.</p>
        <div className="mt-6 space-y-6">
          {interestQuestions.map((q) => (
            <div key={q.key}>
              <p className="text-lg">{q.text}</p>
              <div className="mt-2 flex gap-4">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(q.key, opt)}
                    className={`rounded-xl px-4 py-2 ${
                      answers[q.key] === opt ? 'bg-masari-primary text-white' : 'border border-masari-accent text-masari-light'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={submit} className="mt-6 rounded-xl bg-masari-primary px-6 py-3 font-bold text-white">
          Get Suggestions
        </button>
      </div>
    </div>
  )
}

export default InterestAssessment