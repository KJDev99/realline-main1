import AdditionalServices from '@/components/home/Additionalservices'
import Articles from '@/components/home/Articles'
import ContactForm from '@/components/home/Contactform'
import FAQ from '@/components/home/Faq'
import HowWeWork from '@/components/home/Howwework'
import Reviews from '@/components/home/Reviews'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import ServicesDetail from '@/components/services/ServicesDetail'
import React from 'react'

export default function page() {
    return (
        <div>
            <Navbar />
            <ServicesDetail />
            <HowWeWork />
            <AdditionalServices />
            <Reviews />
            <FAQ />
            <Articles />
            <ContactForm />
        </div>
    )
}
