'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type PendingFarm = { id: string; name: string; district: string; area_acres: number }
type PendingCrop = { id: string; crop_type: string; variety: string; expected_yield_kg: number; slots_total: number }

export default function AdminApprovals() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [farms, setFarms] = useState<PendingFarm[]>([])
  const [crops, setCrops] = useState<PendingCrop[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/signup')
      return
    }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()

    if (!profile || profile.role !== 'admin') {
      setAllowed(false)
      setLoading(false)
      return
    }
    setAllowed(true)

    const { data: pendingFarms } = await supabase
      .from('farms').select('id, name, district, area_acres').eq('approved', false)
    setFarms((pendingFarms || []) as PendingFarm[])

    const { data: pendingCrops } = await supabase
      .from('crops').select('id, crop_type, variety, expected_yield_kg, slots_total').eq('approved', false)
    setCrops((pendingCrops || []) as PendingCrop[])

    setLoading(false)
  }

  async function approveFarm(id: string) {
    await supabase.from('farms').update({ approved: true }).eq('id', id)
    setFarms(farms.filter(f => f.id !== id))
  }

  async function rejectFarm(id: string) {
    await supabase.from('farms').delete().eq('id', id)
    setFarms(farms.filter(f => f.id !== id))
  }

  async function approveCrop(id: string) {
    await supabase.from('crops').update({ approved: true }).eq('id', id)
    setCrops(crops.filter(c => c.id !== id))
  }

  async function rejectCrop(id: string) {
    await supabase.from('crops').delete().eq('id', id)
    setCrops(crops.filter(c => c.id !== id))
  }

  if (loading) return <p className="text-center mt-16">Loading...</p>
  if (!allowed) return <p className="text-center mt-16 text-red-600">Admins only. You don't have access to this page.</p>

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Admin — Approvals Queue</h1>

      <h2 className="text-lg font-bold mb-2">Pending Farms</h2>
      {farms.length === 0 && <p className="text-gray-500 text-sm mb-6">No pending farms.</p>}
      <div className="space-y-3 mb-8">
        {farms.map(f => (
          <div key={f.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{f.name}</p>
              <p className="text-xs text-gray-500">{f.district} · {f.area_acres} acres</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveFarm(f.id)} className="bg-green-700 text-white px-3 py-1 rounded text-sm">Approve</button>
              <button onClick={() => rejectFarm(f.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold mb-2">Pending Crops</h2>
      {crops.length === 0 && <p className="text-gray-500 text-sm">No pending crops.</p>}
      <div className="space-y-3">
        {crops.map(c => (
          <div key={c.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold capitalize">{c.crop_type} — {c.variety}</p>
              <p className="text-xs text-gray-500">Expected {c.expected_yield_kg} kg · {c.slots_total} slots</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveCrop(c.id)} className="bg-green-700 text-white px-3 py-1 rounded text-sm">Approve</button>
              <button onClick={() => rejectCrop(c.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}