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

const PAGE_LIMIT = 9;

const SelectIcon = () => (
    <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
        <path d="M1 1L6 6L11 1" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function parseParams(searchParams) {
    return {
        category: searchParams.get('category') || '',
        category_slug: searchParams.get('category_slug') || '',
        district: searchParams.get('district') || '',
        highway: searchParams.get('highway') || '',
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

function isLandPlot(categories, selectedCategoryId) {
    if (!selectedCategoryId) return false;
    const cat = categories.find(c => String(c.id) === String(selectedCategoryId));
    return cat?.slug === 'land_plot';
}

// ─── Inner component (uses useSearchParams) ───────────────────────────────────
function CatalogInner() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { getData } = useApiStore();
    const isOnCatalogPage = pathname === '/catalog';

    const [categories, setCategories] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [highways, setHighways] = useState([]);
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const initFilters = parseParams(searchParams);
    const [filters, setFilters] = useState(initFilters);
    const offsetRef = useRef(initFilters.offset);

    useEffect(() => {
        getData('accounts/catalog/categories/').then(data => {
            const sorted = (Array.isArray(data) ? data : data.results ?? []).sort((a, b) => a.sort_order - b.sort_order);
            setCategories(sorted);
        }).catch(() => { });
        getData('accounts/catalog/districts/').then(setDistricts).catch(() => { });
        getData('accounts/catalog/highways/').then(setHighways).catch(() => { });
    }, []); // eslint-disable-line

    const fetchProperties = useCallback(async (currentFilters, offset, append = false) => {
        const setter = append ? setLoadingMore : setLoading;
        setter(true); setError(null);
        try {
            const qs = buildQuery(currentFilters, offset);
            const data = await getData(`accounts/catalog/properties/?${qs}`);
            const results = data?.results || [];
            setTotal(data?.count ?? 0);
            setProperties(prev => append ? [...prev, ...results] : results);
        } catch (e) {
            setError(e?.message || 'Ошибка загрузки');
        } finally { setter(false); }
    }, [getData]);

    useEffect(() => {
        const parsed = parseParams(searchParams);
        setFilters(parsed);
        offsetRef.current = parsed.offset;
        fetchProperties(parsed, 0, false);
    }, [searchParams]); // eslint-disable-line

    const pushFilters = (newFilters) => {
        router.push(`${pathname}?${buildURLParams(newFilters).toString()}`);
    };

    const handleFilterChange = (key, value) => {
        const next = { ...filters, [key]: value };
        setFilters(next); pushFilters(next);
    };

    const toggleTag = (key) => handleFilterChange(key, !filters[key]);
    const handlePriceBlur = () => pushFilters(filters);
    const handlePriceKeyDown = (e) => { if (e.key === 'Enter') pushFilters(filters); };

    const clearFilters = () => {
        setFilters(parseParams(new URLSearchParams()));
        router.push(pathname);
    };

    const hasActiveFilters = () =>
        filters.category || filters.district || filters.highway ||
        filters.price_min || filters.price_max ||
        filters.area_min || filters.area_max ||
        filters.land_area_min || filters.land_area_max ||
        filters.distance_to_mkad_max ||
        BOOL_TAGS.some(({ key }) => filters[key]) ||
        filters.actual_offers;

    const handleLoadMore = async () => {
        const nextOffset = properties.length;
        offsetRef.current = nextOffset;
        const params = new URLSearchParams(searchParams.toString());
        params.set('offset', nextOffset);
        router.replace(`${pathname}?${params.toString()}`);
        await fetchProperties(filters, nextOffset, true);
    };

    const handleCardClick = (property) => {
        router.push(`/catalog/${property.id}`);
    };

    const hasMore = properties.length < total;
    const landPlotSelected = isLandPlot(categories, filters.category);

    return (
        <>
            <style>{`
                @keyframes catalog-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
            `}</style>

            <section className="w-full px-4 sm:px-6 md:px-10 py-10 md:py-12 max-w-350 mx-auto">
                <h2 className="text-[24px] md:text-[30px] mb-6 md:mb-8">Каталог недвижимости</h2>

                {/* FILTERS */}
                <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 mb-4">
                    <div className="relative w-full sm:w-[48%] md:w-[240px]">
                        <p className="text-[13px] md:text-[14px] mb-2">Тип недвижимости:</p>
                        <select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}
                            className="w-full h-[48px] md:h-[56px] bg-[#F4F5F5] px-4 md:px-6 rounded-[10px] text-[14px] md:text-[16px] outline-none appearance-none cursor-pointer">
                            <option value="">Все типы</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        <div className="absolute right-4 md:right-6 top-[42px] md:top-[52px] -translate-y-1/2 pointer-events-none"><SelectIcon /></div>
                    </div>

                    <div className="relative w-full sm:w-[48%] md:w-[240px]">
                        <p className="text-[13px] md:text-[14px] mb-2">Выберите район:</p>
                        <select value={filters.district} onChange={e => handleFilterChange('district', e.target.value)}
                            className="w-full h-[48px] md:h-[56px] bg-[#F4F5F5] px-4 md:px-6 rounded-[10px] text-[14px] md:text-[16px] outline-none appearance-none cursor-pointer">
                            <option value="">Все районы</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <div className="absolute right-4 md:right-6 top-[42px] md:top-[52px] -translate-y-1/2 pointer-events-none"><SelectIcon /></div>
                    </div>

                    <div className="relative hidden md:block w-full sm:w-[48%] md:w-[240px]">
                        <p className="text-[13px] md:text-[14px] mb-2">Выберите шоссе:</p>
                        <select value={filters.highway} onChange={e => handleFilterChange('highway', e.target.value)}
                            className="w-full h-[48px] md:h-[56px] bg-[#F4F5F5] px-4 md:px-6 rounded-[10px] text-[14px] md:text-[16px] outline-none appearance-none cursor-pointer">
                            <option value="">Все шоссе</option>
                            {highways.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                        <div className="absolute right-4 md:right-6 top-[42px] md:top-[52px] -translate-y-1/2 pointer-events-none"><SelectIcon /></div>
                    </div>

                    <div className="hidden lg:flex flex-col w-full sm:w-[48%] md:w-auto">
                        <p className="text-[13px] md:text-[14px] mb-2">{landPlotSelected ? 'Площадь участка, сот.:' : 'Площадь, м²:'}</p>
                        <div className="flex gap-3 mt-auto">
                            <select value={landPlotSelected ? filters.land_area_max : filters.area_max}
                                onChange={e => { const key = landPlotSelected ? 'land_area_max' : 'area_max'; const next = { ...filters, [key]: e.target.value }; setFilters(next); pushFilters(next); }}
                                className="w-[130px] h-[48px] md:h-[56px] bg-[#F4F5F5] px-4 rounded-[10px] text-[14px] md:text-[16px] outline-none appearance-none cursor-pointer">
                                <option value="">До</option>
                                {landPlotSelected
                                    ? [6, 10, 15, 20, 30, 50].map(v => <option key={v} value={v}>До {v} сот.</option>)
                                    : [40, 60, 80, 100, 120, 150, 200].map(v => <option key={v} value={v}>До {v} м²</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col w-full sm:w-[48%] md:w-auto">
                        <p className="text-[13px] md:text-[14px] mb-2">Стоимость:</p>
                        <div className="flex gap-3 mt-auto">
                            <input type="number" placeholder="От" value={filters.price_min}
                                onChange={e => setFilters(f => ({ ...f, price_min: e.target.value }))}
                                onBlur={handlePriceBlur} onKeyDown={handlePriceKeyDown}
                                className="w-full md:w-[100px] h-[48px] md:h-[56px] bg-[#F4F5F5] px-4 rounded-[10px] text-sm outline-none" />
                            <input type="number" placeholder="До" value={filters.price_max}
                                onChange={e => setFilters(f => ({ ...f, price_max: e.target.value }))}
                                onBlur={handlePriceBlur} onKeyDown={handlePriceKeyDown}
                                className="w-full md:w-[100px] h-[48px] md:h-[56px] bg-[#F4F5F5] px-4 rounded-[10px] text-sm outline-none" />
                        </div>
                    </div>
                </div>

                {/* BOOL TAGS */}
                <div className="hidden lg:flex flex-wrap gap-3 md:gap-4 mb-2 md:mb-4">
                    {BOOL_TAGS.map(({ key, label }) => (
                        <button key={key} onClick={() => toggleTag(key)}
                            className={`px-3 py-2 md:px-4 md:py-3 rounded-full text-[14px] md:text-[16px] transition ${filters[key] ? 'bg-gray-900 text-white' : 'bg-[#F4F5F5]'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {hasActiveFilters() && (
                    <div className="flex justify-end gap-4 mb-2">
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

// ─── Wrapper with Suspense — fixes useSearchParams build error ────────────────
export default function CatalogSection() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[400px]">
                <div className="w-8 h-8 border-2 border-[#141111] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CatalogInner />
        </Suspense>
    )
}