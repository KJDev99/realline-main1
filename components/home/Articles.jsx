'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { getData } from '@/lib/apiService';

const CARD_W = 416;
const CARD_GAP = 24;

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function CardSkeleton() {
    return (
        <div style={{ flexShrink: 0, width: CARD_W }}>
            <div style={{ width: '100%', height: 280, borderRadius: 16, background: '#E5E7EB', marginBottom: 16, animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 20, background: '#E5E7EB', borderRadius: 6, marginBottom: 10, width: '80%', animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 14, background: '#E5E7EB', borderRadius: 6, width: '60%', animation: 'pulse 1.4s ease-in-out infinite' }} />
        </div>
    );
}

export default function Articles() {
    const scrollRef = useRef(null);
    const router = useRouter();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getData('/site/articles/')
            .then((data) => setArticles(Array.isArray(data) ? data : data.results ?? []))
            .catch((err) => console.error('Ошибка загрузки статей:', err))
            .finally(() => setLoading(false));
    }, []);

    const scrollBy = (dir) => {
        scrollRef.current?.scrollBy({ left: dir * (CARD_W + CARD_GAP), behavior: 'smooth' });
    };

    return (
        <>
            <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
            <section className="w-full bg-white py-12 px-5 md:px-10 max-w-350 mx-auto">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 400, color: '#111827', margin: 0 }}>
                        Полезные статьи о недвижимости
                    </h2>
                    <Link href="/blog">
                        <button style={{
                            background: 'none', border: 'none',
                            fontSize: 14, color: '#9CA3AF',
                            cursor: 'pointer', padding: 0,
                        }}>
                            Смотреть все
                        </button>
                    </Link>
                </div>

                {/* Slider */}
                <div
                    ref={scrollRef}
                    style={{
                        display: 'flex',
                        gap: CARD_GAP,
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        paddingBottom: 4,
                    }}
                >
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                        : articles.map((article) => (
                            <div
                                key={article.id}
                                style={{ flexShrink: 0, width: CARD_W, cursor: 'pointer' }}
                                onClick={() => router.push(`/blog/${article.slug}`)}
                            >
                                {/* Image */}
                                <div style={{ position: 'relative', width: '100%', height: 280, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                                    <Image
                                        src={article.image || '/sec5.png'}
                                        alt={article.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div style={{
                                        position: 'absolute', top: 14, left: 14,
                                        background: 'rgba(255,255,255,0.18)',
                                        backdropFilter: 'blur(8px)',
                                        WebkitBackdropFilter: 'blur(8px)',
                                        borderRadius: 999,
                                        padding: '6px 14px',
                                        fontSize: 14,
                                        color: '#fff',
                                        fontWeight: 400,
                                    }}>
                                        {formatDate(article.published_at)}
                                    </div>
                                </div>

                                {/* Text */}
                                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
                                    {article.title}
                                </h3>
                                <p style={{ fontSize: 14, color: '#9CA3AF', margin: 0 }}>
                                    {article.description}
                                </p>
                            </div>
                        ))
                    }
                </div>

                {/* Arrows */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                    {[{ dir: -1, Icon: FiArrowLeft }, { dir: 1, Icon: FiArrowRight }].map(({ dir, Icon }) => (
                        <button
                            key={dir}
                            onClick={() => scrollBy(dir)}
                            style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: '#F3F4F6', border: 'none',
                                cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#E5E7EB'}
                            onMouseOut={e => e.currentTarget.style.background = '#F3F4F6'}
                        >
                            <Icon size={16} color="#6B7280" />
                        </button>
                    ))}
                </div>
            </section>
        </>
    );
}