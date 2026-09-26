'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

type Tip = {
  id: string
  crop_type: string
  growth_stage: string
  tip_category: string
  tip_content_en: string
  practice_type: string
  source_basis: string
}

export default function FarmingGuide() {
  const supabase = createClient()
  const router = useRouter()
  const { t } = useLanguage()
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)

  useEffect(() => { loadTips() }, [])

  async function loadTips() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/signup'); return }

    const { data } = await supabase
      .from('farming_guide')
      .select('*')
      .eq('crop_type', 'wheat')
      .order('growth_stage')

    setTips((data || []) as Tip[])
    setLoading(false)
  }

  async function askQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    setAsking(true)
    setAnswer('')

    const res = await fetch('/api/farming-guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, crop: 'wheat', stage: 'growth', region: 'Maharashtra' }),
    })
    const data = await res.json()

    if (data.error) {
      setAnswer('Error: ' + data.error)
    } else {
      setAnswer(data.answer)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('farmer_queries').insert({
          farmer_id: user.id,
          query_text: question,
          ai_response: data.answer,
        })
      }
    }
    setAsking(false)
  }

  const stageOrder = ['sowing', 'germination', 'growth', 'maturity', 'harvest']
  const grouped = stageOrder
    .map(stage => ({ stage, items: tips.filter(t2 => t2.growth_stage === stage) }))
    .filter(g => g.items.length > 0)

  if (loading) return <p className="text-center mt-16">Loading...</p>

  return (
    <div className="max-w-xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-1">{t('guide_heading')}</h1>
      <p className="text-gray-500 text-sm mb-6">{t('guide_sub')}</p>

      {grouped.map(g => (
        <div key={g.stage} className="mb-6">
          <h2 className="text-sm font-bold text-amber-700 uppercase mb-2">{g.stage}</h2>
          <div className="space-y-2">
            {g.items.map(tip => (
              <div key={tip.id} className="border rounded p-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  tip.practice_type === 'organic' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {tip.practice_type === 'organic' ? `🌱 ${t('guide_organic')}` : `🧪 ${t('guide_conventional')}`}
                </span>
                <p className="text-sm mt-2">{tip.tip_content_en}</p>
                <p className="text-xs text-gray-400 mt-1">{t('guide_source')}: {tip.source_basis}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t pt-6 mt-6">
        <h2 className="text-lg font-bold text-green-800 mb-2">{t('guide_ask_heading')}</h2>
        <form onSubmit={askQuestion} className="space-y-3">
          <textarea
            placeholder={t('guide_ask_placeholder')}
            className="border w-full p-2 rounded text-sm"
            rows={2}
            value={question}
            onChange={e => setQuestion(e.target.value)}
          />
          <button disabled={asking}
            className="bg-amber-600 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50">
            {asking ? t('guide_asking') : t('guide_ask_btn')}
          </button>
        </form>

        {answer && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-4 text-sm">
            {answer}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-8 border-t pt-4">{t('guide_disclaimer')}</p>
    </div>
  )
}