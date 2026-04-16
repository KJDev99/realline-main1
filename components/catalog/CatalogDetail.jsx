'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import HomeLink from '../homeLink';
import useApiStore from '@/store/useApiStore';
import { useRouter } from 'next/navigation'
import { FiHeart, FiBarChart2 } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { useFavoriteCompare } from '@/store/useFavoriteCompare'
const ORANGE = 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)';

function formatPrice(p) {
    return Number(p).toLocaleString('ru-RU');
}

function SkeletonBlock({ w = '100%', h = 20, mb = 12 }) {
    return <div style={{ width: w, height: h, borderRadius: 6, background: '#E5E7EB', marginBottom: mb, animation: 'detail-pulse 1.4s ease-in-out infinite' }} />;
}

function BoolRow({ label, value }) {
    if (value === null || value === undefined || value === '') return null;
    return (
        <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151', marginBottom: 6 }}>
            <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: value ? ORANGE : '#D1D5DB',
                display: 'inline-block',
            }} />
            {label}
        </li>
    );
}

function InfoRow({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', padding: '10px 0', fontSize: 14 }}>
            <span style={{ color: '#9CA3AF' }}>{label}</span>
            <span style={{ color: '#111827', fontWeight: 500 }}>{value}</span>
        </div>
    );
}

/* ─── Image gallery ─── */
function Gallery({ images }) {
    const [active, setActive] = useState(0);
    const fallback = "/sec2.png";
    const imgs = images?.length > 0 ? images : [fallback];

    const getImgSrc = (img) =>
        typeof img === "string" ? img : img?.image ?? fallback;

    return (
        <div style={{ width: "100%" }}>
            <div style={{
                position: "relative", width: "100%", aspectRatio: "16 / 9",
                borderRadius: 16, overflow: "hidden", marginBottom: 10,
            }}>
                <Image
                    src={getImgSrc(imgs[active])} alt="property" fill
                    className="object-cover" priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
            </div>
            {imgs.length > 1 && (
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "thin" }}>
                    {imgs.map((img, i) => (
                        <div key={i} onClick={() => setActive(i)} style={{
                            flexShrink: 0,
                            width: "clamp(64px, 14vw, 100px)",
                            height: "clamp(46px, 10vw, 72px)",
                            borderRadius: 10, overflow: "hidden", cursor: "pointer", position: "relative",
                            border: i === active ? "2px solid #F05D22" : "2px solid transparent",
                            transition: "border-color 0.2s, opacity 0.2s",
                            opacity: i === active ? 1 : 0.72,
                        }}>
                            <Image src={getImgSrc(img)} alt={`thumb-${i}`} fill className="object-cover" sizes="120px" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Map embed ─── */
function MapBlock({ lat, lng }) {
    if (!lat || !lng) return null;
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.015}%2C${lng + 0.02}%2C${lat + 0.015}&layer=mapnik&marker=${lat}%2C${lng}`;
    return (
        <div style={{ borderRadius: 16, overflow: 'hidden', height: 300, marginTop: 24 }}>
            <iframe src={mapSrc} width="100%" height="100%" style={{ border: 'none', display: 'block' }} title="map" loading="lazy" />
        </div>
    );
}

/* ─── Описание с "Читать далее" ─── */
function DescriptionBlock({ description, extraFields }) {
    const [open, setOpen] = useState(false);
    if (!description && (!extraFields || extraFields.length === 0)) return null;

    return (
        <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 12 }}>Описание</h2>
            {description && (
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: extraFields?.length ? 16 : 0 }}>
                    {description}
                </p>
            )}
            {extraFields?.length > 0 && (
                <>
                    {open && (
                        <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', marginTop: 8 }}>
                            {extraFields.map(([label, value]) =>
                                value ? <InfoRow key={label} label={label} value={value} /> : null
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => setOpen(v => !v)}
                        style={{
                            marginTop: 12, background: 'none', border: '1px solid #E5E7EB',
                            borderRadius: 999, padding: '8px 20px', fontSize: 14,
                            color: '#F05D22', cursor: 'pointer', fontWeight: 500,
                        }}
                    >
                        {open ? 'Скрыть подробности' : 'Показать все характеристики'}
                    </button>
                </>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════
   NEW BUILDING detail
   ═══════════════════════════════════════ */
function NewBuildingDetail({ p }) {
    const rd = p.residential_details;
    const router = useRouter()
    const { isFavorite, toggleFavorite, isCompare, toggleCompare } = useFavoriteCompare()
    const favActive = isFavorite(p.id)
    const cmpActive = isCompare(p.id)

    function handleZayavka() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        router.push(token ? '/profile' : '/sign-in')
    }
    // Asosiy 5 ta (kartochkada ko'rsatiladi)
    const mainFields = [
        ['Застройщик', rd?.developer],
        ['Срок сдачи', rd?.completion_period_text],
        ['Класс жилья', rd?.housing_class],
        ['Цена за м²', rd?.price_per_sqm_from ? `от ${formatPrice(rd.price_per_sqm_from)} ₽` : null],
        ['Этажей', p.floors],
    ];

    // Qolgan maydonlar — "Показать все" tugmasi ostida
    const extraFields = [
        ['Всего квартир', rd?.units_total],
        ['В продаже', rd?.units_available],
        ['Материал стен', p.wall_material],
        ['Отделка', p.finishing],
        ['От МКАД', p.distance_to_mkad_km ? `${p.distance_to_mkad_km} км` : null],
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-5 py-10">
            <HomeLink link="/catalog" label="Каталог" link2={"/catalog/" + p.id} label2={p.name} />

            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 24 }}>
                <div style={{ flex: '1.2 1 340px', minWidth: 300 }}>
                    <Gallery images={p.images} />
                </div>

                <div style={{ flex: '0 1 340px', minWidth: 280 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>{p.name}</h1>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 16px' }}>{p.code}</p>

                    <div className="flex items-center justify-between mb-4">
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#141111', marginBottom: 16 }}>
                            {formatPrice(p.price)} ₽
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <button
                                onClick={() => toggleFavorite(p.id)}
                                style={{
                                    width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB',
                                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', flexShrink: 0,
                                }}
                            >
                                {favActive
                                    ? <FaHeart size={15} color="#F05D22" />
                                    : <FiHeart size={15} color="#9CA3AF" />
                                }
                            </button>
                            <button
                                onClick={() => toggleCompare(p.id)}
                                style={{
                                    width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB',
                                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', flexShrink: 0,
                                }}
                            >
                                <FiBarChart2 size={15} color={cmpActive ? '#F05D22' : '#9CA3AF'} />
                            </button>
                        </div>
                    </div>

                    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                        {mainFields.map(([label, value]) =>
                            <InfoRow key={label} label={label} value={value} />
                        )}
                    </div>

                    <button
                        onClick={handleZayavka}
                        style={{
                            background: ORANGE, color: '#fff', border: 'none',
                            borderRadius: 999, padding: '14px 32px', fontSize: 15,
                            fontWeight: 500, cursor: 'pointer', width: '100%',
                        }}
                    >
                        Оставить заявку
                    </button>
                </div>
            </div>

            <DescriptionBlock description={p.description} extraFields={extraFields} />

            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 48 }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 12 }}>Участок и локация</h2>
                    <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>
                        {p.settlement && `${p.settlement}, `}{p.address}
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <BoolRow label="Рядом магазины" value={p.near_shops} />
                        <BoolRow label="Школа / детский сад" value={p.near_school_kindergarten} />
                        <BoolRow label="Общественный транспорт" value={p.near_public_transport} />
                        <BoolRow label="Асфальтированные дороги" value={p.has_asphalt_roads} />
                        <BoolRow label="Освещение улиц" value={p.has_street_lighting} />
                        <BoolRow label="Охраняемая территория" value={p.has_guarded_territory} />
                    </ul>
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                    <MapBlock lat={parseFloat(p.lat)} lng={parseFloat(p.long)} />
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   LAND PLOT detail
   ═══════════════════════════════════════ */
function LandPlotDetail({ p }) {
    const router = useRouter()
    const { isFavorite, toggleFavorite, isCompare, toggleCompare } = useFavoriteCompare()
    const favActive = isFavorite(p.id)
    const cmpActive = isCompare(p.id)

    function handleZayavka() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        router.push(token ? '/profile' : '/sign-in')
    }
    const mainFields = [
        ['Площадь участка', p.land_area ? `${p.land_area} сот.` : null],
        ['Район', p.district?.name],
        ['Шоссе', p.highway?.name],
        ['От МКАД', p.distance_to_mkad_km ? `${p.distance_to_mkad_km} км` : null],
        ['Посёлок', p.settlement],
    ];

    const extraFields = [
        ['Отделка', p.finishing],
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-5 py-10">
            <HomeLink link="/catalog" label="Каталог" link2={"/catalog/" + p.id} label2={p.name} />

            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 24 }}>
                <div style={{ flex: '1.2 1 340px', minWidth: 300 }}>
                    <Gallery images={p.images} />
                </div>

                <div style={{ flex: '0 1 340px', minWidth: 280 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>{p.name}</h1>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 16px' }}>{p.code}</p>

                    <div style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>
                            от {formatPrice(p.price)} ₽
                        </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#141111', marginBottom: 16 }}>
                            {formatPrice(p.price)} ₽
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <button
                                onClick={() => toggleFavorite(p.id)}
                                style={{
                                    width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB',
                                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', flexShrink: 0,
                                }}
                            >
                                {favActive
                                    ? <FaHeart size={15} color="#F05D22" />
                                    : <FiHeart size={15} color="#9CA3AF" />
                                }
                            </button>
                            <button
                                onClick={() => toggleCompare(p.id)}
                                style={{
                                    width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB',
                                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', flexShrink: 0,
                                }}
                            >
                                <FiBarChart2 size={15} color={cmpActive ? '#F05D22' : '#9CA3AF'} />
                            </button>
                        </div>
                    </div>

                    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                        {mainFields.map(([label, value]) =>
                            <InfoRow key={label} label={label} value={value} />
                        )}
                    </div>

                    {p.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                            {p.tags.map(t => (
                                <span key={t.id} style={{
                                    background: ORANGE, color: '#fff', borderRadius: 999,
                                    padding: '4px 14px', fontSize: 13,
                                }}>{t.tag_name}</span>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleZayavka}
                        style={{
                            background: ORANGE, color: '#fff', border: 'none',
                            borderRadius: 999, padding: '14px 32px', fontSize: 15,
                            fontWeight: 500, cursor: 'pointer', width: '100%',
                        }}
                    >
                        Оставить заявку
                    </button>
                </div>
            </div>

            <DescriptionBlock description={p.description} extraFields={extraFields} />

            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 48 }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 16 }}>Участок и локация</h2>
                    <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Поблизости находится:</p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <BoolRow label="Магазины" value={p.near_shops} />
                                <BoolRow label="Школа / садик" value={p.near_school_kindergarten} />
                                <BoolRow label="Транспорт" value={p.near_public_transport} />
                            </ul>
                        </div>
                        <div>
                            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>В шаговой доступности:</p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <BoolRow label="Дороги асфальт" value={p.has_asphalt_roads} />
                                <BoolRow label="Освещение" value={p.has_street_lighting} />
                                <BoolRow label="Охрана" value={p.has_guarded_territory} />
                            </ul>
                        </div>
                    </div>
                    <MapBlock lat={parseFloat(p.lat)} lng={parseFloat(p.long)} />
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   OTHER (Дачи / Загородная / etc.)
   ═══════════════════════════════════════ */
function OtherDetail({ p }) {
    const rd = p.residential_details;
    const router = useRouter()
    const { isFavorite, toggleFavorite, isCompare, toggleCompare } = useFavoriteCompare()
    const favActive = isFavorite(p.id)
    const cmpActive = isCompare(p.id)

    function handleZayavka() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
        router.push(token ? '/profile' : '/sign-in')
    }

    const mainFields = [
        ['Площадь', p.area ? `${p.area} м²` : null],
        ['Комнат', p.rooms],
        ['Этажей', p.floors],
        ['Район', p.district?.name],
        ['От МКАД', p.distance_to_mkad_km ? `${p.distance_to_mkad_km} км` : null],
    ];

    const extraFields = [
        ['Спален', p.bedrooms],
        ['Санузлов', p.bathrooms],
        ['Год постройки', p.year_built],
        ['Материал стен', p.wall_material],
        ['Отделка', p.finishing],
        ['Шоссе', p.highway?.name],
        ...(rd ? [
            ['Застройщик', rd.developer],
            ['Срок сдачи', rd.completion_period_text],
            ['Класс жилья', rd.housing_class],
        ] : []),
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-5 py-10">
            <HomeLink link="/catalog" label="Каталог" link2={"/catalog/" + p.id} label2={p.name} />

            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 24 }}>
                <div style={{ flex: '1.2 1 340px', minWidth: 300 }}>
                    <Gallery images={p.images} />
                </div>

                <div style={{ flex: '0 1 340px', minWidth: 280 }}>
                    {/* Nom */}
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>{p.name}</h1>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 8px' }}>
                        {p.district?.name && `${p.district.name}, `}
                        {p.distance_to_mkad_km && `${p.distance_to_mkad_km} км от МКАД`}
                    </p>

                    {/* ── Favorites + Compare tugmalari ── */}
                    <div className="flex items-center justify-between mb-4">
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#141111', marginBottom: 16 }}>
                            {formatPrice(p.price)} ₽
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <button
                                onClick={() => toggleFavorite(p.id)}
                                style={{
                                    width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB',
                                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', flexShrink: 0,
                                }}
                            >
                                {favActive
                                    ? <FaHeart size={15} color="#F05D22" />
                                    : <FiHeart size={15} color="#9CA3AF" />
                                }
                            </button>
                            <button
                                onClick={() => toggleCompare(p.id)}
                                style={{
                                    width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB',
                                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', flexShrink: 0,
                                }}
                            >
                                <FiBarChart2 size={15} color={cmpActive ? '#F05D22' : '#9CA3AF'} />
                            </button>
                        </div>
                    </div>



                    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                        {mainFields.map(([label, value]) =>
                            <InfoRow key={label} label={label} value={value} />
                        )}
                    </div>

                    <button
                        onClick={handleZayavka}
                        style={{
                            background: ORANGE, color: '#fff', border: 'none',
                            borderRadius: 999, padding: '14px 32px', fontSize: 15,
                            fontWeight: 500, cursor: 'pointer', width: '100%',
                        }}
                    >
                        Оставить заявку
                    </button>
                </div>
            </div>

            <DescriptionBlock description={p.description} extraFields={extraFields} />

            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 48 }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 16 }}>Участок и локация</h2>
                    <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>
                        {p.settlement && `${p.settlement}, `}{p.address}
                    </p>
                    <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Поблизости:</p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <BoolRow label="Магазины" value={p.near_shops} />
                                <BoolRow label="Школа / садик" value={p.near_school_kindergarten} />
                                <BoolRow label="Транспорт" value={p.near_public_transport} />
                            </ul>
                        </div>
                        <div>
                            <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Инфраструктура:</p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <BoolRow label="Асфальт" value={p.has_asphalt_roads} />
                                <BoolRow label="Освещение" value={p.has_street_lighting} />
                                <BoolRow label="Охрана" value={p.has_guarded_territory} />
                            </ul>
                        </div>
                    </div>

                    {(p.electricity_supply || p.water_supply || p.sewage_type || p.heating_type) && (
                        <div style={{ marginTop: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 500, color: '#111827', marginBottom: 12 }}>Коммуникации</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {p.electricity_supply && <BoolRow label={`Электричество: ${p.electricity_supply}`} value={true} />}
                                {p.water_supply && <BoolRow label={`Водоснабжение: ${p.water_supply}`} value={true} />}
                                {p.sewage_type && <BoolRow label={`Канализация: ${p.sewage_type}`} value={true} />}
                                {p.heating_type && <BoolRow label={`Отопление: ${p.heating_type}`} value={true} />}
                            </ul>
                        </div>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 240 }}>
                    <MapBlock lat={parseFloat(p.lat)} lng={parseFloat(p.long)} />
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */
export default function CatalogDetail() {
    const { id } = useParams();
    const { getData } = useApiStore();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!id) return;
        getData(`accounts/catalog/properties/${id}/`)
            .then(setProperty)
            .catch(err => console.error('Ошибка загрузки объекта:', err))
            .finally(() => setLoading(false));
    }, [id]); // eslint-disable-line

    if (loading) {
        return (
            <>
                <style>{`@keyframes detail-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
                <div className="max-w-[1400px] mx-auto px-5 py-10">
                    <SkeletonBlock w="30%" h={14} mb={32} />
                    <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                        <SkeletonBlock w="55%" h={400} mb={0} />
                        <div style={{ flex: 1 }}>
                            <SkeletonBlock w="80%" h={28} mb={16} />
                            <SkeletonBlock w="40%" h={32} mb={24} />
                            <SkeletonBlock w="100%" h={200} mb={16} />
                            <SkeletonBlock w="100%" h={52} mb={0} />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!property) {
        return (
            <div className="max-w-[1400px] mx-auto px-5 py-10">
                <p style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 60 }}>Объект не найден</p>
            </div>
        );
    }

    const slug = property.category?.slug;
    if (slug === 'new_building') return <NewBuildingDetail p={property} />;
    if (slug === 'land_plot') return <LandPlotDetail p={property} />;
    return <OtherDetail p={property} />;
}