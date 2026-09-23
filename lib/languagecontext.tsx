'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

export type Lang = 'en' | 'hi' | 'mr'

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    nav_home: 'Home',
    nav_explore: 'Explore Crops',
    hero_title: "Don't just buy the harvest.",
    hero_title_hl: 'Experience the journey behind it.',
    reserve_btn: 'Reserve with ₹99 (refundable)',
    my_crops: 'My Crops',
    submit_update: 'Submit Weekly Update',
    verified: 'Verified',
    pending: 'Pending',
  },
  hi: {
    nav_home: 'होम',
    nav_explore: 'फ़सलें देखें',
    hero_title: 'सिर्फ़ फ़सल मत खरीदिए।',
    hero_title_hl: 'उसके पीछे की यात्रा को अनुभव कीजिए।',
    reserve_btn: '₹99 से रिज़र्व करें (वापसी योग्य)',
    my_crops: 'मेरी फसलें',
    submit_update: 'साप्ताहिक अपडेट सबमिट करें',
    verified: 'सत्यापित',
    pending: 'लंबित',
  },
  mr: {
    nav_home: 'मुख्यपृष्ठ',
    nav_explore: 'पिके पहा',
    hero_title: 'फक्त पीक विकत घेऊ नका.',
    hero_title_hl: 'त्यामागचा प्रवास अनुभवा.',
    reserve_btn: '₹99 ने राखीव करा (परत मिळणारे)',
    my_crops: 'माझी पिके',
    submit_update: 'साप्ताहिक अपडेट सबमिट करा',
    verified: 'सत्यापित',
    pending: 'प्रलंबित',
  },
}

type LangContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LangContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  function t(key: string) {
    return STRINGS[lang][key] || STRINGS.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}