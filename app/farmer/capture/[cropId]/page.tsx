'use client'
import { useRef, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
// @ts-ignore
import SparkMD5 from 'spark-md5'

const GEOFENCE_KM = 5

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function CaptureCamera() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const cropId = params.cropId as string

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<'idle' | 'camera-denied' | 'gps-denied' | 'processing' | 'verified' | 'flagged' | 'duplicate-blocked'>('idle')
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [farmCenter, setFarmCenter] = useState<{ lat: number; lon: number } | null>(null)
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')

  const dateCode = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    loadFarmCenter()

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream })
      .catch(() => setStatus('camera-denied'))

    navigator.geolocation.getCurrentPosition(
      pos => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setStatus('gps-denied')
    )
  }, [])

  async function loadFarmCenter() {
    const { data: crop } = await supabase
      .from('crops').select('farm_id').eq('id', cropId).single()
    if (!crop) return
    const { data: farm } = await supabase
      .from('farms').select('lat, lon').eq('id', crop.farm_id).single()
    if (farm) setFarmCenter({ lat: farm.lat, lon: farm.lon })
  }

  async function capture() {
    if (!videoRef.current || !canvasRef.current || !coords) return
    setStatus('processing')
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const ctx = canvasRef.current.getContext('2d')!
    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0)

    ctx.font = '28px sans-serif'
    ctx.fillStyle = 'yellow'
    ctx.fillText(
      `FARMiLIVE · ${dateCode} · ${coords.lat.toFixed(4)},${coords.lon.toFixed(4)}`,
      20, canvasRef.current.height - 20
    )

    const blob: Blob = await new Promise(res =>
      canvasRef.current!.toBlob(b => res(b!), 'image/jpeg', 0.85)
    )
    const arrayBuffer = await blob.arrayBuffer()
    const photoHash = SparkMD5.ArrayBuffer.hash(arrayBuffer)

    const distance = farmCenter
      ? distanceKm(farmCenter.lat, farmCenter.lon, coords.lat, coords.lon)
      : 999
    const gpsVerified = distance <= GEOFENCE_KM

    const { data: existing } = await supabase
      .from('crop_updates').select('photo_hash').eq('crop_id', cropId)
    const isDuplicate = existing?.some(u => u.photo_hash === photoHash)

    if (isDuplicate) {
      setStatus('duplicate-blocked')
      setMessage('❌ This photo matches a previous update. Please take a new one.')
      return
    }

    const fileName = `${cropId}/${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('crop-updates').upload(fileName, blob)
    if (uploadError) {
      setMessage('Upload error: ' + uploadError.message)
      setStatus('idle')
      return
    }
    const { data: urlData } = supabase.storage.from('crop-updates').getPublicUrl(fileName)

    // Insert the update and get its ID back (needed to link a fraud flag, if any)
    const { data: insertedUpdate, error: insertError } = await supabase
      .from('crop_updates')
      .insert({
        crop_id: cropId,
        farmer_id: user.id,
        image_url: urlData.publicUrl,
        lat: coords.lat,
        lon: coords.lon,
        captured_at: new Date().toISOString(),
        date_code_shown: dateCode,
        stage: 'growth',
        note,
        photo_hash: photoHash,
        gps_verified: gpsVerified,
        status: gpsVerified ? 'verified' : 'flagged',
      })
      .select()
      .single()

    if (insertError || !insertedUpdate) {
      setMessage('Save error: ' + (insertError?.message || 'unknown error'))
      setStatus('idle')
      return
    }

    if (!gpsVerified) {
      const { error: flagError } = await supabase.from('fraud_flags').insert({
        update_id: insertedUpdate.id,
        flag_type: 'gps_jump',
        detail: `Capture ${distance.toFixed(1)} km from registered farm center`,
      })
      if (flagError) console.error('Fraud flag insert failed:', flagError.message)
    }

    setStatus(gpsVerified ? 'verified' : 'flagged')
    setMessage(
      gpsVerified
        ? '✅ Verified — location matches farm, unique photo.'
        : '⚠️ Sent for admin review (GPS outside expected range).'
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-xl font-bold text-green-800 mb-3">Weekly Crop Update — Live Capture</h1>

      {status === 'camera-denied' && (
        <p className="text-red-600 text-sm mb-3">
          Camera access was denied. Please allow camera permission in your browser settings and reload.
        </p>
      )}
      {status === 'gps-denied' && (
        <p className="text-red-600 text-sm mb-3">
          Location access was denied. Please allow location permission and reload — GPS is required to verify this update.
        </p>
      )}

      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black" />
      <canvas ref={canvasRef} className="hidden" />

      <div className="text-xs text-gray-500 mt-2">
        Date-code: <b>{dateCode}</b> · GPS: {coords ? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : 'waiting...'}
      </div>

      <textarea
        placeholder="Short note about this week (e.g. 'Neem-oil spray done, mild aphid pressure')"
        className="border w-full p-2 rounded mt-3 text-sm"
        rows={2}
        onChange={e => setNote(e.target.value)}
      />

      <button
        onClick={capture}
        disabled={!coords || status === 'processing'}
        className="bg-green-700 text-white w-full py-2 rounded mt-3 font-semibold disabled:opacity-50">
        {status === 'processing' ? 'Processing...' : 'Capture weekly update'}
      </button>

      {message && <p className="mt-3 text-sm">{message}</p>}

      <p className="text-xs text-gray-400 mt-4">
        This screen only uses your live camera — there is no option to upload a file from your gallery.
        This is intentional: it makes reused or AI-generated images impossible to submit here.
      </p>
    </div>
  )
}