'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export default function Login() {
  const supabase = createClient()
  const router = useRouter()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) return setError(loginError.message)
    if (!data.user) return setError('Login failed — no user returned.')

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single()

    if (!profile) return setError('Logged in, but no profile found for this account.')

    if (profile.role === 'admin') router.push('/admin/approvals')
    else if (profile.role === 'farmer') router.push('/farmer/dashboard')
    else router.push('/customer/dashboard')
  }

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-16 space-y-4 p-6">
      <h1 className="text-2xl font-bold text-green-800">{t('login_heading')}</h1>

      <input placeholder={t('signup_email')} type="email" required
        className="border w-full p-2 rounded"
        value={email} onChange={e => setEmail(e.target.value)} />

      <input placeholder={t('signup_password')} type="password" required
        className="border w-full p-2 rounded"
        value={password} onChange={e => setPassword(e.target.value)} />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button className="bg-green-700 text-white w-full py-2 rounded font-semibold">
        {t('login_btn')}
      </button>

      <p className="text-sm text-center text-gray-500">
        {t('login_no_account')} <a href="/signup" className="text-green-700 underline">{t('login_signup_link')}</a>
      </p>
    </form>
  )
}