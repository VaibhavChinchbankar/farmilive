'use client'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import FadeInSection from './FadeInSection'

export default function Home() {
  const { t } = useLanguage()

  const story = [
    { img: '/images/wheat-closeup.jpg', title: t('story1_title'), desc: t('story1_desc') },
    { img: '/images/farmer.jpg', title: t('story2_title'), desc: t('story2_desc') },
    { img: '/images/harvesting.jpg', title: t('story3_title'), desc: t('story3_desc') },
  ]

  const steps = [
    { n: '01', title: t('step1_title'), desc: t('step1_desc') },
    { n: '02', title: t('step2_title'), desc: t('step2_desc') },
    { n: '03', title: t('step3_title'), desc: t('step3_desc') },
    { n: '04', title: t('step4_title'), desc: t('step4_desc') },
  ]

  const journey = [
    { icon: '🌱', label: t('journey_sowing') },
    { icon: '🌿', label: t('journey_growing') },
    { icon: '🌾', label: t('journey_maturing') },
    { icon: '🚜', label: t('journey_harvest') },
    { icon: '🎁', label: t('journey_yours') },
  ]

  return (
    <div>
      {/* HERO */}
      <div className="relative h-[28rem] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/images/cultivation.jpg')" }}>
        <div className="absolute inset-0 bg-green-900/65" />
        <div className="relative text-center text-white px-6">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-4 drop-shadow-lg tracking-tight">
            🌾 FARMiLIVE
          </h1>
          <p className="text-xl drop-shadow">{t('hero_title')}</p>
          <p className="text-xl font-semibold text-amber-300 mb-6 drop-shadow">{t('hero_title_hl')}</p>

          <div className="flex justify-center gap-3 mb-8">
            <Link href="/crops" className="bg-amber-500 text-white px-6 py-2.5 rounded font-semibold">
              {t('nav_explore')}
            </Link>
            <Link href="/signup" className="bg-white text-green-800 px-6 py-2.5 rounded font-semibold">
              {t('nav_signup')}
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {[t('trust_gps'), t('trust_updates'), t('trust_harvest')].map((label, i) => (
              <span key={i} className="bg-white/15 border border-white/25 text-xs px-3 py-1 rounded-full">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ABOUT / WHY FARMiLIVE */}
      <FadeInSection>
        <section id="about" className="bg-amber-50 py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-amber-700 text-xs font-bold uppercase tracking-wide mb-2">{t('about_badge')}</p>
            <h2 className="text-3xl font-bold text-green-900 mb-4">{t('about_heading')}</h2>
            <p className="text-gray-600 mb-8">{t('about_desc')}</p>
          </div>

          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-amber-200">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">{t('about_traditional')}</p>
              <div className="flex justify-between items-center text-xs font-semibold text-gray-600 flex-wrap gap-2">
                <span>{t('about_farmer_word')}</span><span>→</span>
                <span>{t('about_market')}</span><span>→</span>
                <span>{t('about_middleman')}</span><span>→</span>
                <span>{t('about_customer')}</span>
              </div>
            </div>
            <div className="bg-green-800 text-white rounded-xl p-4">
              <p className="text-xs font-bold text-amber-300 uppercase mb-3 text-center">FARMiLIVE</p>
              <div className="flex justify-between items-center text-xs font-semibold flex-wrap gap-2">
                <span>{t('about_you')}</span><span>→</span>
                <span>{t('about_your_farm')}</span><span>→</span>
                <span>{t('about_your_crop')}</span><span>→</span>
                <span>{t('about_your_harvest')}</span>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* HOW IT WORKS */}
      <FadeInSection>
        <section id="how-it-works" className="py-16 px-6 max-w-4xl mx-auto">
          <p className="text-amber-700 text-xs font-bold uppercase tracking-wide mb-2 text-center">{t('how_works_badge')}</p>
          <h2 className="text-3xl font-bold text-green-900 mb-10 text-center">{t('how_works_heading')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {steps.map(s => (
              <div key={s.n} className="border-2 border-green-100 bg-white rounded-xl p-5">
                <p className="text-amber-600 font-bold text-lg mb-2">{s.n}</p>
                <h3 className="font-bold text-green-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* EXPLORE CROPS PREVIEW / STORY */}
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

      {/* YOUR JOURNEY */}
      <FadeInSection>
        <section className="bg-amber-50 py-16 px-6 text-center">
          <p className="text-amber-700 text-xs font-bold uppercase tracking-wide mb-2">{t('journey_badge')}</p>
          <h2 className="text-3xl font-bold text-green-900 mb-10">{t('journey_heading')}</h2>
          <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            {journey.map((j, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-20">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-green-300 flex items-center justify-center text-2xl shadow">
                  {j.icon}
                </div>
                <span className="text-xs font-semibold text-gray-600">{j.label}</span>
              </div>
            ))}
          </div>
        </section>
      </FadeInSection>

      {/* CTA */}
      <FadeInSection>
        <section
          className="relative h-72 bg-cover bg-center flex items-center justify-center text-center"
          style={{ backgroundImage: "url('/images/harvesting.jpg')" }}>
          <div className="absolute inset-0 bg-green-900/70" />
          <div className="relative text-white px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('cta_heading')}</h2>
            <p className="mb-6 text-white/90">{t('cta_sub')}</p>
            <Link href="/crops" className="bg-amber-500 text-white px-6 py-2.5 rounded font-semibold inline-block">
              {t('cta_btn')}
            </Link>
          </div>
        </section>
      </FadeInSection>
    </div>
  )
}