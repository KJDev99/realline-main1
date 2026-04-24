'use client'

import { useEffect, useCallback } from 'react'
import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

const LOCAL_FAV = 'local_favorites'
const LOCAL_CMP = 'local_compares'

export const AUTH_CHANGED_EVENT = 'auth-changed'

function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
}

function getAuthHeaders() {
    return { Authorization: `Bearer ${getToken()}` }
}

function getLocalList(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
        return []
    }
}

function setLocalList(key, list) {
    localStorage.setItem(key, JSON.stringify(list))
}

function normalizeId(id) {
    const n = Number(id)
    return Number.isFinite(n) ? n : id
}

function extractPropertyIds(data) {
    const list = data?.results ?? data ?? []
    return list
        .map((item) => normalizeId(item.property_listing?.id ?? item.id))
        .filter((x) => x != null && x !== '')
}

/** Login bo'lganda local comparelarni backendga jimgina sync qilish */
async function syncLocalComparesToBackend() {
    const localIds = getLocalList(LOCAL_CMP).map(normalizeId)
    if (!localIds.length) return

    // Avval backendda nima borligini bilamiz
    let existingIds = []
    try {
        const { data } = await axios.get(`${API_BASE}accounts/profile/compare/`, {
            headers: getAuthHeaders(),
        })
        existingIds = extractPropertyIds(data)
    } catch {
        // ignore
    }

    const toAdd = localIds.filter((id) => !existingIds.includes(id))
    const available = 4 - existingIds.length

    // Faqat limit bo'lgan qadarda qo'shamiz, jimgina
    const batch = toAdd.slice(0, Math.max(0, available))
    await Promise.allSettled(
        batch.map((id) =>
            axios.post(
                `${API_BASE}accounts/profile/compare/add/`,
                { property_listing: id },
                { headers: getAuthHeaders() },
            ),
        ),
    )

    // Local listni tozalab tashlaymiz
    setLocalList(LOCAL_CMP, [])
}

let hydrateInFlight = null

let authListenerAttached = false
function attachAuthListenerOnce() {
    if (typeof window === 'undefined' || authListenerAttached) return
    authListenerAttached = true
    window.addEventListener(AUTH_CHANGED_EVENT, () => {
        void useFavoriteCompareStore.getState().invalidateAndHydrate()
    })
}

export const useFavoriteCompareStore = create((set, get) => ({
    favorites: [],
    compares: [],
    hydrated: false,
    _lastToken: undefined,

    invalidateAndHydrate: async () => {
        // Agar login bo'lgan bo'lsa, oldin local comparelarni sync qilamiz
        if (getToken()) {
            await syncLocalComparesToBackend()
        }
        set({ hydrated: false, _lastToken: undefined })
        await get().hydrateOnce()
    },

    hydrateOnce: async () => {
        if (typeof window === 'undefined') return

        if (hydrateInFlight) {
            await hydrateInFlight
            return
        }

        const token = getToken() ?? null
        if (token !== get()._lastToken) {
            set({ _lastToken: token, hydrated: false })
        }

        if (get().hydrated) return

        hydrateInFlight = (async () => {
            try {
                if (!getToken()) {
                    set({
                        favorites: getLocalList(LOCAL_FAV).map(normalizeId),
                        compares: getLocalList(LOCAL_CMP).map(normalizeId),
                        hydrated: true,
                    })
                    return
                }

                try {
                    const [favRes, cmpRes] = await Promise.all([
                        axios.get(`${API_BASE}accounts/profile/favorites/`, { headers: getAuthHeaders() }),
                        axios.get(`${API_BASE}accounts/profile/compare/`, { headers: getAuthHeaders() }),
                    ])
                    set({
                        favorites: extractPropertyIds(favRes.data),
                        compares: extractPropertyIds(cmpRes.data),
                        hydrated: true,
                    })
                } catch {
                    set({ hydrated: true })
                }
            } finally {
                hydrateInFlight = null
            }
        })()

        await hydrateInFlight
    },

    toggleFavorite: async (rawId, onRemoved) => {
        const id = normalizeId(rawId)

        if (!getToken()) {
            const current = get().favorites
            const alreadyIn = current.includes(id)
            const next = alreadyIn ? current.filter((x) => x !== id) : [...current, id]
            setLocalList(LOCAL_FAV, next)
            set({ favorites: next })
            toast.success(alreadyIn ? 'Удалено из избранного' : 'Добавлено в избранное')
            if (alreadyIn && onRemoved) onRemoved(id)
            return
        }

        const alreadyIn = get().favorites.includes(id)
        if (alreadyIn) {
            try {
                await axios.delete(`${API_BASE}accounts/profile/favorites/${id}/`, { headers: getAuthHeaders() })
                set({ favorites: get().favorites.filter((x) => x !== id) })
                toast.success('Удалено из избранного')
                if (onRemoved) onRemoved(id)
            } catch {
                toast.error('Не удалось удалить из избранного')
            }
        } else {
            try {
                await axios.post(
                    `${API_BASE}accounts/profile/favorites/add/`,
                    { property_listing: id },
                    { headers: getAuthHeaders() },
                )
                set({ favorites: [...get().favorites, id] })
                toast.success('Добавлено в избранное')
            } catch {
                toast.error('Не удалось добавить в избранное')
            }
        }
    },

    toggleCompare: async (rawId, onRemoved) => {
        const id = normalizeId(rawId)

        if (!getToken()) {
            const current = get().compares
            const alreadyIn = current.includes(id)

            if (!alreadyIn && current.length >= 4) {
                toast.error('В сравнении не более 4 объектов.')
                return
            }

            const next = alreadyIn ? current.filter((x) => x !== id) : [...current, id]
            setLocalList(LOCAL_CMP, next)
            set({ compares: next })
            toast.success(alreadyIn ? 'Удалено из сравнения' : 'Добавлено в сравнение')
            if (alreadyIn && onRemoved) onRemoved(id)
            return
        }

        const alreadyIn = get().compares.includes(id)
        if (alreadyIn) {
            try {
                await axios.delete(`${API_BASE}accounts/profile/compare/${id}/`, { headers: getAuthHeaders() })
                set({ compares: get().compares.filter((x) => x !== id) })
                toast.success('Удалено из сравнения')
                if (onRemoved) onRemoved(id)
            } catch {
                toast.error('Не удалось удалить из сравнения')
            }
        } else {
            try {
                await axios.post(
                    `${API_BASE}accounts/profile/compare/add/`,
                    { property_listing: id },
                    { headers: getAuthHeaders() },
                )
                set({ compares: [...get().compares, id] })
                toast.success('Добавлено в сравнение')
            } catch {
                toast.error('В сравнении не более 4 объектов.')
            }
        }
    },
}))

export function useFavoriteCompare() {
    const favorites = useFavoriteCompareStore((s) => s.favorites)
    const compares = useFavoriteCompareStore((s) => s.compares)
    const toggleFavorite = useFavoriteCompareStore((s) => s.toggleFavorite)
    const toggleCompare = useFavoriteCompareStore((s) => s.toggleCompare)

    useEffect(() => {
        attachAuthListenerOnce()
        void useFavoriteCompareStore.getState().hydrateOnce()
    }, [])

    const isFavorite = useCallback((pid) => favorites.includes(normalizeId(pid)), [favorites])
    const isCompare = useCallback((pid) => compares.includes(normalizeId(pid)), [compares])

    return { isFavorite, toggleFavorite, isCompare, toggleCompare }
}