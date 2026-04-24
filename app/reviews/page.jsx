import ReviewsDetail from '@/components/contact/reviewsDetail'
import ContactForm from '@/components/home/Contactform'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import { cookies } from 'next/headers'
import React from 'react'

const SEO = {
  moscow: {
    title: 'Отзывы клиентов о сделках с недвижимостью - Реаллайн',
    description: 'Читайте отзывы о покупке, продаже и аренде недвижимости. Реальные отзывы покупателей и продавцов квартир, домов и коммерческих объектов агенства Реаллайн.',
  },
  saint_petersburg: {
    title: 'Отзывы клиентов о сделках с недвижимостью - Реаллайн',
    description: 'Читайте отзывы о покупке, продаже и аренде недвижимости. Реальные отзывы покупателей и продавцов квартир, домов и коммерческих объектов агенства Реаллайн.',
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
      <HomeLink link={'/reviews'} label={'Отзывы'} link2={''} label2={''} />
      <ReviewsDetail />
      <ContactForm />
    </div>
  )
}
