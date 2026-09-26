'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'

type CropCard = {
  id: string
  crop_type: string
  variety: string
  current_stage: string
  expected_harvest_date: string
  slots_total: number
  slots_sold: number
  farms: { name: string; district: string } | null
}

export default function CropsPage() {
  const supabase = createClient()
  const { t } = useLanguage()
  const [crops, setCrops] = useState<CropCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCrops() }, [])

  async function loadCrops() {
    const { data, error } = await supabase
      .from('crops')
      .select(`
        id, crop_type, variety, current_stage, expected_harvest_date, slots_total, slots_sold,
        farms ( name, district )
      `)
      .eq('approved', true)

    if (error) console.error(error)
    setCrops((data || []) as unknown as CropCard[])
    setLoading(false)
  }

  const icons: Record<string, string> = {
    wheat: '🌾', maize: '🌽', chickpea: '🫘', rice: '🍚', soybean: '🌱',
  }

  if (loading) return <p className="text-center mt-16">Loading...</p>

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-2">{t('crops_heading')}</h1>
      <p className="text-gray-600 mb-6">{t('crops_sub')}</p>

      {crops.length === 0 && <p className="text-gray-500">{t('crops_none')}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {crops.map(crop => (
          <Link key={crop.id} href={`/crops/${crop.id}`}
            className="border-2 border-green-200 bg-white rounded-xl p-5 hover:shadow-lg hover:border-green-500 transition block">
            <img src="/images/wheat-closeup.jpg" className="w-full h-28 object-cover rounded-lg mb-3" />
            <div className="text-2xl mb-1">{icons[crop.crop_type] || '🌾'}</div>
            <h2 className="text-lg font-bold capitalize">{crop.crop_type} — {crop.variety}</h2>
            <p className="text-sm text-gray-500">📍 {t('crops_location')}: {crop.farms?.district}</p>
            <p className="text-sm text-gray-500 capitalize">🌱 {t('crops_stage')}: {crop.current_stage}</p>
            <p className="text-sm text-gray-500">📅 {t('crops_harvest')}: {crop.expected_harvest_date}</p>
            <p className="text-sm text-green-700 font-semibold mt-2">
              {crop.slots_sold} / {crop.slots_total} {t('crops_slots')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}