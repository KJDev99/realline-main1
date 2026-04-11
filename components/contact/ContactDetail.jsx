'use client';

import { getData } from '@/lib/apiService';
import React, { useEffect, useState } from 'react';

function SkeletonLine({ w = '60%', h = 16, mb = 8 }) {
    return (
        <div style={{
            width: w, height: h, borderRadius: 6,
            background: '#E5E7EB', marginBottom: mb,
            animation: 'pulse 1.4s ease-in-out infinite',
        }} />
    );
}

export default function ContactDetail() {
    const [contacts, setContacts] = useState(null);
    const [geo, setGeo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getData('/site/contacts/').catch(() => null),
            getData('/site/geo/').catch(() => null),
        ]).then(([contactsData, geoData]) => {
            setContacts(contactsData);
            setGeo(geoData);
        }).finally(() => setLoading(false));
    }, []);

    // Map center: geo dan yoki contacts addressdan default Moscow
    const lat = geo?.latitude ?? 55.7558;
    const lng = geo?.longitude ?? 37.6173;
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.3}%2C${lat - 0.2}%2C${lng + 0.3}%2C${lat + 0.2}&layer=mapnik&marker=${lat}%2C${lng}`;

    return (
        <>
            <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
            <div className="max-w-[1400px] mx-auto px-5 pb-10">
                <h1 style={{ fontSize: 28, fontWeight: 400, color: '#111827', margin: '0 0 28px' }}>
                    Контакты
                </h1>

                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* LEFT — contact info */}
                    <div style={{
                        flex: '1 1 320px',
                        background: '#F9FAFB',
                        borderRadius: 16,
                        padding: '28px 32px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 24,
                        minWidth: 280,
                    }}>
                        {loading ? (
                            <>
                                <div>
                                    <SkeletonLine w="40%" h={12} mb={10} />
                                    <SkeletonLine w="65%" h={28} mb={0} />
                                </div>
                                <div>
                                    <SkeletonLine w="50%" h={12} mb={10} />
                                    <SkeletonLine w="55%" h={18} mb={0} />
                                </div>
                                <div>
                                    <SkeletonLine w="30%" h={12} mb={10} />
                                    <SkeletonLine w="75%" h={18} mb={6} />
                                    <SkeletonLine w="70%" h={18} mb={0} />
                                </div>
                                <div>
                                    <SkeletonLine w="35%" h={12} mb={10} />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <SkeletonLine w={40} h={36} mb={0} />
                                        <SkeletonLine w={40} h={36} mb={0} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Phone */}
                                {contacts?.phone && (
                                    <div>
                                        <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 6px' }}>Телефон</p>
                                        <a
                                            href={`tel:${contacts.phone.replace(/\s/g, '')}`}
                                            style={{ fontSize: 26, fontWeight: 400, color: '#111827', textDecoration: 'none', display: 'block' }}
                                        >
                                            {contacts.phone}
                                        </a>
                                    </div>
                                )}

                                {/* Email */}
                                {contacts?.email && (
                                    <div>
                                        <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 6px' }}>Электронная почта</p>
                                        <a
                                            href={`mailto:${contacts.email}`}
                                            style={{ fontSize: 16, color: '#111827', textDecoration: 'none' }}
                                        >
                                            {contacts.email}
                                        </a>
                                    </div>
                                )}

                                {/* Office + hours */}
                                {(contacts?.address || contacts?.work_hours) && (
                                    <div>
                                        <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 6px' }}>Офис</p>
                                        {contacts.address && (
                                            <p style={{ fontSize: 16, color: '#111827', margin: '0 0 4px' }}>{contacts.address}</p>
                                        )}
                                        {contacts.work_hours && (
                                            <p style={{ fontSize: 15, color: '#111827', margin: 0 }}>{contacts.work_hours}</p>
                                        )}
                                    </div>
                                )}

                                {/* Social */}
                                {(contacts?.telegram_url || contacts?.vk_url) && (
                                    <div>
                                        <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 10px' }}>Соц. сети</p>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {contacts.telegram_url && (
                                                <a
                                                    href={contacts.telegram_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        width: 44, height: 36, borderRadius: 8,
                                                        background: '#E5E7EB', color: '#111827',
                                                        fontSize: 14, fontWeight: 500, textDecoration: 'none',
                                                    }}
                                                >
                                                    Tg
                                                </a>
                                            )}
                                            {contacts.vk_url && (
                                                <a
                                                    href={contacts.vk_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        width: 44, height: 36, borderRadius: 8,
                                                        background: '#E5E7EB', color: '#111827',
                                                        fontSize: 14, fontWeight: 500, textDecoration: 'none',
                                                    }}
                                                >
                                                    Вк
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* RIGHT — map */}
                    <div style={{
                        flex: '2 1 460px',
                        height: 420,
                        borderRadius: 16,
                        overflow: 'hidden',
                        minWidth: 300,
                        background: '#E5E7EB',
                    }}>
                        {loading ? (
                            <div style={{ width: '100%', height: '100%', background: '#E5E7EB', animation: 'pulse 1.4s ease-in-out infinite' }} />
                        ) : (
                            <iframe
                                src={mapSrc}
                                width="100%"
                                height="100%"
                                style={{ border: 'none', display: 'block' }}
                                title="Карта офиса"
                                loading="lazy"
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}