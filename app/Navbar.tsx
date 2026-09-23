'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'

export default function Navbar() {
  const { lang, setLang } = useLanguage()

  return (
    <nav className="bg-green-800 text-white shadow-md">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-6 py-3">
        <Link href="/" className="font-bold text-lg flex items-center gap-2">
          🌾 FARMiLIVE
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/crops" className="hover:text-amber-300">Explore Crops</Link>
          <Link href="/login" className="hover:text-amber-300">Login</Link>
          <Link href="/signup" className="hover:text-amber-300">Sign up</Link>

          <div className="flex gap-1 ml-2 border-l border-white/20 pl-3">
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