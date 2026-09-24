'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'

export default function Navbar() {
  const { lang, setLang, t } = useLanguage()

  return (
    <nav className="bg-green-800 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-bold text-base sm:text-lg flex items-center gap-2">
            🌾 FARMiLIVE
          </Link>
          <div className="flex gap-1 sm:hidden">
            {(['en', 'hi', 'mr'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  lang === l ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/80'
                }`}>
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'म'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between sm:justify-end items-center gap-3 text-xs sm:text-sm">
          <Link href="/crops" className="hover:text-amber-300">{t('nav_explore')}</Link>
          <Link href="/login" className="hover:text-amber-300">{t('nav_login')}</Link>
          <Link href="/signup" className="hover:text-amber-300">{t('nav_signup')}</Link>

          <div className="hidden sm:flex gap-1 border-l border-white/20 pl-3">
            {(['en', 'hi', 'mr'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  lang === l ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/80'
                }`}>
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'म'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}