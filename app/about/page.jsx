import AboutHero from '@/components/about/AboutHero'
import AboutInfo from '@/components/about/AboutInfo'
import AboutWork from '@/components/about/AboutWork'
import OurTeam from '@/components/about/OurTeam'
import AdditionalServices from '@/components/home/Additionalservices'
import Articles from '@/components/home/Articles'
import ContactForm from '@/components/home/Contactform'
import FAQ from '@/components/home/Faq'
import HowWeWork from '@/components/home/Howwework'
import Reviews from '@/components/home/Reviews'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import { cookies } from 'next/headers'
import React from 'react'

const SEO = {
  moscow: {
    title: 'Об агенстве недвижимости Реаллайн.',
    description: 'Реаллайн - эксперты по недвижимости. Мы работаем с земельными участками, жилой и коммерческой недвижимостью Москвы.',
  },
  saint_petersburg: {
    title: 'Об агенстве недвижимости Реаллайн.',
    description: 'Реаллайн - эксперты по недвижимости. Мы работаем с земельными участками, жилой и коммерческой недвижимостью Санкт-Петербурга.',
  },
};

export async function generateMetadata() {
  const cookieStore = await cookies();
  const city = cookieStore.get('selected_city')?.value ?? 'moscow';
  const seo = SEO[city] ?? SEO.moscow;
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default function page() {
  return (
    <div>
      <Navbar />
      <HomeLink link={'/about'} label={'О компании'} link2={''} label2={''} />
      <AboutHero />
      <AboutInfo />
      <AboutWork />
      <OurTeam />
      <HowWeWork />
      <AdditionalServices />
      <Reviews />
      <FAQ />
      <Articles />
      <ContactForm />
    </div>
  )
}
