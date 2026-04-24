import Profile from '@/components/Lichniy/profile'
import Navbar from '@/components/Navbar'
import { cookies } from 'next/headers';
import React from 'react'

const SEO = {
  moscow: {
    title: 'Земельные участки и недвижимость - Реаллайн МСК',
    description: 'Реаллайн - Подбор, проверка и сопровождение сделок с недвижимостью. От земельных участков до инвестиционных объектов.',
  },
  saint_petersburg: {
    title: 'Земельные участки и недвижимость - Реаллайн СПБ',
    description: 'Реаллайн - Подбор, проверка и сопровождение сделок с недвижимостью. От земельных участков до инвестиционных объектов.',
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
    <div className='mb-[100px]'>
      <Navbar />
      <Profile />
    </div>
  )
}
