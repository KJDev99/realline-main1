'use client'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useFavoriteCompareStore, AUTH_CHANGED_EVENT } from '@/store/useFavoriteCompare'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
}
function getAuthHeaders() {
    return { Authorization: `Bearer ${getToken()}` }
}
function getLocalIds() {
    try { return JSON.parse(localStorage.getItem('local_compares') || '[]') }
    catch { return [] }
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
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            if (getToken()) {
                // Accountga kirgan — profile endpoint (token bilan)
                const { data } = await axios.get(`${API_BASE}accounts/profile/compare/table/`, {
                    headers: getAuthHeaders(),
                })
                setTableData(data)
            } else {
                // Guest — localdan IDlar olib query param bilan yuboramiz
                const ids = getLocalIds()
                if (!ids.length) {
                    setTableData(null)
                    return
                }
                const idsParam = ids.join(',')
                const { data } = await axios.get(
                    `${API_BASE}accounts/compare/table/?ids=${encodeURIComponent(idsParam)}`
                )
                setTableData(data)
            }
        } catch {
            setTableData(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()

        // Login / logout bo'lganda qayta yuklaymiz
        const authHandler = () => setTimeout(load, 400)
        window.addEventListener(AUTH_CHANGED_EVENT, authHandler)

        // Store compares o'zgarganda (qo'shildi / o'chirildi) qayta yuklaymiz
        let prevCompares = useFavoriteCompareStore.getState().compares
        const unsub = useFavoriteCompareStore.subscribe((state) => {
            if (state.compares !== prevCompares) {
                prevCompares = state.compares
                load()
            }
        })

        return () => {
            window.removeEventListener(AUTH_CHANGED_EVENT, authHandler)
            unsub()
        }
    }, [load])

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

    // ── bo'sh yoki xato ────────────────────────────────────────────────────────
    if (!tableData || !tableData.items?.length) {
        return null
    }

    const { items, rows } = tableData
    const colCount = items.length

    const visibleRows = rows.filter((row) =>
        row.values.some((v) => v !== null && v !== undefined && v !== ''),
    )

    return (
        <section className="max-w-350 mx-auto px-5 mb-[100px]">
            <h2 className="text-[28px] font-semibold text-[#141111] mb-6 max-md:text-[20px]">
                Таблица сравнения
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-[#e5e5e5] shadow-sm">
                <table className="w-full min-w-[600px] border-collapse">
                    <colgroup>
                        <col style={{ width: '220px', minWidth: '160px' }} />
                        {items.map((_, i) => (
                            <col key={i} style={{ minWidth: '160px' }} />
                        ))}
                    </colgroup>

                    {/* ── header: faqat nomlar ── */}
                    <thead>
                        <tr>
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
                            const bestIndexes =
                                row.type === 'number' ? getBestIndexes(row.values, row.key) : []

                            return (
                                <tr
                                    key={row.key}
                                    className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}
                                >
                                    <td className="px-4 py-3 text-[13px] font-medium text-[#666] border-r border-[#e5e5e5] whitespace-nowrap">
                                        {row.label}
                                    </td>

                                    {row.values.slice(0, colCount).map((val, colIdx) => {
                                        const isBest = bestIndexes.includes(colIdx)
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