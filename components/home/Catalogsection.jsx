'use client';

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import useApiStore from '@/store/useApiStore';
import PropertyCard from './Propertycard';

const BOOL_TAGS = [
    { key: 'promo', label: 'Акция' },
    { key: 'start_sales', label: 'Старт продаж' },
    { key: 'forest_access', label: 'С выходом в Лес' },
    { key: 'near_railway', label: 'Ж/д станция рядом' },
];

const CITIES = [
    { label: 'Москва', value: 'moscow' },
    { label: 'Санкт-Петербург', value: 'saint_petersburg' },
];

// Загород: тип дома / внешняя отделка (значения совпадают с backend choices)
const HOUSE_TYPE_OPTIONS = [
    { value: 'brick', label: 'Кирпичный' },
    { value: 'gas_concrete', label: 'Газобетон / пеноблок' },
    { value: 'wood', label: 'Деревянный' },
    { value: 'frame', label: 'Каркасный' },
    { value: 'monolith', label: 'Монолитный' },
    { value: 'combined', label: 'Комбинированный' },
];

const EXTERNAL_FINISHING_OPTIONS = [
    { value: 'facade_plaster', label: 'Фасадная штукатурка' },
    { value: 'siding_panels', label: 'Сайдинг и панели' },
    { value: 'facade_tile', label: 'Фасадная плитка' },
    { value: 'brick_stone', label: 'Кирпич / камень' },
    { value: 'wood_cladding', label: 'Облицовка дерево' },
];

const MKAD_OPTIONS = [10, 20, 30, 50, 100];

const PAGE_LIMIT = 9;
const CITY_STORAGE_KEY = 'selected_city';
const SELECTED_CITY_EVENT = 'selected-city-changed';
// Har bir shahar o'z sayti (subdomeni) — tanlanganda o'sha domenga o'tadi
const CITY_URLS = {
    moscow: 'https://reallain.ru/',
    saint_petersburg: 'https://saintpetersburg.reallain.ru/',
};

function getStoredCity() {
    try {
        const stored = localStorage.getItem(CITY_STORAGE_KEY);
        if (stored === 'moscow' || stored === 'saint_petersburg') return stored;
    } catch { }
    return 'moscow';
}

function setStoredCity(value) {
    try {
        localStorage.setItem(CITY_STORAGE_KEY, value);
    } catch { }
}

function parseParams(searchParams) {
    return {
        category: searchParams.get('category') || '',
        category_slug: searchParams.get('category_slug') || '',
        district: searchParams.get('district') || '',
        highway: searchParams.get('highway') || '',
        house_type: searchParams.get('house_type') || '',
        external_finishing: searchParams.get('external_finishing') || '',
        price_min: searchParams.get('price_min') || '',
        price_max: searchParams.get('price_max') || '',
        area_min: searchParams.get('area_min') || '',
        area_max: searchParams.get('area_max') || '',
        land_area_min: searchParams.get('land_area_min') || '',
        land_area_max: searchParams.get('land_area_max') || '',
        distance_to_mkad_max: searchParams.get('distance_to_mkad_max') || '',
        has_asphalt_roads: searchParams.get('has_asphalt_roads') === 'true' ? true : searchParams.get('has_asphalt_roads') === 'false' ? false : '',
        has_street_lighting: searchParams.get('has_street_lighting') === 'true' ? true : searchParams.get('has_street_lighting') === 'false' ? false : '',
        has_guarded_territory: searchParams.get('has_guarded_territory') === 'true' ? true : searchParams.get('has_guarded_territory') === 'false' ? false : '',
        near_shops: searchParams.get('near_shops') === 'true' ? true : searchParams.get('near_shops') === 'false' ? false : '',
        near_school_kindergarten: searchParams.get('near_school_kindergarten') === 'true' ? true : searchParams.get('near_school_kindergarten') === 'false' ? false : '',
        near_public_transport: searchParams.get('near_public_transport') === 'true' ? true : searchParams.get('near_public_transport') === 'false' ? false : '',
        promo: searchParams.get('promo') === 'true',
        start_sales: searchParams.get('start_sales') === 'true',
        forest_access: searchParams.get('forest_access') === 'true',
        near_railway: searchParams.get('near_railway') === 'true',
        actual_offers: searchParams.get('actual_offers') === 'true',
        offset: Number(searchParams.get('offset') || 0),
    };
}

function buildQuery(filters, offset) {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.category_slug) params.set('category_slug', filters.category_slug);
    if (filters.district) params.set('district', filters.district);
    if (filters.highway) params.set('highway', filters.highway);
    if (filters.house_type) params.set('house_type', filters.house_type);
    if (filters.external_finishing) params.set('external_finishing', filters.external_finishing);
    if (filters.price_min) params.set('price_min', filters.price_min);
    if (filters.price_max) params.set('price_max', filters.price_max);
    if (filters.area_min) params.set('area_min', filters.area_min);
    if (filters.area_max) params.set('area_max', filters.area_max);
    if (filters.land_area_min) params.set('land_area_min', filters.land_area_min);
    if (filters.land_area_max) params.set('land_area_max', filters.land_area_max);
    if (filters.distance_to_mkad_max) params.set('distance_to_mkad_max', filters.distance_to_mkad_max);
    const boolInfra = ['has_asphalt_roads', 'has_street_lighting', 'has_guarded_territory', 'near_shops', 'near_school_kindergarten', 'near_public_transport'];
    boolInfra.forEach(key => {
        if (filters[key] === true) params.set(key, 'true');
        else if (filters[key] === false) params.set(key, 'false');
    });
    BOOL_TAGS.forEach(({ key }) => { if (filters[key]) params.set(key, 'true'); });
    if (filters.actual_offers) params.set('actual_offers', 'true');
    params.set('limit', PAGE_LIMIT);
    params.set('offset', offset);
    return params.toString();
}

function buildURLParams(filters) {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.category_slug) params.set('category_slug', filters.category_slug);
    if (filters.district) params.set('district', filters.district);
    if (filters.highway) params.set('highway', filters.highway);
    if (filters.house_type) params.set('house_type', filters.house_type);
    if (filters.external_finishing) params.set('external_finishing', filters.external_finishing);
    if (filters.price_min) params.set('price_min', filters.price_min);
    if (filters.price_max) params.set('price_max', filters.price_max);
    if (filters.area_min) params.set('area_min', filters.area_min);
    if (filters.area_max) params.set('area_max', filters.area_max);
    if (filters.land_area_min) params.set('land_area_min', filters.land_area_min);
    if (filters.land_area_max) params.set('land_area_max', filters.land_area_max);
    if (filters.distance_to_mkad_max) params.set('distance_to_mkad_max', filters.distance_to_mkad_max);
    const boolInfra = ['has_asphalt_roads', 'has_street_lighting', 'has_guarded_territory', 'near_shops', 'near_school_kindergarten', 'near_public_transport'];
    boolInfra.forEach(key => {
        if (filters[key] === true) params.set(key, 'true');
        else if (filters[key] === false) params.set(key, 'false');
    });
    BOOL_TAGS.forEach(({ key }) => { if (filters[key]) params.set(key, 'true'); });
    if (filters.actual_offers) params.set('actual_offers', 'true');
    params.set('offset', '0');
    return params;
}

function CardSkeleton() {
    return (
        <div style={{
            borderRadius: 16, background: '#F5F5F5', height: 320,
            animation: 'catalog-pulse 1.4s ease-in-out infinite',
        }} />
    );
}

// Kategoriyani id bo'yicha topadi — ham yuqori daraja, ham sub_category ichidan
function findCategory(categories, selectedCategoryId) {
    if (!selectedCategoryId) return null;
    for (const c of categories) {
        if (String(c.id) === String(selectedCategoryId)) return c;
        const sub = c.sub_category?.find(s => String(s.id) === String(selectedCategoryId));
        if (sub) return sub;
    }
    return null;
}

function isLandPlot(categories, selectedCategoryId) {
    return findCategory(categories, selectedCategoryId)?.slug === 'land_plot';
}

function isSuburban(categories, selectedCategoryId) {
    const slug = findCategory(categories, selectedCategoryId)?.slug;
    return slug === 'dacha' || slug === 'cottage';
}

function SearchableSelect({ label, value, onChange, options, placeholder, className = '' }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open) {
            setTimeout(() => ref.current?.querySelector('input')?.focus(), 40);
        } else {
            setSearch('');
        }
    }, [open]);

    const selected = options.find(o => String(o.value) === String(value));
    const filtered = options.filter(o => o?.label?.toLowerCase().includes(search?.toLowerCase()));

    return (
        <div className={`flex flex-col gap-2 ${className}`} ref={ref}>
            {label && <p className='text-[13px] md:text-[14px]'>{label}</p>}
            <div className='relative'>
                <button
                    type='button'
                    onClick={() => setOpen(p => !p)}
                    className='w-full h-[48px] md:h-[56px] bg-[#F4F5F5] rounded-[10px] px-4 md:px-6 flex items-center justify-between text-[14px] md:text-[16px] outline-none text-left'
                >
                    <span className={selected ? 'text-[#141111] text-nowrap' : 'text-[#aaa]'}>
                        {selected ? selected.label.length > 20 ? selected.label.slice(0, 20) + '...' : selected.label : placeholder}
                    </span>
                    <svg width='12' height='7' viewBox='0 0 12 7' fill='none'
                        className={`transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
                        <path d='M1 1L6 6L11 1' stroke='#999' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                </button>
                {open && (
                    <div className='absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-[10px] shadow-md overflow-hidden'>
                        <div className='px-3 py-2 border-b border-[#E5E5E5]'>
                            <input
                                type='text'
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder='Поиск...'
                                className='w-full bg-[#F4F5F5] rounded-[8px] px-3 py-[6px] text-[13px] outline-none'
                            />
                        </div>
                        <div className='max-h-[200px] overflow-y-auto'>
                            {filtered.length > 0 ? filtered.map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={`px-4 py-[10px] text-[14px] cursor-pointer hover:bg-[#F4F5F5]
                                        ${String(opt.value) === String(value) ? 'font-semibold text-[#141111]' : 'text-[#444]'}`}
                                >
                                    {opt.label}
                                </div>
                            )) : (
                                <div className='px-4 py-3 text-[13px] text-[#999]'>Результаты не найдены.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Simple (non-searchable) city select — only 2 options, no search needed ──
function CitySelect({ label, value, onChange, className = '' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = CITIES.find(c => c.value === value);

    return (
        <div className={`flex flex-col gap-2 ${className}`} ref={ref}>
            {label && <p className='text-[13px] md:text-[14px]'>{label}</p>}
            <div className='relative'>
                <button
                    type='button'
                    onClick={() => setOpen(p => !p)}
                    className='w-full h-[48px] md:h-[56px] bg-[#F4F5F5] rounded-[10px] px-4 md:px-6 flex items-center justify-between text-[14px] md:text-[16px] outline-none text-left'
                >
                    <span className='text-[#141111]'>{selected?.label}</span>
                    <svg width='12' height='7' viewBox='0 0 12 7' fill='none'
                        className={`transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
                        <path d='M1 1L6 6L11 1' stroke='#999' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                </button>
                {open && (
                    <div className='absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-[10px] shadow-md overflow-hidden'>
                        {CITIES.map(city => (
                            <a
                                key={city.value}
                                href={CITY_URLS[city.value]}
                                onClick={(e) => {
                                    if (typeof window !== 'undefined' && window.location.hostname === new URL(CITY_URLS[city.value]).hostname) e.preventDefault();
                                    setOpen(false);
                                }}
                                className={`block no-underline px-4 py-[10px] text-[14px] cursor-pointer hover:bg-[#F4F5F5]
                                    ${city.value === value ? 'font-semibold text-[#141111]' : 'text-[#444]'}`}
                            >
                                {city.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Category select with hover sub-category fly-out (like Navbar) ──
function CategorySelect({ label, value, onChange, categories, className = '' }) {
    const [open, setOpen] = useState(false);
    const [openSubId, setOpenSubId] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setOpenSubId(null); }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Resolve label of the currently selected category / sub-category
    let selectedLabel = 'Все типы';
    if (value) {
        for (const cat of categories) {
            if (String(cat.id) === String(value)) { selectedLabel = cat.main_category; break; }
            const sub = cat.sub_category?.find(s => String(s.id) === String(value));
            if (sub) { selectedLabel = sub.sub_category; break; }
        }
    }

    const select = (v) => { onChange(v); setOpen(false); setOpenSubId(null); };

    return (
        <div className={`flex flex-col gap-2 ${className}`} ref={ref}>
            {label && <p className='text-[13px] md:text-[14px]'>{label}</p>}
            <div className='relative'>
                <button
                    type='button'
                    onClick={() => setOpen(p => !p)}
                    className='w-full h-[48px] md:h-[56px] bg-[#F4F5F5] rounded-[10px] px-4 md:px-6 flex items-center justify-between text-[14px] md:text-[16px] outline-none text-left'
                >
                    <span className='text-[#141111] truncate'>{selectedLabel}</span>
                    <svg width='12' height='7' viewBox='0 0 12 7' fill='none'
                        className={`transition-transform flex-shrink-0 ml-2 ${open ? 'rotate-180' : ''}`}>
                        <path d='M1 1L6 6L11 1' stroke='#999' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                </button>
                {open && (
                    <div className='absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-[10px] shadow-md'
                        style={{ padding: '6px 0' }}>
                        <style>{`
                            .cat-submenu { position: absolute; top: 0; left: 100%; background:#fff; border-radius:10px; box-shadow:0 8px 32px rgba(0,0,0,0.12); min-width:200px; z-index:9999; padding:6px 0; border:1px solid #E5E5E5; }
                            @media (max-width: 768px) {
                                .cat-submenu { position: static; top:auto; left:auto; min-width:0; width:100%; box-shadow:none; border:none; border-left:2px solid #F05D22; border-radius:0; padding:2px 0 2px 10px; margin-top:2px; background:#FAFAFA; }
                            }
                        `}</style>
                        <div
                            onClick={() => select('')}
                            className='px-4 py-[10px] text-[14px] cursor-pointer hover:bg-[#F4F5F5] text-[#444]'
                        >
                            Все типы
                        </div>
                        {categories.map(cat => {
                            const hasSub = cat.sub_category?.length > 0;
                            return (
                                <div
                                    key={cat.id}
                                    style={{ position: 'relative' }}
                                    onMouseEnter={() => hasSub && setOpenSubId(cat.id)}
                                    onMouseLeave={() => hasSub && setOpenSubId(null)}
                                >
                                    <div
                                        onClick={() => select(cat.id)}
                                        className={`flex items-center justify-between px-4 py-[10px] text-[14px] cursor-pointer hover:bg-[#F4F5F5]
                                            ${String(cat.id) === String(value) ? 'font-semibold text-[#141111]' : 'text-[#444]'}`}
                                    >
                                        {cat.main_category}
                                        {hasSub && (
                                            <span
                                                onClick={(e) => { e.stopPropagation(); setOpenSubId(p => p === cat.id ? null : cat.id); }}
                                                style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 0 4px 10px', flexShrink: 0 }}
                                            >
                                                <svg width='8' height='12' viewBox='0 0 8 12' fill='none'
                                                    style={{ transition: 'transform 0.2s', transform: openSubId === cat.id ? 'rotate(90deg)' : 'none' }}>
                                                    <path d='M1 1l6 5-6 5' stroke='#9CA3AF' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    {hasSub && openSubId === cat.id && (
                                        <div className="cat-submenu">
                                            {cat.sub_category.map(sub => (
                                                <div
                                                    key={sub.id}
                                                    onClick={() => select(sub.id)}
                                                    className={`px-4 py-[10px] text-[14px] cursor-pointer hover:bg-[#F4F5F5]
                                                        ${String(sub.id) === String(value) ? 'font-semibold text-[#141111]' : 'text-[#444]'}`}
                                                >
                                                    {sub.sub_category}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function CatalogInner() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { getData } = useApiStore();
    const isOnCatalogPage = pathname === '/catalog';

    const [selectedCity, setSelectedCity] = useState('moscow');
    const [cityReady, setCityReady] = useState(false);

    const [categories, setCategories] = useState([]);
    const [allDistricts, setAllDistricts] = useState([]);
    const [allHighways, setAllHighways] = useState([]);
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // ── Mobile filter accordion state ──
    const [mobileExpanded, setMobileExpanded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const expandedContentRef = useRef(null);
    const [expandedHeight, setExpandedHeight] = useState(0);

    const initFilters = parseParams(searchParams);
    const [filters, setFilters] = useState(initFilters);
    const offsetRef = useRef(initFilters.offset);
    const filtersRef = useRef(filters);
    filtersRef.current = filters;
    const selectedCityRef = useRef(selectedCity);
    selectedCityRef.current = selectedCity;

    // Filtered by current city
    const districts = allDistricts.filter(d => d.region === selectedCity);
    const highways = allHighways.filter(h => h.region === selectedCity);

    // Read city from localStorage on mount
    useEffect(() => {
        const city = getStoredCity();
        setSelectedCity(city);
        setCityReady(true);
    }, []);

    // Shapka (Navbar) da shahar almashtirilsa — katalogni shu shaharga moslash
    useEffect(() => {
        const handler = (e) => {
            const v = e.detail?.value;
            if (v !== 'moscow' && v !== 'saint_petersburg') return;
            if (v === selectedCityRef.current) return;
            setSelectedCity(v);
            setStoredCity(v);
            const next = { ...filtersRef.current, district: '', highway: '' };
            setFilters(next);
            router.replace(`${pathname}?${buildURLParams(next).toString()}`, { scroll: false });
        };
        window.addEventListener(SELECTED_CITY_EVENT, handler);
        return () => window.removeEventListener(SELECTED_CITY_EVENT, handler);
    }, [pathname, router]);

    // Категории не зависят от города
    useEffect(() => {
        getData('accounts/catalog/categories/').then(data => {
            const sorted = (Array.isArray(data) ? data : data.results ?? []).sort((a, b) => a.sort_order - b.sort_order);
            setCategories(sorted);
        }).catch(() => { });
    }, []); // eslint-disable-line

    // Районы и шоссе зависят от выбранного города
    useEffect(() => {
        if (!cityReady) return;
        getData(`accounts/catalog/districts/?region=${selectedCity}`).then(data => {
            setAllDistricts(Array.isArray(data) ? data : data.results ?? []);
        }).catch(() => { });
        getData(`accounts/catalog/highways/?region=${selectedCity}`).then(data => {
            setAllHighways(Array.isArray(data) ? data : data.results ?? []);
        }).catch(() => { });
    }, [selectedCity, cityReady]); // eslint-disable-line

    const fetchProperties = useCallback(async (currentFilters, offset, append = false) => {
        const setter = append ? setLoadingMore : setLoading;
        setter(true); setError(null);
        try {
            const qs = buildQuery(currentFilters, offset);
            const data = await getData(`accounts/catalog/properties/?${qs}&region=${selectedCity}`);
            const results = data?.results || [];
            setTotal(data?.count ?? 0);
            setProperties(prev => append ? [...prev, ...results] : results);
        } catch (e) {
            setError(e?.message || 'Ошибка загрузки');
        } finally { setter(false); }
    }, [getData, selectedCity]);

    useEffect(() => {
        if (!cityReady) return;
        const parsed = parseParams(searchParams);
        setFilters(parsed);
        offsetRef.current = parsed.offset;
        fetchProperties(parsed, 0, false);
    }, [searchParams, selectedCity, cityReady]); // eslint-disable-line

    // Measure expanded content height for animation
    useEffect(() => {
        if (expandedContentRef.current) {
            setExpandedHeight(expandedContentRef.current.scrollHeight);
        }
    }, [mobileExpanded, categories, highways, filters]);

    const toggleMobileFilter = () => {
        setIsAnimating(true);
        if (expandedContentRef.current) {
            setExpandedHeight(expandedContentRef.current.scrollHeight);
        }
        setMobileExpanded(prev => !prev);
        setTimeout(() => setIsAnimating(false), 350);
    };

    const pushFilters = (newFilters) => {
        router.replace(`${pathname}?${buildURLParams(newFilters).toString()}`, { scroll: false });
    };

    const handleFilterChange = (key, value) => {
        const next = { ...filters, [key]: value };
        // Загородное шоссе tanlansa — «Район» kriteriyasi olib tashlanadi
        if (key === 'highway' && value) next.district = '';
        setFilters(next); pushFilters(next);
    };

    // When city changes: save to localStorage, clear district & highway filters
    const handleCityChange = (city) => {
        setSelectedCity(city);
        setStoredCity(city);
        document.cookie = `selected_city=${city};path=/;max-age=31536000`;
        const next = { ...filters, district: '', highway: '' };
        setFilters(next);
        pushFilters(next);
        window.dispatchEvent(new CustomEvent(SELECTED_CITY_EVENT, { detail: { value: city } }));
    };

    const toggleTag = (key) => handleFilterChange(key, !filters[key]);
    const handlePriceBlur = () => pushFilters(filters);
    const handlePriceKeyDown = (e) => { if (e.key === 'Enter') pushFilters(filters); };

    const clearFilters = () => {
        setFilters(parseParams(new URLSearchParams()));
        router.replace(pathname, { scroll: false });
    };

    const hasActiveFilters = () =>
        filters.category || filters.district || filters.highway ||
        filters.price_min || filters.price_max ||
        filters.area_min || filters.area_max ||
        filters.land_area_min || filters.land_area_max ||
        filters.distance_to_mkad_max ||
        filters.house_type || filters.external_finishing ||
        BOOL_TAGS.some(({ key }) => filters[key]) ||
        filters.actual_offers;

    const handleLoadMore = async () => {
        // «Показать ещё» — faqat keyingi obyektlarni ro'yxat oxiriga qo'shadi (next).
        // URL o'zgarmaydi → sahifa tepaga sakramaydi va birinchi obyektlar qayta yuklanmaydi.
        await fetchProperties(filters, properties.length, true);
    };

    const handleCardClick = (property) => {
        router.push(`/catalog/${property.slug}`);
    };

    const hasMore = properties.length < total;
    const suburbanSelected = isSuburban(categories, filters.category);
    const landPlotSelected = isLandPlot(categories, filters.category) || suburbanSelected;

    // Don't render city-dependent selects until localStorage is read
    if (!cityReady) return null;

    return (
        <>
            <style>{`
                @keyframes catalog-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
                .mobile-filter-expanded {
                    overflow: hidden;
                    transition: max-height 0.35s ease, opacity 0.35s ease;
                }
            `}</style>

            <section className="w-full px-4 sm:px-6 md:px-10 py-10 md:py-12 max-w-350 mx-auto">
                <h2 className="text-[24px] md:text-[30px] mb-6 md:mb-8">Каталог недвижимости</h2>

                {/* ── DESKTOP FILTERS (md+) ── */}
                <div className="hidden md:flex flex-row flex-wrap gap-4 md:gap-6 mb-4">
                    {/* City select — always first */}
                    <CitySelect
                        label='Выберите город:'
                        value={selectedCity}
                        onChange={handleCityChange}
                        className='w-[240px]'
                    />
                    <CategorySelect
                        label='Тип недвижимости:'
                        value={filters.category}
                        onChange={v => handleFilterChange('category', v)}
                        categories={categories}
                        className='w-[240px]'
                    />
                    {!filters.highway && (
                        <SearchableSelect
                            label='Выберите район:'
                            value={filters.district}
                            onChange={v => handleFilterChange('district', v)}
                            options={[{ value: '', label: 'Все районы' }, ...districts.map(d => ({ value: d.id, label: d.name }))]}
                            placeholder='Все районы'
                            className='w-[240px]'
                        />
                    )}
                    <SearchableSelect
                        label='Выберите шоссе:'
                        value={filters.highway}
                        onChange={v => handleFilterChange('highway', v)}
                        options={[{ value: '', label: 'Все шоссе' }, ...highways.map(h => ({ value: h.id, label: h.name }))]}
                        placeholder='Все шоссе'
                        className='w-[240px]'
                    />
                    {suburbanSelected && (
                        <>
                            <SearchableSelect
                                label='Тип дома:'
                                value={filters.house_type}
                                onChange={v => handleFilterChange('house_type', v)}
                                options={[{ value: '', label: 'Любой' }, ...HOUSE_TYPE_OPTIONS]}
                                placeholder='Любой'
                                className='w-[240px]'
                            />
                            <SearchableSelect
                                label='Внешняя отделка:'
                                value={filters.external_finishing}
                                onChange={v => handleFilterChange('external_finishing', v)}
                                options={[{ value: '', label: 'Любая' }, ...EXTERNAL_FINISHING_OPTIONS]}
                                placeholder='Любая'
                                className='w-[240px]'
                            />
                            <SearchableSelect
                                label='От МКАД:'
                                value={filters.distance_to_mkad_max}
                                onChange={v => handleFilterChange('distance_to_mkad_max', v)}
                                options={[{ value: '', label: 'Любое' }, ...MKAD_OPTIONS.map(v => ({ value: v, label: `До ${v} км` }))]}
                                placeholder='Любое'
                                className='w-[240px]'
                            />
                        </>
                    )}
                    <div className="hidden lg:flex flex-col w-auto">
                        <p className="text-[13px] md:text-[14px] mb-2">
                            {landPlotSelected ? 'Площадь участка, сот.:' : 'Площадь, м²:'}
                        </p>
                        <div className="flex gap-3 mt-auto">
                            <select
                                value={
                                    (landPlotSelected ? filters.land_area_min : filters.area_min)
                                        ? `>${landPlotSelected ? filters.land_area_min : filters.area_min}`
                                        : (landPlotSelected ? filters.land_area_max : filters.area_max)
                                }
                                onChange={e => {
                                    const val = e.target.value;
                                    const minKey = landPlotSelected ? 'land_area_min' : 'area_min';
                                    const maxKey = landPlotSelected ? 'land_area_max' : 'area_max';
                                    const next = val.startsWith('>')
                                        ? { ...filters, [minKey]: val.slice(1), [maxKey]: '' }
                                        : { ...filters, [maxKey]: val, [minKey]: '' };
                                    setFilters(next); pushFilters(next);
                                }}
                                className="w-[130px] h-[48px] md:h-[56px] bg-[#F4F5F5] px-4 rounded-[10px] text-[14px] md:text-[16px] outline-none appearance-none cursor-pointer"
                            >
                                <option value="">До</option>
                                {landPlotSelected ? (
                                    <>
                                        {[6, 10, 15, 20, 30, 50].map(v => <option key={v} value={v}>До {v} сот.</option>)}
                                        <option value=">50">более 50 сот.</option>
                                    </>
                                ) : (
                                    <>
                                        {[40, 60, 80, 100, 120, 150, 200].map(v => <option key={v} value={v}>До {v} м²</option>)}
                                        <option value=">200">более 200 м²</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-end gap-5">
                        <div className="hidden lg:flex flex-col w-auto">
                            <p className="text-[13px] md:text-[14px] mb-2">Стоимость:</p>
                            <div className="flex gap-3 mt-auto ">
                                <input type="number" placeholder="От" value={filters.price_min}
                                    onChange={e => setFilters(f => ({ ...f, price_min: e.target.value }))}
                                    onBlur={handlePriceBlur} onKeyDown={handlePriceKeyDown}
                                    className="w-[100px] h-[48px] md:h-[56px] bg-[#F4F5F5] px-4 rounded-[10px] text-sm outline-none" />
                                <input type="number" placeholder="До" value={filters.price_max}
                                    onChange={e => setFilters(f => ({ ...f, price_max: e.target.value }))}
                                    onBlur={handlePriceBlur} onKeyDown={handlePriceKeyDown}
                                    className="w-[100px] h-[48px] md:h-[56px] bg-[#F4F5F5] px-4 rounded-[10px] text-sm outline-none" />
                            </div>
                        </div>
                        {/* ── DESKTOP BOOL TAGS ── */}
                        <div className="hidden lg:flex flex-wrap gap-3 md:gap-4 ">
                            {BOOL_TAGS.map(({ key, label }) => (
                                <button key={key} onClick={() => toggleTag(key)}
                                    className={`px-3 py-2 md:px-4 md:py-3 rounded-full text-[14px] md:text-[16px] transition ${filters[key] ? 'bg-gray-900 text-white' : 'bg-[#F4F5F5]'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>



                {/* ── MOBILE FILTERS ── */}
                <div className="flex md:hidden flex-col gap-3 mb-4">
                    {/* Always visible: city + 2 selects */}
                    <CitySelect
                        label='Выберите город:'
                        value={selectedCity}
                        onChange={handleCityChange}
                        className='w-full'
                    />
                    <CategorySelect
                        label='Тип недвижимости:'
                        value={filters.category}
                        onChange={v => handleFilterChange('category', v)}
                        categories={categories}
                        className='w-full'
                    />
                    {!filters.highway && (
                        <SearchableSelect
                            label='Выберите район:'
                            value={filters.district}
                            onChange={v => handleFilterChange('district', v)}
                            options={[{ value: '', label: 'Все районы' }, ...districts.map(d => ({ value: d.id, label: d.name }))]}
                            placeholder='Все районы'
                            className='w-full'
                        />
                    )}

                    {/* Expandable section */}
                    <div
                        className="mobile-filter-expanded"
                        style={{
                            maxHeight: mobileExpanded ? `${expandedHeight}px` : '0px',
                            opacity: mobileExpanded ? 1 : 0,
                        }}
                    >
                        <div ref={expandedContentRef} className="flex flex-col gap-3 pt-1">
                            <SearchableSelect
                                label='Выберите шоссе:'
                                value={filters.highway}
                                onChange={v => handleFilterChange('highway', v)}
                                options={[{ value: '', label: 'Все шоссе' }, ...highways.map(h => ({ value: h.id, label: h.name }))]}
                                placeholder='Все шоссе'
                                className='w-full'
                            />
                            {suburbanSelected && (
                                <>
                                    <SearchableSelect
                                        label='Тип дома:'
                                        value={filters.house_type}
                                        onChange={v => handleFilterChange('house_type', v)}
                                        options={[{ value: '', label: 'Любой' }, ...HOUSE_TYPE_OPTIONS]}
                                        placeholder='Любой'
                                        className='w-full'
                                    />
                                    <SearchableSelect
                                        label='Внешняя отделка:'
                                        value={filters.external_finishing}
                                        onChange={v => handleFilterChange('external_finishing', v)}
                                        options={[{ value: '', label: 'Любая' }, ...EXTERNAL_FINISHING_OPTIONS]}
                                        placeholder='Любая'
                                        className='w-full'
                                    />
                                    <SearchableSelect
                                        label='От МКАД:'
                                        value={filters.distance_to_mkad_max}
                                        onChange={v => handleFilterChange('distance_to_mkad_max', v)}
                                        options={[{ value: '', label: 'Любое' }, ...MKAD_OPTIONS.map(v => ({ value: v, label: `До ${v} км` }))]}
                                        placeholder='Любое'
                                        className='w-full'
                                    />
                                </>
                            )}
                            {/* Площадь */}
                            <div className="flex flex-col gap-2">
                                <p className="text-[13px]">
                                    {landPlotSelected ? 'Площадь участка, сот.:' : 'Площадь, м²:'}
                                </p>
                                <select
                                    value={
                                        (landPlotSelected ? filters.land_area_min : filters.area_min)
                                            ? `>${landPlotSelected ? filters.land_area_min : filters.area_min}`
                                            : (landPlotSelected ? filters.land_area_max : filters.area_max)
                                    }
                                    onChange={e => {
                                        const val = e.target.value;
                                        const minKey = landPlotSelected ? 'land_area_min' : 'area_min';
                                        const maxKey = landPlotSelected ? 'land_area_max' : 'area_max';
                                        const next = val.startsWith('>')
                                            ? { ...filters, [minKey]: val.slice(1), [maxKey]: '' }
                                            : { ...filters, [maxKey]: val, [minKey]: '' };
                                        setFilters(next); pushFilters(next);
                                    }}
                                    className="w-full h-[48px] bg-[#F4F5F5] px-4 rounded-[10px] text-[14px] outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">До</option>
                                    {landPlotSelected ? (
                                        <>
                                            {[6, 10, 15, 20, 30, 50].map(v => <option key={v} value={v}>До {v} сот.</option>)}
                                            <option value=">50">более 50 сот.</option>
                                        </>
                                    ) : (
                                        <>
                                            {[40, 60, 80, 100, 120, 150, 200].map(v => <option key={v} value={v}>До {v} м²</option>)}
                                            <option value=">200">более 200 м²</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            {/* Стоимость */}
                            <div className="flex flex-col gap-2">
                                <p className="text-[13px]">Стоимость:</p>
                                <div className="flex gap-3 max-md:grid max-md:grid-cols-2">
                                    <input type="number" placeholder="От" value={filters.price_min}
                                        onChange={e => setFilters(f => ({ ...f, price_min: e.target.value }))}
                                        onBlur={handlePriceBlur} onKeyDown={handlePriceKeyDown}
                                        className="flex-1 h-[48px] bg-[#F4F5F5] px-4 rounded-[10px] text-sm outline-none" />
                                    <input type="number" placeholder="До" value={filters.price_max}
                                        onChange={e => setFilters(f => ({ ...f, price_max: e.target.value }))}
                                        onBlur={handlePriceBlur} onKeyDown={handlePriceKeyDown}
                                        className="flex-1 h-[48px] bg-[#F4F5F5] px-4 rounded-[10px] text-sm outline-none" />
                                </div>
                            </div>
                            {/* Bool tags */}
                            <div className="flex flex-wrap gap-2 pb-1">
                                {BOOL_TAGS.map(({ key, label }) => (
                                    <button key={key} onClick={() => toggleTag(key)}
                                        className={`px-3 py-2 rounded-full text-[14px] transition ${filters[key] ? 'bg-gray-900 text-white' : 'bg-[#F4F5F5]'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Expand / Collapse + Clear row */}
                    <div className="flex items-center justify-center gap-6 mt-1">
                        <button
                            onClick={toggleMobileFilter}
                            className="text-[13px] text-[#14111180] flex items-center gap-1"
                        >
                            {mobileExpanded ? 'Свернуть фильтр' : 'Развернуть фильтр'}
                            <svg
                                width="12" height="7" viewBox="0 0 12 7" fill="none"
                                className={`transition-transform duration-300 ${mobileExpanded ? 'rotate-180' : ''}`}
                            >
                                <path d="M1 1L6 6L11 1" stroke="#14111180" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        {hasActiveFilters() && (
                            <button onClick={clearFilters} className="text-[13px] text-[#14111180] flex items-center gap-1">
                                Очистить фильтр <span>×</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── DESKTOP clear filter ── */}
                {hasActiveFilters() && (
                    <div className="hidden md:flex justify-end gap-4 mb-2">
                        <button onClick={clearFilters} className="text-[13px] md:text-[14px] text-[#14111180] flex items-center gap-1">
                            Очистить фильтр <span>×</span>
                        </button>
                    </div>
                )}

                {error && <p className="text-center text-red-400 text-sm py-8">{error}</p>}

                {/* GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-[64px]">
                    {loading
                        ? Array.from({ length: PAGE_LIMIT }).map((_, i) => <CardSkeleton key={i} />)
                        : properties.map(property => (
                            <div key={property.id} onClick={() => handleCardClick(property)} style={{ cursor: 'pointer' }}>
                                <PropertyCard property={property} />
                            </div>
                        ))
                    }
                    {loadingMore && Array.from({ length: PAGE_LIMIT }).map((_, i) => <CardSkeleton key={`more-${i}`} />)}
                </div>

                {!loading && !error && properties.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-16">Объекты не найдены</p>
                )}

                {!loading && properties.length > 0 && (
                    <div className="flex flex-col items-center gap-3 mt-6">
                        {hasMore && (
                            <button onClick={handleLoadMore} disabled={loadingMore}
                                className="text-[13px] md:text-[14px] text-[#14111180] disabled:opacity-40">
                                {loadingMore ? 'Загрузка...' : 'Показать ещё'}
                            </button>
                        )}
                        {!isOnCatalogPage && (
                            <Link href="/catalog">
                                <button className="border-2 rounded-full px-4 md:px-5 py-2 text-[13px] md:text-[14px]">
                                    Смотреть весь каталог
                                </button>
                            </Link>
                        )}
                    </div>
                )}
            </section>
        </>
    );
}

export default function CatalogSection() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[400px]">
                <div className="w-8 h-8 border-2 border-[#141111] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CatalogInner />
        </Suspense>
    );
}