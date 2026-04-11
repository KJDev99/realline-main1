'use client';

import React, { useEffect, useRef } from 'react';

const items = [
    { label: 'строительство дома' },
    { label: 'инвестиции' },
    { label: 'коммерческие проекты' },
];

export default function Home1() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    section.classList.add('is-visible');
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style>{`
        .home1-section .anim-top {
          opacity: 0;
          transform: translateY(-40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .home1-section .anim-bottom {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .home1-section.is-visible .anim-top {
          opacity: 1;
          transform: translateY(0);
        }
        .home1-section.is-visible .anim-bottom {
          opacity: 1;
          transform: translateY(0);
        }
        .home1-section .anim-top:nth-child(2) { transition-delay: 0.1s; }
        .home1-section.is-visible .anim-bottom:nth-child(1) { transition-delay: 0.3s; }
        .home1-section.is-visible .anim-bottom:nth-child(2) { transition-delay: 0.45s; }
        .home1-section.is-visible .anim-bottom:nth-child(3) { transition-delay: 0.6s; }
      `}</style>

            <section
                ref={sectionRef}
                className="home1-section flex flex-col items-center justify-center py-24 px-4  text-center"
            >
                <h2 className="anim-top font-normal text-[20px] lg:text-[30px] leading-[100%] tracking-[0%] text-center align-middle">
                    Помогаем купить земельный участок<br />или недвижимость без скрытых рисков
                </h2>
                <p className="anim-top font-normal text-[14px] lg:text-[14px] w-[335px] leading-[100%] tracking-[0%] text-center align-middle lg:w-[636px] mt-[30px]">
                    Работаем только с проверенными объектами и сопровождаем клиента на каждом
                    этапе сделки — от подбора до регистрации
                </p>

                {/* BOTTOM animations — items */}
                <p className="anim-bottom font-normal text-[16px] lg:text-[20px] leading-[100%] tracking-[0%] text-center align-middle mt-10">
                    Подбор объектов под задачи клиента:
                </p>

                <div className="mt-6 flex items-start gap-0 w-full max-w-2xl">
                    {items.map((item, i) => (
                        <div key={i} className="anim-bottom font-normal text-[14px] lg:text-[16px] leading-[100%] tracking-[0%] flex-1 flex flex-col items-center">
                            {/* dot + line */}
                            <div className="flex items-center w-full">
                                {/* left line (hidden for first) */}
                                <div className={`flex-1 h-px ${i === 0 ? 'bg-transparent' : 'bg-gray-300'}`} />
                                <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                                {/* right line (hidden for last) */}
                                <div className={`flex-1 h-px ${i === items.length - 1 ? 'bg-transparent' : 'bg-gray-300'}`} />
                            </div>
                            <span className="mt-2 max-md:text-sm text-[#141111]">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}