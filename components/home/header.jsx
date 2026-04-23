'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { FiChevronDown, FiMenu, FiX, FiMapPin } from 'react-icons/fi';
import useApiStore from '@/store/useApiStore';
import { postData } from '@/lib/apiService';
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

const ORANGE = 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)';
const ORANGE_COLOR = '#F05D22';

function ZayavkaModal({ open, onClose }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!name || !phone) { toast.error('Введите имя и номер телефона'); return; }
        if (!agreed) { toast.error('Дайте согласие на обработку данных'); return; }
        setLoading(true);
        try {
            await postData('/site/consultation/', { name, phone });
            toast.success('Заявка принята!');
            setName(''); setPhone(''); setAgreed(false);
            onClose();
        } catch {
            toast.error('Произошла ошибка. Попробуйте снова');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 10000,
                    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease',
                }}
            />
            {/* Modal */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 10001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px', pointerEvents: 'none',
            }}>
                <div style={{
                    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460,
                    padding: '36px 32px 32px', position: 'relative', pointerEvents: 'all',
                    animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
                }}>
                    {/* Close */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 16, right: 16,
                            width: 32, height: 32, borderRadius: '50%',
                            border: '1px solid #E5E7EB', background: '#F9FAFB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#6B7280',
                        }}
                    >
                        <FiX size={15} />
                    </button>

                    {/* Header */}
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
                            Оставить заявку
                        </h3>
                    </div>

                    {/* Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        <input
                            type="text"
                            placeholder="Ваше имя"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{
                                height: 52, borderRadius: 12, border: '1px solid #E5E7EB',
                                background: '#F9FAFB', padding: '0 16px', fontSize: 14,
                                outline: 'none', width: '100%', boxSizing: 'border-box',
                                color: '#111827', transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.target.style.borderColor = ORANGE_COLOR}
                            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                        <input
                            type="tel"
                            placeholder="Номер телефона"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            style={{
                                height: 52, borderRadius: 12, border: '1px solid #E5E7EB',
                                background: '#F9FAFB', padding: '0 16px', fontSize: 14,
                                outline: 'none', width: '100%', boxSizing: 'border-box',
                                color: '#111827', transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.target.style.borderColor = ORANGE_COLOR}
                            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* Checkbox */}
                    <div
                        onClick={() => setAgreed(a => !a)}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}
                    >
                        <div style={{
                            width: 20, height: 20, minWidth: 20, borderRadius: 6,
                            border: `2px solid ${agreed ? ORANGE_COLOR : '#D1D5DB'}`,
                            background: agreed ? ORANGE_COLOR : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: 1, transition: 'all 0.15s', flexShrink: 0,
                        }}>
                            {agreed && (
                                <svg width="11" height="8" viewBox="0 0 12 9" fill="none">
                                    <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, userSelect: 'none' }}>
                            Я даю согласие на обработку персональных данных в соответствии с{' '}
                            <a href="/privacy" style={{ color: ORANGE_COLOR, textDecoration: 'underline' }} onClick={e => e.stopPropagation()}>
                                Политикой
                            </a>
                        </span>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: '100%', height: 52, borderRadius: 999,
                            background: ORANGE, border: 'none',
                            color: '#fff', fontSize: 15, fontWeight: 500,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
                        }}
                    >
                        {loading ? 'Отправка...' : 'Отправить заявку'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
            `}</style>
        </>
    );
}

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
    const [modalOpen, setModalOpen] = useState(false);

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

    useEffect(() => {
        const savedCityValue = localStorage.getItem(CITY_STORAGE_KEY);
        const city = CITIES.find((c) => c.value === savedCityValue) || CITIES[0];
        setSelectedCity(city);
        setCityHydrated(true);
    }, []);

    useEffect(() => {
        if (!cityHydrated) return;

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

    // ✅ TO'G'IRLANDI: () => router.push() shaklida, render paytida chaqirilmaydi
    const handleProfileClick = () => {
        router.push('/profile');
    };

    const handleZayavka = () => {
        setMobileMenuOpen(false);
        setModalOpen(true);
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

            {/* Zayavka Modal */}
            <ZayavkaModal open={modalOpen} onClose={() => setModalOpen(false)} />

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
                    {/* ✅ #contact o'rniga modal ochiladi */}
                    <button
                        onClick={handleZayavka}
                        className="mt-[23px] lg:mt-[40px] bg-[#F05D22] transition-all duration-200 text-white font-medium w-[180px] h-[68px] rounded-full text-sm"
                    >
                        Подобрать участок
                    </button>
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
                                            color: '#141111',
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
                    {/* ✅ #contact o'rniga modal */}
                    <button
                        onClick={handleZayavka}
                        className="bg-white text-black font-normal text-[14px] px-5 py-[10px] rounded-full hover:bg-white/90 transition"
                    >
                        Получить консультацию
                    </button>
                    {isAuthenticated ? (
                        // ✅ TO'G'IRLANDI: onClick={handleProfileClick} — parenthesis yo'q
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

            {/* ===== MOBILE FULLSCREEN MENU ===== */}
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
                            {/* ✅ Mobile: #contact o'rniga modal */}
                            <button
                                onClick={handleZayavka}
                                className="bg-white text-black font-medium text-[14px] px-5 py-3 rounded-full hover:bg-white/90 transition flex-1 cursor-pointer"
                            >
                                Получить консультацию
                            </button>
                            <button className="bg-white/90 text-black font-medium text-[14px] px-5 py-3 rounded-full transition border border-white/20 cursor-pointer">
                                Tg
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {isAuthenticated ? (
                                // ✅ TO'G'IRLANDI: handleProfileClick — parenthesis yo'q
                                <button
                                    onClick={handleProfileClick}
                                    className="bg-white/90 text-black font-medium text-[14px] px-5 py-3 rounded-full transition border border-white/20 flex-1 cursor-pointer"
                                >
                                    Профиль
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