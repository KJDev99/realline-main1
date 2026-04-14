'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useApiStore from '@/store/useApiStore';

const CARD_GRADIENT = 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)';

export default function WhyUs() {
    const scrollRef = useRef(null);
    const { getData } = useApiStore();
    const [cards, setCards] = useState([]);
    const cardRefs = useRef([]);
    const [cardHeight, setCardHeight] = useState('auto');

    useEffect(() => {
        getData('site/advantages/')
            .then(data => {
                const list = Array.isArray(data) ? data : data?.results || [];
                setCards([...list].sort((a, b) => a.sort_order - b.sort_order));
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (cards.length === 0) return;
        requestAnimationFrame(() => {
            const heights = cardRefs.current
                .filter(Boolean)
                .map(el => el.getBoundingClientRect().height);
            if (heights.length > 0) {
                setCardHeight(Math.max(...heights));
            }
        });
    }, [cards]);

    return (
        <>
            <style>{`
                .whyus-outer {
                    width: 100%;
                    height: calc(100vh - 10px);
                    position: relative;
                    overflow: hidden;
                    border-radius: 20px;
                }

                .whyus-scroll {
                    position: absolute;
                    inset: 0;
                    z-index: 2;
                    overflow-y: auto;
                    scrollbar-width: none;
                }
                .whyus-scroll::-webkit-scrollbar { display: none; }

                .whyus-title-sticky {
                    position: sticky;
                    top: 0;
                    z-index: 5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: calc(50vh - 10px);
                    pointer-events: none;
                }

                .whyus-cards-inner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 0 16px;
                    position: relative;
                }

                .whyus-card-sticky {
                    position: sticky;
                    top: calc(50vh - 10px - 30px);
                    width: 100%;
                    max-width: 636px;
                    margin-bottom: 24px;
                }

                ${Array.from({ length: 20 }, (_, i) =>
                `.whyus-card-sticky:nth-child(${i + 1}) { z-index: ${10 + i}; }`
            ).join('\n')}

                .whyus-bottom-space { height: 40vh; }
            `}</style>

            <div className="mx-1">
                <div className="whyus-outer">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/sec3.png"
                            alt="background"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/35 z-1" />

                    <div className="whyus-scroll" ref={scrollRef}>
                        <div className="whyus-title-sticky">
                            <h2 className="font-normal text-[30px] leading-[100%] tracking-[0%] text-center text-white px-4">
                                Почему клиенты выбирают Реаллайн
                            </h2>
                        </div>

                        <div className="whyus-cards-inner">
                            {cards.map((card, i) => (
                                <div key={card.id} className="whyus-card-sticky">
                                    <div
                                        ref={el => cardRefs.current[i] = el}
                                        className="rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.22)] p-[32px_40px] max-md:p-4 max-md:rounded-[15px] flex flex-col justify-between box-border"
                                        style={{
                                            background: CARD_GRADIENT,
                                            height: cardHeight !== 'auto' ? cardHeight : undefined,
                                        }}
                                    >
                                        <div>
                                            <span className="text-white/60 text-[14px] font-medium block mb-[10px]">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <h3 className="text-white text-[20px] font-medium mb-3 leading-[1.3]">
                                                {card.title}
                                            </h3>
                                            <p className="text-white/85 text-[16px] leading-[1.6] max-md:text-sm max-md:leading-[1.4]">
                                                {card.body}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {cards.length === 0 && Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="whyus-card-sticky">
                                    <div
                                        className="rounded-[20px] h-[160px] opacity-40 animate-pulse"
                                        style={{ background: CARD_GRADIENT }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="whyus-bottom-space" />
                    </div>
                </div>

                <div className="flex justify-center mt-6 mb-2">
                    <Link
                        href="/about"
                        className="inline-block bg-[#111] text-white font-semibold rounded-full py-4 px-9 text-[15px] no-underline transition-colors duration-200 hover:bg-[#222]"
                    >
                        Подробнее о компании
                    </Link>
                </div>
            </div>
        </>
    );
}