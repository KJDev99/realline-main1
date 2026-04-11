'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

function getAuthHeaders() {
    const token = localStorage.getItem('access_token')
    return { Authorization: `Bearer ${token}` }
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_COLOR = {
    published: 'bg-green-500',
    moderation: 'bg-yellow-400',
    rejected: 'bg-red-500',
    draft: 'bg-gray-400',
}

const TABS = [
    { id: 'all', label: 'Показать все объекты', status: null },
    { id: 'moderation', label: 'На модерации', status: 'moderation' },
    { id: 'published', label: 'Опубликованы', status: 'published' },
    { id: 'rejected', label: 'Отклонены', status: 'rejected' },
]

// ─── ObyektCard ───────────────────────────────────────────────────────────────
function ObyektCard({ item }) {
    const { name, code, price, status, status_display, rejection_reason, images, tags } = item
    const isRejected = status === 'rejected'
    const thumb = images?.[0]?.image || null

    return (
        <div className='w-full max-w-[416px] p-6 bg-[#FAFAFA] rounded-[20px] mx-auto'>
            {/* Thumbnail */}
            {thumb && (
                <div className='w-full h-[160px] rounded-[12px] overflow-hidden mb-4'>
                    <img src={thumb} alt={name} className='w-full h-full object-cover' />
                </div>
            )}

            {/* Title */}
            <h1 className='font-normal text-[24px] leading-tight max-sm:text-[20px]'>
                {name}
            </h1>

            {/* Code */}
            <span className='flex items-center gap-1 mt-[12px] text-[16px] max-sm:text-[14px]'>
                <h2 className='text-[#14111180] font-normal'>Код:</h2>
                <p>{code}</p>
            </span>

            {/* Price */}
            <span className='flex items-center gap-1 mt-[8px] text-[16px] max-sm:text-[14px]'>
                <h2 className='text-[#14111180] font-normal'>Цена:</h2>
                <p>{Number(price).toLocaleString('ru-RU')} ₽</p>
            </span>

            {/* Status block */}
            <div className='w-full rounded-[15px] bg-white p-[15px] mt-5 mb-4'>
                <h2 className='font-medium text-[18px] mb-[10px] max-sm:text-[15px]'>Статус:</h2>
                <div className='flex gap-2 items-center'>
                    <div className={`w-[18px] h-[18px] ${STATUS_COLOR[status] || 'bg-gray-400'} rounded-full`} />
                    <span className='text-[14px]'>{status_display}</span>
                </div>
            </div>

            {/* Rejection reason */}
            {isRejected && rejection_reason && (
                <p className='text-red-600 text-[13px] underline cursor-pointer mt-2'>
                    {rejection_reason}
                </p>
            )}

            {/* Tags */}
            {tags?.length > 0 && (
                <div className='flex flex-wrap gap-2 mt-3'>
                    {tags.map(t => (
                        <span key={t.id} className='bg-[#F4F5F5] text-[12px] px-3 py-1 rounded-full'>
                            {t.tag_name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Top() {
    const [activeTab, setActiveTab] = useState('all')
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true)
            try {
                const { data } = await axios.get(`${API_BASE}accounts/properties/`, {
                    headers: getAuthHeaders(),
                })
                // API paginated => data.results, yoki to'g'ridan massiv
                setProperties(Array.isArray(data) ? data : data.results || [])
            } catch {
                toast.error('Не удалось загрузить объекты')
            } finally {
                setLoading(false)
            }
        }
        fetchProperties()
    }, [])

    const activeStatus = TABS.find(t => t.id === activeTab)?.status

    const filtered = activeStatus
        ? properties.filter(p => p.status === activeStatus)
        : properties

    return (
        <div className='mt-10 max-w-7xl m-auto max-sm:px-4 px-4 lg:px-0'>
            {/* Tabs */}
            <div className='flex flex-col sm:flex-row gap-4'>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`font-normal text-[16px] flex justify-center items-center gap-2 h-[50px] rounded-full border-2 transition-all
                            w-full sm:w-[calc(50%-8px)] lg:w-[306.5px]
                            ${activeTab === tab.id
                                ? 'bg-white text-[#141111] border-[#141111]'
                                : 'bg-[#F4F5F5] text-gray-600 border-transparent'
                            }`}
                    >
                        {tab.label}
                        {/* Badge */}
                        {tab.status && !loading && (
                            <span className='bg-[#141111] text-white text-[11px] rounded-full px-2 py-0.5'>
                                {properties.filter(p => p.status === tab.status).length}
                            </span>
                        )}
                        {!tab.status && !loading && (
                            <span className='bg-[#141111] text-white text-[11px] rounded-full px-2 py-0.5'>
                                {properties.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className='mt-8 relative min-h-[200px]'>
                {loading ? (
                    <div className='flex items-center justify-center h-[200px]'>
                        <div className='w-8 h-8 border-2 border-[#141111] border-t-transparent rounded-full animate-spin' />
                    </div>
                ) : (
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {filtered.length === 0 ? (
                                <div className='flex items-center justify-center h-[200px] text-[#aaa] text-[16px]'>
                                    Объекты не найдены
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {filtered.map(item => (
                                        <ObyektCard key={item.id} item={item} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}