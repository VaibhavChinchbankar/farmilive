'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'

type SubRow = {
  id: string
  status: string
  expected_allocation_kg: number
  crops: { crop_type: string; variety: string } | null
  allocations: {
    id: string
    final_qty_kg: number
    shortfall_kg: number
    refund_amount: number
  }[] | null
}

export default function CustomerDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subs, setSubs] = useState<SubRow[]>([])
  const [qrMap, setQrMap] = useState<Record<string, string>>({})

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('subscriptions')
      .select(`
        id, status, expected_allocation_kg,
        crops ( crop_type, variety ),
        allocations ( id, final_qty_kg, shortfall_kg, refund_amount )
      `)
      .eq('customer_id', user.id)

    const rows = (data || []) as unknown as SubRow[]
    setSubs(rows)

    const qrs: Record<string, string> = {}
    for (const s of rows) {
      if (s.allocations && s.allocations.length > 0) {
        const allocId = s.allocations[0].id
        const url = `${window.location.origin}/verify/${allocId}`
        qrs[s.id] = await QRCode.toDataURL(url)
      }
    }
    setQrMap(qrs)
    setLoading(false)
  }

  if (loading) return <p className="text-center mt-16">Loading...</p>

  return (
    <div className="max-w-xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">My Subscriptions</h1>

      {subs.length === 0 && <p className="text-gray-500 text-sm">No subscriptions yet — go explore crops!</p>}

      <div className="space-y-5">
        {subs.map(s => {
          const alloc = s.allocations && s.allocations.length > 0 ? s.allocations[0] : null
          return (
            <div key={s.id} className="border rounded-lg p-5">
              <p className="font-bold capitalize text-lg">
                {s.crops?.crop_type} — {s.crops?.variety}
              </p>
              <p className="text-sm text-gray-500 capitalize mb-3">Status: {s.status}</p>

              <p className="text-sm">Expected allocation: <b>{s.expected_allocation_kg} kg</b></p>

              {alloc && (
                <div className="mt-3 bg-green-50 rounded p-4">
                  <p className="text-sm">Final verified allocation: <b>{alloc.final_qty_kg.toFixed(1)} kg</b></p>
                  {alloc.shortfall_kg > 0 && (
                    <>
                      <p className="text-sm text-amber-700">Shortfall: {alloc.shortfall_kg.toFixed(1)} kg</p>
                      <p className="text-sm text-amber-700">Refund: ₹{alloc.refund_amount.toFixed(0)}</p>
                    </>
                  )}

                  {qrMap[s.id] && (
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500 mb-2">Your CropPass™ — scan to view the verified journey</p>
                      <img src={qrMap[s.id]} alt="CropPass QR" className="w-32 h-32 mx-auto" />
                    </div>
                  )}
                </div>
              )}

              {!alloc && s.status === 'reserved' && (
                <p className="text-sm text-gray-400 mt-2">Waiting for harvest to be recorded...</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}