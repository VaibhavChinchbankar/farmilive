'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Farm = {
  id: string
  name: string
  district: string
  lat: number
  lon: number
  area_acres: number
  approved: boolean
}

type Crop = {
  id: string
  crop_type: string
  variety: string
  current_stage: string
  approved: boolean
  slots_total: number
  slots_sold: number
}

export default function FarmerDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [farm, setFarm] = useState<Farm | null>(null)
  const [crops, setCrops] = useState<Crop[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', district: '', lat: '', lon: '', area_acres: '' })

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/signup')
      return
    }
    setUserId(user.id)

    const { data: farms } = await supabase
      .from('farms')
      .select('*')
      .eq('farmer_id', user.id)
      .limit(1)

    if (farms && farms.length > 0) {
      const f = farms[0] as Farm
      setFarm(f)

      const { data: cropRows } = await supabase
        .from('crops')
        .select('id, crop_type, variety, current_stage, approved, slots_total, slots_sold')
        .eq('farm_id', f.id)

      setCrops((cropRows || []) as Crop[])
    }
    setLoading(false)
  }

  async function handleRegisterFarm(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!userId) return

    const { data, error: insertError } = await supabase
      .from('farms')
      .insert({
        farmer_id: userId,
        name: form.name,
        district: form.district,
        lat: parseFloat(form.lat),
        lon: parseFloat(form.lon),
        area_acres: parseFloat(form.area_acres),
      })
      .select()
      .single()

    if (insertError) return setError(insertError.message)
    setFarm(data as Farm)
  }

  if (loading) {
    return <p className="text-center mt-16">Loading...</p>
  }

  return (
    <div className="max-w-xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Farmer Dashboard</h1>

      <Link href="/farmer/guide" className="text-sm text-amber-700 underline mb-4 inline-block">
        📖 Open Farming Guide
      </Link>

      {!farm && (
        <>
          <p className="text-gray-600 mb-4">You haven't registered a farm yet. Add one below.</p>
          <form onSubmit={handleRegisterFarm} className="space-y-4 border p-5 rounded">
            <input placeholder="Farm name (e.g. Patil Family Farm)" required
              className="border w-full p-2 rounded"
              onChange={e => setForm({ ...form, name: e.target.value })} />

            <input placeholder="District (e.g. Pune District)" required
              className="border w-full p-2 rounded"
              onChange={e => setForm({ ...form, district: e.target.value })} />

            <div className="flex gap-3">
              <input placeholder="Latitude (e.g. 18.7608)" required
                className="border w-full p-2 rounded"
                onChange={e => setForm({ ...form, lat: e.target.value })} />
              <input placeholder="Longitude (e.g. 73.8630)" required
                className="border w-full p-2 rounded"
                onChange={e => setForm({ ...form, lon: e.target.value })} />
            </div>

            <input placeholder="Farm area in acres (e.g. 3)" required
              className="border w-full p-2 rounded"
              onChange={e => setForm({ ...form, area_acres: e.target.value })} />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button className="bg-green-700 text-white w-full py-2 rounded font-semibold">
              Register Farm
            </button>
          </form>
        </>
      )}

      {farm && (
        <>
          <div className="border p-5 rounded bg-green-50 mb-6">
            <h2 className="text-lg font-bold">{farm.name}</h2>
            <p className="text-sm text-gray-600">{farm.district}</p>
            <p className="text-sm mt-2">📍 {farm.lat}, {farm.lon}</p>
            <p className="text-sm">🌾 {farm.area_acres} acres</p>
            <p className="mt-3">
              Status:{' '}
              {farm.approved ? (
                <span className="text-green-700 font-semibold">✅ Approved</span>
              ) : (
                <span className="text-amber-600 font-semibold">⏳ Pending admin approval</span>
              )}
            </p>
          </div>

          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-green-800">My Crops</h2>
            <Link href="/farmer/crops/new" className="bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold">
              + Add Crop
            </Link>
          </div>

          {crops.length === 0 && <p className="text-gray-500 text-sm">No crops listed yet.</p>}

          <div className="space-y-3">
            {crops.map(crop => (
              <div key={crop.id} className="border p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold capitalize">{crop.crop_type} — {crop.variety}</p>
                    <p className="text-xs text-gray-500 capitalize">Stage: {crop.current_stage}</p>
                    <p className="text-xs text-gray-500">{crop.slots_sold} / {crop.slots_total} slots reserved</p>
                  </div>
                  <span className={crop.approved ? 'text-green-700 text-xs font-semibold' : 'text-amber-600 text-xs font-semibold'}>
                    {crop.approved ? '✅ Approved' : '⏳ Pending'}
                  </span>
                </div>
                {crop.approved && (
                  <Link href={`/farmer/capture/${crop.id}`}
                    className="block text-center bg-amber-500 text-white mt-3 py-2 rounded text-sm font-semibold">
                    📸 Submit Weekly Update
                  </Link>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}