'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export default function Signup() {
  const supabase = createClient()
  const router = useRouter()
  const { t } = useLanguage()
  const [role, setRole] = useState<'customer' | 'farmer'>('customer')
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' })
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (signUpError) return setError(signUpError.message)
    if (!data.user) return setError('Signup succeeded but no user returned.')

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      name: form.name,
      mobile: form.mobile,
      email: form.email,
    })
    if (profileError) return setError(profileError.message)

    alert('Account created! You are now logged in.')
    router.push(role === 'farmer' ? '/farmer/dashboard' : '/customer/dashboard')
  }

  return (
    <form onSubmit={handleSignup} className="max-w-sm mx-auto mt-16 space-y-4 p-6">
      <h1 className="text-2xl font-bold text-green-800">{t('signup_heading')}</h1>

      <div className="flex gap-2">
        <button type="button" onClick={() => setRole('customer')}
          className={role === 'customer' ? 'bg-green-700 text-white px-4 py-2 rounded' : 'border px-4 py-2 rounded'}>
          {t('signup_customer')}
        </button>
        <button type="button" onClick={() => setRole('farmer')}
          className={role === 'farmer' ? 'bg-green-700 text-white px-4 py-2 rounded' : 'border px-4 py-2 rounded'}>
          {t('signup_farmer')}
        </button>
      </div>

      <input placeholder={t('signup_name')} required className="border w-full p-2 rounded"
        onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder={t('signup_email')} type="email" required className="border w-full p-2 rounded"
        onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder={t('signup_mobile')} className="border w-full p-2 rounded"
        onChange={e => setForm({ ...form, mobile: e.target.value })} />
      <input placeholder={t('signup_password')} type="password" required minLength={6}
        className="border w-full p-2 rounded"
        onChange={e => setForm({ ...form, password: e.target.value })} />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button className="bg-green-700 text-white w-full py-2 rounded font-semibold">
        {t('signup_btn')}
      </button>
    </form>
  )
}