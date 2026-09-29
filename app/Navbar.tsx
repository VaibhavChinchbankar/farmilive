'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/crops', label: t('nav_explore') },
    { href: '/#how-it-works', label: t('nav_how_works') },
    { href: '/#about', label: t('nav_about') },
    { href: '/login', label: t('nav_login') },
    { href: '/signup', label: t('nav_signup') },
  ]

  return (
    <nav className="bg-green-800 text-white shadow-md relative">
      <div className="w-full px-4 sm:px-8 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-base sm:text-lg flex items-center gap-2">
          🌾 FARMiLIVE
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-x-4 text-sm">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-amber-300">{l.label}</Link>
          ))}
          <div className="flex gap-1 border-l border-white/20 pl-3">
            {(['en', 'hi', 'mr'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  lang === l ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/80'
                }`}>
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'म'}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: language toggle + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="flex gap-1">
            {(['en', 'hi', 'mr'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  lang === l ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/80'
                }`}>
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'म'}
              </button>
            ))}
          </div>
          <button onClick={() => setOpen(!open)} className="text-2xl leading-none px-1" aria-label="Menu">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="sm:hidden bg-green-900 px-4 pb-4 flex flex-col gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="py-2 border-b border-white/10 text-sm hover:text-amber-300">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}