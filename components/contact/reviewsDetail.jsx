'use client';

import { getData } from '@/lib/apiService';
import React, { useEffect, useState } from 'react';

function SkeletonCard() {
    return (
        <div style={{
            background: '#F3F4F6',
            borderRadius: 12,
            padding: '20px',
            animation: 'pulse 1.4s ease-in-out infinite',
        }}>
            <div style={{ height: 12, background: '#E5E7EB', borderRadius: 6, width: '60%', marginBottom: 12 }} />
            <div style={{ height: 10, background: '#E5E7EB', borderRadius: 6, width: '100%', marginBottom: 6 }} />
            <div style={{ height: 10, background: '#E5E7EB', borderRadius: 6, width: '85%', marginBottom: 6 }} />
            <div style={{ height: 10, background: '#E5E7EB', borderRadius: 6, width: '70%' }} />
        </div>
    );
}

export default function ReviewsDetail() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getData('/site/reviews/')
            .then((data) => setReviews(Array.isArray(data) ? data : data.results ?? []))
            .catch((err) => console.error('Ошибка загрузки отзывов:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }`}</style>
            <div className="max-w-[1400px] mx-auto px-5 pb-10">
                <h2 style={{ fontSize: 28, fontWeight: 400, color: '#111827', margin: '0 0 28px' }}>
                    Отзывы наших клиентов
                </h2>

                <div className='max-md:grid-cols-1 grid grid-cols-4 gap-4' >
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                        : reviews.map((review) => (
                            <div
                                key={review.id}
                                style={{
                                    background: '#141111',

                                    borderRadius: 12,
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 10,
                                }}
                            >
                                <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: 0, color: 'white' }}>
                                    {review.author_name}{review.city ? `, ${review.city}` : ''}
                                </p>
                                <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, margin: 0, color: '#fff' }}>
                                    {review.text}
                                </p>
                            </div>
                        ))
                    }
                </div>

                {!loading && reviews.length === 0 && (
                    <p style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 60 }}>Отзывов пока нет</p>
                )}
            </div>
        </>
    );
}