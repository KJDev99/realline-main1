'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home2() {
    const sectionRef = useRef(null);
    const imgRef = useRef(null);
    const logoRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);

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

    return (
        <section ref={sectionRef} className="w-full px-1 py-10">
            <div
                ref={imgRef}
                className="relative w-full rounded-2xl overflow-hidden"
                style={{ height: '640px' }}
            >
                <Image
                    src="/sec1.png"
                    alt="Реаллайн — недвижимость"
                    fill
                    className="object-cover"
                    priority
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-[#1411111A]" />

                {/* Centered content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white text-center px-4">
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
                        Специалисты по недвижимости, в Москве и Московской области
                    </p>
                </div>
            </div>
        </section>
    );
}