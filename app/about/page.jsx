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
import React from 'react'

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
