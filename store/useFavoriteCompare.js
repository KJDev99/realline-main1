'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
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

    // ✅ Ref orqali latest state — stale closure muammosini hal qiladi
    const favoritesRef = useRef(favorites)
    const comparesRef = useRef(compares)

    useEffect(() => { favoritesRef.current = favorites }, [favorites])
    useEffect(() => { comparesRef.current = compares }, [compares])

    const isAuth = () => !!getToken()

    useEffect(() => {
        if (!isAuth()) {
            setFavorites(getLocalList('local_favorites'))
            setCompares(getLocalList('local_compares'))
        }
    }, [])

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

    const isFavorite = useCallback((id) => favoritesRef.current.includes(id), [])
    const isCompare = useCallback((id) => comparesRef.current.includes(id), [])

    // ✅ toggleFavorite — dependency array tozalandi, ref orqali ishlaydi
    const toggleFavorite = useCallback(async (id, onRemoved) => {
        if (!isAuth()) {
            const current = favoritesRef.current
            const alreadyIn = current.includes(id)
            const next = alreadyIn ? current.filter(x => x !== id) : [...current, id]
            setLocalList('local_favorites', next)
            setFavorites(next)
            toast.success(alreadyIn ? 'Удалено из избранного' : 'Добавлено в избранное')
            if (alreadyIn && onRemoved) onRemoved(id)
            return
        }
        const alreadyIn = favoritesRef.current.includes(id)
        if (alreadyIn) {
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
    }, [])

    // ✅ toggleCompare — xuddi shunday
    const toggleCompare = useCallback(async (id, onRemoved) => {
        if (!isAuth()) {
            const current = comparesRef.current
            const alreadyIn = current.includes(id)
            const next = alreadyIn ? current.filter(x => x !== id) : [...current, id]
            setLocalList('local_compares', next)
            setCompares(next)
            toast.success(alreadyIn ? 'Удалено из сравнения' : 'Добавлено в сравнение')
            if (alreadyIn && onRemoved) onRemoved(id)
            return
        }
        const alreadyIn = comparesRef.current.includes(id)
        if (alreadyIn) {
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
    }, [])

    return { isFavorite, toggleFavorite, isCompare, toggleCompare }
}