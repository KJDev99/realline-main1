import ContactDetail from '@/components/contact/ContactDetail'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import React from 'react'

export default function page() {
  return (
    <div>
      <Navbar />
      <HomeLink link={'/contacts'} label={'Контакты'} link2={''} label2={''} />
      <ContactDetail />
    </div>
  )
}
