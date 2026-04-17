'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { getData } from '@/lib/apiService';
import Link from 'next/link';

export default function Reviews() {
    const sectionRef = useRef(null);
    const scrollRef = useRef(null);
    const [animated, setAnimated] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getData('/site/reviews/')
            .then((data) => setReviews(Array.isArray(data) ? data : data.results ?? []))
            .catch((err) => console.error('Ошибка загрузки отзывов:', err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAnimated(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    const scrollBy = (dir) => {
        scrollRef.current?.scrollBy({ left: dir * (306 + 24), behavior: 'smooth' });
    };

    const cardCount = loading ? 5 : reviews.length;

    return (
        <>
            <style>{`
                .reviews-outer {
                    width: calc(100% - 10px);
                    height: 750px;
                    position: relative;
                    border-radius: 20px;
                    overflow: hidden;
                    margin: 0 auto;
                }

                .reviews-scroll-row {
                    display: flex;
                    gap: 24px;
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding: 0 28px;
                    align-items: center;
                    height: 100%;
                    box-sizing: border-box;
                }
                .reviews-scroll-row::-webkit-scrollbar { display: none; }

                .review-card {
                    flex-shrink: 0;
                    width: 306px;
                    height: 200px;
                    opacity: 0;
                    transform: translateX(60px);
                    transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.22,1,0.36,1);
                }
                .review-card.visible { opacity: 1; transform: translateX(0); }
                ${Array.from({ length: cardCount }).map((_, i) => `.review-card:nth-child(${i + 1}).visible { transition-delay: ${i * 0.07}s; }`).join('\n')}

                .review-card-inner {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(1px);
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.12);
                    padding: 24px 24px 28px;
                    height: 100%;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .reviews-title {
                    font-weight: 400;
                    font-size: 30px;
                    line-height: 100%;
                    color: white;
                    position: absolute;
                    top: 100px;
                    left: 67px;
                    z-index: 20;
                }

                .reviews-all-btn {
                    z-index: 20;
                    position: absolute;
                    top: 100px;
                    right: 67px;
                    font-size: 14px;
                    color: white;
                    width: 132px;
                    height: 38px;
                    border-radius: 999px;
                    backdrop-filter: blur(10px);
                    background: rgba(255,255,255,0.15);
                    border: none;
                    cursor: pointer;
                }

                .reviews-arrows {
                    position: absolute;
                    bottom: 100px;
                    right: 67px;
                    z-index: 10;
                    display: flex;
                    gap: 8px;
                }

                .review-skeleton {
                    background: rgba(255,255,255,0.06);
                    border-radius: 12px;
                    animation: pulse 1.4s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }

                /* ── MOBILE ── */
                @media (max-width: 767px) {
                    .reviews-outer {
                        height: 411px !important;
                        width: 100% !important;
                        border-radius: 16px;
                    }

                    .reviews-title {
                        font-size: 18px !important;
                        top: 24px !important;
                        left: 16px !important;
                        right: 16px;
                    }

                    .reviews-all-btn {
                        top: 24px !important;
                        right: 16px !important;
                        width: 110px !important;
                        height: 32px !important;
                        font-size: 12px !important;
                    }

                    .reviews-scroll-row {
                        padding: 70px 16px 0 16px !important;
                        gap: 12px !important;
                        align-items: center !important;
                        height: 100% !important;
                        box-sizing: border-box;
                    }

                    .review-card {
                        width: 240px !important;
                        height: 170px !important;
                    }

                    .review-card-inner {
                        padding: 16px !important;
                        border-radius: 12px !important;
                    }

                    .reviews-arrows {
                        bottom: 20px !important;
                        right: 16px !important;
                    }
                }
            `}</style>

            <section ref={sectionRef} style={{ padding: '5px 0' }}>
                <div className="reviews-outer">
                    {/* BG image */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        <Image
                            src="/sec4.png"
                            alt="bg"
                            fill
                            className="object-cover"
                            priority
                        />

                        {/* overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: '#1411111A',
                            }}
                        />
                    </div>

                    {/* Header */}
                    <h2 className="reviews-title">Отзывы наших клиентов</h2>
                    <Link href="/reviews" className="reviews-all-btn flex items-center justify-center">
                        Смотреть все
                    </Link>

                    {/* Cards */}
                    <div ref={scrollRef} className="reviews-scroll-row" style={{ position: 'relative', zIndex: 5 }}>
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className={`review-card ${animated ? 'visible' : ''}`}>
                                    <div className="review-card-inner" style={{ gap: 12 }}>
                                        <div className="review-skeleton" style={{ height: 14, width: '60%', borderRadius: 6 }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, marginTop: 16 }}>
                                            <div className="review-skeleton" style={{ height: 12, width: '100%', borderRadius: 6 }} />
                                            <div className="review-skeleton" style={{ height: 12, width: '85%', borderRadius: 6 }} />
                                            <div className="review-skeleton" style={{ height: 12, width: '70%', borderRadius: 6 }} />
                                        </div>
                                    </div>
                                </div>
                            ))
                            : reviews.map((review, i) => (
                                <div key={review.id} className={`review-card ${animated ? 'visible' : ''}`}>
                                    <div className="review-card-inner">
                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: '100%' }}>
                                            {review.author_name}{review.city ? `, ${review.city}` : ''}
                                        </p>
                                        <p style={{
                                            fontSize: 14,
                                            lineHeight: '150%',
                                            color: 'white',
                                            marginTop: 12,
                                            flex: 1,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 5,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {review.text}
                                        </p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    {/* Arrows */}
                    <div className="reviews-arrows">
                        {[{ dir: -1, Icon: FiArrowLeft }, { dir: 1, Icon: FiArrowRight }].map(({ dir, Icon }) => (
                            <button
                                key={dir}
                                onClick={() => scrollBy(dir)}
                                style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Icon size={16} color="#fff" />
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}