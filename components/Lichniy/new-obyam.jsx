'use client'
import Image from 'next/image'
import React, { useState, useRef, useEffect } from 'react'
import { FaPlus, FaTimes, FaChevronDown } from 'react-icons/fa'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

function getAuthHeaders() {
    const token = localStorage.getItem('access_token')
    return { Authorization: `Bearer ${token}` }
}

// ─── Reusable Select ──────────────────────────────────────────────────────────
function Select({ label, value, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                ref.current?.querySelector('input')?.focus()
            }, 50)
        } else {
            setSearch('')
        }
    }, [open])

    const selected = options.find(o => o.value === value)
    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <span className='flex flex-col gap-2 w-full'>
            {label && <p className='text-[14px] text-[#141111]'>{label}</p>}
            <div ref={ref} className='relative w-full'>
                <button
                    type='button'
                    onClick={() => setOpen(p => !p)}
                    className='outline-none w-full h-[56px] bg-[#F4F5F5] rounded-[10px] px-[24px] flex items-center justify-between text-[14px] text-left'
                >
                    <span className={selected ? 'text-[#141111]' : 'text-[#aaa]'}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <FaChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                    <div className='absolute z-50 w-full mt-1 bg-white border border-[#E5E5E5] rounded-[10px] shadow-lg'>
                        <div className='px-3 py-2 border-b border-[#E5E5E5]'>
                            <input
                                type='text'
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder='Поиск...'
                                className='w-full outline-none bg-[#F4F5F5] rounded-[8px] px-3 py-2 text-[13px]'
                            />
                        </div>
                        <div className='max-h-[200px] overflow-y-auto'>
                            {filtered.length > 0 ? (
                                filtered.map(opt => (
                                    <div
                                        key={opt.value}
                                        onClick={() => { onChange(opt.value); setOpen(false) }}
                                        className={`px-5 py-3 text-[14px] cursor-pointer hover:bg-[#F4F5F5] 
                                            ${opt.value === value ? 'font-semibold text-[#141111]' : 'text-[#444]'}`}
                                    >
                                        {opt.label}
                                    </div>
                                ))
                            ) : (
                                <div className='px-5 py-4 text-[13px] text-[#999]'>
                                    Результаты не найдены.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </span>
    )
}

// ─── Reusable Field ───────────────────────────────────────────────────────────
function Field({ label, name, type = 'text', placeholder, value, onChange, className = '' }) {
    return (
        <span className={`flex flex-col gap-2 w-full ${className}`}>
            {label && <p className='text-[14px] text-[#141111]'>{label}</p>}
            <input
                name={name}
                value={value}
                onChange={onChange}
                className='outline-none w-full h-[56px] bg-[#F4F5F5] rounded-[10px] px-[24px] text-[14px]'
                placeholder={placeholder}
                type={type}
            />
        </span>
    )
}

// ─── MultiInput ───────────────────────────────────────────────────────────────
function MultiInput({ label, name, values, onChange, placeholder, type = 'text' }) {
    const handleChange = (i, val) => {
        const next = [...values]
        next[i] = val
        onChange(next)
    }
    const addRow = () => onChange([...values, ''])
    const removeRow = (i) => {
        if (values.length === 1) return
        onChange(values.filter((_, idx) => idx !== i))
    }

    return (
        <span className='flex flex-col gap-2 w-full'>
            {label && <p className='text-[14px] text-[#141111]'>{label}</p>}
            <div className='flex flex-col gap-2'>
                {values.map((val, i) => (
                    <div key={i} className='flex items-center gap-2'>
                        <input
                            value={val}
                            onChange={e => handleChange(i, e.target.value)}
                            className='outline-none w-full h-[56px] bg-[#F4F5F5] rounded-[10px] px-[24px] text-[14px]'
                            placeholder={placeholder}
                            type={type}
                        />
                        {values.length > 1 && (
                            <button
                                type='button'
                                onClick={() => removeRow(i)}
                                className='w-8 h-8 flex-shrink-0 bg-[#F4F5F5] hover:bg-[#141111] hover:text-white text-[#444] rounded-full flex items-center justify-center transition-colors'
                            >
                                <FaTimes size={11} />
                            </button>
                        )}
                        {i === values.length - 1 && (
                            <button
                                type='button'
                                onClick={addRow}
                                className='w-8 h-8 flex-shrink-0 bg-[#141111] text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity'
                            >
                                <FaPlus size={11} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </span>
    )
}

// ─── Empty Unit ───────────────────────────────────────────────────────────────
const emptyUnit = () => ({
    layout_label: '',
    title: '',
    building: '',
    completion_text: '',
    price: '',
    rooms: '',
    total_area: '',
    kitchen_area: '',
    floor: '',
    floors_total: '',
    finishing: '',
    bathroom_summary: '',
    ceiling_height: '',
    balcony_summary: '',
    payment_methods: '',
    banks: '',
    is_apartments_legal: '',
    is_assignment: '',
    is_two_level: '',
    has_master_bedroom: '',
    price_per_sqm: '',
    sort_order: '',
    image: null,
    imagePreview: null,
})

// ─── Unit Card ────────────────────────────────────────────────────────────────
function UnitCard({ unit, index, onChange, onRemove, onImageChange }) {
    const fileRef = useRef(null)

    const handleField = (e) => {
        const { name, value, type, checked } = e.target
        onChange(index, name, type === 'checkbox' ? checked : value)
    }

    const boolSelect = (name) => (
        <span className='flex flex-col gap-2 w-full'>
            <p className='text-[14px] text-[#141111]'>
                {name === 'is_apartments_legal' ? 'Апартаменты (юр.)' :
                    name === 'is_assignment' ? 'Переуступка' :
                        name === 'is_two_level' ? 'Двухуровневая' : 'Мастер-спальня'}
            </p>
            <select
                name={name}
                value={unit[name]}
                onChange={handleField}
                className='outline-none w-full h-[56px] bg-[#F4F5F5] rounded-[10px] px-[24px] text-[14px] cursor-pointer'
            >
                <option value=''>—</option>
                <option value='true'>Да</option>
                <option value='false'>Нет</option>
            </select>
        </span>
    )

    return (
        <div className='border border-[#E5E5E5] rounded-[14px] p-5 space-y-4 bg-white relative'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <p className='text-[13px] font-semibold text-[#141111] uppercase tracking-wider'>
                    Квартира / юнит #{index + 1}
                </p>
                <button
                    type='button'
                    onClick={() => onRemove(index)}
                    className='w-7 h-7 bg-[#F4F5F5] hover:bg-[#141111] hover:text-white text-[#666] rounded-full flex items-center justify-center transition-colors'
                >
                    <FaTimes size={10} />
                </button>
            </div>

            {/* Row 1 */}
            <div className='flex flex-col lg:flex-row gap-4'>
                <Field label='Студия:' name='layout_label' value={unit.layout_label} onChange={handleField} placeholder='Студия, 1-комнатная...' />
                <Field label='Название:' name='title' value={unit.title} onChange={handleField} placeholder='Название планировки' />
                <Field label='Корпус:' name='building' value={unit.building} onChange={handleField} placeholder='Корпус 1' />
                <Field label='Срок сдачи:' name='completion_text' value={unit.completion_text} onChange={handleField} placeholder='Q2 2026' />
            </div>

            {/* Row 2 */}
            <div className='flex flex-col lg:flex-row gap-4'>
                <Field label='Цена (₽):' name='price' value={unit.price} onChange={handleField} placeholder='5000000' type='number' />
                <Field label='Цена за м²:' name='price_per_sqm' value={unit.price_per_sqm} onChange={handleField} placeholder='150000' type='number' />
                <Field label='Комнат:' name='rooms' value={unit.rooms} onChange={handleField} placeholder='2' type='number' />
                <Field label='Общая площадь:' name='total_area' value={unit.total_area} onChange={handleField} placeholder='60.5' type='number' />
            </div>

            {/* Row 3 */}
            <div className='flex flex-col lg:flex-row gap-4'>
                <Field label='Площадь кухни:' name='kitchen_area' value={unit.kitchen_area} onChange={handleField} placeholder='12.0' type='number' />
                <Field label='Этаж:' name='floor' value={unit.floor} onChange={handleField} placeholder='5' type='number' />
                <Field label='Этажей всего:' name='floors_total' value={unit.floors_total} onChange={handleField} placeholder='20' type='number' />
                <Field label='Высота потолков:' name='ceiling_height' value={unit.ceiling_height} onChange={handleField} placeholder='2.85 м' />
            </div>

            {/* Row 4 */}
            <div className='flex flex-col lg:flex-row gap-4'>
                <Field label='Отделка:' name='finishing' value={unit.finishing} onChange={handleField} placeholder='Чистовая' />
                <Field label='Санузел:' name='bathroom_summary' value={unit.bathroom_summary} onChange={handleField} placeholder='Совмещённый' />
                <Field label='Балкон:' name='balcony_summary' value={unit.balcony_summary} onChange={handleField} placeholder='Лоджия 4 м²' />
                <Field label='Порядок сортировки:' name='sort_order' value={unit.sort_order} onChange={handleField} placeholder='0' type='number' />
            </div>

            {/* Row 5 */}
            <div className='flex flex-col lg:flex-row gap-4'>
                <Field label='Способы оплаты:' name='payment_methods' value={unit.payment_methods} onChange={handleField} placeholder='Ипотека, рассрочка' />
                <Field label='Банки:' name='banks' value={unit.banks} onChange={handleField} placeholder='Сбербанк, ВТБ' />
            </div>

            {/* Row 6 — booleans */}
            <div className='flex flex-col lg:flex-row gap-4'>
                {boolSelect('is_apartments_legal')}
                {boolSelect('is_assignment')}
                {boolSelect('is_two_level')}
                {boolSelect('has_master_bedroom')}
            </div>

            {/* Image */}
            <div>
                <p className='text-[14px] text-[#141111] mb-2'>Изображение планировки:</p>
                {unit.imagePreview ? (
                    <div className='relative w-[150px] h-[110px] rounded-[10px] overflow-hidden'>
                        <img src={unit.imagePreview} alt='' className='w-full h-full object-cover' />
                        <button
                            type='button'
                            onClick={() => onImageChange(index, null)}
                            className='absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center'
                        >
                            <FaTimes size={9} />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileRef.current.click()}
                        className='w-full h-[80px] border-2 border-dashed border-[#D0D0D0] bg-[#F9F9F9] rounded-[10px] flex items-center justify-center gap-3 cursor-pointer hover:bg-[#EFEFEF] transition-colors'
                    >
                        <div className='bg-[#141111] text-white w-7 h-7 rounded-full flex items-center justify-center'>
                            <FaPlus size={11} />
                        </div>
                        <p className='text-[13px] text-[#888]'>Добавить изображение</p>
                        <input
                            ref={fileRef}
                            type='file'
                            accept='image/*'
                            className='hidden'
                            onChange={e => {
                                const file = e.target.files[0]
                                if (file) onImageChange(index, file)
                                e.target.value = ''
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Units Section (opens after property created) ─────────────────────────────
function UnitsSection({ propertyId, onDone }) {
    const [units, setUnits] = useState([emptyUnit()])
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (i, name, value) => {
        setUnits(prev => prev.map((u, idx) => idx === i ? { ...u, [name]: value } : u))
    }

    const handleImageChange = (i, file) => {
        setUnits(prev => prev.map((u, idx) => {
            if (idx !== i) return u
            if (!file) {
                if (u.imagePreview) URL.revokeObjectURL(u.imagePreview)
                return { ...u, image: null, imagePreview: null }
            }
            const preview = URL.createObjectURL(file)
            return { ...u, image: file, imagePreview: preview }
        }))
    }

    const addUnit = () => setUnits(prev => [...prev, emptyUnit()])

    const removeUnit = (i) => {
        if (units.length === 1) return
        setUnits(prev => {
            if (prev[i].imagePreview) URL.revokeObjectURL(prev[i].imagePreview)
            return prev.filter((_, idx) => idx !== i)
        })
    }

    const handleSubmitUnits = async () => {
        setSubmitting(true)
        try {
            for (const unit of units) {
                if (!unit.price) continue // bo'sh unitlarni skip qilish

                const fd = new FormData()

                const textFields = [
                    'layout_label', 'title', 'building', 'completion_text', 'price',
                    'rooms', 'total_area', 'kitchen_area', 'floor', 'floors_total',
                    'finishing', 'bathroom_summary', 'ceiling_height', 'balcony_summary',
                    'payment_methods', 'banks', 'price_per_sqm', 'sort_order',
                ]
                textFields.forEach(key => {
                    if (unit[key] !== '' && unit[key] !== null && unit[key] !== undefined) {
                        fd.append(key, unit[key])
                    }
                })

                const boolFields = ['is_apartments_legal', 'is_assignment', 'is_two_level', 'has_master_bedroom']
                boolFields.forEach(key => {
                    if (unit[key] !== '') fd.append(key, unit[key])
                })

                if (unit.image) {
                    fd.append('image', unit.image)
                }

                await axios.post(
                    `${API_BASE}accounts/properties/${propertyId}/units/`,
                    fd,
                    {
                        headers: {
                            ...getAuthHeaders(),
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                )
            }

            toast.success('Юниты успешно добавлены!')
            onDone()
        } catch (err) {
            const data = err?.response?.data
            if (data && typeof data === 'object') {
                const firstKey = Object.keys(data)[0]
                const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
                toast.error(String(msg))
            } else {
                toast.error('Ошибка при добавлении юнитов')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='space-y-5'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-[18px] font-semibold text-[#141111]'>Добавление квартир / юнитов</h2>
                    <p className='text-[13px] text-[#888] mt-1'>Объект создан. Теперь добавьте планировки.</p>
                </div>
                <button
                    type='button'
                    onClick={addUnit}
                    className='flex items-center gap-2 bg-[#141111] text-white px-5 py-2.5 rounded-full text-[13px] hover:opacity-80 transition-opacity'
                >
                    <FaPlus size={11} />
                    Добавить юнит
                </button>
            </div>

            {/* Unit cards */}
            <div className='space-y-4'>
                {units.map((unit, i) => (
                    <UnitCard
                        key={i}
                        unit={unit}
                        index={i}
                        onChange={handleChange}
                        onRemove={removeUnit}
                        onImageChange={handleImageChange}
                    />
                ))}
            </div>

            {/* Action buttons */}
            <div className='flex flex-col sm:flex-row items-center gap-4 pt-2'>
                <button
                    type='button'
                    onClick={handleSubmitUnits}
                    disabled={submitting}
                    className='border border-[#141111] rounded-full px-10 py-3 text-[14px] hover:bg-[#141111] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {submitting ? 'Сохранение...' : 'Сохранить юниты'}
                </button>
                <button
                    type='button'
                    onClick={onDone}
                    className='text-[13px] text-[#999] hover:text-[#141111] transition-colors underline underline-offset-2'
                >
                    Пропустить
                </button>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NewObyam() {
    const [categories, setCategories] = useState([])
    const [districts, setDistricts] = useState([])
    const [highways, setHighways] = useState([])
    const [regions, setRegions] = useState([])

    const [form, setForm] = useState({
        category_id: '',
        name: '',
        price: '',
        settlement: '',
        district_id: '',
        highway_id: '',
        region_id: '',
        address: '',
        area: '',
        land_area: '',
        distance_to_mkad_km: '',
        floors: '',
        rooms: '',
        bedrooms: '',
        bathrooms: '',
        year_built: '',
        wall_material: '',
        finishing: '',
        communications: '',
        electricity_supply: '',
        water_supply: '',
        sewage_type: '',
        heating_type: '',
        internet_connection: '',
        description: '',
        has_asphalt_roads: false,
        has_street_lighting: false,
        has_guarded_territory: false,
        near_shops: false,
        near_school_kindergarten: false,
        near_public_transport: false,
    })

    const [tags, setTags] = useState([])
    const [tagInput, setTagInput] = useState('')
    const [images, setImages] = useState([])
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(false)

    // ── Units state ──
    const [createdPropertyId, setCreatedPropertyId] = useState(null)
    const [showUnits, setShowUnits] = useState(false)

    // ─── Fetch справочники ────────────────────────────────────────────────────
    useEffect(() => {
        const headers = getAuthHeaders()
        Promise.all([
            axios.get(`${API_BASE}accounts/catalog/categories/`, { headers }),
            axios.get(`${API_BASE}accounts/catalog/districts/`, { headers }),
            axios.get(`${API_BASE}accounts/catalog/highways/`, { headers }),
            axios.get(`${API_BASE}site/regions/`, { headers }),
        ]).then(([cat, dist, high, reg]) => {
            setCategories(cat.data)
            setDistricts(dist.data)
            setHighways(high.data)
            setRegions(reg.data)
        }).catch(() => {
            toast.error('Не удалось загрузить справочники')
        })
    }, [])

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const selectedCategory = categories.find(c => c.id === form.category_id)
    const isLandPlot = selectedCategory?.slug === 'land_plot'

    const handleForm = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const addTag = () => {
        if (!tagInput.trim()) return
        setTags(prev => [...prev, tagInput.trim()])
        setTagInput('')
    }

    const removeTag = (i) => setTags(prev => prev.filter((_, idx) => idx !== i))

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }))
        setImages(prev => [...prev, ...newImages])
        e.target.value = ''
    }

    const removeImage = (i) => {
        setImages(prev => {
            URL.revokeObjectURL(prev[i].preview)
            return prev.filter((_, idx) => idx !== i)
        })
    }

    // ─── Reset ────────────────────────────────────────────────────────────────
    const resetForm = () => {
        setForm({
            category_id: '', name: '', price: '', settlement: '', district_id: '',
            highway_id: '', region_id: '', address: '', area: '', land_area: '',
            distance_to_mkad_km: '', floors: '', rooms: '', bedrooms: '', bathrooms: '',
            year_built: '', wall_material: '', finishing: '', communications: '',
            electricity_supply: '', water_supply: '', sewage_type: '', heating_type: '',
            internet_connection: '', description: '',
            has_asphalt_roads: false, has_street_lighting: false, has_guarded_territory: false,
            near_shops: false, near_school_kindergarten: false, near_public_transport: false,
        })
        setTags([])
        images.forEach(img => URL.revokeObjectURL(img.preview))
        setImages([])
    }

    // ─── Submit property ──────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!form.category_id) { toast.error('Выберите тип недвижимости'); return }
        if (!form.name.trim()) { toast.error('Введите название объекта'); return }
        if (!form.price) { toast.error('Введите стоимость'); return }

        setLoading(true)
        try {
            const fd = new FormData()

            const textFields = [
                'category_id', 'name', 'price', 'settlement', 'district_id', 'highway_id',
                'address', 'area', 'land_area', 'distance_to_mkad_km', 'floors', 'rooms',
                'bedrooms', 'bathrooms', 'year_built', 'wall_material', 'finishing',
                'communications', 'electricity_supply', 'water_supply', 'sewage_type',
                'heating_type', 'internet_connection', 'description',
            ]
            textFields.forEach(key => {
                if (form[key] !== '' && form[key] !== null && form[key] !== undefined) {
                    fd.append(key, form[key])
                }
            })

            const boolFields = [
                'has_asphalt_roads', 'has_street_lighting', 'has_guarded_territory',
                'near_shops', 'near_school_kindergarten', 'near_public_transport',
            ]
            boolFields.forEach(key => fd.append(key, form[key]))

            const region = regions.find(r => r.id === form.region_id)
            if (region) {
                fd.append('lat', region.latitude)
                fd.append('long', region.longitude)
            }

            if (tags.length > 0) {
                fd.append('tags', JSON.stringify(tags))
            }

            images.forEach(img => fd.append('images', img.file))

            const res = await axios.post(`${API_BASE}accounts/properties/`, fd, {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                },
            })

            toast.success('Объект отправлен на модерацию!')

            const newId = res.data?.id
            resetForm()

            if (newId) {
                setCreatedPropertyId(newId)
                setShowUnits(true)
            }

        } catch (err) {
            const data = err?.response?.data
            if (data && typeof data === 'object') {
                const firstKey = Object.keys(data)[0]
                const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
                toast.error(String(msg))
            } else {
                toast.error('Произошла ошибка при отправке')
            }
        } finally {
            setLoading(false)
        }
    }

    // ─── After units done ─────────────────────────────────────────────────────
    const handleUnitsDone = () => {
        setShowUnits(false)
        setCreatedPropertyId(null)
    }

    // ─── Options ──────────────────────────────────────────────────────────────
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))
    const districtOptions = districts.map(d => ({ value: d.id, label: d.name }))
    const highwayOptions = highways.map(h => ({ value: h.id, label: h.name }))
    const regionOptions = regions.map(r => ({ value: r.id, label: r.name }))

    const booleanLabels = {
        has_asphalt_roads: 'Асфальт. дороги',
        has_street_lighting: 'Уличное освещение',
        has_guarded_territory: 'Охраняемая терр.',
        near_shops: 'Рядом магазины',
        near_school_kindergarten: 'Школа / сад',
        near_public_transport: 'Общ. транспорт',
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className='max-w-7xl m-auto mt-[30px] max-sm:px-4 pb-[100px] space-y-6'>
            <Toaster />

            {/* ══ Units section — property yaratilgandan keyin ko'rinadi ══ */}
            {showUnits ? (
                <UnitsSection
                    propertyId={createdPropertyId}
                    onDone={handleUnitsDone}
                />
            ) : (
                <>
                    {/* ── Row 1: Тип / Название / Стоимость ── */}
                    <div className='flex flex-col lg:flex-row gap-6'>
                        <Select
                            label='Тип недвижимости:'
                            value={form.category_id}
                            onChange={v => setForm(p => ({ ...p, category_id: v }))}
                            options={categoryOptions}
                            placeholder='Выберите тип'
                        />
                        <Field label='Название объекта:' name='name' value={form.name} onChange={handleForm} placeholder='Название объекта' />
                        <Field label='Стоимость:' name='price' value={form.price} onChange={handleForm} placeholder='1234567890 ₽' type='number' />
                    </div>

                    {/* ── Row 2: Населённый пункт / Регион / Район / Шоссе ── */}
                    <div className='flex flex-col lg:flex-row gap-6'>
                        <Field label='Населённый пункт:' name='settlement' value={form.settlement} onChange={handleForm} placeholder='Населённый пункт' />
                        <Select
                            label='Регион:'
                            value={form.region_id}
                            onChange={v => setForm(p => ({ ...p, region_id: v }))}
                            options={regionOptions}
                            placeholder='Выберите регион'
                        />
                        <Select
                            label='Район:'
                            value={form.district_id}
                            onChange={v => setForm(p => ({ ...p, district_id: v }))}
                            options={districtOptions}
                            placeholder='Выберите район'
                        />
                        <Select
                            label='Шоссе:'
                            value={form.highway_id}
                            onChange={v => setForm(p => ({ ...p, highway_id: v }))}
                            options={highwayOptions}
                            placeholder='Выберите шоссе'
                        />
                    </div>

                    {/* ── Row 3: Адрес / Площадь / Участок / До МКАД ── */}
                    <div className='flex flex-col lg:flex-row gap-6'>
                        <Field label='Адрес:' name='address' value={form.address} onChange={handleForm} placeholder='Улица, дом' />
                        <Field label='Площадь (м²):' name='area' value={form.area} onChange={handleForm} placeholder='120' type='number' />
                        <Field label='Площадь участка (сот.):' name='land_area' value={form.land_area} onChange={handleForm} placeholder='10' type='number' />
                        <Field label='До МКАД (км):' name='distance_to_mkad_km' value={form.distance_to_mkad_km} onChange={handleForm} placeholder='30' type='number' />
                    </div>

                    {/* ── Row 4: Этажность / Комнаты / Спальни / Санузлы ── */}
                    {!isLandPlot && (
                        <div className='flex flex-col lg:flex-row gap-6'>
                            <Field label='Этажность:' name='floors' value={form.floors} onChange={handleForm} placeholder='5' type='number' />
                            <Field label='Количество комнат:' name='rooms' value={form.rooms} onChange={handleForm} placeholder='3' type='number' />
                            <Field label='Спальни:' name='bedrooms' value={form.bedrooms} onChange={handleForm} placeholder='2' type='number' />
                            <Field label='Санузлы:' name='bathrooms' value={form.bathrooms} onChange={handleForm} placeholder='1' type='number' />
                        </div>
                    )}

                    {/* ── Row 5: Год / Материал / Отделка / Коммуникации ── */}
                    {!isLandPlot && (
                        <div className='flex flex-col lg:flex-row gap-6'>
                            <Field label='Год постройки:' name='year_built' value={form.year_built} onChange={handleForm} placeholder='2020' type='number' />
                            <Field label='Материал стен:' name='wall_material' value={form.wall_material} onChange={handleForm} placeholder='Кирпич' />
                            <Field label='Отделка:' name='finishing' value={form.finishing} onChange={handleForm} placeholder='Чистовая' />
                            <Field label='Коммуникации (общее):' name='communications' value={form.communications} onChange={handleForm} placeholder='Электричество, вода...' />
                        </div>
                    )}

                    {/* ── Row 6: Коммуникации по отдельности ── */}
                    <div className='flex flex-col lg:flex-row gap-6'>
                        <Field label='Электроснабжение:' name='electricity_supply' value={form.electricity_supply} onChange={handleForm} placeholder='Центральное' />
                        <Field label='Водоснабжение:' name='water_supply' value={form.water_supply} onChange={handleForm} placeholder='Центральное' />
                        <Field label='Канализация:' name='sewage_type' value={form.sewage_type} onChange={handleForm} placeholder='Центральная' />
                        <Field label='Отопление:' name='heating_type' value={form.heating_type} onChange={handleForm} placeholder='Газовое' />
                    </div>
                    <div className='flex flex-col lg:flex-row gap-6'>
                        <div className='w-full lg:w-1/4'>
                            <Field label='Интернет:' name='internet_connection' value={form.internet_connection} onChange={handleForm} placeholder='Оптика' />
                        </div>
                    </div>

                    {/* ── Удобства (чекбоксы) ── */}
                    <div>
                        <p className='text-[14px] text-[#141111] mb-3'>Инфраструктура и удобства:</p>
                        <div className='flex flex-wrap gap-3'>
                            {Object.entries(booleanLabels).map(([key, label]) => (
                                <label
                                    key={key}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer select-none text-[13px] transition-colors
                                        ${form[key] ? 'bg-[#141111] text-white border-[#141111]' : 'bg-[#F4F5F5] text-[#444] border-[#E5E5E5]'}`}
                                >
                                    <input
                                        type='checkbox'
                                        name={key}
                                        checked={form[key]}
                                        onChange={handleForm}
                                        className='hidden'
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── Описание ── */}
                    <span className='flex flex-col gap-2'>
                        <p className='text-[14px] text-[#141111]'>Текстовое описание:</p>
                        <textarea
                            name='description'
                            value={form.description}
                            onChange={handleForm}
                            className='outline-none w-full h-[120px] bg-[#F4F5F5] rounded-[10px] px-[24px] pt-[18px] resize-none text-[14px]'
                            placeholder='Текстовое описание объекта'
                        />
                    </span>

                    {/* ── Теги ── */}
                    <div>
                        <p className='text-[14px] text-[#141111] mb-2'>Теги:</p>
                        <div className='flex flex-wrap gap-3 items-center'>
                            {tags.map((tag, i) => (
                                <div key={i} className='relative flex items-center bg-[#F4F5F5] rounded-full px-5 h-[44px] text-[13px] pr-8'>
                                    {tag}
                                    <button
                                        type='button'
                                        onClick={() => removeTag(i)}
                                        className='absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center'
                                    >
                                        <FaTimes size={9} />
                                    </button>
                                </div>
                            ))}
                            <div className='relative flex items-center bg-[#F4F5F5] rounded-full px-5 h-[44px] gap-2 w-[180px]'>
                                <input
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addTag()}
                                    className='bg-transparent outline-none text-[13px] w-full pr-7'
                                    placeholder='Добавить тег'
                                />
                                <button
                                    type='button'
                                    onClick={addTag}
                                    className='absolute right-3 w-5 h-5 bg-[#E0E0E0] rounded-full flex items-center justify-center'
                                >
                                    <FaPlus size={10} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Изображения ── */}
                    <div>
                        <p className='text-[14px] text-[#141111] mb-2'>Загрузка изображений:</p>
                        {images.length > 0 && (
                            <div className='flex flex-wrap gap-3 mb-4'>
                                {images.map((img, i) => (
                                    <div key={i} className='relative w-[120px] h-[90px] rounded-[10px] overflow-hidden'>
                                        <img src={img.preview} alt='' className='w-full h-full object-cover' />
                                        <button
                                            type='button'
                                            onClick={() => removeImage(i)}
                                            className='absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center'
                                        >
                                            <FaTimes size={9} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className='w-full h-[129px] border-2 border-dashed border-[#141111] bg-[#F4F5F5] rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#ECECEC] transition-colors'
                        >
                            <div className='bg-black text-white w-8 h-8 rounded-full flex items-center justify-center mb-2'>
                                <FaPlus size={14} />
                            </div>
                            <p className='text-[14px] text-[#141111]'>Добавить изображения</p>
                            <input ref={fileInputRef} type='file' multiple accept='image/*' className='hidden' onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* ── Кнопка отправки ── */}
                    <div className='flex flex-col items-center gap-4 mt-6'>
                        <button
                            type='button'
                            onClick={handleSubmit}
                            disabled={loading}
                            className='border border-[#141111] rounded-full px-10 py-3 text-[14px] hover:bg-[#141111] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? 'Отправка...' : 'Отправить на модерацию'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}