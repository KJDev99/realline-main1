import AllBlog from '@/components/blog/AllBlog'
import ContactForm from '@/components/home/Contactform'
import Header from '@/components/home/header'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import { cookies } from 'next/headers'
import React from 'react'

const SEO = {
  moscow: {
    title: 'Блог о недвижимости - Реаллайн',
    description: 'Полезные статьи о покупке, продаже и аренде недвижимости. Советы экспертов, разбор рынка и юридические нюансы сделок.',
  },
  saint_petersburg: {
    title: 'Блог о недвижимости - Реаллайн',
    description: 'Полезные статьи о покупке, продаже и аренде недвижимости. Советы экспертов, разбор рынка и юридические нюансы сделок.',
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
      <HomeLink link={'/blog'} label={'Блог'} link2={''} label2={''} />
      <AllBlog />
      <ContactForm />
    </div>
  )
}
