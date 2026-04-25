'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronDown, FiMenu, FiX, FiMapPin } from 'react-icons/fi';
import useApiStore from '@/store/useApiStore';
import { postData } from '@/lib/apiService';
import toast, { Toaster } from 'react-hot-toast';

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
            await postData('/site/consultation/', {
                name, phone
            });
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
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease',
                }}
            />
            {/* Modal */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1001,
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

    const [modalOpen, setModalOpen] = useState(false);
    function handleZayavka() { setModalOpen(true); }

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

    // YANGI
    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setCityDropdownOpen(false);
        document.cookie = `selected_city=${city.value};path=/;max-age=31536000`;
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
                <Toaster position="top-right" />
                <ZayavkaModal open={modalOpen} onClose={() => setModalOpen(false)} />
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
                                    minWidth: 240,
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
                                    <div key={cat.id} style={{ position: 'relative' }}
                                        onMouseEnter={e => {
                                            if (cat.sub_category?.length > 0)
                                                e.currentTarget.querySelector('.sub-menu').style.display = 'block';
                                        }}
                                        onMouseLeave={e => {
                                            if (cat.sub_category?.length > 0)
                                                e.currentTarget.querySelector('.sub-menu').style.display = 'none';
                                        }}
                                    >
                                        <button
                                            onClick={() => handleCategoryClick(cat.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                width: '100%', textAlign: 'left',
                                                padding: '10px 20px', fontSize: 14, color: '#374151',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            {cat.main_category}
                                            {cat.sub_category?.length > 0 && (
                                                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ flexShrink: 0 }}>
                                                    <path d="M1 1l6 5-6 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>
                                        {cat.sub_category?.length > 0 && (
                                            <div className="sub-menu" style={{
                                                display: 'none', position: 'absolute',
                                                top: 0, left: '100%',
                                                background: '#fff', borderRadius: 14,
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                                minWidth: 200, zIndex: 9999,
                                                padding: '8px 0', border: '1px solid #F0F0F0',
                                            }}>
                                                {cat.sub_category.map(sub => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => handleCategoryClick(sub.id)}
                                                        style={{
                                                            display: 'block', width: '100%', textAlign: 'left',
                                                            padding: '10px 20px', fontSize: 14, color: '#374151',
                                                            background: 'none', border: 'none', cursor: 'pointer',
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                    >
                                                        {sub.sub_category}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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
                    <button onClick={handleZayavka} className="bg-white border border-[#1411111A] text-black font-normal text-[14px] px-5 py-[10px] rounded-full hover:bg-gray-50 transition">
                        Получить консультацию
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
                                    >
                                        Все категории
                                    </button>
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="w-full">
                                            <button
                                                onClick={() => handleCategoryClick(cat.id)}
                                                className="text-left text-white/80 text-[15px] py-2 font-medium hover:text-white transition w-full cursor-pointer"
                                            >
                                                {cat.main_category}
                                            </button>
                                            {cat.sub_category?.length > 0 && (
                                                <div className="flex flex-col pl-4 gap-1">
                                                    {cat.sub_category.map(sub => (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => handleCategoryClick(sub.id)}
                                                            className="text-left text-white/60 text-[14px] py-1.5 hover:text-white transition w-full cursor-pointer"
                                                        >
                                                            {sub.sub_category}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
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
                                <a onClick={() => { setMobileMenuOpen(false); handleZayavka() }}>Получить консультацию</a>
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