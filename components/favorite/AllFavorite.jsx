'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import PropertyCard from '../home/Propertycard'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
}
function getAuthHeaders() {
    return { Authorization: `Bearer ${getToken()}` }
}

export default function AllFavorite() {
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            try {
                if (getToken()) {
                    const { data } = await axios.get(`${API_BASE}accounts/profile/favorites/`, {
                        headers: getAuthHeaders(),
                    })
                    const list = data?.results ?? data ?? []
                    setProperties(list.map(f => f.property_listing ?? f))
                } else {
                    const ids = JSON.parse(localStorage.getItem('local_favorites') || '[]')
                    if (!ids.length) { setProperties([]); return }
                    const results = await Promise.allSettled(
                        ids.map(id => axios.get(`${API_BASE}accounts/catalog/properties/${id}/`))
                    )
                    setProperties(results.filter(r => r.status === 'fulfilled').map(r => r.value.data))
                }
            } catch {
                toast.error('Не удалось загрузить избранное')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    // Instantly remove card from list when unfavorited
    const handleRemoved = (id) => {
        setProperties(prev => prev.filter(p => p.id !== id))
    }

    if (loading) return (
        <div className="flex items-center justify-center h-[200px]">
            <div className="w-8 h-8 border-2 border-[#141111] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!properties.length) return (
        <div className="flex items-center justify-center h-[200px] text-[#aaa] text-[16px]">
            Нет избранных объектов
        </div>
    )

    return (
        <div className='max-w-350 mx-auto px-5 mb-[100px]'>
            <h2 className='text-[36px] mb-7 text-[#141111]'>Сравнение объектов</h2>
            <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                    <div
                        key={property.id}
                        onClick={() => router.push(`/catalog/${property.id}`)}
                        className="cursor-pointer"
                    >
                        <PropertyCard
                            property={property}
                            onFavoriteRemoved={handleRemoved}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}