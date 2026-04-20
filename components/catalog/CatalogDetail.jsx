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

/* ─── Описание — always open ─── */
function DescriptionBlock({ description, extraFields }) {
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
                <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', marginTop: 8 }}>
                    {extraFields.map(([label, value]) =>
                        value ? <InfoRow key={label} label={label} value={value} /> : null
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Unit Card (3-column grid, no fav/compare) ─── */
function UnitCard({ unit }) {
    const [activeSlide, setActiveSlide] = useState(0);
    const fallback = '/sec2.png';

    const images = unit.image ? [unit.image] : [fallback];
    const roomLabel = unit.is_studio ? 'Студия' : unit.layout_label || (unit.rooms ? `${unit.rooms}-комн.` : 'Квартира');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Image */}
            <div
                style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '1 / 0.75' }}
                onMouseLeave={() => setActiveSlide(0)}
            >
                {images.map((src, i) => (
                    <Image
                        key={i}
                        src={typeof src === 'string' ? src : src.image ?? fallback}
                        alt={roomLabel}
                        fill
                        className="object-cover"
                        style={{ opacity: i === activeSlide ? 1 : 0, transition: 'opacity 0.3s' }}
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                ))}

                {/* Hover zones for multiple images */}
                {images.length > 1 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 10 }}>
                        {images.map((_, i) => (
                            <div
                                key={i}
                                style={{ flex: 1, height: '100%' }}
                                onMouseEnter={() => setActiveSlide(i)}
                            />
                        ))}
                    </div>
                )}

                {/* Dots */}
                {images.length > 1 && (
                    <div style={{
                        position: 'absolute', bottom: 12, left: 0, right: 0,
                        display: 'flex', justifyContent: 'center', gap: 6, zIndex: 20, pointerEvents: 'none',
                    }}>
                        {images.map((_, i) => (
                            <span key={i} style={{
                                display: 'block', borderRadius: 999,
                                width: i === activeSlide ? 20 : 7, height: 7,
                                background: i === activeSlide ? '#F05D22' : 'rgba(255,255,255,0.85)',
                                transition: 'all 0.3s',
                            }} />
                        ))}
                    </div>
                )}

                {/* Building badge */}
                {unit.building && (
                    <div style={{
                        position: 'absolute', top: 10, left: 10, zIndex: 20,
                        background: 'rgba(0,0,0,0.55)', borderRadius: 999,
                        padding: '4px 12px', fontSize: 12, color: '#fff',
                    }}>
                        {unit.building}
                    </div>
                )}
            </div>

            {/* Name + Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, padding: '0 2px' }}>
                <span style={{ fontWeight: 500, fontSize: 18, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {roomLabel}
                </span>
                <span style={{ fontWeight: 500, fontSize: 16, whiteSpace: 'nowrap', color: '#111827' }}>
                    от {formatPrice(unit.price)} ₽
                </span>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 2px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                    {unit.total_area && (
                        <span style={{ color: '#9CA3AF', fontSize: 12 }}>
                            Площадь, м²: <span style={{ color: '#111827', fontWeight: 400, fontSize: 14 }}>{unit.total_area}</span>
                        </span>
                    )}
                    {unit.floor && (
                        <span style={{ color: '#9CA3AF', fontSize: 12 }}>
                            Этаж: <span style={{ color: '#111827', fontWeight: 400, fontSize: 14 }}>{unit.floor}{unit.floors_total ? `/${unit.floors_total}` : ''}</span>
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                    {unit.finishing && (
                        <span style={{ color: '#9CA3AF', fontSize: 12 }}>
                            Отделка: <span style={{ color: '#111827', fontWeight: 400, fontSize: 14 }}>{unit.finishing}</span>
                        </span>
                    )}
                    {unit.completion_text && (
                        <span style={{ color: '#9CA3AF', fontSize: 12 }}>
                            Сдача: <span style={{ color: '#111827', fontWeight: 400, fontSize: 14 }}>{unit.completion_text}</span>
                        </span>
                    )}
                </div>
                {unit.price_per_sqm && (
                    <span style={{ color: '#9CA3AF', fontSize: 12 }}>
                        Цена за м²: <span style={{ color: '#111827', fontWeight: 400, fontSize: 14 }}>{formatPrice(unit.price_per_sqm)} ₽</span>
                    </span>
                )}
            </div>
        </div>
    );
}

/* ─── Units Section ─── */
function UnitsSection({ propertyId }) {
    const { getData } = useApiStore();
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!propertyId) return;
        getData(`accounts/properties/${propertyId}/units/`)
            .then(res => {
                // API paginated yoki array qaytarishi mumkin
                const results = Array.isArray(res) ? res : (res?.results ?? []);
                setUnits(results);
            })
            .catch(() => setUnits([]))
            .finally(() => setLoading(false));
    }, [propertyId]); // eslint-disable-line

    if (loading) {
        return (
            <div style={{ marginTop: 48 }}>
                <SkeletonBlock w="30%" h={24} mb={24} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                    {[1, 2, 3].map(i => <SkeletonBlock key={i} w="100%" h={260} mb={0} />)}
                </div>
            </div>
        );
    }

    if (units.length === 0) return null;

    return (
        <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 24 }}>
                Планировка и цены
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
            }}
                className="units-grid"
            >
                {units.map(unit => (
                    <UnitCard key={unit.id} unit={unit} />
                ))}
            </div>
            <style>{`
                @media (max-width: 900px) {
                    .units-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 560px) {
                    .units-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
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

    const mainFields = [
        ['Застройщик', rd?.developer],
        ['Срок сдачи', rd?.completion_period_text],
        ['Класс жилья', rd?.housing_class],
        ['Цена за м²', rd?.price_per_sqm_from ? `от ${formatPrice(rd.price_per_sqm_from)} ₽` : null],
        ['Этажей', p.floors],
    ];

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
                                {favActive ? <FaHeart size={15} color="#F05D22" /> : <FiHeart size={15} color="#9CA3AF" />}
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
                        {[...mainFields, ...extraFields].map(([label, value]) =>
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

            <DescriptionBlock description={p.description} extraFields={[]} />

            {/* ── Units (Квартиры) ── */}
            <UnitsSection propertyId={p.id} />

            {/* ── Участок и локация ── */}
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

    const allFields = [
        ['Площадь участка', p.land_area ? `${p.land_area} сот.` : null],
        ['Район', p.district?.name],
        ['Шоссе', p.highway?.name],
        ['От МКАД', p.distance_to_mkad_km ? `${p.distance_to_mkad_km} км` : null],
        ['Посёлок', p.settlement],
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
                                {favActive ? <FaHeart size={15} color="#F05D22" /> : <FiHeart size={15} color="#9CA3AF" />}
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
                        {allFields.map(([label, value]) =>
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

            <DescriptionBlock description={p.description} extraFields={[]} />

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

    const allFields = [
        ['Площадь', p.area ? `${p.area} м²` : null],
        ['Комнат', p.rooms],
        ['Этажей', p.floors],
        ['Район', p.district?.name],
        ['От МКАД', p.distance_to_mkad_km ? `${p.distance_to_mkad_km} км` : null],
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
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>{p.name}</h1>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 8px' }}>
                        {p.district?.name && `${p.district.name}, `}
                        {p.distance_to_mkad_km && `${p.distance_to_mkad_km} км от МКАД`}
                    </p>

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
                                {favActive ? <FaHeart size={15} color="#F05D22" /> : <FiHeart size={15} color="#9CA3AF" />}
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
                        {allFields.map(([label, value]) =>
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

            <DescriptionBlock description={p.description} extraFields={[]} />

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