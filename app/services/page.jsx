import ContactForm from '@/components/home/Contactform'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import AllServices from '@/components/services/AllServices'
import React from 'react'

export default function page() {
    return (
        <div>
            <Navbar />
            <HomeLink link={'/services'} label={'Услуги'} link2={''} label2={''} />
            <AllServices />
            <ContactForm />
        </div>
    )
}
