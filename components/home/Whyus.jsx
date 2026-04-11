'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useApiStore from '@/store/useApiStore';

const CARD_GRADIENT =
    'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)';

export default function WhyUs() {
    const scrollRef = useRef(null);
    const { getData } = useApiStore();
    const [cards, setCards] = useState([]);

    // For equal card heights — measure tallest card
    const cardRefs = useRef([]);
    const [cardHeight, setCardHeight] = useState('auto');

    useEffect(() => {
        getData('site/advantages/')
            .then(data => {
                const list = Array.isArray(data) ? data : data?.results || [];
                setCards([...list].sort((a, b) => a.sort_order - b.sort_order));
            })
            .catch(() => { });
    }, []); // eslint-disable-line

    // After cards render — measure and equalize heights
    useEffect(() => {
        if (cards.length === 0) return;
        // Wait one frame for DOM to paint
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

                /* Title: sticky but only within the outer box,
                   stays at top — does NOT overlap the card area */
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

            <div className="mr-1 ml-1">
                {/* ── Scrollable section ── */}
                <div className="whyus-outer">
                    {/* BG image */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        <Image
                            src="/sec3.png"
                            alt="background"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    {/* Overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1 }} />

                    <div className="whyus-scroll" ref={scrollRef}>
                        {/* Sticky title — occupies top half, card stacking starts below it */}
                        <div className="whyus-title-sticky">
                            <h2 className="font-normal text-[30px] leading-[100%] tracking-[0%] text-center text-white px-4">
                                Почему клиенты выбирают Реаллайн
                            </h2>
                        </div>

                        {/* Cards */}
                        <div className="whyus-cards-inner">
                            {cards.map((card, i) => (
                                <div key={card.id} className="whyus-card-sticky">
                                    <div
                                        ref={el => cardRefs.current[i] = el}
                                        style={{
                                            background: CARD_GRADIENT,
                                            borderRadius: '20px',
                                            boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
                                            padding: '32px 40px',
                                            height: cardHeight !== 'auto' ? cardHeight : undefined,
                                            boxSizing: 'border-box',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div>
                                            <span style={{
                                                color: 'rgba(255,255,255,0.6)',
                                                fontSize: 14,
                                                fontWeight: 500,
                                                display: 'block',
                                                marginBottom: 10,
                                            }}>
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <h3 style={{
                                                color: '#fff',
                                                fontSize: 20,
                                                fontWeight: 500,
                                                marginBottom: 12,
                                                lineHeight: 1.3,
                                            }}>
                                                {card.title}
                                            </h3>
                                            <p style={{
                                                color: 'rgba(255,255,255,0.85)',
                                                fontSize: 16,
                                                lineHeight: 1.6,
                                            }}>
                                                {card.body}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Skeleton cards while loading */}
                            {cards.length === 0 && Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="whyus-card-sticky">
                                    <div style={{
                                        background: CARD_GRADIENT,
                                        borderRadius: '20px',
                                        height: 160,
                                        opacity: 0.4,
                                        animation: 'pulse 1.4s ease-in-out infinite',
                                    }} />
                                </div>
                            ))}
                        </div>

                        <div className="whyus-bottom-space" />
                    </div>
                </div>

                {/* ── Button — OUTSIDE the scrollable bg section ── */}
                <div className="flex justify-center mt-6 mb-2">
                    <Link
                        href="/about"
                        style={{
                            display: 'inline-block',
                            background: '#111',
                            color: '#fff',
                            fontWeight: 600,
                            borderRadius: 999,
                            padding: '16px 36px',
                            fontSize: 15,
                            textDecoration: 'none',
                            transition: 'background 0.2s',
                        }}
                    >
                        Подробнее о компании
                    </Link>
                </div>
            </div>
        </>
    );
}