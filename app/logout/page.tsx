'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Logout() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      router.push('/login')
    })
  }, [])

  return <p className="text-center mt-16">Logging out...</p>
}