'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NewCrop() {
  const supabase = createClient()
  const router = useRouter()
  const [farmId, setFarmId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    crop_type: 'wheat',
    variety: '',
    sowing_date: '',
    expected_harvest_date: '',
    expected_yield_kg: '',
    slots_total: '',
  })

  useEffect(() => {
    loadFarm()
  }, [])

  async function loadFarm() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/signup')
      return
    }
    const { data: farms } = await supabase
      .from('farms')
      .select('id')
      .eq('farmer_id', user.id)
      .limit(1)

    if (!farms || farms.length === 0) {
      router.push('/farmer/dashboard')
      return
    }
    setFarmId(farms[0].id)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!farmId) return

    const { error: insertError } = await supabase.from('crops').insert({
      farm_id: farmId,
      crop_type: form.crop_type,
      variety: form.variety,
      sowing_date: form.sowing_date,
      expected_harvest_date: form.expected_harvest_date,
      expected_yield_kg: parseFloat(form.expected_yield_kg),
      slots_total: parseInt(form.slots_total),
    })

    if (insertError) return setError(insertError.message)

    alert('Crop listing created! It will show as "pending approval" until admin approves it.')
    router.push('/farmer/dashboard')
  }

  if (loading) return <p className="text-center mt-16">Loading...</p>

  return (
    <div className="max-w-lg mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Add a Crop Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border p-5 rounded">
        <div>
          <label className="block text-sm font-semibold mb-1">Crop type</label>
          <select className="border w-full p-2 rounded"
            value={form.crop_type}
            onChange={e => setForm({ ...form, crop_type: e.target.value })}>
            <option value="wheat">Wheat</option>
            <option value="maize">Maize</option>
            <option value="chickpea">Chickpea</option>
            <option value="rice">Rice</option>
            <option value="soybean">Soybean</option>
          </select>
        </div>

        <input placeholder="Variety (e.g. Lok-1)" required
          className="border w-full p-2 rounded"
          onChange={e => setForm({ ...form, variety: e.target.value })} />

        <div>
          <label className="block text-sm font-semibold mb-1">Sowing date</label>
          <input type="date" required className="border w-full p-2 rounded"
            onChange={e => setForm({ ...form, sowing_date: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Expected harvest date</label>
          <input type="date" required className="border w-full p-2 rounded"
            onChange={e => setForm({ ...form, expected_harvest_date: e.target.value })} />
        </div>

        <input placeholder="Expected total yield in kg (e.g. 500)" required type="number"
          className="border w-full p-2 rounded"
          onChange={e => setForm({ ...form, expected_yield_kg: e.target.value })} />

        <input placeholder="Total subscription slots (e.g. 25)" required type="number"
          className="border w-full p-2 rounded"
          onChange={e => setForm({ ...form, slots_total: e.target.value })} />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button className="bg-green-700 text-white w-full py-2 rounded font-semibold">
          Create Crop Listing
        </button>
      </form>
    </div>
  )
}