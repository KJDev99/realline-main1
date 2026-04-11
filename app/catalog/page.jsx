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
import React from 'react'

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
