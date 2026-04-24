import ContactDetail from '@/components/contact/ContactDetail'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import { cookies } from 'next/headers'
import React from 'react'

const SEO = {
  moscow: {
    title: 'Контакты агенства недвижимости Реаллайн МСК',
    description: 'Контактная информация.',
  },
  saint_petersburg: {
    title: 'Контакты агенства недвижимости Реаллайн СПБ',
    description: 'Контактная информация.',
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
      <HomeLink link={'/contacts'} label={'Контакты'} link2={''} label2={''} />
      <ContactDetail />
    </div>
  )
}
