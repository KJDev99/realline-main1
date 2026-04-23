'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className='flex-wrap lg:flex gap-10 lg:gap-0 justify-between bg-black max-md:px-5 max-md:py-5 max-md:rounded-t-[10px] px-10 rounded-t-[20px] py-[50px] mr-1 ml-1'>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link href={'/'}>
                        <Image src="/icons/logo.svg" alt="logo" width={196.00035095214844} height={30} style={{ height: 28, width: 'auto' }} />
                    </Link>
                </div>
                <div className='max-md:mb-4 max-md:hidden flex flex-col gap-1.5 mt-2'>
                    <span className='font-normal text-[14px] leading-[100%] tracking-[0%] align-middle text-[rgba(255,255,255,0.35)] mt-[15px]'>© 2026 Все права защищены</span>
                    <Link href="/privacy" className='font-normal text-[14px] leading-[100%] tracking-[0%] align-middle text-[rgba(255,255,255,0.35)] mt-[15px]'>
                        Политика конфиденциальности
                    </Link>
                    <span className='font-normal text-[14px] leading-[100%] tracking-[0%] align-middle mt-[15px] text-[rgba(255,255,255,0.35)]'>Разработано в Usertech</span>
                </div>
            </div>

            {/* COL 2 + COL 3 — mobilda yonma-yon, desktopda alohida */}
            <div className='md:contents flex gap-10 max-md:mt-6'>
                {/* COL 2 — Недвижимость */}
                <div className='mb-5' style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                        { label: 'Новостройки', href: '/catalog?category=1&offset=0' },
                        { label: 'Загородная недвижимость', href: '/catalog?category=2&offset=0' },
                        { label: 'Земельные участки', href: '/catalog?category=3&offset=0' },
                        { label: 'Вторичная недвижимость', href: '/catalog?category=4&offset=0' },
                        { label: 'Смотреть всю недвижимость', href: '/catalog', muted: 'true' },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className='font-normal text-[16px] leading-[100%] tracking-[0%] align-middle text-white max-md:text-sm'
                            style={{
                                color: link.muted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255, 1)',
                            }}

                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* COL 3 — Компания */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                        { label: 'Услуги', href: '/services' },
                        { label: 'О компании', href: '/about' },
                        { label: 'Отзывы', href: '/reviews' },
                        { label: 'Блог', href: '/blog' },
                        { label: 'Контакты', href: '/contacts' },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className='font-normal text-[16px] leading-[100%] max-md:text-sm tracking-[0%] align-middle text-white'
                            onMouseOver={e => e.currentTarget.style.color = '#fff'}
                            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

            </div>

            {/* COL 4 — Contacts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                    href="tel:+71234567890"
                    style={{ color: '#fff', fontSize: 20, fontWeight: 700, textDecoration: 'none', marginBottom: 4 }}
                >
                    +7 (123) 456 78 90
                </a>
                <a
                    href="mailto:realline@info.ru"
                    className='font-normal text-[16px] leading-[100%] tracking-[0%] align-middle text-white mb-[10px]'
                >
                    realline@info.ru
                </a>
                <span className='font-normal text-[16px] leading-[100%] tracking-[0%] align-middle text-white'>
                    г. Москва, ул. Улица, д.1, офис 1
                </span>

                {/* Social buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    {[
                        { label: 'Tg', href: 'https://t.me/' },
                        { label: 'Вк', href: 'https://vk.com/' },
                    ].map((s) => (
                        <a
                            key={s.label}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className='font-normal text-[14px] leading-[100%] tracking-[0%] align-middle text-black bg-white w-[38px] h-[38px] rounded-full flex items-center justify-center'

                        >
                            {s.label}
                        </a>
                    ))}
                </div>
            </div>
            <div className='max-md:mb-4 md:hidden max-md:flex flex-col gap-1.5 mt-2' >
                <span className='font-normal text-[14px] leading-[100%] tracking-[0%] align-middle text-[rgba(255,255,255,0.35)] mt-[15px]'>© 2026 Все права защищены</span>
                <Link href="/privacy" className='font-normal text-[14px] leading-[100%] tracking-[0%] align-middle text-[rgba(255,255,255,0.35)] mt-[15px]'>
                    Политика конфиденциальности
                </Link>
                <span className='font-normal text-[14px] leading-[100%] tracking-[0%] align-middle mt-[15px] text-[rgba(255,255,255,0.35)]'>Разработано в Usertech</span>
            </div>
        </footer>
    );
}