import AllCompare from '@/components/favorite/AllCompare'
import ContactForm from '@/components/home/Contactform'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import React from 'react'

export default function page() {
  return (
    <div>
      <Navbar />
      <HomeLink link={'/compare'} label={'Сравнение'} link2='' label2="" />
      <AllCompare />
      <ContactForm />
    </div>
  )
}
