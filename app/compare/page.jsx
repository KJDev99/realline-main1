import AllCompare from '@/components/favorite/AllCompare'
import CompareTable from '@/components/favorite/CompareTable'
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
      <CompareTable />
      <ContactForm />
    </div>
  )
}
