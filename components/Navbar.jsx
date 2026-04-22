'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronDown, FiMenu, FiX, FiMapPin } from 'react-icons/fi';
import useApiStore from '@/store/useApiStore';

const staticLinks = [
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

export default function Navbar() {
    const router = useRouter();
    const { getData } = useApiStore();
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState(CITIES[0]);
    const [cityHydrated, setCityHydrated] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false); // Mobile uchun alohida state

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
        if (!cityHydrated) {
            return;
        }

        localStorage.setItem(CITY_STORAGE_KEY, selectedCity.value);
        window.dispatchEvent(
            new CustomEvent(SELECTED_CITY_EVENT, { detail: { value: selectedCity.value } }),
        );
    }, [selectedCity, cityHydrated]);

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setCityDropdownOpen(false);
    };

    // Close real-estate dropdown on outside click (desktop)
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

    // Close city dropdown on outside click (desktop)
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
        setMobileMenuOpen(false);
        if (isAuthenticated) {
            router.push('/profile');
        } else {
            router.push('/sign-in');
        }
    };

    return (
        <>
            <div className="overflow-visible relative flex items-center justify-between max-w-[1400px] mx-auto px-4 lg:px-6 py-4 lg:py-6">

                {/* Logo */}
                <Link href={'/'}>
                    <Image
                        src="/icons/logodark.svg"
                        alt="logo"
                        width={196}
                        height={32}
                        className="w-[160px] lg:w-[196px] h-8 shrink-0"
                    />
                </Link>

                {/* Desktop nav */}
                <nav className="hidden lg:flex items-center gap-x-5 flex-wrap">
                    {/* Недвижимость dropdown */}
                    <div className="relative">
                        <button
                            ref={buttonRef}
                            onClick={() => setDropdownOpen((prev) => !prev)}
                            className="flex items-center gap-1 font-normal text-[14px] leading-[100%] tracking-[0%] bg-transparent border-none cursor-pointer p-0"
                        >
                            Недвижимость
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
                                        background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500,
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

                    {staticLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="flex items-center font-normal text-[14px] leading-[100%] tracking-[0%]"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop right actions */}
                <div className="hidden lg:flex items-center gap-2">
                    {/* City selector */}
                    <div className="relative">
                        <button
                            ref={cityButtonRef}
                            onClick={() => setCityDropdownOpen((prev) => !prev)}
                            className="flex items-center gap-1 text-[#141111] text-sm bg-white border border-[#1411111A] rounded-full px-3 py-[10px] hover:bg-gray-50 transition cursor-pointer"
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
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                    minWidth: 200,
                                    zIndex: 9999,
                                    padding: '6px 0',
                                    border: '1px solid #F0F0F0',
                                }}
                            >
                                {CITIES.map((city) => (
                                    <button
                                        key={city.value}
                                        onClick={() => handleCitySelect(city)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            width: '100%', textAlign: 'left',
                                            padding: '10px 16px', fontSize: 14,
                                            color: '#141111',
                                            fontWeight: selectedCity.value === city.value ? 600 : 400,
                                            background: 'none', border: 'none', cursor: 'pointer',
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

                    <button className="bg-white border border-[#1411111A] rounded-full p-[10px] font-normal text-[14px] transition">
                        Tg
                    </button>
                    <button className="bg-white border border-[#1411111A] text-black font-normal text-[14px] px-5 py-[10px] rounded-full hover:bg-gray-50 transition">
                        <a href="#contact">Получить консультацию</a>
                    </button>
                    <button
                        onClick={handleAgentClick}
                        className="bg-white border border-[#1411111A] rounded-full px-5 py-[10px] font-normal text-[14px] transition cursor-pointer"
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

                {/* Mobile burger */}
                <button
                    className="lg:hidden text-[#141111] p-1"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <FiMenu size={28} />
                </button>
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

                    {/* Mobile nav links - overflow yaxshilandi */}
                    <nav className="flex flex-col px-6 pt-2 gap-1 flex-1 overflow-y-auto" style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        {/* Недвижимость accordion - mobile uchun alohida state */}
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
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Все категории
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className="text-left text-white/60 text-[15px] py-2 hover:text-white transition w-full cursor-pointer"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {staticLinks.map((link) => (
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

                    {/* Mobile bottom actions - flex-shrink-0 qo'shildi */}
                    <div className="p-6 flex flex-col gap-3 flex-shrink-0">
                        {/* City selector mobile */}
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
                                            onClick={() => handleCitySelect(city)}
                                            className="flex items-center gap-3 w-full text-left px-4 py-3 text-[15px] hover:bg-white/10 transition cursor-pointer"
                                            style={{
                                                color: selectedCity.value === city.value ? '#F05D22' : '#e5e7eb',
                                                fontWeight: selectedCity.value === city.value ? 600 : 400,
                                                cursor: 'pointer'
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
                            <button
                                onClick={() => { handleAgentClick(); setMobileMenuOpen(false); }}
                                className="bg-white/90 text-black font-medium text-[14px] px-5 py-3 rounded-full transition border border-white/20 flex-1 cursor-pointer"
                            >
                                {isAuthenticated ? 'Профиль' : 'Агентам'}
                            </button>
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
        </>
    );
}