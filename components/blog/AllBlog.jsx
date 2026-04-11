'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getData } from '@/lib/apiService';

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function CardSkeleton() {
    return (
        <div>
            <div style={{ width: '100%', height: 280, borderRadius: 16, background: '#E5E7EB', marginBottom: 16, animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 20, background: '#E5E7EB', borderRadius: 6, marginBottom: 10, width: '80%', animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 14, background: '#E5E7EB', borderRadius: 6, width: '55%', animation: 'pulse 1.4s ease-in-out infinite' }} />
        </div>
    );
}

export default function AllBlog() {
    const router = useRouter();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getData('/site/articles/')
            .then((data) => setArticles(Array.isArray(data) ? data : data.results ?? []))
            .catch((err) => console.error('Ошибка загрузки статей:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
            <div className="max-w-[1400px] mx-auto px-5 pb-10">
                <h2 style={{ fontSize: 28, fontWeight: 400, color: '#111827', margin: '0 0 32px' }}>
                    Полезные статьи о недвижимости
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
                        : articles.map((article) => (
                            <div
                                key={article.id}
                                style={{ cursor: 'pointer' }}
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

                {!loading && articles.length === 0 && (
                    <p style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 60 }}>Статьи не найдены</p>
                )}
            </div>
        </>
    );
}