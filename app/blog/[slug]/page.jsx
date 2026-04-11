import DetailBlog from '@/components/blog/DetailBlog'
import Articles from '@/components/home/Articles'
import ContactForm from '@/components/home/Contactform'
import Navbar from '@/components/Navbar'
import React from 'react'

export default function page() {
    return (
        <div>
            <Navbar />
            <DetailBlog />
            <Articles />
            <ContactForm />
        </div>
    )
}
