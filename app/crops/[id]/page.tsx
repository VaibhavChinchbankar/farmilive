'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

type CropDetail = {
  id: string
  crop_type: string
  variety: string
  current_stage: string
  sowing_date: string
  expected_harvest_date: string
  expected_yield_kg: number
  slots_total: number
  slots_sold: number
  farms: { name: string; district: string } | null
}

type UpdateRow = {
  id: string
  image_url: string
  stage: string
  note: string
  server_time: string
  status: string
}

const STAGES = ['sowing', 'germination', 'growth', 'maturity', 'harvest']

export default function CropDetail() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const { t } = useLanguage()
  const cropId = params.id as string

  const [crop, setCrop] = useState<CropDetail | null>(null)
  const [updates, setUpdates] = useState<UpdateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [acknowledged, setAcknowledged] = useState(false)
  const [reserving, setReserving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { loadCrop(); loadUpdates() }, [cropId])

  async function loadCrop() {
    const { data } = await supabase
      .from('crops')
      .select(`
        id, crop_type, variety, current_stage, sowing_date, expected_harvest_date,
        expected_yield_kg, slots_total, slots_sold,
        farms ( name, district )
      `)
      .eq('id', cropId)
      .single()

    setCrop(data as unknown as CropDetail)
    setLoading(false)
  }

  async function loadUpdates() {
    const { data } = await supabase
      .from('crop_updates')
      .select('id, image_url, stage, note, server_time, status')
      .eq('crop_id', cropId)
      .eq('status', 'verified')
      .order('server_time', { ascending: false })

    setUpdates((data || []) as UpdateRow[])
  }

  async function handleReserve() {
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()

    if (!profile || profile.role !== 'customer') {
      setMessage(`⚠️ You're logged in as a "${profile?.role || 'unknown'}" account. Please log out and log in with a customer account to reserve a crop.`)
      return
    }

    if (!crop) return

    setReserving(true)
    const perSubAllocation = crop.expected_yield_kg / crop.slots_total

    const { error } = await supabase.from('subscriptions').insert({
      customer_id: user.id,
      crop_id: crop.id,
      expected_allocation_kg: perSubAllocation,
      token_paid: 99,
      status: 'reserved',
      acknowledged_formula: acknowledged,
    })

    if (error) {
      setMessage('Error: ' + error.message)
      setReserving(false)
      return
    }

    await supabase.from('crops').update({ slots_sold: (crop.slots_sold || 0) + 1 }).eq('id', crop.id)

    setMessage('✅ Reserved! You will receive weekly updates as this crop grows.')
    setReserving(false)
  }

  if (loading) return <p className="text-center mt-16">Loading...</p>
  if (!crop) return <p className="text-center mt-16 text-red-600">Crop not found.</p>

  const currentIndex = STAGES.indexOf(crop.current_stage)
  const perSubAllocation = (crop.expected_yield_kg / crop.slots_total).toFixed(1)

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6">
      <img src="/images/wheat-closeup.jpg" className="w-full h-48 object-cover rounded-lg mb-4" />

      <h1 className="text-2xl font-bold text-green-800 capitalize mb-1">
        {crop.crop_type} — {crop.variety}
      </h1>
      <p className="text-gray-600 mb-6">📍 {crop.farms?.name}, {crop.farms?.district}</p>

      <div className="flex justify-between mb-8">
        {STAGES.map((stage, i) => (
          <div key={stage} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
              ${i < currentIndex ? 'bg-green-100 border-2 border-green-600' :
                i === currentIndex ? 'bg-amber-500 text-white' : 'bg-gray-100'}`}>
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span className="text-xs mt-1 capitalize text-center">{stage}</span>
          </div>
        ))}
      </div>

      <div className="border rounded p-4 mb-6 text-sm space-y-1">
        <p><b>{t('detail_sowing_date')}:</b> {crop.sowing_date}</p>
        <p><b>{t('detail_expected_harvest')}:</b> {crop.expected_harvest_date}</p>
        <p><b>{t('detail_expected_alloc')}:</b> ~{perSubAllocation} kg</p>
        <p><b>{t('detail_slots')}:</b> {crop.slots_sold} / {crop.slots_total}</p>
      </div>

      <div className="border rounded p-4 bg-amber-50 mb-4">
        <label className="flex gap-2 text-sm items-start">
          <input type="checkbox" className="mt-1"
            checked={acknowledged}
            onChange={e => setAcknowledged(e.target.checked)} />
          <span>{t('detail_ack')}</span>
        </label>
      </div>

      <button
        disabled={!acknowledged || reserving}
        onClick={handleReserve}
        className="bg-green-700 text-white w-full py-3 rounded font-semibold disabled:opacity-50">
        {reserving ? t('detail_reserving') : t('detail_reserve_btn')}
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}

      <h2 className="text-lg font-bold text-green-800 mt-10 mb-3">{t('detail_updates_heading')}</h2>
      {updates.length === 0 && <p className="text-gray-500 text-sm">{t('detail_updates_none')}</p>}
      <div className="space-y-4">
        {updates.map(u => (
          <div key={u.id} className="border rounded overflow-hidden">
            <img src={u.image_url} alt={u.stage} className="w-full h-48 object-cover" />
            <div className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-green-700 capitalize">🌱 {u.stage}</span>
                <span className="text-xs text-gray-400">{new Date(u.server_time).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700">{u.note}</p>
              <p className="text-xs text-gray-400 mt-1">📍 {t('detail_location_verified')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}