'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type ApprovedCrop = {
  id: string
  crop_type: string
  variety: string
  expected_yield_kg: number
  slots_sold: number
}

export default function AdminHarvest() {
  const supabase = createClient()
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [crops, setCrops] = useState<ApprovedCrop[]>([])
  const [selectedCrop, setSelectedCrop] = useState<string>('')
  const [actualQty, setActualQty] = useState('')
  const [message, setMessage] = useState('')
  const [allocationResults, setAllocationResults] = useState<any[]>([])

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

    const { data } = await supabase
      .from('crops')
      .select('id, crop_type, variety, expected_yield_kg, slots_sold')
      .eq('approved', true)

    setCrops((data || []) as ApprovedCrop[])
    setLoading(false)
  }

  async function recordHarvestAndAllocate(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    setAllocationResults([])
    if (!selectedCrop || !actualQty) return

    const { data: harvest, error: harvestError } = await supabase
      .from('harvests')
      .insert({
        crop_id: selectedCrop,
        expected_qty_kg: crops.find(c => c.id === selectedCrop)?.expected_yield_kg,
        actual_qty_kg: parseFloat(actualQty),
        verified: true,
        harvest_date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single()

    if (harvestError || !harvest) {
      setMessage('Error creating harvest: ' + (harvestError?.message || 'unknown'))
      return
    }

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('crop_id', selectedCrop)
      .eq('status', 'reserved')

    if (!subs || subs.length === 0) {
      setMessage('Harvest recorded, but no reserved subscriptions found to allocate.')
      return
    }

    const totalExpected = subs.reduce((sum, s) => sum + Number(s.expected_allocation_kg), 0)
    const yieldRatio = Math.min(1, harvest.actual_qty_kg / totalExpected)
    const PRICE_PER_KG = 30
    const REFUND_RATE = 1.0

    const results = []
    for (const sub of subs) {
      const finalQty = Number(sub.expected_allocation_kg) * yieldRatio
      const shortfall = Number(sub.expected_allocation_kg) - finalQty
      const refund = shortfall * REFUND_RATE * PRICE_PER_KG

      const { error: allocError } = await supabase.from('allocations').insert({
        subscription_id: sub.id,
        harvest_id: harvest.id,
        final_qty_kg: finalQty,
        shortfall_kg: shortfall,
        refund_amount: refund,
      })

      if (!allocError) {
        await supabase.from('subscriptions').update({ status: 'fulfilled' }).eq('id', sub.id)
        await supabase.from('notifications').insert({
          user_id: sub.customer_id,
          type: 'allocation',
          message: `Your verified harvest allocation is ${finalQty.toFixed(1)} kg.`,
        })
      }

      results.push({
        subscriptionId: sub.id,
        expected: sub.expected_allocation_kg,
        final: finalQty.toFixed(2),
        shortfall: shortfall.toFixed(2),
        refund: refund.toFixed(0),
      })
    }

    setAllocationResults(results)
    setMessage(`✅ Harvest recorded. Yield ratio: ${(yieldRatio * 100).toFixed(0)}%. ${results.length} subscriptions allocated.`)
  }

  if (loading) return <p className="text-center mt-16">Loading...</p>
  if (!allowed) return <p className="text-center mt-16 text-red-600">Admins only.</p>

  return (
    <div className="max-w-xl mx-auto mt-12 p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Admin — Record Harvest &amp; Run Allocation</h1>

      <form onSubmit={recordHarvestAndAllocate} className="space-y-4 border p-5 rounded">
        <div>
          <label className="block text-sm font-semibold mb-1">Crop</label>
          <select required className="border w-full p-2 rounded"
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}>
            <option value="">Select a crop...</option>
            {crops.map(c => (
              <option key={c.id} value={c.id}>
                {c.crop_type} — {c.variety} (expected {c.expected_yield_kg} kg, {c.slots_sold} subscribers)
              </option>
            ))}
          </select>
        </div>

        <input placeholder="Actual harvested quantity (kg)" type="number" required
          className="border w-full p-2 rounded"
          value={actualQty}
          onChange={e => setActualQty(e.target.value)} />

        <button className="bg-green-700 text-white w-full py-2 rounded font-semibold">
          Record Harvest &amp; Run Allocation
        </button>
      </form>

      {message && <p className="mt-4 text-sm font-semibold">{message}</p>}

      {allocationResults.length > 0 && (
        <table className="w-full mt-6 text-sm border">
          <thead>
            <tr className="bg-green-800 text-white">
              <th className="p-2 text-left">Expected (kg)</th>
              <th className="p-2 text-left">Final (kg)</th>
              <th className="p-2 text-left">Shortfall (kg)</th>
              <th className="p-2 text-left">Refund (₹)</th>
            </tr>
          </thead>
          <tbody>
            {allocationResults.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{r.expected}</td>
                <td className="p-2">{r.final}</td>
                <td className="p-2">{r.shortfall}</td>
                <td className="p-2">₹{r.refund}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}