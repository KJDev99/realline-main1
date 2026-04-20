'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useApiStore from '@/store/useApiStore';

const CARD_GRADIENT = 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)';
const CARD_HEIGHT = 220;
const CARD_GAP = 24;
const FIXED_TOP = 320;

export default function WhyUs() {
    const { getData } = useApiStore();
    const [cards, setCards] = useState([]);
    const wrapperRef = useRef(null);
    const cardRefs = useRef([]);
    const btnRef = useRef(null);

    useEffect(() => {
        getData('site/advantages/')
            .then(data => {
                const list = Array.isArray(data) ? data : data?.results || [];
                setCards([...list].sort((a, b) => a.sort_order - b.sort_order));
            })
            .catch(() => { });
    }, []);

    const updatePositions = useCallback(() => {
        if (!wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const scrolled = window.scrollY - sectionTop;
        const totalScroll = window.innerHeight;
        const progress = Math.min(1, Math.max(0, scrolled / totalScroll));

        const count = cardRefs.current.length;
        // count ta bosqich bor, har bosqichda barcha cardlar 1 slot yuqoriga siljiydian
        // Oxirgi bosqichda 2-card FIXED_TOP ga yetadi, undan keyin 3-card, keyin 4-card
        // Jami bosqich soni = count (chunki 2-card count ta slot bosadi)
        const slotSize = 0.8 / count;

        cardRefs.current.forEach((el, i) => {
            if (!el) return;

            // Har bir card uchun joriy "virtual pozitsiya" hisoblash
            // card i ning boshlang'ich slot indeksi = i+1 (0-based: 2-card=1, 3-card=2, 4-card=3)
            // Har bosqichda barcha cardlar 1 slot yuqoriga siljiydi
            // progress/slotSize = nechta bosqich o'tdi (float)
            const stepsElapsed = Math.min(count, Math.max(0, progress / slotSize));

            // Joriy slot pozitsiyasi (float): boshlang'ich - o'tgan bosqich
            const currentSlot = (i + 1) - stepsElapsed;

            // Slot pozitsiyasini pixel ga aylantirish
            // slot 0 = FIXED_TOP, slot 1 = FIXED_TOP + 1*(H+G), va hokazo
            // Agar currentSlot < 0 bo'lsa, card FIXED_TOP da qotib qoladi
            const clampedSlot = Math.max(0, currentSlot);
            const top = FIXED_TOP + clampedSlot * (CARD_HEIGHT + CARD_GAP);
            el.style.top = `${top}px`;
        });

        if (btnRef.current) {
            // Button oxirgi card bilan birga harakatlanadi, doim undan CARD_HEIGHT + CARD_GAP pastda
            const lastCard = cardRefs.current[cardRefs.current.length - 1];
            if (lastCard) {
                const lastCardTop = parseFloat(lastCard.style.top);
                btnRef.current.style.top = `${lastCardTop + CARD_HEIGHT + CARD_GAP}px`;
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', updatePositions);
        updatePositions();
        return () => window.removeEventListener('scroll', updatePositions);
    }, [updatePositions, cards]);

    const cardStyle = { background: CARD_GRADIENT, minHeight: CARD_HEIGHT };
    const innerClass = "w-full max-w-[636px] rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.22)] p-8 max-md:p-5 max-md:rounded-[15px] flex flex-col";

    const firstCard = cards[0] ?? null;
    const restCards = cards.length > 1 ? cards.slice(1) : [null, null, null];

    return (
        <div className="mx-1" ref={wrapperRef}>
            <div style={{ height: `calc(200vh)` }}>
                <div
                    className="sticky top-0 rounded-[20px] overflow-hidden"
                    style={{ height: 'calc(100vh - 10px)' }}
                >
                    <div className="absolute inset-0 z-0">
                        <Image src="/sec3.png" alt="background" fill className="object-cover" priority />
                    </div>
                    <div className="absolute inset-0 z-[1] bg-black/35" />

                    {/* Title + 1-card: qimirlamaydi */}
                    <div className="absolute top-0 left-0 right-0 z-[2] flex flex-col items-center gap-6 py-16 px-0">
                        <h2 className="font-normal text-[30px] leading-none text-center text-white max-md:text-2xl px-4 mt-50">
                            Почему клиенты выбирают Реаллайн
                        </h2>
                        <div className="px-4 flex justify-center w-full">
                            {firstCard ? (
                                <div className={innerClass} style={cardStyle}>
                                    <span className="text-white/60 text-sm font-medium block mb-2.5">01</span>
                                    <h3 className="text-white text-xl font-medium mb-3 leading-snug max-md:text-lg">
                                        {firstCard.title}
                                    </h3>
                                    <p className="text-white/85 text-base leading-relaxed max-md:text-sm max-md:leading-snug">
                                        {firstCard.body}
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full max-w-[636px] rounded-[20px] opacity-40 animate-pulse"
                                    style={{ background: CARD_GRADIENT, minHeight: CARD_HEIGHT }} />
                            )}
                        </div>
                    </div>

                    {/* 2,3,4-cardlar */}
                    {restCards.map((card, i) => (
                        <div
                            key={card?.id ?? i}
                            ref={el => cardRefs.current[i] = el}
                            className="absolute left-0 right-0 flex justify-center px-4"
                            style={{
                                top: FIXED_TOP + (i + 1) * (CARD_HEIGHT + CARD_GAP),
                                zIndex: 3 + i,
                                transition: 'none',
                            }}
                        >
                            {card ? (
                                <div className={innerClass} style={cardStyle}>
                                    <span className="text-white/60 text-sm font-medium block mb-2.5">
                                        {String(i + 2).padStart(2, '0')}
                                    </span>
                                    <h3 className="text-white text-xl font-medium mb-3 leading-snug max-md:text-lg">
                                        {card.title}
                                    </h3>
                                    <p className="text-white/85 text-base leading-relaxed max-md:text-sm max-md:leading-snug">
                                        {card.body}
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full max-w-[636px] rounded-[20px] opacity-40 animate-pulse"
                                    style={{ background: CARD_GRADIENT, minHeight: CARD_HEIGHT }} />
                            )}
                        </div>
                    ))}

                    {/* Button */}
                    <div
                        ref={btnRef}
                        className="absolute left-0 right-0 flex justify-center px-4"
                        style={{
                            top: FIXED_TOP + (restCards.length + 1) * (CARD_HEIGHT + CARD_GAP),
                            zIndex: 10,
                        }}
                    >
                        <Link
                            href="/about"
                            className="bg-transparent border border-[#FFFFFF] w-[636px] max-md:w-full flex justify-center items-center text-white font-semibold rounded-full py-4 px-9 text-[15px] no-underline transition-colors duration-200  max-md:text-sm max-md:py-3 max-md:px-7"
                        >
                            Подробнее о компании
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}