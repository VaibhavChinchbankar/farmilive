'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams } from 'next/navigation'

type VerifyData = {
  final_qty_kg: number
  shortfall_kg: number
  harvests: {
    harvest_date: string
    actual_qty_kg: number
    crops: {
      crop_type: string
      variety: string
      sowing_date: string
      farms: { name: string; district: string } | null
    } | null
  } | null
}

export default function VerifyPage() {
  const supabase = createClient()
  const params = useParams()
  const allocId = params.allocId as string

  const [data, setData] = useState<VerifyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [allocId])

  async function load() {
    const { data: alloc } = await supabase
      .from('allocations')
      .select(`
        final_qty_kg, shortfall_kg,
        harvests (
          harvest_date, actual_qty_kg,
          crops ( crop_type, variety, sowing_date, farms ( name, district ) )
        )
      `)
      .eq('id', allocId)
      .single()

    setData(alloc as unknown as VerifyData)
    setLoading(false)
  }

  if (loading) return <p className="text-center mt-16">Loading...</p>
  if (!data) return <p className="text-center mt-16 text-red-600">CropPass not found.</p>

  const crop = data.harvests?.crops

  return (
    <div className="max-w-md mx-auto mt-12 p-6">
      <div className="bg-green-800 text-white rounded-xl p-6 text-center">
        <p className="text-3xl mb-1">🌾</p>
        <h1 className="text-xl font-bold">FARMiLIVE CropPass™</h1>
        <p className="text-sm text-green-100">Verified Harvest Certificate</p>
      </div>

      <div className="border rounded-b-xl p-6 -mt-1 space-y-3">
        <div className="flex justify-between text-sm border-b pb-2">
          <span className="text-gray-500">Crop</span>
          <span className="font-semibold capitalize">{crop?.crop_type} — {crop?.variety}</span>
        </div>
        <div className="flex justify-between text-sm border-b pb-2">
          <span className="text-gray-500">Farm</span>
          <span className="font-semibold">{crop?.farms?.name}, {crop?.farms?.district}</span>
        </div>
        <div className="flex justify-between text-sm border-b pb-2">
          <span className="text-gray-500">Sowing date</span>
          <span className="font-semibold">{crop?.sowing_date}</span>
        </div>
        <div className="flex justify-between text-sm border-b pb-2">
          <span className="text-gray-500">Harvest date</span>
          <span className="font-semibold">{data.harvests?.harvest_date}</span>
        </div>
        <div className="flex justify-between text-sm border-b pb-2">
          <span className="text-gray-500">Total verified harvest</span>
          <span className="font-semibold">{data.harvests?.actual_qty_kg} kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Your allocation</span>
          <span className="font-bold text-green-700">{data.final_qty_kg.toFixed(1)} kg</span>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          This certificate confirms this batch was tracked from sowing to harvest via
          verified, GPS-stamped weekly updates on FARMiLIVE.
        </p>
      </div>
    </div>
  )
}