'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useApiStore from '@/store/useApiStore';

const staticLinks = [
    { label: 'Услуги', href: '/services' },
    { label: 'О компании', href: '/about' },
    { label: 'Отзывы', href: '/reviews' },
    { label: 'Блог', href: '/blog' },
    { label: 'Контакты', href: '/contacts' },
];

export default function Navbar() {
    const router = useRouter();
    const { getData } = useApiStore();
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        // Check if user is authenticated
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
        <div className="overflow-visible relative flex justify-between max-w-[1400px] mx-auto">
            <div className="p-4 lg:p-6 z-10">
                <div className="flex items-center gap-x-10">
                    <Link href={'/'}>
                        <Image
                            src="/icons/logodark.svg"
                            alt="logo"
                            width={196}
                            height={32}
                            className="w-[196px] h-8 shrink-0"
                        />
                    </Link>
                    <nav className="flex items-center gap-x-5 flex-wrap hidden lg:flex">
                        {/* Недвижимость — dropdown */}
                        <div className="relative">
                            <button
                                ref={buttonRef}
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className="flex items-center gap-1 font-normal text-[14px] leading-[100%] tracking-[0%] align-middle bg-transparent border-none cursor-pointer p-0"
                            >
                                Недвижимость
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
                                    {/* Все */}
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

                        {/* Static links */}
                        {staticLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="flex items-center font-normal text-[14px] leading-[100%] tracking-[0%] align-middle"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
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
                    <button className="bg-white border border-[#1411111A] backdrop-blur-md rounded-full p-[10px] font-normal text-[14px] leading-[100%] tracking-[0%] align-middle transition">
                        Tg
                    </button>
                    <button className="bg-white border border-[#1411111A] text-black font-normal text-[14px] px-5 py-[10px] leading-[100%] tracking-[0%] align-middle rounded-full hover:bg-white/90 transition">
                        <a href="#contact">
                            Получить консультацию
                        </a>
                    </button>
                    <button
                        onClick={handleAgentClick}
                        className="bg-white border border-[#1411111A] backdrop-blur-md rounded-full px-5 py-[10px] font-normal text-[14px] leading-[100%] tracking-[0%] align-middle transition cursor-pointer"
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
            </div>
        </div>
    );
}