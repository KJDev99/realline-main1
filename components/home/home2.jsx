'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CITY_STORAGE_KEY = 'selected_city';
const DEFAULT_CITY = 'moscow';
const SELECTED_CITY_EVENT = 'selected-city-changed';

export default function Home2() {
    const sectionRef = useRef(null);
    const imgRef = useRef(null);
    const logoRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    once: true,
                },
            });

            // Rasm tepadan tushadi
            tl.from(imgRef.current, {
                y: -60,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out',
            });

            // Logo tepadan tushadi
            tl.from(logoRef.current, {
                y: -30,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
            }, '-=0.4');

            // Sarlavha pastdan chiqadi
            tl.from(titleRef.current, {
                y: 40,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
            }, '-=0.3');

            // Tavsif pastdan chiqadi
            tl.from(subtitleRef.current, {
                y: 30,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out',
            }, '-=0.3');
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const syncFromStorage = () => {
            const savedCity = localStorage.getItem(CITY_STORAGE_KEY) || DEFAULT_CITY;
            setSelectedCity(savedCity);
        };

        syncFromStorage();

        const onStorage = (e) => {
            if (e.key === CITY_STORAGE_KEY || e.key === null) {
                syncFromStorage();
            }
        };

        window.addEventListener('storage', onStorage);
        window.addEventListener(SELECTED_CITY_EVENT, syncFromStorage);

        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener(SELECTED_CITY_EVENT, syncFromStorage);
        };
    }, []);

    const isSpb = selectedCity === 'saint_petersburg';

    return (
        <section ref={sectionRef} className="w-full px-1 py-10">
            <div
                ref={imgRef}
                className="relative w-full rounded-2xl overflow-hidden "
                style={{ height: '640px' }}
            >
                <Image
                    key={selectedCity}
                    src={isSpb ? '/secst.jpg' : '/sec1.png'}
                    alt="Реаллайн — недвижимость"
                    fill
                    className="object-cover"
                    priority
                />

                {/* Black/20 + vignette shadow curtain */}
                <div
                    className="pointer-events-none absolute inset-0 z-1 bg-black/20 shadow-[inset_0_0_140px_rgba(0,0,0,0.45)]"
                    aria-hidden
                />

                {/* Centered content */}
                <div className="absolute inset-0 z-2 flex flex-col items-center justify-center gap-3 text-white text-center px-4">
                    {/* Logo icon + text */}
                    <div ref={logoRef} className="flex flex-col items-center gap-2">
                        <Image
                            src="/icons/seclogo.svg"
                            alt="icon"
                            width={250.18634033203125}
                            height={95.8643798828125}
                            className=""
                        />

                    </div>
                    <p ref={titleRef} className="font-normal text-[16px] leading-[100%] tracking-[0%] text-center align-middle text-white/90 mt-1">
                        {isSpb
                            ? 'Специалисты по недвижимости, в Санкт-Петербурге и Ленинградской области'
                            : 'Специалисты по недвижимости, в Москве и Московской области'}
                    </p>
                </div>
            </div>
        </section>
    );
}