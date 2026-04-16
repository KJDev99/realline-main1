'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { FiHeart, FiBarChart2, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

import 'swiper/css';
import { getData } from '@/lib/apiService';
import { useRouter } from 'next/navigation';

// ─── Zustand store (mavjud store'ingizga qo'shing) ───────────────────────────
// import { usePropertyStore } from '@/store/propertyStore';
// Agar alohida store bo'lmasa — local state bilan ishlaydi
// ─────────────────────────────────────────────────────────────────────────────

function formatPrice(price) {
    return Number(price).toLocaleString('ru-RU');
}

function PropertyCard({ property, aksiya }) {
    const [activeSlide, setActiveSlide] = useState(0);
    const [liked, setLiked] = useState(property.is_favourite);
    const [compared, setCompared] = useState(property.is_compare);

    const images = property.images?.length > 0
        ? property.images
        : ['/sec2.png'];

    return (
        <div className="flex flex-col gap-3 select-none">
            {/* Image block */}
            <div
                className="relative rounded-2xl overflow-hidden"
                style={{ aspectRatio: '1 / 0.75' }}
            >
                {images.map((src, i) => (
                    <Image
                        key={i}
                        src={typeof src === 'string' ? src : src.image ?? '/sec2.png'}
                        alt={property.name}
                        fill
                        className={`object-cover transition-opacity duration-300 ${i === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}

                {
                    aksiya && <div className='absolute left-4 top-4 bg-[#DF3505] text-sm text-[#FFFFFF] rounded-full py-2.5 px-5'>Акция</div>
                }

                {/* Action buttons */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <button
                        onClick={() => setLiked(!liked)}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow hover:scale-105 transition-transform"
                    >
                        {liked
                            ? <FaHeart size={15} className="text-red-500" />
                            : <FiHeart size={15} className="text-gray-500" />
                        }
                    </button>
                    <button
                        onClick={() => setCompared(!compared)}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow hover:scale-105 transition-transform"
                    >
                        <FiBarChart2 size={15} className={compared ? 'text-[#F05D22]' : 'text-gray-500'} />
                    </button>
                </div>

                {/* Hover zones */}
                {images.length > 1 && (
                    <div className="absolute inset-0 flex z-10">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className="flex-1 h-full"
                                onMouseEnter={() => setActiveSlide(i)}
                                onMouseLeave={() => setActiveSlide(0)}
                            />
                        ))}
                    </div>
                )}

                {/* Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                        {images.map((_, i) => (
                            <span
                                key={i}
                                className="block rounded-full transition-all duration-300"
                                style={{
                                    width: i === activeSlide ? 20 : 7,
                                    height: 7,
                                    background: i === activeSlide ? '#F05D22' : 'rgba(255,255,255,0.85)',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex items-baseline justify-between gap-2 px-0.5">
                <span className="font-medium text-[20px] leading-[100%] tracking-[0%] line-clamp-1">{property.name}</span>
                <span className="font-medium text-[20px] leading-[100%] tracking-[0%] whitespace-nowrap">
                    {formatPrice(property.price)} ₽
                </span>
            </div>

            <div className="flex flex-col gap-[10px] px-0.5">
                <div className="flex gap-4">
                    {property.district && (
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            Район: <span className="text-black font-normal text-[14px] leading-[100%]">{property.district.name}</span>
                        </span>
                    )}
                    {property.highway && (
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            Шоссе: <span className="text-black font-normal text-[14px] leading-[100%]">{property.highway.name}</span>
                        </span>
                    )}
                </div>
                <span className="text-gray-400 text-xs flex items-center gap-1">
                    Площадь, м²: <span className="text-black font-normal text-[14px] leading-[100%]">{property.area}</span>
                </span>
            </div>
        </div>
    );
}

// Skeleton loader
function CardSkeleton() {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            <div className="rounded-2xl bg-gray-200" style={{ aspectRatio: '1 / 0.75' }} />
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
    );
}

export default function ActualOffers() {
    const swiperRef = useRef(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const data = await getData('/accounts/properties/published/?actual_offers=true');
                setProperties(data.results ?? []);
            } catch (err) {
                console.error('Ошибка загрузки актуальных предложений:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const handleCardClick = (property) => {
        router.push(`/catalog/${property.id}`);
    };

    return (
        <section className="w-full py-12 px-5 md:px-10 bg-white rounded-2xl max-w-350 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold text-gray-900">Актуальные предложения</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => swiperRef.current?.slidePrev()}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition"
                    >
                        <FiArrowLeft size={16} className="text-gray-600" />
                    </button>
                    <button
                        onClick={() => swiperRef.current?.slideNext()}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition"
                    >
                        <FiArrowRight size={16} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Swiper */}
            <Swiper
                modules={[FreeMode]}
                freeMode
                slidesPerView={1.15}
                spaceBetween={16}
                speed={500}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                breakpoints={{
                    640: { slidesPerView: 2.15, spaceBetween: 20 },
                    1024: { slidesPerView: 3.15, spaceBetween: 24 },
                    1280: { slidesPerView: 3.4, spaceBetween: 24 },
                }}
            >
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <SwiperSlide key={i}>
                            <CardSkeleton />
                        </SwiperSlide>
                    ))
                    : properties.map((property) => (
                        <SwiperSlide key={property.id} onClick={() => handleCardClick(property)} style={{ cursor: 'pointer' }}>
                            <PropertyCard aksiya={true} property={property} />
                        </SwiperSlide>
                    ))
                }
            </Swiper>

            {!loading && properties.length === 0 && (
                <p className="text-center text-gray-400 py-10">Нет актуальных предложений</p>
            )}
        </section>
    );
}