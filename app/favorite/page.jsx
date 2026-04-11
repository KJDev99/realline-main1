import AllFavorite from '@/components/favorite/AllFavorite'
import ContactForm from '@/components/home/Contactform'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import React from 'react'

export default function page() {
    return (
        <div>
            <Navbar />
            <HomeLink link={'/favorite'} label={'Favorite'} link2='' label2="" />
            <AllFavorite />
            <ContactForm />
        </div>
    )
}
