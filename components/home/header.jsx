'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { FiChevronDown, FiMenu, FiX, FiMapPin } from 'react-icons/fi';
import useApiStore from '@/store/useApiStore';
import { AUTH_CHANGED_EVENT } from '@/store/useFavoriteCompare';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

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

const CITIES = [
    { label: 'Москва', value: 'moscow' },
    { label: 'Санкт-Петербург', value: 'saint_petersburg' },
];

const CITY_STORAGE_KEY = 'selected_city';
const SELECTED_CITY_EVENT = 'selected-city-changed';
const CITY_TO_REGION = {
    moscow: 1,
    saint_petersburg: 2,
};

export default function Header() {
    const router = useRouter();
    const swiperRef = useRef(null);
    const { getData } = useApiStore();
    const [slides, setSlides] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState(CITIES[0]);
    const [cityHydrated, setCityHydrated] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const cityDropdownRef = useRef(null);
    const cityButtonRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setIsAuthenticated(!!token);

        getData('accounts/catalog/categories/')
            .then((data) => {
                const sorted = (Array.isArray(data) ? data : data.results ?? [])
                    .sort((a, b) => a.sort_order - b.sort_order);
                setCategories(sorted);
            })
            .catch(() => { });
    }, []);

    // localStorage faqat clientda — birinchi SSR render bilan moslashishi uchun keyinroq o‘qiladi
    useEffect(() => {
        const savedCityValue = localStorage.getItem(CITY_STORAGE_KEY);
        const city = CITIES.find((c) => c.value === savedCityValue) || CITIES[0];
        setSelectedCity(city);
        setCityHydrated(true);
    }, []);

    useEffect(() => {
        if (!cityHydrated) {
            return;
        }

        localStorage.setItem(CITY_STORAGE_KEY, selectedCity.value);
        window.dispatchEvent(
            new CustomEvent(SELECTED_CITY_EVENT, { detail: { value: selectedCity.value } }),
        );

        const selectedRegion = CITY_TO_REGION[selectedCity.value] ?? 1;
        getData(`site/hero-slides/?site_region=${selectedRegion}`)
            .then(data => {
                const list = Array.isArray(data) ? data : data?.results || [];
                setSlides([...list].sort((a, b) => a.sort_order - b.sort_order));
            })
            .catch(() => { });
    }, [getData, selectedCity, cityHydrated]);

    // Close real-estate dropdown on outside click
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

    // Close city dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target) &&
                cityButtonRef.current && !cityButtonRef.current.contains(e.target)) {
                setCityDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCategoryClick = (categoryId) => {
        setDropdownOpen(false);
        setMobileDropdownOpen(false);
        setMobileMenuOpen(false);
        router.push(`/catalog?category=${categoryId}&offset=0`);
    };

    const handleAllClick = () => {
        setDropdownOpen(false);
        setMobileDropdownOpen(false);
        setMobileMenuOpen(false);
        router.push('/catalog?offset=0');
    };

    const handleAgentClick = () => {
        if (isAuthenticated) {
            router.push('/profile');
        } else {
            router.push('/sign-in');
        }
    };


    const handleProfileClick = () => {
        router.push('/profile');

    };


    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
        toast.success('Вы успешно вышли из системы');
        setShowLogoutDialog(false);
        setMobileMenuOpen(false);
        setIsAuthenticated(false);
        setTimeout(() => {
            router.push('/');
        }, 1000);
    };

    return (
        <div className="herobg rounded-[20px] w-[calc(100%-10px)] overflow-hidden relative flex max-md:flex-col max-md:h-max"
            style={{ height: '100vh', minHeight: '600px' }}>

            <Toaster position="top-right" />

            {/* Logout Dialog */}
            {showLogoutDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-white rounded-[20px] p-6 max-w-md mx-4">
                        <h3 className="text-xl font-semibold mb-4 text-[#141111]">Выход из системы</h3>
                        <p className="text-gray-600 mb-6">Вы действительно хотите выйти из системы?</p>
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setShowLogoutDialog(false)}
                                className="px-6 py-2 border border-gray-300 rounded-[10px] text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2 bg-red-600 text-white rounded-[10px] hover:bg-red-700 transition-colors"
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== LEFT SIDE (55%) ===== */}
            <div className="relative z-10 flex flex-col w-full lg:w-[55%] h-full p-4 lg:p-6">

                {/* Top row: logo + desktop nav */}
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

                    {/* Desktop nav */}
                    <nav className="hidden lg:flex items-center gap-x-5 flex-wrap">
                        {navLinks.map((link) => (
                            link.hasDropdown ? (
                                <div key={link.label} className="relative">
                                    <button
                                        ref={buttonRef}
                                        onClick={() => setDropdownOpen((prev) => !prev)}
                                        className="text-white/80 hover:text-white flex items-center gap-1 font-normal text-[14px] leading-[100%] tracking-[0%] bg-transparent border-none cursor-pointer"
                                    >
                                        {link.label}
                                        <FiChevronDown
                                            size={14}
                                            style={{
                                                transition: 'transform 0.2s',
                                                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }}
                                        />
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
                                    className="text-white/80 hover:text-white flex items-center font-normal text-[14px] leading-[100%] tracking-[0%]"
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </nav>

                    {/* Mobile burger */}
                    <button
                        className="lg:hidden ml-auto text-white p-1"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <FiMenu size={28} />
                    </button>
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

                {/* Title / subtitle / CTA */}
                <div className="ml-0 lg:ml-[38px]">
                    {slides.length > 0 ? (
                        <>
                            <h1 className="font-normal text-[26px] lg:text-[36px] mt-[31px] leading-[110%] text-white">
                                {slides[0].title}
                            </h1>
                            <p className="font-normal text-[14px] lg:text-[16px] leading-[100%] text-[gray] mt-[26px]">
                                {slides[0].subtitle}
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="mt-[31px] h-9 w-72 bg-white/10 animate-pulse rounded-lg" />
                            <div className="mt-[26px] h-5 w-96 bg-white/10 animate-pulse rounded-lg" />
                        </>
                    )}
                    <a href="#contact">
                        <button className="mt-[23px] lg:mt-[40px] bg-[#F05D22] transition-all duration-200 text-white font-medium w-[180px] h-[68px] rounded-full text-sm">
                            Подобрать участок
                        </button>
                    </a>
                </div>
            </div>

            {/* ===== RIGHT SIDE (45%) — SLIDER ===== */}
            <div className="lg:absolute right-0 top-0 w-[45%] max-md:w-full h-full rounded-[20px] overflow-hidden">

                {/* Top action bar */}
                <div className="max-md:hidden absolute top-0 left-0 right-0 z-20 flex items-center justify-end gap-2 p-4">
                    {/* City Selector */}
                    <div className="relative">
                        <button
                            ref={cityButtonRef}
                            onClick={() => setCityDropdownOpen((prev) => !prev)}
                            className="flex items-center gap-1 text-[#141111] text-sm bg-white/70 backdrop-blur-md rounded-full px-3 py-[10px] hover:bg-white/80 transition cursor-pointer border border-white/20"
                        >
                            <FiMapPin size={13} />
                            {selectedCity.label}
                            <FiChevronDown
                                size={12}
                                style={{
                                    transition: 'transform 0.2s',
                                    transform: cityDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}
                            />
                        </button>

                        {cityDropdownOpen && (
                            <div
                                ref={cityDropdownRef}
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    background: '#fff',
                                    borderRadius: 12,
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                    minWidth: 200,
                                    zIndex: 9999,
                                    padding: '6px 0',
                                    border: '1px solid #F0F0F0',
                                }}
                            >
                                {CITIES.map((city) => (
                                    <button
                                        key={city.value}
                                        onClick={() => {
                                            setSelectedCity(city);
                                            setCityDropdownOpen(false);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '10px 16px',
                                            fontSize: 14,
                                            color: selectedCity.value === city.value ? '#141111' : '#141111',
                                            fontWeight: selectedCity.value === city.value ? 600 : 400,
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                    >
                                        <FiMapPin size={13} color={selectedCity.value === city.value ? '#F05D22' : '#9CA3AF'} />
                                        {city.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="bg-white backdrop-blur-md rounded-full p-[10px] font-normal text-[14px] leading-[100%] transition">
                        Tg
                    </button>
                    <button className="bg-white text-black font-normal text-[14px] px-5 py-[10px] rounded-full hover:bg-white/90 transition">
                        <a href="#contact">Получить консультацию</a>
                    </button>
                    {isAuthenticated ? (
                        <button
                            onClick={handleProfileClick}
                            className="bg-white backdrop-blur-md rounded-full px-5 py-[10px] font-normal text-[14px] transition cursor-pointer"
                        >
                            Профиль
                        </button>
                    ) : (
                        <button
                            onClick={handleAgentClick}
                            className="bg-white backdrop-blur-md rounded-full px-5 py-[10px] font-normal text-[14px] transition cursor-pointer"
                        >
                            Агентам
                        </button>
                    )}
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

                {/* Swiper */}
                {slides.length > 0 && (
                    <Swiper
                        modules={[Autoplay, EffectFade]}
                        effect="fade"
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        loop
                        speed={800}
                        onSwiper={(swiper) => { swiperRef.current = swiper; }}
                        className="w-full h-full"
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
                    <div className="w-full h-full bg-white/10 animate-pulse" />
                )}
            </div>

            {/* ===== MOBILE FULLSCREEN MENU (TO'G'IRILGAN) ===== */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 bg-[#1a1a1a] flex flex-col"
                    style={{ minHeight: '100dvh' }}
                >
                    {/* Mobile menu header */}
                    <div className="flex items-center justify-between p-4 flex-shrink-0">
                        <Link href={'/'} onClick={() => setMobileMenuOpen(false)}>
                            <Image src="/icons/logo.svg" alt="logo" width={160} height={28} />
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-white p-1"
                            aria-label="Close menu"
                        >
                            <FiX size={28} />
                        </button>
                    </div>

                    {/* Mobile nav links */}
                    <nav className="flex flex-col px-6 pt-2 gap-1 flex-1 overflow-y-auto" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        {/* Real estate with inline subcategories */}
                        <div className="w-full">
                            <button
                                onClick={() => setMobileDropdownOpen((prev) => !prev)}
                                className="flex items-center justify-between w-full text-white text-[18px] font-medium py-3 border-b border-white/10"
                            >
                                Недвижимость
                                <FiChevronDown
                                    size={18}
                                    style={{
                                        transition: 'transform 0.2s',
                                        transform: mobileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                />
                            </button>

                            {mobileDropdownOpen && (
                                <div className="flex flex-col pl-4 py-2 gap-1 w-full">
                                    <button
                                        onClick={handleAllClick}
                                        className="text-left text-white/80 text-[15px] py-2 font-medium hover:text-white transition w-full cursor-pointer"
                                    >
                                        Все категории
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className="text-left text-white/60 text-[15px] py-2 hover:text-white transition w-full cursor-pointer"
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {navLinks.filter(l => !l.hasDropdown).map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-white text-[18px] font-medium py-3 border-b border-white/10 hover:text-white/70 transition w-full"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile bottom actions */}
                    <div className="p-6 flex flex-col gap-3 flex-shrink-0">
                        {/* City selector — mobile */}
                        <div className="relative">
                            <button
                                onClick={() => setCityDropdownOpen((prev) => !prev)}
                                className="flex items-center gap-2 text-white text-sm bg-white/10 rounded-full px-4 py-3 w-full hover:bg-white/20 transition border border-white/20"
                            >
                                <FiMapPin size={15} />
                                {selectedCity.label}
                                <FiChevronDown
                                    size={14}
                                    className="ml-auto"
                                    style={{
                                        transition: 'transform 0.2s',
                                        transform: cityDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                />
                            </button>

                            {cityDropdownOpen && (
                                <div
                                    className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden border border-white/10"
                                    style={{ background: '#2a2a2a', zIndex: 60 }}
                                >
                                    {CITIES.map((city) => (
                                        <button
                                            key={city.value}
                                            onClick={() => {
                                                setSelectedCity(city);
                                                setCityDropdownOpen(false);
                                            }}
                                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-[15px] hover:bg-white/10 transition cursor-pointer"
                                            style={{
                                                color: selectedCity.value === city.value ? '#F05D22' : '#e5e7eb',
                                                fontWeight: selectedCity.value === city.value ? 600 : 400,
                                            }}
                                        >
                                            <FiMapPin size={14} color={selectedCity.value === city.value ? '#F05D22' : '#9CA3AF'} />
                                            {city.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button className="bg-white text-black font-medium text-[14px] px-5 py-3 rounded-full hover:bg-white/90 transition flex-1 cursor-pointer">
                                <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Получить консультацию</a>
                            </button>
                            <button className="bg-white/90 text-black font-medium text-[14px] px-5 py-3 rounded-full transition border border-white/20 cursor-pointer">
                                Tg
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {isAuthenticated ? (
                                <button
                                    onClick={handleProfileClick()}
                                    className="bg-red-600 text-white font-medium text-[14px] px-5 py-3 rounded-full transition flex-1 cursor-pointer"
                                >
                                    Выйти
                                </button>
                            ) : (
                                <button
                                    onClick={() => { handleAgentClick(); setMobileMenuOpen(false); }}
                                    className="bg-white/90 text-black font-medium text-[14px] px-5 py-3 rounded-full transition border border-white/20 flex-1 cursor-pointer"
                                >
                                    Агентам
                                </button>
                            )}
                            <Link href={'/favorite'} onClick={() => setMobileMenuOpen(false)}>
                                <button className="flex justify-center items-center w-[46px] h-[46px] rounded-full bg-white/90 border border-white/20 cursor-pointer">
                                    <Image src="/icons/1.svg" width={20} height={18} alt="icon1" />
                                </button>
                            </Link>
                            <Link href={'/compare'} onClick={() => setMobileMenuOpen(false)}>
                                <button className="flex justify-center items-center w-[46px] h-[46px] rounded-full bg-white/90 border border-white/20 cursor-pointer">
                                    <Image src="/icons/2.svg" width={20} height={18} alt="icon2" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}