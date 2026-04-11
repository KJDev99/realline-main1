import ReviewsDetail from '@/components/contact/reviewsDetail'
import ContactForm from '@/components/home/Contactform'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import React from 'react'

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
