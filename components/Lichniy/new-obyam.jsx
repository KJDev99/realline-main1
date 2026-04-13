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

    // Dropdown ochilganda search inputga focus
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
                        {/* Search input */}
                        <div className='px-3 py-2 border-b border-[#E5E5E5]'>
                            <input
                                type='text'
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder='Поиск...'
                                className='w-full outline-none bg-[#F4F5F5] rounded-[8px] px-3 py-2 text-[13px]'
                            />
                        </div>

                        {/* Options list */}
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NewObyam() {
    // Справочники
    const [categories, setCategories] = useState([])
    const [districts, setDistricts] = useState([])
    const [highways, setHighways] = useState([])
    const [regions, setRegions] = useState([])

    // Основные поля
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
        // Boolean flags
        has_asphalt_roads: false,
        has_street_lighting: false,
        has_guarded_territory: false,
        near_shops: false,
        near_school_kindergarten: false,
        near_public_transport: false,
    })

    // residential_details (только для Новостройки)
    const [resDetails, setResDetails] = useState({
        completion_period_text: '',
        project_finishing: '',
        developer: '',
        housing_class: '',
        payment_methods: '',
        escrow_bank: '',
        units_total: '',
        units_available: '',
        price_per_sqm_from: '',
        parking_info: '',
        contract_form: '',
        travel_time_note: '',
        district_note: '',
        registration_settlement: '',
        plot_location_text: '',
    })

    // Теги
    const [tags, setTags] = useState([])
    const [tagInput, setTagInput] = useState('')

    // Изображения
    const [images, setImages] = useState([]) // [{file, preview}]
    const fileInputRef = useRef(null)

    const [loading, setLoading] = useState(false)

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
    const isNewBuilding = selectedCategory?.slug === 'new_building'
    const isLandPlot = selectedCategory?.slug === 'land_plot'

    const handleForm = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleResDetails = (e) => {
        const { name, value } = e.target
        setResDetails(prev => ({ ...prev, [name]: value }))
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

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!form.category_id) { toast.error('Выберите тип недвижимости'); return }
        if (!form.name.trim()) { toast.error('Введите название объекта'); return }
        if (!form.price) { toast.error('Введите стоимость'); return }

        setLoading(true)
        try {
            const fd = new FormData()

            // Основные поля
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

            // Boolean flags
            const boolFields = [
                'has_asphalt_roads', 'has_street_lighting', 'has_guarded_territory',
                'near_shops', 'near_school_kindergarten', 'near_public_transport',
            ]
            boolFields.forEach(key => fd.append(key, form[key]))

            // Region → lat/long
            const region = regions.find(r => r.id === form.region_id)
            if (region) {
                fd.append('lat', region.latitude)
                fd.append('long', region.longitude)
            }

            // Tags
            if (tags.length > 0) {
                fd.append('tags', JSON.stringify(tags))
            }

            // residential_details
            if (isNewBuilding) {
                const cleaned = Object.fromEntries(
                    Object.entries(resDetails).filter(([, v]) => v !== '' && v !== null)
                )
                if (Object.keys(cleaned).length > 0) {
                    fd.append('residential_details', JSON.stringify(cleaned))
                }
            }

            // Images
            images.forEach(img => fd.append('images', img.file))

            await axios.post(`${API_BASE}accounts/properties/`, fd, {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                },
            })

            toast.success('Объект отправлен на модерацию!')

            // Reset
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
            setResDetails({
                completion_period_text: '', project_finishing: '', developer: '',
                housing_class: '', payment_methods: '', escrow_bank: '', units_total: '',
                units_available: '', price_per_sqm_from: '', parking_info: '',
                contract_form: '', travel_time_note: '', district_note: '',
                registration_settlement: '', plot_location_text: '',
            })
            setTags([])
            images.forEach(img => URL.revokeObjectURL(img.preview))
            setImages([])

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

    // ─── Options ──────────────────────────────────────────────────────────────
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))
    const districtOptions = districts.map(d => ({ value: d.id, label: d.name }))
    const highwayOptions = highways.map(h => ({ value: h.id, label: h.name }))
    const regionOptions = regions.map(r => ({ value: r.id, label: r.name }))

    // ─── Checkbox row ─────────────────────────────────────────────────────────
    const booleanLabels = {
        has_asphalt_roads: 'Асфальт. дороги',
        has_street_lighting: 'Уличное освещение',
        has_guarded_territory: 'Охраняемая терр.',
        near_shops: 'Рядом магазины',
        near_school_kindergarten: 'Школа / сад',
        near_public_transport: 'Общ. транспорт',
    }

    return (
        <div className='max-w-7xl m-auto mt-[30px] max-sm:px-4 pb-[100px] space-y-6'>
            <Toaster />
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

            {/* ── Новостройки — дополнительные поля ── */}
            {isNewBuilding && (
                <div className='border border-[#E5E5E5] rounded-[12px] p-5 space-y-5 bg-[#fafafa]'>
                    <p className='text-[13px] font-semibold text-[#141111] uppercase tracking-wider'>Детали новостройки</p>
                    <div className='flex flex-col lg:flex-row gap-6'>
                        <Field label='Срок сдачи:' name='completion_period_text' value={resDetails.completion_period_text} onChange={handleResDetails} placeholder='Срок сдачи' />
                        <Field label='Отделка проекта:' name='project_finishing' value={resDetails.project_finishing} onChange={handleResDetails} placeholder='Чистовая / черновая' />
                        <Field label='Застройщик:' name='developer' value={resDetails.developer} onChange={handleResDetails} placeholder='Застройщик' />
                        <Field label='Класс жилья:' name='housing_class' value={resDetails.housing_class} onChange={handleResDetails} placeholder='Комфорт / бизнес' />
                    </div>
                    <div className='flex flex-col lg:flex-row gap-6'>
                        <Field label='Способы оплаты:' name='payment_methods' value={resDetails.payment_methods} onChange={handleResDetails} placeholder='Ипотека, рассрочка...' />
                        <Field label='Банки (эскроу):' name='escrow_bank' value={resDetails.escrow_bank} onChange={handleResDetails} placeholder='Сбербанк, ВТБ...' />
                        <Field label='Форма договора:' name='contract_form' value={resDetails.contract_form} onChange={handleResDetails} placeholder='ДДУ, ДКП...' />
                        <Field label='Цена за м² от:' name='price_per_sqm_from' value={resDetails.price_per_sqm_from} onChange={handleResDetails} placeholder='150000' type='number' />
                    </div>
                    <div className='flex flex-col lg:flex-row gap-6'>
                        <Field label='Всего квартир:' name='units_total' value={resDetails.units_total} onChange={handleResDetails} placeholder='200' type='number' />
                        <Field label='Доступно квартир:' name='units_available' value={resDetails.units_available} onChange={handleResDetails} placeholder='50' type='number' />
                        <Field label='Паркинг:' name='parking_info' value={resDetails.parking_info} onChange={handleResDetails} placeholder='Подземный, 1 м/м' />
                        <Field label='Время в пути:' name='travel_time_note' value={resDetails.travel_time_note} onChange={handleResDetails} placeholder='30 мин до центра' />
                    </div>
                    <div className='flex flex-col lg:flex-row gap-6'>
                        <Field label='Заметка о районе:' name='district_note' value={resDetails.district_note} onChange={handleResDetails} placeholder='Тихий зелёный район' />
                        <Field label='Регистрация посёлка:' name='registration_settlement' value={resDetails.registration_settlement} onChange={handleResDetails} placeholder='' />
                        <Field label='Расположение участка:' name='plot_location_text' value={resDetails.plot_location_text} onChange={handleResDetails} placeholder='' />
                    </div>
                </div>
            )}

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
                {!isNewBuilding && (
                    <Field label='Площадь участка (сот.):' name='land_area' value={form.land_area} onChange={handleForm} placeholder='10' type='number' />
                )}
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

                {/* Preview grid */}
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

            {/* ── Кнопки ── */}
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
        </div>
    )
}