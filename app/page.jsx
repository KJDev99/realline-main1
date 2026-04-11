import Footer from '@/components/Footer';
import ActualOffers from '@/components/home/Actualoffers';
import AdditionalServices from '@/components/home/Additionalservices';
import Articles from '@/components/home/Articles';
import CatalogSection from '@/components/home/Catalogsection';
import ContactForm from '@/components/home/Contactform';
import FAQ from '@/components/home/Faq';
import Header from '@/components/home/header';
import Home1 from '@/components/home/home1';
import Home2 from '@/components/home/home2';
import HowWeWork from '@/components/home/Howwework';
import Reviews from '@/components/home/Reviews';
import WhyUs from '@/components/home/Whyus';
import React from 'react'

export default function page() {
  return (
    <div>
      <Header />
      <Home1 />
      <Home2 />
      <CatalogSection />
      <WhyUs />
      <ActualOffers />
      <HowWeWork />
      <AdditionalServices />
      <Reviews />
      <FAQ />
      <Articles />
      <ContactForm />
    </div>
  )
}
