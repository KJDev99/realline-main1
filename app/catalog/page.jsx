import ActualOffers from '@/components/home/Actualoffers'
import AdditionalServices from '@/components/home/Additionalservices'
import Articles from '@/components/home/Articles'
import CatalogSection from '@/components/home/Catalogsection'
import ContactForm from '@/components/home/Contactform'
import FAQ from '@/components/home/Faq'
import HowWeWork from '@/components/home/Howwework'
import Reviews from '@/components/home/Reviews'
import WhyUs from '@/components/home/Whyus'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import { cookies } from 'next/headers'
import React from 'react'

const SEO = {
  moscow: {
    title: 'Каталог недвижимости Реаллайн Москва',
    description: 'Категории недвижимости: новостройки, земельные участки, коттеджи, дачи, вторичная, коммерческая и загородная недвижимость.',
  },
  saint_petersburg: {
    title: 'Каталог недвижимости Реаллайн Санкт-Петербург',
    description: 'Категории недвижимости: новостройки, земельные участки, коттеджи, дачи, вторичная, коммерческая и загородная недвижимость.',
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
      <HomeLink link={'/catalog'} label={'Каталог недвижимости'} link2={''} label2={''} />
      <CatalogSection />
      <Reviews />
      <FAQ />
      <Articles />
      <ContactForm />
    </div>
  )
}
