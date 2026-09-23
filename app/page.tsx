'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import FadeInSection from './FadeInSection'

export default function Home() {
  const { t } = useLanguage()

  const story = [
    { img: '/images/wheat-closeup.jpg', title: 'Choose a Crop', desc: 'Pick a real crop growing on a real, verified farm near you.' },
    { img: '/images/farmer.jpg', title: 'Follow the Journey', desc: 'Get weekly, GPS-verified updates straight from the farmer, from sowing to growth.' },
    { img: '/images/harvesting.jpg', title: 'Own the Harvest', desc: 'Receive your verified allocation, along with a CropPass™ proving every step of the journey.' },
  ]

  return (
    <div>
      <div
        className="relative h-[28rem] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/images/cultivation.jpg')" }}
      >
        <div className="absolute inset-0 bg-green-900/65" />
        <div className="relative text-center text-white px-6">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-4 drop-shadow-lg tracking-tight">
            🌾 FARMiLIVE
          </h1>
          <p className="text-xl drop-shadow">{t('hero_title')}</p>
          <p className="text-xl font-semibold text-amber-300 mb-8 drop-shadow">{t('hero_title_hl')}</p>
          <div className="flex justify-center gap-3">
            <Link href="/crops" className="bg-amber-500 text-white px-6 py-2.5 rounded font-semibold">
              {t('nav_explore')}
            </Link>
            <Link href="/signup" className="bg-white text-green-800 px-6 py-2.5 rounded font-semibold">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-20">
        {story.map((s, i) => (
          <FadeInSection key={i} delay={i * 100}>
            <div className="text-center">
              <img src={s.img} className="w-full h-64 object-cover rounded-2xl shadow-xl border-4 border-white mb-6" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">{s.title}</h2>
              <p className="text-gray-600 max-w-md mx-auto">{s.desc}</p>
            </div>
          </FadeInSection>
        ))}
      </div>
    </div>
  )
}