'use client'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
}
function getAuthHeaders() {
    return { Authorization: `Bearer ${getToken()}` }
}
function getLocalList(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
function setLocalList(key, list) {
    localStorage.setItem(key, JSON.stringify(list))
}

export function useFavoriteCompare() {
    const [favorites, setFavorites] = useState([])
    const [compares, setCompares] = useState([])

    const isAuth = () => !!getToken()

    useEffect(() => {
        if (!isAuth()) {
            setFavorites(getLocalList('local_favorites'))
            setCompares(getLocalList('local_compares'))
        }
    }, [])

    // ── Fetch from server on mount ─────────────────────────────────────────────
    useEffect(() => {
        if (!isAuth()) return
        Promise.all([
            axios.get(`${API_BASE}accounts/profile/favorites/`, { headers: getAuthHeaders() }),
            axios.get(`${API_BASE}accounts/profile/compare/`, { headers: getAuthHeaders() }),
        ]).then(([favRes, cmpRes]) => {
            const favIds = (favRes.data?.results ?? favRes.data ?? []).map(f => f.property_listing?.id ?? f.id)
            const cmpIds = (cmpRes.data?.results ?? cmpRes.data ?? []).map(c => c.property_listing?.id ?? c.id)
            setFavorites(favIds)
            setCompares(cmpIds)
        }).catch(() => { })
    }, [])

    const isFavorite = useCallback((id) => favorites.includes(id), [favorites])
    const isCompare = useCallback((id) => compares.includes(id), [compares])

    // ── Toggle Favorite ────────────────────────────────────────────────────────
    const toggleFavorite = useCallback(async (id, onRemoved) => {
        if (!isAuth()) {
            setFavorites(prev => {
                const alreadyIn = prev.includes(id)
                const next = alreadyIn ? prev.filter(x => x !== id) : [...prev, id]
                setLocalList('local_favorites', next)
                toast.success(alreadyIn ? 'Удалено из избранного' : 'Добавлено в избранное')
                if (alreadyIn && onRemoved) onRemoved(id)
                return next
            })
            return
        }
        if (isFavorite(id)) {
            try {
                await axios.delete(`${API_BASE}accounts/profile/favorites/${id}/`, { headers: getAuthHeaders() })
                setFavorites(prev => prev.filter(x => x !== id))
                toast.success('Удалено из избранного')
                if (onRemoved) onRemoved(id)
            } catch {
                toast.error('Не удалось удалить из избранного')
            }
        } else {
            try {
                await axios.post(`${API_BASE}accounts/profile/favorites/add/`, { property_listing: id }, { headers: getAuthHeaders() })
                setFavorites(prev => [...prev, id])
                toast.success('Добавлено в избранное')
            } catch {
                toast.error('Не удалось добавить в избранное')
            }
        }
    }, [favorites, isFavorite])

    // ── Toggle Compare ─────────────────────────────────────────────────────────
    const toggleCompare = useCallback(async (id, onRemoved) => {
        if (!isAuth()) {
            setCompares(prev => {
                const alreadyIn = prev.includes(id)
                const next = alreadyIn ? prev.filter(x => x !== id) : [...prev, id]
                setLocalList('local_compares', next)
                toast.success(alreadyIn ? 'Удалено из сравнения' : 'Добавлено в сравнение')
                if (alreadyIn && onRemoved) onRemoved(id)
                return next
            })
            return
        }
        if (isCompare(id)) {
            try {
                await axios.delete(`${API_BASE}accounts/profile/compare/${id}/`, { headers: getAuthHeaders() })
                setCompares(prev => prev.filter(x => x !== id))
                toast.success('Удалено из сравнения')
                if (onRemoved) onRemoved(id)
            } catch {
                toast.error('Не удалось удалить из сравнения')
            }
        } else {
            try {
                await axios.post(`${API_BASE}accounts/profile/compare/add/`, { property_listing: id }, { headers: getAuthHeaders() })
                setCompares(prev => [...prev, id])
                toast.success('Добавлено в сравнение')
            } catch {
                toast.error('Не удалось добавить в сравнение')
            }
        }
    }, [compares, isCompare])

    return { isFavorite, toggleFavorite, isCompare, toggleCompare }
}