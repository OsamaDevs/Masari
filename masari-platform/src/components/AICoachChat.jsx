import { useMemo, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage.jsx'

function dedupe(items) {
  return Array.from(new Set(items))
}

function average(values) {
  if (!values.length) {
    return 0
  }
  const total = values.reduce((sum, value) => sum + value, 0)
  return Math.round(total / values.length)
}

function topByFrequency(items, limit = 4) {
  const counter = new Map()
  items.forEach((item) => {
    counter.set(item, (counter.get(item) ?? 0) + 1)
  })

  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name)
}

function AICoachChat({ career, profile, semesters }) {
  const { isArabic } = useLanguage()

  const labels = isArabic
    ? {
        title: 'مساعد مساري الذكي (محاكاة)',
        subtitle:
          'هذه واجهة محاكاة لشات الذكاء الاصطناعي: يحلل مقرراتك، يقارنها بسوق العمل، ويعطي توصيات عملية.',
        note: 'ملاحظة: هذه النسخة واجهة تجريبية وليست نموذج ذكاء اصطناعي فعلي.',
        placeholder: 'اكتب سؤالك... مثال: ما أهم المقررات لهذه الوظيفة؟',
        send: 'إرسال',
        thinking: 'جاري التحليل...',
        quickAsk: 'أسئلة سريعة',
        quick1: 'ما نسبة التطابق في فصلي الحالي؟',
        quick2: 'ما أهم المقررات التي أركز عليها؟',
        quick3: 'ما الفجوات وما الموارد المقترحة؟',
        welcome:
          'جاهز! بعد تحليل الخريطة الحالية أقدر أشرح لك نسبة التطابق وأهم المقررات والفجوات المطلوبة لسوق العمل.',
      }
    : {
        title: 'Masari AI Coach (Simulation)',
        subtitle:
          'This is a simulated AI chat UI: it analyzes your courses, compares them with market needs, and gives practical recommendations.',
        note: 'Note: this is a demo interface, not a live AI model.',
        placeholder: 'Ask something... e.g. What courses should I focus on for this role?',
        send: 'Send',
        thinking: 'Analyzing...',
        quickAsk: 'Quick asks',
        quick1: 'What is my match score this semester?',
        quick2: 'Which courses are most important for this role?',
        quick3: 'What are my gaps and suggested resources?',
        welcome:
          'Ready. Based on your current roadmap, I can explain match score, key courses, and market gaps with suggested learning resources.',
      }

  const allCourses = useMemo(() => semesters.flatMap((semester) => semester.courses), [semesters])

  const insights = useMemo(() => {
    const matchScore = average(allCourses.map((course) => course.matchPercent))
    const importantCourses = allCourses.filter((course) => course.isImportant)
    const topImportant = importantCourses.slice(0, 5).map((course) => course.title)
    const topGaps = topByFrequency(allCourses.flatMap((course) => course.gapSkills), 5)
    const topResources = dedupe(allCourses.flatMap((course) => course.supplemental)).slice(0, 6)

    return {
      matchScore,
      topImportant,
      topGaps,
      topResources,
    }
  }, [allCourses])

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: labels.welcome,
    },
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const buildReply = (question) => {
    const q = question.toLowerCase()
    const asksMatch = q.includes('تطابق') || q.includes('match') || q.includes('score')
    const asksCourses = q.includes('مقرر') || q.includes('course') || q.includes('focus')
    const asksGaps = q.includes('فجوة') || q.includes('gap') || q.includes('resource') || q.includes('موارد')

    if (asksMatch) {
      return isArabic
        ? `نسبة التطابق التقديرية لمسارك الحالي: ${insights.matchScore}%\n\nأفضل تحسين سريع: ركّز على المهارات المطلوبة في وظيفة ${career.arTitle || career.title} وطبّق مشروع عملي صغير هذا الفصل.`
        : `Estimated match score for your current roadmap: ${insights.matchScore}%\n\nQuick win: focus on the core skills for ${career.title} and build one practical project this semester.`
    }

    if (asksCourses) {
      const list = insights.topImportant.length ? insights.topImportant.join('، ') : '-'
      return isArabic
        ? `أهم المقررات المرتبطة بهذه الوظيفة:\n${list}\n\nنصيحة: ابدأ بالمقرر الأقرب لمهارات الوظيفة المطلوبة وراجع مخرجات التعلم الخاصة به.`
        : `Most role-relevant courses:\n${list}\n\nTip: start with the course that maps directly to the required job skills and revise its learning outcomes.`
    }

    if (asksGaps) {
      const gaps = insights.topGaps.length ? insights.topGaps.join('، ') : '-'
      const resources = insights.topResources.length ? insights.topResources.join('، ') : '-'
      return isArabic
        ? `أبرز الفجوات الحالية:\n${gaps}\n\nموارد إضافية مقترحة:\n${resources}`
        : `Top current gaps:\n${gaps}\n\nSuggested extra resources:\n${resources}`
    }

    return isArabic
      ? `تم تحليل سؤالك ضمن محاكاة الذكاء الاصطناعي.\n\nملخص سريع:\n- التخصص: ${profile.major}\n- الوظيفة المستهدفة: ${career.arTitle || career.title}\n- نسبة التطابق الحالية: ${insights.matchScore}%\n\nيمكنك أن تسألني عن: أهم المقررات، الفجوات، أو خطة تطوير للفصل الحالي.`
      : `Your question has been processed in AI simulation mode.\n\nQuick summary:\n- Major: ${profile.major}\n- Target role: ${career.title}\n- Current match score: ${insights.matchScore}%\n\nYou can ask me about key courses, skill gaps, or a semester action plan.`
  }

  const submitQuestion = (questionText) => {
    const trimmed = questionText.trim()
    if (!trimmed) {
      return
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', text: trimmed },
    ])
    setInput('')
    setIsThinking(true)

    setTimeout(() => {
      const reply = buildReply(trimmed)
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', text: reply },
      ])
      setIsThinking(false)
    }, 700)
  }

  return (
    <section className="mt-8 rounded-2xl border border-emerald-300 bg-white p-5 shadow-lg shadow-emerald-200/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-emerald-950">{labels.title}</h2>
          <p className="mt-1 text-sm text-emerald-900">{labels.subtitle}</p>
        </div>
        <span className="rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
          {labels.note}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-300 bg-emerald-100/80 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-900">{labels.quickAsk}</p>
        <div className="flex flex-wrap gap-2">
          {[labels.quick1, labels.quick2, labels.quick3].map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => submitQuestion(quick)}
              className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100"
            >
              {quick}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 max-h-72 space-y-3 overflow-y-auto rounded-xl border border-emerald-300 bg-white p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[92%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              message.role === 'assistant'
                ? 'bg-emerald-100 text-emerald-900'
                : 'ms-auto bg-emerald-600 text-white'
            }`}
          >
            {message.text}
          </div>
        ))}
        {isThinking && (
          <div className="inline-flex rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-900">
            {labels.thinking}
          </div>
        )}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          submitQuestion(input)
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={labels.placeholder}
          className="flex-1 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-2.5 text-sm text-emerald-950 placeholder-emerald-500 outline-none ring-emerald-300/40 transition focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          {labels.send}
        </button>
      </form>
    </section>
  )
}

export default AICoachChat
