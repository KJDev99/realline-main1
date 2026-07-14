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

    // ── Yon strelkalar bilan varaqlash (pastki nuqtalarsiz ham) ──
    const goPrev = (e) => {
        e.stopPropagation()
        setActiveSlide(i => (i - 1 + images.length) % images.length)
    }
    const goNext = (e) => {
        e.stopPropagation()
        setActiveSlide(i => (i + 1) % images.length)
    }

    return (
        <div className="flex flex-col gap-3 select-none">
            {/* ── Image block ── */}
            <div
                className="relative rounded-2xl overflow-hidden bg-[#F4F5F5]"
                style={{ aspectRatio: '1 / 0.75' }}
            >
                {images.map((src, i) => (
                    <Image
                        key={i}
                        src={typeof src === 'string' ? src : src.image ?? '/sec2.png'}
                        alt={name}
                        fill
                        className={`object-contain transition-opacity duration-300 ${i === activeSlide ? 'opacity-100' : 'opacity-0'}`}
                    />
                ))}

                {/* Yon strelkalar — rasmlarni pastki navigatsiyasiz varaqlash */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goPrev}
                            aria-label="Предыдущее фото"
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 flex items-center justify-center shadow hover:bg-white transition-colors"
                        >
                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                                <path d="M7 1L1 7l6 6" stroke="#141111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button
                            onClick={goNext}
                            aria-label="Следующее фото"
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 flex items-center justify-center shadow hover:bg-white transition-colors"
                        >
                            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                                <path d="M1 1l6 6-6 6" stroke="#141111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </>
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
                <span className="font-medium text-[20px] leading-tight">{name}</span>
                <span className="font-medium text-[20px] leading-[100%] whitespace-nowrap shrink-0">
                    {formatPrice(price)} ₽
                </span>
            </div>

            <div className="flex flex-col gap-[10px] px-0.5">
                <div className="flex gap-4 flex-wrap">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                        Район: <span className="text-black font-normal text-[14px] leading-[100%]">{district?.name || '—'}</span>
                    </span>
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
                {/* {tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map(t => (
                            <span key={t.id} className="bg-[#F4F5F5] text-[11px] px-3 py-1 rounded-full">
                                {t.tag_name}
                            </span>
                        ))}
                    </div>
                )} */}
            </div>
        </div>
    )
}