'use client'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useFavoriteCompareStore, AUTH_CHANGED_EVENT } from '@/store/useFavoriteCompare' // adjust path as needed

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
}
function getAuthHeaders() {
    return { Authorization: `Bearer ${getToken()}` }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function BoolIcon({ value }) {
    if (value === null || value === undefined) return <span className="text-[#bbb]">—</span>
    return value ? (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#e8f5e9]">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5L5.2 10L11 3" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
    ) : (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#fce4ec]">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M3 3L10 10M10 3L3 10" stroke="#c62828" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        </span>
    )
}

function CellValue({ value, type }) {
    if (type === 'bool') return <BoolIcon value={value} />
    if (value === null || value === undefined || value === '') return <span className="text-[#bbb]">—</span>
    return <span>{value}</span>
}

// ─── highlight best numeric value ─────────────────────────────────────────────
function getBestIndexes(values, key) {
    const higherIsBetter = ['area', 'land_area', 'rooms', 'bedrooms', 'bathrooms', 'floors']
    const lowerIsBetter = ['price', 'distance_to_mkad_km', 'residential.price_per_sqm_from']

    const nums = values.map((v) => (v != null && !isNaN(Number(v)) ? Number(v) : null))
    const valid = nums.filter((n) => n !== null)
    if (!valid.length) return []

    if (higherIsBetter.includes(key)) {
        const max = Math.max(...valid)
        return nums.map((n, i) => (n === max ? i : -1)).filter((i) => i !== -1)
    }
    if (lowerIsBetter.includes(key)) {
        const min = Math.min(...valid)
        return nums.map((n, i) => (n === min ? i : -1)).filter((i) => i !== -1)
    }
    return []
}

// ─── main component ───────────────────────────────────────────────────────────

export default function CompareTable() {
    const [tableData, setTableData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [hasToken, setHasToken] = useState(false)

    const load = useCallback(async () => {
        if (!getToken()) {
            setHasToken(false)
            setTableData(null)
            return
        }
        setHasToken(true)
        setLoading(true)
        try {
            const { data } = await axios.get(`${API_BASE}accounts/profile/compare/table/`, {
                headers: getAuthHeaders(),
            })
            setTableData(data)
        } catch {
            setTableData(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()

        const handler = () => {
            setTimeout(load, 300) // sync bo'lib bo'lgandan keyin yuklaylik
        }
        window.addEventListener(AUTH_CHANGED_EVENT, handler)

        // compares o'zgarganda (o'chirildi/qo'shildi) table qayta yuklanadi
        let prevCompares = useFavoriteCompareStore.getState().compares
        const unsub = useFavoriteCompareStore.subscribe((state) => {
            if (state.compares !== prevCompares) {
                prevCompares = state.compares
                if (getToken()) load()
            }
        })

        return () => {
            window.removeEventListener(AUTH_CHANGED_EVENT, handler)
            unsub()
        }
    }, [load])

    // ── token yo'q ─────────────────────────────────────────────────────────────
    if (!hasToken) {
        return (
            <section className="max-w-350 mx-auto px-5 mb-[100px]">
                <div className="rounded-2xl border border-[#ebebeb] bg-[#fafafa] flex flex-col items-center justify-center py-16 gap-4">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-30">
                        <rect x="8" y="20" width="32" height="22" rx="4" stroke="#141111" strokeWidth="2" />
                        <path d="M16 20V14a8 8 0 0 1 16 0v6" stroke="#141111" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="24" cy="31" r="3" fill="#141111" />
                    </svg>
                    <p className="text-[#888] text-[16px]">Войдите, чтобы увидеть таблицу сравнения</p>
                </div>
            </section>
        )
    }

    // ── loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <section className="max-w-350 mx-auto px-5 mb-[100px]">
                <div className="flex items-center justify-center h-[200px]">
                    <div className="w-8 h-8 border-2 border-[#141111] border-t-transparent rounded-full animate-spin" />
                </div>
            </section>
        )
    }

    // ── ma'lumot yo'q ──────────────────────────────────────────────────────────
    if (!tableData || !tableData.items?.length) {
        return null
    }

    const { items, rows } = tableData
    const colCount = items.length

    // Faqat kamida bitta non-null qiymatli qatorlarni ko'rsatamiz
    const visibleRows = rows.filter((row) =>
        row.values.some((v) => v !== null && v !== undefined && v !== ''),
    )

    return (
        <section className="max-w-350 mx-auto px-5 mb-[100px]">
            <h2 className="text-[28px] font-semibold text-[#141111] mb-6 max-md:text-[20px]">
                Таблица сравнения
            </h2>

            {/* ── scroll wrapper ── */}
            <div className="overflow-x-auto rounded-2xl border border-[#e5e5e5] shadow-sm">
                <table className="w-full min-w-[600px] border-collapse">
                    <colgroup>
                        {/* label column */}
                        <col style={{ width: '220px', minWidth: '160px' }} />
                        {/* property columns */}
                        {items.map((_, i) => (
                            <col key={i} style={{ minWidth: '160px' }} />
                        ))}
                    </colgroup>

                    {/* ── header: only names ── */}
                    <thead>
                        <tr>
                            {/* empty corner */}
                            <th className="bg-[#f7f7f7] border-b border-[#e5e5e5] p-0" />

                            {items.map((item) => (
                                <th
                                    key={item.id}
                                    className="bg-[#f7f7f7] border-b border-l border-[#e5e5e5] px-4 py-3 text-left align-middle"
                                >
                                    <span className="text-[13px] font-semibold text-[#141111] block leading-snug line-clamp-2">
                                        {item.name}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* ── rows ── */}
                    <tbody>
                        {visibleRows.map((row, rowIdx) => {


                            return (
                                <tr
                                    key={row.key}
                                    className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}
                                >
                                    {/* label */}
                                    <td className="px-4 py-3 text-[13px] font-medium text-[#666] border-r border-[#e5e5e5] whitespace-nowrap">
                                        {row.label}
                                    </td>

                                    {/* values */}
                                    {row.values.slice(0, colCount).map((val, colIdx) => {
                                        return (
                                            <td
                                                key={colIdx}
                                                className={[
                                                    'px-4 py-3 text-[13px] text-[#141111] border-l border-[#e5e5e5] text-center'
                                                ].join(' ')}
                                            >
                                                <CellValue value={val} type={row.type} />

                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    )
}