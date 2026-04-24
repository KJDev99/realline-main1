import ContactForm from '@/components/home/Contactform'
import HomeLink from '@/components/homeLink'
import Navbar from '@/components/Navbar'
import AllServices from '@/components/services/AllServices'
import { cookies } from 'next/headers'
import React from 'react'

const SEO = {
    moscow: {
        title: 'Услуги агентства недвижимости Реаллайн – полное сопровождение',
        description: 'Покупка, продажа, аренда квартир, домов и коммерции в МСК. Юридическая проверка, безопасные сделки и помощь в получении ипотеки.',
    },
    saint_petersburg: {
        title: 'Услуги агентства недвижимости Реаллайн – полное сопровождение',
        description: 'Покупка, продажа, аренда квартир, домов и коммерции в СПБ. Юридическая проверка, безопасные сделки и помощь в получении ипотеки.',
    },
};

export async function generateMetadata() {
    const cookieStore = await cookies();
    const city = cookieStore.get('selected_city')?.value ?? 'moscow';
    const seo = SEO[city] ?? SEO.moscow;
    return {
        title: seo.title,
        description: seo.description,
    };
}

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
