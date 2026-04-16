'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { FiHeart, FiBarChart2 } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import { useFavoriteCompare } from '@/store/useFavoriteCompare'

function formatPrice(price) {
    return Number(price).toLocaleString('ru-RU')
}

export default function PropertyCard({ property, onFavoriteRemoved, onCompareRemoved }) {
    const { isFavorite, toggleFavorite, isCompare, toggleCompare } = useFavoriteCompare()
    const [activeSlide, setActiveSlide] = useState(0)

    const { id, name, price, district, highway, area, images: rawImages, tags } = property

    const images = rawImages?.length > 0 ? rawImages : [{ image: '/sec2.png' }]
    const favActive = isFavorite(id)
    const cmpActive = isCompare(id)

    return (
        <div className="flex flex-col gap-3 select-none">
            {/* ── Image block ── */}
            <div
                className="relative rounded-2xl overflow-hidden"
                style={{ aspectRatio: '1 / 0.75' }}
                onMouseLeave={() => setActiveSlide(0)}  // ✅ Container darajasida
            >
                {images.map((src, i) => (
                    <Image
                        key={i}
                        src={typeof src === 'string' ? src : src.image ?? '/sec2.png'}
                        alt={name}
                        fill
                        className={`object-cover transition-opacity duration-300 ${i === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}

                {/* Hover zones */}
                {images.length > 1 && (
                    <div className="absolute inset-0 flex z-10">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className="flex-1 h-full"
                                onMouseEnter={() => setActiveSlide(i)}
                            // ✅ onMouseLeave bu yerdan olib tashlandi
                            />
                        ))}
                    </div>
                )}

                {/* Action buttons */}
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                    <button
                        onClick={e => {
                            e.stopPropagation()
                            toggleFavorite(id, onFavoriteRemoved)
                        }}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow hover:scale-105 transition-transform"
                    >
                        {favActive
                            ? <FaHeart size={15} className="text-[#F05D22]" />
                            : <FiHeart size={15} className="text-gray-500" />
                        }
                    </button>
                    <button
                        onClick={e => {
                            e.stopPropagation()
                            toggleCompare(id, onCompareRemoved)
                        }}
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow hover:scale-105 transition-transform"
                    >
                        <FiBarChart2
                            size={15}
                            className={cmpActive ? 'text-[#F05D22]' : 'text-gray-500'}
                        />
                    </button>
                </div>

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

            {/* ── Info ── */}
            <div className="flex items-baseline justify-between gap-2 px-0.5">
                <span className="font-medium text-[20px] leading-[100%] line-clamp-1">{name}</span>
                <span className="font-medium text-[20px] leading-[100%] whitespace-nowrap">
                    {formatPrice(price)} ₽
                </span>
            </div>

            <div className="flex flex-col gap-[10px] px-0.5">
                <div className="flex gap-4 flex-wrap">
                    {district && (
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            Район: <span className="text-black font-normal text-[14px] leading-[100%]">{district.name}</span>
                        </span>
                    )}
                    {highway && (
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                            Шоссе: <span className="text-black font-normal text-[14px] leading-[100%]">{highway.name}</span>
                        </span>
                    )}
                </div>
                {area && (
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                        Площадь, м²: <span className="text-black font-normal text-[14px] leading-[100%]">{area}</span>
                    </span>
                )}
                {tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map(t => (
                            <span key={t.id} className="bg-[#F4F5F5] text-[11px] px-3 py-1 rounded-full">
                                {t.tag_name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}