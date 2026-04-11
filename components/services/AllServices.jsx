'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getData } from '@/lib/apiService';

function SkeletonCard() {
    return (
        <div style={{
            flex: 1,
            height: 450,
            borderRadius: 20,
            background: '#E5E7EB',
            animation: 'pulse 1.4s ease-in-out infinite',
        }} />
    );
}

export default function AllServices() {
    const router = useRouter();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getData('/site/services/')
            .then((data) => setServices(Array.isArray(data) ? data : data.results ?? []))
            .catch((err) => console.error('Ошибка загрузки услуг:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <style>{`
                @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
                @media (max-width: 767px) {
                    .all-services-grid > div {
                        height: 340px !important;
                    }
                }
            `}</style>

            <div className="max-w-[1400px] mx-auto px-5 pb-10">
                <h2 style={{ fontSize: 28, fontWeight: 400, color: '#111827', margin: '0 0 32px' }}>
                    Все услуги
                </h2>

                <div className="all-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                        : services.map((service, i) => (
                            <ServiceCard key={service.id} service={service} delay={i * 100} router={router} />
                        ))
                    }
                </div>

                {!loading && services.length === 0 && (
                    <p style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 60 }}>Услуги не найдены</p>
                )}
            </div>
        </>
    );
}

function ServiceCard({ service, delay, router }) {
    const [hovered, setHovered] = useState(false);
    const cardRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setVisible(true), delay);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [delay]);

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => router.push(`/services/${service.id}`)}
            style={{
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                height: 450,
                flex: '1 1 calc(33.333% - 12px)',
                minWidth: '280px',
                cursor: 'pointer',
                transform: visible ? 'translateY(0)' : 'translateY(60px)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease',
            }}
        >
            {/* BG image */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                transition: 'filter 0.4s ease',
                filter: hovered ? 'blur(6px) brightness(0.6)' : 'brightness(0.75)',
            }}>
                <Image src={service.image || '/imgs/herobig.png'} alt={service.title} fill className="object-cover" />
            </div>

            {/* Gradient overlay */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.55) 100%)',
                pointerEvents: 'none',
            }} />

            {/* Content */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 2,
                padding: '20px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
                <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 600, lineHeight: 1.35, maxWidth: 240 }}>
                    {service.title}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <button
                        className="md-hover-btn"
                        style={{
                            background: 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)',
                            color: '#fff', border: 'none', borderRadius: 999,
                            padding: '14px 28px', fontSize: 15, fontWeight: 500,
                            cursor: 'pointer', whiteSpace: 'nowrap',
                            opacity: hovered ? 1 : 0,
                            transform: hovered ? 'scale(1)' : 'scale(0.92)',
                            transition: 'opacity 0.3s ease, transform 0.3s ease',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/services/${service.id}`);
                        }}
                    >
                        Получить консультацию
                    </button>
                </div>

                <p style={{ fontWeight: 400, fontSize: 16, lineHeight: '100%', color: '#fff', maxWidth: 258 }}>
                    {service.body}
                </p>
            </div>
        </div>
    );
}