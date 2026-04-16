'use client';

import { getData } from '@/lib/apiService';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet marker default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

    const lat = geo?.latitude ?? 55.7558;
    const lng = geo?.longitude ?? 37.6173;

    return (
        <>
            <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
            <div className="max-w-[1400px] mx-auto px-5 pb-10">
                <h1 style={{ fontSize: 28, fontWeight: 400, color: '#111827', margin: '0 0 28px' }}>
                    Контакты
                </h1>

                <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6'>

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
                                                        width: 44, height: 44, borderRadius: 22,
                                                        background: '#fff', color: '#111827',
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
                                                        width: 44, height: 44, borderRadius: 22,
                                                        background: '#fff', color: '#111827',
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

                    {/* RIGHT — map (Grayscale) */}
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
                            <MapContainer
                                center={[lat, lng]}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={true}
                                attributionControl={false}
                            >
                                {/* Grayscale/Black & White tile layer */}
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB'
                                    subdomains="abcd"
                                />
                                <Marker position={[lat, lng]}>
                                    <Popup>
                                        {contacts?.address || 'Bizning ofis'}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}