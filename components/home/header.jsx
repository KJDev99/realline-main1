'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import useApiStore from '@/store/useApiStore';
import { useRouter } from 'next/navigation';

import 'swiper/css';
import 'swiper/css/effect-fade';

const navLinks = [
    { label: 'Недвижимость', href: '/', hasDropdown: true },
    { label: 'Услуги', href: '/services' },
    { label: 'О компании', href: '/about' },
    { label: 'Отзывы', href: '/reviews' },
    { label: 'Блог', href: '/blog' },
    { label: 'Контакты', href: '/contacts' },
];

export default function Header() {
    const router = useRouter();
    const swiperRef = useRef(null);
    const { getData } = useApiStore();
    const [slides, setSlides] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('access_token');
        setIsAuthenticated(!!token);

        getData('site/hero-slides/')
            .then(data => {
                const list = Array.isArray(data) ? data : data?.results || [];
                setSlides([...list].sort((a, b) => a.sort_order - b.sort_order));
            })
            .catch(() => { });

        // Load categories for dropdown
        getData('accounts/catalog/categories/')
            .then((data) => {
                const sorted = (Array.isArray(data) ? data : data.results ?? [])
                    .sort((a, b) => a.sort_order - b.sort_order);
                setCategories(sorted);
            })
            .catch(() => { });
    }, []);

    // Tashqariga bosilganda yopish
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCategoryClick = (categoryId) => {
        setDropdownOpen(false);
        router.push(`/catalog?category=${categoryId}&offset=0`);
    };

    const handleAllClick = () => {
        setDropdownOpen(false);
        router.push('/catalog?offset=0');
    };

    const handleAgentClick = () => {
        if (isAuthenticated) {
            router.push('/profile');
        } else {
            router.push('/sign-in');
        }
    };

    return (
        <div className="herobg rounded-[20px] w-[calc(100%-10px)] h-[995px] lg:h-[750px] overflow-visible relative flex justify-between">
            <div className="p-4 lg:p-6 z-10">
                <div className="flex items-center gap-x-10">
                    <Link href={'/'}>
                        <Image
                            src="/icons/logo.svg"
                            alt="logo"
                            width={196}
                            height={32}
                            className="w-[196px] h-8 shrink-0"
                        />
                    </Link>
                    <nav className="flex items-center gap-x-5 flex-wrap hidden lg:flex">
                        {navLinks.map((link) => (
                            link.hasDropdown ? (
                                <div key={link.label} className="relative">
                                    <button
                                        ref={buttonRef}
                                        onClick={() => setDropdownOpen((prev) => !prev)}
                                        className="text-white/80 hover:text-white flex items-center gap-1 font-normal text-[14px] leading-[100%] tracking-[0%] align-middle bg-transparent border-none cursor-pointer"
                                    >
                                        {link.label}
                                        <svg
                                            width="10" height="6" viewBox="0 0 10 6" fill="none"
                                            style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                        >
                                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>

                                    {dropdownOpen && (
                                        <div
                                            ref={dropdownRef}
                                            style={{
                                                position: 'absolute',
                                                top: 'calc(100% + 12px)',
                                                left: 0,
                                                background: '#fff',
                                                borderRadius: 14,
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                                minWidth: 220,
                                                zIndex: 9999,
                                                padding: '8px 0',
                                                border: '1px solid #F0F0F0',
                                            }}
                                        >
                                            <button
                                                onClick={handleAllClick}
                                                style={{
                                                    display: 'block', width: '100%', textAlign: 'left',
                                                    padding: '10px 20px', fontSize: 14, color: '#111827',
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    fontWeight: 500,
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                            >
                                                Все категории
                                            </button>

                                            <div style={{ height: 1, background: '#F0F0F0', margin: '4px 0' }} />

                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => handleCategoryClick(cat.id)}
                                                    style={{
                                                        display: 'block', width: '100%', textAlign: 'left',
                                                        padding: '10px 20px', fontSize: 14, color: '#374151',
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-white/80 hover:text-white flex items-center font-normal text-[14px] leading-[100%] tracking-[0%] align-middle"
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </nav>
                </div>

                {/* Slide thumbnails */}
                <div className="flex gap-3 mt-[50px] lg:mt-[130px] ml-0 lg:ml-[36px]">
                    {slides.map((slide, i) => (
                        <button
                            key={slide.id}
                            onClick={() => swiperRef.current?.slideTo(i)}
                            className="w-[76px] h-[76px] lg:h-[112px] lg:w-[112px] rounded-xl overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all duration-300 shrink-0"
                        >
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                width={120}
                                height={80}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}

                    {slides.length === 0 && Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-[76px] h-[76px] lg:h-[112px] lg:w-[112px] rounded-xl bg-white/10 animate-pulse shrink-0"
                        />
                    ))}
                </div>

                <div className="ml-0 lg:ml-[38px]">
                    {slides.length > 0 ? (
                        <>
                            <h1 className="font-normal text-[26px] lg:text-[36px] mt-[31px] leading-[100%] tracking-[0%] align-middle text-white">
                                {slides[0].title}
                            </h1>
                            <p className="font-normal text-[14px] lg:text-[16px] leading-[100%] tracking-[0%] align-middle text-[gray] mt-[26px]">
                                {slides[0].subtitle}
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="mt-[31px] h-9 w-72 bg-white/10 animate-pulse rounded-lg" />
                            <div className="mt-[26px] h-5 w-96 bg-white/10 animate-pulse rounded-lg" />
                        </>
                    )}
                    <Link href="/sign-in">
                        <button className="mt-[23px] lg:mt-[40px] bg-[#F05D22] transition-all duration-200 text-white font-medium w-[180px] h-[68px] rounded-full text-sm">
                            Подобрать участок
                        </button>
                    </Link>
                </div>
            </div>

            <div className="absolute right-0 top-0 w-[375px] lg:w-[620px] h-full rounded-[20px] overflow-hidden flex justify-end">
                <div className="absolute hidden lg:flex top-0 left-0 right-0 z-20 flex items-center justify-end gap-2 p-4">
                    <div className="flex items-center gap-1 text-white text-sm">
                        Москва
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <button className="bg-white backdrop-blur-md rounded-full p-[10px] font-normal text-[14px] leading-[100%] tracking-[0%] align-middle transition">
                        Tg
                    </button>
                    <button className="bg-white text-black font-normal text-[14px] px-5 py-[10px] leading-[100%] tracking-[0%] align-middle rounded-full hover:bg-white/90 transition">
                        <a href="#contact">

                            Получить консультацию
                        </a>
                    </button>
                    <button
                        onClick={handleAgentClick}
                        className="bg-white backdrop-blur-md rounded-full px-5 py-[10px] font-normal text-[14px] leading-[100%] tracking-[0%] align-middle transition cursor-pointer"
                    >
                        {isAuthenticated ? 'Профиль' : 'Агентам'}
                    </button>
                    <Link href={'/favorite'}>
                        <button className="flex justify-center items-center w-[38px] h-[38px] rounded-full bg-white border border-[#1411111A]">
                            <Image src="/icons/1.svg" width={20} height={17.79} alt="icon1" />
                        </button>
                    </Link>
                    <Link href={'/compare'}>
                        <button className="flex justify-center items-center w-[38px] h-[38px] rounded-full bg-white border border-[#1411111A]">
                            <Image src="/icons/2.svg" width={20} height={17.79} alt="icon2" />
                        </button>
                    </Link>
                </div>

                {/* SWIPER */}
                {slides.length > 0 && (
                    <Swiper
                        modules={[Autoplay, EffectFade]}
                        effect="fade"
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        loop
                        speed={800}
                        onSwiper={(swiper) => { swiperRef.current = swiper; }}
                        className="w-[375px] lg:w-[620px] h-[448px] lg:h-[calc(100%_-_10px)] ml-auto my-135 lg:my-1 absolute right-1 flex justify-end rounded-[20px]"
                    >
                        {slides.map((slide, i) => (
                            <SwiperSlide key={slide.id} className="relative">
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className="object-cover"
                                    priority={i === 0}
                                />
                                <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-t from-black/50 to-transparent">
                                    <span className="text-white text-sm">{slide.title}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => swiperRef.current?.slidePrev()}
                                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur flex items-center justify-center transition"
                                        >
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                                                <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => swiperRef.current?.slideNext()}
                                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur flex items-center justify-center transition"
                                        >
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                                                <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}

                {slides.length === 0 && (
                    <div className="w-[375px] lg:w-[620px] h-[448px] lg:h-[calc(100%_-_10px)] absolute right-1 rounded-[20px] bg-white/10 animate-pulse" />
                )}
            </div>
        </div>
    );
}