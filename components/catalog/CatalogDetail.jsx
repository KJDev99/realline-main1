'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import HomeLink from '../homeLink';
import useApiStore from '@/store/useApiStore';
import { useRouter } from 'next/navigation'
import { FiHeart, FiBarChart2, FiSliders, FiX } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { useFavoriteCompare } from '@/store/useFavoriteCompare'
import toast, { Toaster } from 'react-hot-toast';
import { postData } from '@/lib/apiService';

const ORANGE = 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)';
const ORANGE_COLOR = '#F05D22';

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
            <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: value ? ORANGE : '#D1D5DB', display: 'inline-block' }} />
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
    const getImgSrc = (img) => typeof img === "string" ? img : img?.image ?? fallback;

    return (
        <div style={{ width: "100%" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 16, overflow: "hidden", marginBottom: 10 }}>
                <Image src={getImgSrc(imgs[active])} alt="property" fill className="object-cover" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw" />
            </div>
            {imgs.length > 1 && (
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "thin" }}>
                    {imgs.map((img, i) => (
                        <div key={i} onClick={() => setActive(i)} style={{
                            flexShrink: 0, width: "clamp(64px, 14vw, 100px)", height: "clamp(46px, 10vw, 72px)",
                            borderRadius: 10, overflow: "hidden", cursor: "pointer", position: "relative",
                            border: i === active ? "2px solid #F05D22" : "2px solid transparent",
                            transition: "border-color 0.2s, opacity 0.2s", opacity: i === active ? 1 : 0.72,
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

/* ─── Description block ─── */
function DescriptionBlock({ description }) {
    if (!description) return null;
    return (
        <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 12 }}>Описание</h2>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}>{description}</p>
        </div>
    );
}

/* ─── Filter pill toggle ─── */
function Pill({ label, active, onClick }) {
    return (
        <button type="button" onClick={onClick} style={{
            height: 36, borderRadius: 999,
            border: active ? 'none' : '1px solid #E5E7EB',
            background: active ? ORANGE_COLOR : '#F9FAFB',
            color: active ? '#fff' : '#374151',
            padding: '0 16px', fontSize: 13, cursor: 'pointer',
            whiteSpace: 'nowrap', fontWeight: active ? 600 : 400,
            transition: 'all 0.15s', flexShrink: 0,
        }}>
            {label}
        </button>
    );
}

/* ─── Filter text input ─── */
function FInput({ placeholder, value, onChange, type = 'text' }) {
    return (
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
                height: 40, borderRadius: 10, border: '1px solid #E5E7EB',
                background: '#fff', padding: '0 12px', fontSize: 13,
                outline: 'none', width: '100%', boxSizing: 'border-box', color: '#111827',
            }}
        />
    );
}

/* ─── Range row ─── */
function RangeRow({ label, keyMin, keyMax, filters, set }) {
    return (
        <div>
            <p style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, marginBottom: 8 }}>{label}</p>
            <div style={{ display: 'flex', gap: 8 }}>
                <FInput placeholder="от" value={filters[keyMin]} onChange={v => set(keyMin, v)} type="number" />
                <FInput placeholder="до" value={filters[keyMax]} onChange={v => set(keyMax, v)} type="number" />
            </div>
        </div>
    );
}

/* ─── Default filters ─── */
const defaultFilters = {
    q: '', building: '', completion_period: '', key_delivery: '',
    rooms: '', price_min: '', price_max: '', finishing: '',
    area_min: '', area_max: '', kitchen_min: '', kitchen_max: '',
    bathroom: '', ceiling_height: '', balcony: '',
    floor_min: '', floor_max: '', payment_method: '', bank: '',
    is_apartments_legal: '', is_assignment: '', is_two_level: '', has_master_bedroom: '',
};

/* ─── Dropdown component ─── */
function Dropdown({ label, options, value, onChange, fullWidth = false }) {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const active = value !== '' && value !== null;

    return (
        <div ref={ref} style={{ position: 'relative', width: fullWidth ? '100%' : undefined }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    height: 36, borderRadius: 8,
                    border: active ? `1px solid ${ORANGE_COLOR}` : '1px solid #E5E7EB',
                    background: active ? '#FFF4EF' : '#fff',
                    color: active ? ORANGE_COLOR : '#374151',
                    padding: '0 10px 0 12px', fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    whiteSpace: 'nowrap', fontWeight: active ? 500 : 400,
                    transition: 'all 0.15s',
                    width: '100%',
                    justifyContent: 'space-between',
                }}
            >
                {label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5, flexShrink: 0 }}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
                    background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.10)', minWidth: 160, padding: '6px 0',
                }}>
                    <div
                        onClick={() => { onChange(''); setOpen(false); }}
                        style={{
                            padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                            color: value === '' ? ORANGE_COLOR : '#374151',
                            fontWeight: value === '' ? 500 : 400,
                            background: value === '' ? '#FFF4EF' : 'transparent',
                        }}
                    >
                        Все
                    </div>
                    {options.map(opt => {
                        const optVal = typeof opt === 'object' ? opt.value : opt;
                        const optLabel = typeof opt === 'object' ? opt.label : opt;
                        return (
                            <div
                                key={optVal}
                                onClick={() => { onChange(value === optVal ? '' : optVal); setOpen(false); }}
                                style={{
                                    padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                                    color: value === optVal ? ORANGE_COLOR : '#374151',
                                    fontWeight: value === optVal ? 500 : 400,
                                    background: value === optVal ? '#FFF4EF' : 'transparent',
                                    transition: 'background 0.1s',
                                }}
                            >
                                {optLabel}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── Range Dropdown ─── */
function RangeDropdown({ label, keyMin, keyMax, filters, onChange, placeholder = ['от', 'до'], fullWidth = false }) {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);
    const active = filters[keyMin] !== '' || filters[keyMax] !== '';

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const set = (key, val) => onChange({ ...filters, [key]: val });

    return (
        <div ref={ref} style={{ position: 'relative', width: fullWidth ? '100%' : undefined }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    height: 36, borderRadius: 8,
                    border: active ? `1px solid ${ORANGE_COLOR}` : '1px solid #E5E7EB',
                    background: active ? '#FFF4EF' : '#fff',
                    color: active ? ORANGE_COLOR : '#374151',
                    padding: '0 10px 0 12px', fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    whiteSpace: 'nowrap', fontWeight: active ? 500 : 400,
                    transition: 'all 0.15s',
                    width: '100%',
                    justifyContent: 'space-between',
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {active
                        ? `${filters[keyMin] ? filters[keyMin] : '...'} – ${filters[keyMax] ? filters[keyMax] : '...'}`
                        : label}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5, flexShrink: 0 }}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
                    background: '#fff', borderRadius: 10, border: '1px solid #E5E7EB',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.10)', padding: '14px 14px 10px', minWidth: 220,
                }}>
                    <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, marginBottom: 8 }}>{label}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="number"
                            value={filters[keyMin]}
                            onChange={e => set(keyMin, e.target.value)}
                            placeholder={placeholder[0]}
                            style={{ height: 36, borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', padding: '0 10px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', color: '#111827' }}
                        />
                        <input
                            type="number"
                            value={filters[keyMax]}
                            onChange={e => set(keyMax, e.target.value)}
                            placeholder={placeholder[1]}
                            style={{ height: 36, borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', padding: '0 10px', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box', color: '#111827' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Units Filter Panel ─── */
function UnitsFilterPanel({ filters, onChange, onReset, buildings, layoutLabels, hasActiveFilters }) {
    const set = (key, val) => onChange({ ...filters, [key]: val });
    const [mobileOpen, setMobileOpen] = useState(false);

    const activeCount = Object.values(filters).filter(v => v !== '' && v !== null).length;

    const roomOptions = ['Студия', '1', '2', '3', '4', '5+'];
    const finishingOptions = ['Чистовая', 'Черновая', 'Предчистовая', 'Без отделки'];
    const bathroomOptions = ['Совмещённый', 'Раздельный', '2+'];
    const ceilingOptions = ['2.5', '2.7', '3.0', '3.2+'];
    const balconyOptions = ['Балкон', 'Лоджия', 'Терраса', 'Без балкона'];
    const paymentOptions = ['Ипотека', '100% оплата', 'Рассрочка', 'Материнский капитал'];
    const buildingOpts = buildings.map(b => ({ value: b, label: b }));

    const rowStyle = (cols) => ({
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 8,
        marginBottom: 8,
    });

    /* ── Desktop layout ── */
    const desktopRows = (
        <>
            <div style={rowStyle(5)}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={filters.q}
                        onChange={e => set('q', e.target.value)}
                        placeholder="Поиск"
                        style={{
                            height: 36, borderRadius: 8, border: '1px solid #E5E7EB',
                            background: filters.q ? '#FFF4EF' : '#fff',
                            padding: '0 32px 0 12px', fontSize: 13,
                            outline: 'none', width: '100%', boxSizing: 'border-box', color: '#111827',
                            transition: 'all 0.15s',
                        }}
                    />
                    {filters.q ? (
                        <button onClick={() => set('q', '')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: ORANGE_COLOR, padding: 0, display: 'flex' }}>
                            <FiX size={13} />
                        </button>
                    ) : (
                        <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.35, pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="6" cy="6" r="4.5" stroke="#374151" strokeWidth="1.4" />
                            <path d="M10 10l2.5 2.5" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    )}
                </div>
                <Dropdown label="Корпус" options={buildingOpts} value={filters.building} onChange={v => set('building', v)} fullWidth />
                <Dropdown label="Срок сдачи" options={['2024', '2025', '2026', '2027', '2028']} value={filters.completion_period} onChange={v => set('completion_period', v)} fullWidth />
                <Dropdown label="Выдача ключей" options={['I кв.', 'II кв.', 'III кв.', 'IV кв.']} value={filters.key_delivery} onChange={v => set('key_delivery', v)} fullWidth />
                <Dropdown label="Кол-во комнат" options={roomOptions} value={filters.rooms} onChange={v => set('rooms', v)} fullWidth />
            </div>

            <div style={rowStyle(6)}>
                <RangeDropdown label="Цена" keyMin="price_min" keyMax="price_max" filters={filters} onChange={onChange} fullWidth />
                <Dropdown label="Отделка" options={finishingOptions} value={filters.finishing} onChange={v => set('finishing', v)} fullWidth />
                <RangeDropdown label="S общая" keyMin="area_min" keyMax="area_max" filters={filters} onChange={onChange} fullWidth />
                <RangeDropdown label="S кухни" keyMin="kitchen_min" keyMax="kitchen_max" filters={filters} onChange={onChange} fullWidth />
                <Dropdown label="Санузел" options={bathroomOptions} value={filters.bathroom} onChange={v => set('bathroom', v)} fullWidth />
                <Dropdown label="Высота потолков" options={ceilingOptions} value={filters.ceiling_height} onChange={v => set('ceiling_height', v)} fullWidth />
            </div>

            <div style={rowStyle(6)}>
                <Dropdown label="Балкон" options={balconyOptions} value={filters.balcony} onChange={v => set('balcony', v)} fullWidth />
                <RangeDropdown label="Этаж" keyMin="floor_min" keyMax="floor_max" filters={filters} onChange={onChange} fullWidth />
                <Dropdown label="Способы оплаты" options={paymentOptions} value={filters.payment_method} onChange={v => set('payment_method', v)} fullWidth />
                <Dropdown label="Банки" options={['Сбербанк', 'ВТБ', 'Альфа-Банк', 'Газпромбанк', 'ДОМ.РФ']} value={filters.bank} onChange={v => set('bank', v)} fullWidth />
                <Dropdown label="Апартаменты" options={[{ value: 'true', label: 'Да' }, { value: 'false', label: 'Нет' }]} value={filters.is_apartments_legal} onChange={v => set('is_apartments_legal', v)} fullWidth />
                <Dropdown label="Переуступки" options={[{ value: 'true', label: 'Да' }, { value: 'false', label: 'Нет' }]} value={filters.is_assignment} onChange={v => set('is_assignment', v)} fullWidth />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                <Dropdown label="Двухъярусная" options={[{ value: 'true', label: 'Да' }, { value: 'false', label: 'Нет' }]} value={filters.is_two_level} onChange={v => set('is_two_level', v)} fullWidth />
                <Dropdown label="Мастер-спальня" options={[{ value: 'true', label: 'Да' }, { value: 'false', label: 'Нет' }]} value={filters.has_master_bedroom} onChange={v => set('has_master_bedroom', v)} fullWidth />
                <div /><div /><div />
                {hasActiveFilters ? (
                    <button type="button" onClick={onReset} style={{
                        height: 36, borderRadius: 8, border: '1px solid #FECACA',
                        background: '#FFF7F7', color: '#EF4444',
                        padding: '0 14px', fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}>
                        <FiX size={12} />
                        Сбросить
                        {activeCount > 0 && (
                            <span style={{ background: '#EF4444', color: '#fff', borderRadius: 999, width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                {activeCount}
                            </span>
                        )}
                    </button>
                ) : <div />}
            </div>
        </>
    );

    /* ── Mobile layout ── */
    const allFilters = [
        <Dropdown key="building" label="Корпус" options={buildingOpts} value={filters.building} onChange={v => set('building', v)} fullWidth />,
        <Dropdown key="completion" label="Срок сдачи" options={['2024', '2025', '2026', '2027', '2028']} value={filters.completion_period} onChange={v => set('completion_period', v)} fullWidth />,
        <Dropdown key="keys" label="Выдача ключей" options={['I кв.', 'II кв.', 'III кв.', 'IV кв.']} value={filters.key_delivery} onChange={v => set('key_delivery', v)} fullWidth />,
        <Dropdown key="rooms" label="Кол-во комнат" options={roomOptions} value={filters.rooms} onChange={v => set('rooms', v)} fullWidth />,
        <RangeDropdown key="price" label="Цена" keyMin="price_min" keyMax="price_max" filters={filters} onChange={onChange} fullWidth />,
        <Dropdown key="finishing" label="Отделка" options={finishingOptions} value={filters.finishing} onChange={v => set('finishing', v)} fullWidth />,
        <RangeDropdown key="area" label="S общая" keyMin="area_min" keyMax="area_max" filters={filters} onChange={onChange} fullWidth />,
        <RangeDropdown key="kitchen" label="S кухни" keyMin="kitchen_min" keyMax="kitchen_max" filters={filters} onChange={onChange} fullWidth />,
        <Dropdown key="bathroom" label="Санузел" options={bathroomOptions} value={filters.bathroom} onChange={v => set('bathroom', v)} fullWidth />,
        <Dropdown key="ceiling" label="Высота потолков" options={ceilingOptions} value={filters.ceiling_height} onChange={v => set('ceiling_height', v)} fullWidth />,
        <Dropdown key="balcony" label="Балкон" options={balconyOptions} value={filters.balcony} onChange={v => set('balcony', v)} fullWidth />,
        <RangeDropdown key="floor" label="Этаж" keyMin="floor_min" keyMax="floor_max" filters={filters} onChange={onChange} fullWidth />,
        <Dropdown key="payment" label="Способы оплаты" options={paymentOptions} value={filters.payment_method} onChange={v => set('payment_method', v)} fullWidth />,
        <Dropdown key="bank" label="Банки" options={['Сбербанк', 'ВТБ', 'Альфа-Банк', 'Газпромбанк', 'ДОМ.РФ']} value={filters.bank} onChange={v => set('bank', v)} fullWidth />,
        <Dropdown key="apart" label="Апартаменты" options={[{ value: 'true', label: 'Да' }, { value: 'false', label: 'Нет' }]} value={filters.is_apartments_legal} onChange={v => set('is_apartments_legal', v)} fullWidth />,
        <Dropdown key="assign" label="Переуступки" options={[{ value: 'true', label: 'Да' }, { value: 'false', label: 'Нет' }]} value={filters.is_assignment} onChange={v => set('is_assignment', v)} fullWidth />,
        <Dropdown key="twolevel" label="Двухъярусная" options={[{ value: 'true', label: 'Да' }, { value: 'false', label: 'Нет' }]} value={filters.is_two_level} onChange={v => set('is_two_level', v)} fullWidth />,
        <Dropdown key="master" label="Мастер-спальня" options={[{ value: 'true', label: 'Да' }, { value: 'false', label: 'Нет' }]} value={filters.has_master_bedroom} onChange={v => set('has_master_bedroom', v)} fullWidth />,
    ];

    const mobileLayout = (
        <div>
            {/* Search full width */}
            <div style={{ position: 'relative', marginBottom: 8 }}>
                <input
                    type="text"
                    value={filters.q}
                    onChange={e => set('q', e.target.value)}
                    placeholder="Поиск"
                    style={{
                        height: 40, borderRadius: 8, border: '1px solid #E5E7EB',
                        background: filters.q ? '#FFF4EF' : '#fff',
                        padding: '0 36px 0 12px', fontSize: 14,
                        outline: 'none', width: '100%', boxSizing: 'border-box', color: '#111827',
                    }}
                />
                {filters.q ? (
                    <button onClick={() => set('q', '')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: ORANGE_COLOR, padding: 0, display: 'flex' }}>
                        <FiX size={14} />
                    </button>
                ) : (
                    <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.35, pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 14 14" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke="#374151" strokeWidth="1.4" />
                        <path d="M10 10l2.5 2.5" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                )}
            </div>

            {/* First 2 always visible */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                {allFilters[0]}
                {allFilters[1]}
            </div>

            {/* Rest — toggled */}
            {mobileOpen && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    {allFilters.slice(2).map((f, i) => (
                        <React.Fragment key={i}>{f}</React.Fragment>
                    ))}
                </div>
            )}

            {/* Toggle + Reset row */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                    type="button"
                    onClick={() => setMobileOpen(o => !o)}
                    style={{
                        flex: 1, height: 40, borderRadius: 8,
                        border: mobileOpen ? 'none' : '1px solid #E5E7EB',
                        background: mobileOpen ? '#141111' : '#F9FAFB',
                        color: mobileOpen ? '#fff' : '#374151',
                        fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        fontWeight: 500,
                    }}
                >
                    <FiSliders size={14} />
                    {mobileOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
                    {!mobileOpen && activeCount > 0 && (
                        <span style={{ background: ORANGE_COLOR, color: '#fff', borderRadius: 999, width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {activeCount}
                        </span>
                    )}
                </button>
                {hasActiveFilters && (
                    <button type="button" onClick={onReset} style={{
                        height: 40, borderRadius: 8, border: '1px solid #FECACA',
                        background: '#FFF7F7', color: '#EF4444',
                        padding: '0 14px', fontSize: 13, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                    }}>
                        <FiX size={12} />
                        Сбросить
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ marginBottom: 24 }}>
            <div className="filter-desktop">{desktopRows}</div>
            <div className="filter-mobile">{mobileLayout}</div>

            <style>{`
                @keyframes detail-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
                .filter-desktop { display: block; }
                .filter-mobile  { display: none;  }
                @media (max-width: 768px) {
                    .filter-desktop { display: none;  }
                    .filter-mobile  { display: block; }
                }
            `}</style>
        </div>
    );
}
/* ─── Unit Card ─── */
function UnitCard({ unit }) {
    const fallback = '/sec2.png';
    const images = unit.image ? [unit.image] : [fallback];
    const [activeSlide, setActiveSlide] = useState(0);
    const roomLabel = unit.is_studio ? 'Студия' : unit.layout_label || (unit.rooms ? `${unit.rooms}-комн.` : 'Квартира');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '1 / 0.75' }} onMouseLeave={() => setActiveSlide(0)}>
                {images.map((src, i) => (
                    <Image key={i} src={typeof src === 'string' ? src : src.image ?? fallback} alt={roomLabel} fill className="object-cover"
                        style={{ opacity: i === activeSlide ? 1 : 0, transition: 'opacity 0.3s' }} sizes="(max-width: 768px) 100vw, 33vw" />
                ))}
                {images.length > 1 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 10 }}>
                        {images.map((_, i) => <div key={i} style={{ flex: 1, height: '100%' }} onMouseEnter={() => setActiveSlide(i)} />)}
                    </div>
                )}
                {images.length > 1 && (
                    <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 20, pointerEvents: 'none' }}>
                        {images.map((_, i) => (
                            <span key={i} style={{ display: 'block', borderRadius: 999, width: i === activeSlide ? 20 : 7, height: 7, background: i === activeSlide ? '#F05D22' : 'rgba(255,255,255,0.85)', transition: 'all 0.3s' }} />
                        ))}
                    </div>
                )}
                {unit.building && (
                    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 20, background: 'rgba(0,0,0,0.55)', borderRadius: 999, padding: '4px 12px', fontSize: 12, color: '#fff' }}>
                        {unit.building}
                    </div>
                )}
                {unit.is_assignment && (
                    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 20, background: ORANGE_COLOR, borderRadius: 999, padding: '4px 10px', fontSize: 11, color: '#fff', fontWeight: 600 }}>
                        Переуступка
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, padding: '0 2px' }}>
                <span style={{ fontWeight: 500, fontSize: 18, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{roomLabel}</span>
                <span style={{ fontWeight: 500, fontSize: 16, whiteSpace: 'nowrap', color: '#111827' }}>от {formatPrice(unit.price)} ₽</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '0 2px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                    {unit.total_area && <span style={{ color: '#9CA3AF', fontSize: 12 }}>Площадь, м²: <span style={{ color: '#111827', fontWeight: 400, fontSize: 14 }}>{unit.total_area}</span></span>}
                    {unit.floor && <span style={{ color: '#9CA3AF', fontSize: 12 }}>Этаж: <span style={{ color: '#111827', fontWeight: 400, fontSize: 14 }}>{unit.floor}{unit.floors_total ? `/${unit.floors_total}` : ''}</span></span>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                    {unit.finishing && <span style={{ color: '#9CA3AF', fontSize: 12 }}>Отделка: <span style={{ color: '#111827', fontWeight: 400, fontSize: 14 }}>{unit.finishing}</span></span>}
                    {unit.completion_text && <span style={{ color: '#9CA3AF', fontSize: 12 }}>Сдача: <span style={{ color: '#111827', fontWeight: 400, fontSize: 14 }}>{unit.completion_text}</span></span>}
                </div>
                {unit.price_per_sqm && <span style={{ color: '#9CA3AF', fontSize: 12 }}>Цена за м²: <span style={{ color: '#111827', fontWeight: 400, fontSize: 14 }}>{formatPrice(unit.price_per_sqm)} ₽</span></span>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
                    {unit.is_two_level && <span style={{ fontSize: 11, background: '#F3F4F6', borderRadius: 999, padding: '3px 10px', color: '#374151' }}>Двухуровневая</span>}
                    {unit.has_master_bedroom && <span style={{ fontSize: 11, background: '#F3F4F6', borderRadius: 999, padding: '3px 10px', color: '#374151' }}>Мастер-спальня</span>}
                    {unit.is_apartments_legal && <span style={{ fontSize: 11, background: '#F3F4F6', borderRadius: 999, padding: '3px 10px', color: '#374151' }}>Апартаменты</span>}
                </div>
            </div>
        </div>
    );
}

/* ─── Units Section ─── */
function UnitsSection({ propertyId }) {
    const { getData } = useApiStore();
    const [allUnits, setAllUnits] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtering, setFiltering] = useState(false);
    const [filters, setFilters] = useState(defaultFilters);
    const [buildings, setBuildings] = useState([]);
    const [layoutLabels, setLayoutLabels] = useState([]);

    // Initial load — get all units once for pill options
    useEffect(() => {
        if (!propertyId) return;
        getData(`accounts/catalog/properties/${propertyId}/units/`)
            .then(res => {
                const results = Array.isArray(res) ? res : (res?.results ?? []);
                setAllUnits(results);
                setUnits(results);
                setBuildings([...new Set(results.map(u => u.building).filter(Boolean))]);
                setLayoutLabels([...new Set(results.map(u => u.layout_label).filter(Boolean))]);
            })
            .catch(() => { setAllUnits([]); setUnits([]); })
            .finally(() => setLoading(false));
    }, [propertyId]); // eslint-disable-line

    // Fetch with query params (debounced)
    const fetchFiltered = useCallback(async (f) => {
        setFiltering(true);
        try {
            const params = new URLSearchParams();
            Object.entries(f).forEach(([k, v]) => { if (v !== '' && v !== null) params.append(k, v); });
            const qs = params.toString();
            const url = `accounts/catalog/properties/${propertyId}/units/${qs ? `?${qs}` : ''}`;
            const res = await getData(url);
            const results = Array.isArray(res) ? res : (res?.results ?? []);
            setUnits(results);
        } catch {
            setUnits([]);
        } finally {
            setFiltering(false);
        }
    }, [propertyId, getData]);

    useEffect(() => {
        const hasActive = Object.values(filters).some(v => v !== '' && v !== null);
        if (!hasActive) { setUnits(allUnits); return; }
        const t = setTimeout(() => fetchFiltered(filters), 450);
        return () => clearTimeout(t);
    }, [filters]); // eslint-disable-line

    const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== null);
    const resetFilters = () => { setFilters(defaultFilters); setUnits(allUnits); };

    if (loading) {
        return (
            <div style={{ marginTop: 48 }}>
                <SkeletonBlock w="30%" h={24} mb={24} />
                <SkeletonBlock w="100%" h={44} mb={16} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {[1, 2, 3].map(i => <SkeletonBlock key={i} w="100%" h={260} mb={0} />)}
                </div>
            </div>
        );
    }

    if (allUnits.length === 0) return null;

    return (
        <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 24 }}>Планировка и цены</h2>

            <UnitsFilterPanel
                filters={filters}
                onChange={setFilters}
                onReset={resetFilters}
                buildings={buildings}
                layoutLabels={layoutLabels}
                hasActiveFilters={hasActiveFilters}
            />

            {filtering ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="units-grid">
                    {[1, 2, 3].map(i => <SkeletonBlock key={i} w="100%" h={260} mb={0} />)}
                </div>
            ) : units.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF', fontSize: 14 }}>
                    По вашему запросу ничего не найдено
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="units-grid">
                    {units.map(unit => <UnitCard key={unit.id} unit={unit} />)}
                </div>
            )}

            <style>{`
                @keyframes detail-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
                @media (max-width: 900px) { .units-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 560px) { .units-grid { grid-template-columns: 1fr !important; } }
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

    const [modalOpen, setModalOpen] = useState(false);

    function handleZayavka() { setModalOpen(true); }
    const allFields = [
        ['Застройщик', rd?.developer],
        ['Срок сдачи', rd?.completion_period_text],
        ['Класс жилья', rd?.housing_class],
        ['Цена за м²', rd?.price_per_sqm_from ? `от ${formatPrice(rd.price_per_sqm_from)} ₽` : null],
        ['Этажей', p.floors],
        ['Всего квартир', rd?.units_total],
        ['В продаже', rd?.units_available],
        ['Материал стен', p.wall_material],
        ['Отделка', p.finishing],
        ['От МКАД', p.distance_to_mkad_km ? `${p.distance_to_mkad_km} км` : null],
    ];

    return (
        <div className="max-w-[1400px] mx-auto px-5 py-10">
            <Toaster position="top-right" />
            <ZayavkaModal open={modalOpen} onClose={() => setModalOpen(false)} propertyName={p.name} />
            <HomeLink link="/catalog" label="Каталог" link2={"/catalog/" + p.id} label2={p.name} />
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 24 }}>
                <div style={{ flex: '1.2 1 340px', minWidth: 300 }}><Gallery images={p.images} /></div>
                <div style={{ flex: '0 1 340px', minWidth: 280 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>{p.name}</h1>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 16px' }}>{p.code}</p>
                    <div className="flex items-center justify-between mb-4">
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#141111', marginBottom: 16 }}>{formatPrice(p.price)} ₽</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <button onClick={() => toggleFavorite(p.id)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                {favActive ? <FaHeart size={15} color="#F05D22" /> : <FiHeart size={15} color="#9CA3AF" />}
                            </button>
                            <button onClick={() => toggleCompare(p.id)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                <FiBarChart2 size={15} color={cmpActive ? '#F05D22' : '#9CA3AF'} />
                            </button>
                        </div>
                    </div>
                    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                        {allFields.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
                    </div>
                    <button onClick={handleZayavka} style={{ background: ORANGE, color: '#fff', border: 'none', borderRadius: 999, padding: '14px 32px', fontSize: 15, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
                        Оставить заявку
                    </button>
                </div>
            </div>

            <DescriptionBlock description={p.description} />
            <UnitsSection propertyId={p.id} />

            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 48 }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 12 }}>Участок и локация</h2>
                    <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>{p.settlement && `${p.settlement}, `}{p.address}</p>
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
    const [modalOpen, setModalOpen] = useState(false);

    function handleZayavka() { setModalOpen(true); }
    const allFields = [
        ['Площадь участка', p.land_area ? `${p.land_area} сот.` : null],
        ['Район', p.district?.name], ['Шоссе', p.highway?.name],
        ['От МКАД', p.distance_to_mkad_km ? `${p.distance_to_mkad_km} км` : null],
        ['Посёлок', p.settlement], ['Отделка', p.finishing],
    ];
    return (
        <div className="max-w-[1400px] mx-auto px-5 py-10">
            <Toaster position="top-right" />
            <ZayavkaModal open={modalOpen} onClose={() => setModalOpen(false)} propertyName={p.name} />
            <HomeLink link="/catalog" label="Каталог" link2={"/catalog/" + p.id} label2={p.name} />
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 24 }}>
                <div style={{ flex: '1.2 1 340px', minWidth: 300 }}><Gallery images={p.images} /></div>
                <div style={{ flex: '0 1 340px', minWidth: 280 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>{p.name}</h1>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 16px' }}>{p.code}</p>
                    <div style={{ marginBottom: 6 }}><span style={{ fontSize: 13, color: '#9CA3AF', textDecoration: 'line-through' }}>от {formatPrice(p.price)} ₽</span></div>
                    <div className="flex items-center justify-between mb-4">
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#141111', marginBottom: 16 }}>{formatPrice(p.price)} ₽</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <button onClick={() => toggleFavorite(p.id)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                {favActive ? <FaHeart size={15} color="#F05D22" /> : <FiHeart size={15} color="#9CA3AF" />}
                            </button>
                            <button onClick={() => toggleCompare(p.id)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                <FiBarChart2 size={15} color={cmpActive ? '#F05D22' : '#9CA3AF'} />
                            </button>
                        </div>
                    </div>
                    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                        {allFields.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
                    </div>
                    {p.tags?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                            {p.tags.map(t => <span key={t.id} style={{ background: ORANGE, color: '#fff', borderRadius: 999, padding: '4px 14px', fontSize: 13 }}>{t.tag_name}</span>)}
                        </div>
                    )}
                    <button onClick={handleZayavka} style={{ background: ORANGE, color: '#fff', border: 'none', borderRadius: 999, padding: '14px 32px', fontSize: 15, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
                        Оставить заявку
                    </button>
                </div>
            </div>
            <DescriptionBlock description={p.description} />
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
   OTHER detail
   ═══════════════════════════════════════ */
function OtherDetail({ p }) {
    const rd = p.residential_details;
    const router = useRouter()
    const { isFavorite, toggleFavorite, isCompare, toggleCompare } = useFavoriteCompare()
    const favActive = isFavorite(p.id)
    const cmpActive = isCompare(p.id)
    const [modalOpen, setModalOpen] = useState(false);

    function handleZayavka() { setModalOpen(true); }
    const allFields = [
        ['Площадь', p.area ? `${p.area} м²` : null], ['Комнат', p.rooms], ['Этажей', p.floors],
        ['Район', p.district?.name], ['От МКАД', p.distance_to_mkad_km ? `${p.distance_to_mkad_km} км` : null],
        ['Спален', p.bedrooms], ['Санузлов', p.bathrooms], ['Год постройки', p.year_built],
        ['Материал стен', p.wall_material], ['Отделка', p.finishing], ['Шоссе', p.highway?.name],
        ...(rd ? [['Застройщик', rd.developer], ['Срок сдачи', rd.completion_period_text], ['Класс жилья', rd.housing_class]] : []),
    ];
    return (
        <div className="max-w-[1400px] mx-auto px-5 py-10">
            <Toaster position="top-right" />
            <ZayavkaModal open={modalOpen} onClose={() => setModalOpen(false)} propertyName={p.name} />
            <HomeLink link="/catalog" label="Каталог" link2={"/catalog/" + p.id} label2={p.name} />
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 24 }}>
                <div style={{ flex: '1.2 1 340px', minWidth: 300 }}><Gallery images={p.images} /></div>
                <div style={{ flex: '0 1 340px', minWidth: 280 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111827', margin: '0 0 4px' }}>{p.name}</h1>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 8px' }}>
                        {p.district?.name && `${p.district.name}, `}{p.distance_to_mkad_km && `${p.distance_to_mkad_km} км от МКАД`}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#141111', marginBottom: 16 }}>{formatPrice(p.price)} ₽</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <button onClick={() => toggleFavorite(p.id)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                {favActive ? <FaHeart size={15} color="#F05D22" /> : <FiHeart size={15} color="#9CA3AF" />}
                            </button>
                            <button onClick={() => toggleCompare(p.id)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                <FiBarChart2 size={15} color={cmpActive ? '#F05D22' : '#9CA3AF'} />
                            </button>
                        </div>
                    </div>
                    <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
                        {allFields.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
                    </div>
                    <button onClick={handleZayavka} style={{ background: ORANGE, color: '#fff', border: 'none', borderRadius: 999, padding: '14px 32px', fontSize: 15, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
                        Оставить заявку
                    </button>
                </div>
            </div>
            <DescriptionBlock description={p.description} />
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 48 }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 16 }}>Участок и локация</h2>
                    <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>{p.settlement && `${p.settlement}, `}{p.address}</p>
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
/* ─── Zayavka Modal ─── */
function ZayavkaModal({ open, onClose, propertyName }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!name || !phone) { toast.error('Введите имя и номер телефона'); return; }
        if (!agreed) { toast.error('Дайте согласие на обработку данных'); return; }
        setLoading(true);
        try {
            await postData('/site/consultation/', {
                name, phone, email: '', message: propertyName || '', personal_data_consent: true,
            });
            toast.success('Заявка принята!');
            setName(''); setPhone(''); setAgreed(false);
            onClose();
        } catch {
            toast.error('Произошла ошибка. Попробуйте снова');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease',
                }}
            />
            {/* Modal */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px', pointerEvents: 'none',
            }}>
                <div style={{
                    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460,
                    padding: '36px 32px 32px', position: 'relative', pointerEvents: 'all',
                    animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
                }}>
                    {/* Close */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 16, right: 16,
                            width: 32, height: 32, borderRadius: '50%',
                            border: '1px solid #E5E7EB', background: '#F9FAFB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#6B7280',
                        }}
                    >
                        <FiX size={15} />
                    </button>

                    {/* Header */}
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
                            Оставить заявку
                        </h3>
                        {propertyName && (
                            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>{propertyName}</p>
                        )}
                    </div>

                    {/* Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        <input
                            type="text"
                            placeholder="Ваше имя"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{
                                height: 52, borderRadius: 12, border: '1px solid #E5E7EB',
                                background: '#F9FAFB', padding: '0 16px', fontSize: 14,
                                outline: 'none', width: '100%', boxSizing: 'border-box',
                                color: '#111827', transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.target.style.borderColor = ORANGE_COLOR}
                            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                        <input
                            type="tel"
                            placeholder="Номер телефона"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            style={{
                                height: 52, borderRadius: 12, border: '1px solid #E5E7EB',
                                background: '#F9FAFB', padding: '0 16px', fontSize: 14,
                                outline: 'none', width: '100%', boxSizing: 'border-box',
                                color: '#111827', transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.target.style.borderColor = ORANGE_COLOR}
                            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* Checkbox */}
                    <div
                        onClick={() => setAgreed(a => !a)}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}
                    >
                        <div style={{
                            width: 20, height: 20, minWidth: 20, borderRadius: 6,
                            border: `2px solid ${agreed ? ORANGE_COLOR : '#D1D5DB'}`,
                            background: agreed ? ORANGE_COLOR : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: 1, transition: 'all 0.15s', flexShrink: 0,
                        }}>
                            {agreed && (
                                <svg width="11" height="8" viewBox="0 0 12 9" fill="none">
                                    <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, userSelect: 'none' }}>
                            Я даю согласие на обработку персональных данных в соответствии с{' '}
                            <a href="/privacy" style={{ color: ORANGE_COLOR, textDecoration: 'underline' }} onClick={e => e.stopPropagation()}>
                                Политикой
                            </a>
                        </span>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: '100%', height: 52, borderRadius: 999,
                            background: ORANGE, border: 'none',
                            color: '#fff', fontSize: 15, fontWeight: 500,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
                        }}
                    >
                        {loading ? 'Отправка...' : 'Отправить заявку'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
            `}</style>
        </>
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