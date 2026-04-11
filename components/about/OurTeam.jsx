'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { getData } from '@/lib/apiService';

const CARD_W = 306;
const CARD_GAP = 20;

function SkeletonCard() {
    return (
        <div style={{ flexShrink: 0, width: CARD_W }}>
            <div style={{
                width: CARD_W, height: 280, borderRadius: 16,
                background: '#E5E7EB', marginBottom: 14,
                animation: 'pulse 1.4s ease-in-out infinite',
            }} />
            <div style={{ height: 16, background: '#E5E7EB', borderRadius: 6, width: '70%', marginBottom: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 12, background: '#E5E7EB', borderRadius: 6, width: '90%', marginBottom: 6, animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 12, background: '#E5E7EB', borderRadius: 6, width: '60%', animation: 'pulse 1.4s ease-in-out infinite' }} />
        </div>
    );
}

export default function OurTeam() {
    const scrollRef = useRef(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getData('/site/team/')
            .then((data) => setMembers(Array.isArray(data) ? data : data.results ?? []))
            .catch((err) => console.error('Ошибка загрузки команды:', err))
            .finally(() => setLoading(false));
    }, []);

    const scrollBy = (dir) => {
        scrollRef.current?.scrollBy({ left: dir * (CARD_W + CARD_GAP) * 2, behavior: 'smooth' });
    };

    return (
        <>
            <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
            <section className="w-full bg-white py-12 px-5 md:px-10 max-w-[1400px] mx-auto">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <h2 style={{ fontSize: 28, fontWeight: 400, color: '#111827', margin: 0 }}>
                        Наша команда
                    </h2>
                    <div style={{ display: 'flex', gap: 8 }}>
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
                        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                        : members.map((member) => (
                            <div key={member.id} style={{ flexShrink: 0, width: CARD_W }}>
                                {/* Photo */}
                                <div style={{
                                    position: 'relative',
                                    width: CARD_W,
                                    height: 280,
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                    marginBottom: 14,
                                    background: '#F3F4F6',
                                }}>
                                    {member.photo && (
                                        <Image
                                            src={member.photo}
                                            alt={member.full_name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                {/* Info */}
                                <p style={{ fontSize: 16, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>
                                    {member.full_name}
                                </p>
                                <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 4px' }}>
                                    {member.role}
                                </p>
                                <p className='line-clamp-1' style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                                    Опыт работы <strong style={{ color: '#111827' }}>{member.experience}</strong>
                                </p>
                            </div>
                        ))
                    }
                </div>
            </section>
        </>
    );
}