import AllBlog from '@/components/blog/AllBlog'
import ContactForm from '@/components/home/Contactform'
import Header from '@/components/home/header'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import React from 'react'

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
