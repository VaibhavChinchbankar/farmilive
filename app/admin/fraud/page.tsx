'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type FlagRow = {
  id: string
  flag_type: string
  detail: string
  resolved: boolean
  created_at: string
  crop_updates: {
    id: string
    image_url: string
    lat: number
    lon: number
    date_code_shown: string
    note: string
    crops: { crop_type: string; variety: string } | null
  } | null
}

export default function AdminFraudFlags() {
  const supabase = createClient()
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [flags, setFlags] = useState<FlagRow[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/signup'); return }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()

    if (!profile || profile.role !== 'admin') {
      setAllowed(false); setLoading(false); return
    }
    setAllowed(true)

    const { data, error } = await supabase
      .from('fraud_flags')
      .select(`
        id, flag_type, detail, resolved, created_at,
        crop_updates ( id, image_url, lat, lon, date_code_shown, note, crops ( crop_type, variety ) )
      `)
      .eq('resolved', false)
      .order('created_at', { ascending: false })

    if (error) console.error('Fraud flags query failed:', error.message)
    setFlags((data || []) as unknown as FlagRow[])
    setLoading(false)
  }

  async function approveAnyway(flagId: string, updateId: string) {
    await supabase.from('crop_updates').update({ status: 'verified' }).eq('id', updateId)
    await supabase.from('fraud_flags').update({ resolved: true }).eq('id', flagId)
    setFlags(flags.filter(f => f.id !== flagId))
  }

  async function rejectUpdate(flagId: string, updateId: string) {
    await supabase.from('crop_updates').delete().eq('id', updateId)
    await supabase.from('fraud_flags').update({ resolved: true }).eq('id', flagId)
    setFlags(flags.filter(f => f.id !== flagId))
  }

  if (loading) return <p className="text-center mt-16">Loading...</p>
  if (!allowed) return <p className="text-center mt-16 text-red-600">Admins only.</p>

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-2">Admin — Fraud Flags</h1>
      <p className="text-gray-500 text-sm mb-6">Auto-flagged crop updates awaiting manual review.</p>

      {flags.length === 0 && <p className="text-gray-500 text-sm">No open flags. Nice and clean.</p>}

      <div className="space-y-5">
        {flags.map(f => (
          <div key={f.id} className="border rounded-lg overflow-hidden">
            {f.crop_updates?.image_url && (
              <img src={f.crop_updates.image_url} alt="flagged capture" className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold capitalize">
                    {f.crop_updates?.crops?.crop_type} — {f.crop_updates?.crops?.variety}
                  </p>
                  <p className="text-xs text-red-600 font-semibold uppercase mt-1">{f.flag_type.replace('_', ' ')}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(f.created_at).toLocaleString()}</span>
              </div>

              <p className="text-sm text-gray-600 mb-1">{f.detail}</p>
              <p className="text-xs text-gray-400">
                Date-code shown: {f.crop_updates?.date_code_shown} · GPS: {f.crop_updates?.lat.toFixed(4)}, {f.crop_updates?.lon.toFixed(4)}
              </p>
              {f.crop_updates?.note && <p className="text-sm mt-2 italic">"{f.crop_updates.note}"</p>}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => f.crop_updates && approveAnyway(f.id, f.crop_updates.id)}
                  className="bg-green-700 text-white px-3 py-1.5 rounded text-sm flex-1">
                  Approve anyway
                </button>
                <button
                  onClick={() => f.crop_updates && rejectUpdate(f.id, f.crop_updates.id)}
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm flex-1">
                  Reject update
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}