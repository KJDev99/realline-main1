'use client'

import { AUTH_CHANGED_EVENT } from '@/store/useFavoriteCompare'

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

function getAuthHeaders() {
    const token = localStorage.getItem('access_token')
    return { Authorization: `Bearer ${token}` }
}

// ─── Компонент вынесен ЗА пределы родителя — фокус не теряется ───────────────
function EditableField({ label, name, type = 'text', placeholder, value, onChange }) {
    return (
        <span className='flex flex-col gap-2 w-full'>
            <p className='text-[14px] text-[#141111]'>{label}</p>
            <div className='relative w-full'>
                <input
                    name={name}
                    value={value}
                    onChange={onChange}
                    className='outline-none w-full h-[56px] bg-[#F4F5F5] rounded-[10px] px-[24px] pr-[52px]'
                    placeholder={placeholder}
                    type={type}
                />
                <Image
                    className='absolute right-6 top-[18px]'
                    width={20}
                    height={20}
                    alt='edit'
                    src='/icons/edit.svg'
                />
            </div>
        </span>
    )
}

const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4 },
    }),
}

export default function ProfilAgent() {
    const router = useRouter()
    const [showPassword1, setShowPassword1] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    const [profile, setProfile] = useState({
        full_name: '',
        phone: '',
        email: '',
        description: '',
    })

    const [passwords, setPasswords] = useState({
        new_password: '',
        new_password_confirm: '',
    })

    const [loadingProfile, setLoadingProfile] = useState(false)
    const [loadingPassword, setLoadingPassword] = useState(false)

    // ─── Загрузка профиля ─────────────────────────────────────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}accounts/profile/`, {
                    headers: getAuthHeaders(),
                })
                setProfile({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    description: data.description || '',
                })
            } catch {
                toast.error('Не удалось загрузить данные профиля')
            }
        }
        fetchProfile()
    }, [])

    // ─── Обработчики ──────────────────────────────────────────────────────────
    const handleProfileChange = (e) => {
        setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handlePasswordChange = (e) => {
        setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    // ─── Сохранение профиля ───────────────────────────────────────────────────
    const handleProfileSave = async () => {
        setLoadingProfile(true)
        try {
            await axios.patch(
                `${API_BASE}accounts/profile/`,
                {
                    full_name: profile.full_name,
                    phone: profile.phone,
                    email: profile.email,
                    description: profile.description,
                },
                { headers: getAuthHeaders() }
            )
            toast.success('Профиль успешно сохранён')
        } catch (err) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                'Произошла ошибка при сохранении'
            toast.error(msg)
        } finally {
            setLoadingProfile(false)
        }
    }

    // ─── Смена пароля ─────────────────────────────────────────────────────────
    const handlePasswordSave = async () => {
        if (!passwords.new_password || !passwords.new_password_confirm) {
            toast.error('Пожалуйста, заполните оба поля пароля')
            return
        }
        if (passwords.new_password !== passwords.new_password_confirm) {
            toast.error('Пароли не совпадают')
            return
        }
        setLoadingPassword(true)
        try {
            await axios.post(
                `${API_BASE}accounts/change-password/`,
                {
                    new_password: passwords.new_password,
                    new_password_confirm: passwords.new_password_confirm,
                },
                { headers: getAuthHeaders() }
            )
            toast.success('Пароль успешно изменён')
            setPasswords({ new_password: '', new_password_confirm: '' })
        } catch (err) {
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                'Произошла ошибка при смене пароля'
            toast.error(msg)
        } finally {
            setLoadingPassword(false)
        }
    }

    // ─── Выход из системы ─────────────────────────────────────────────────────
    const handleLogout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT))

        // Показываем сообщение об успешном выходе
        toast.success('Вы успешно вышли из системы')

        setShowLogoutDialog(false)

        setTimeout(() => {
            router.push('/')
        }, 1000)
    }

    return (
        <motion.div
            initial='hidden'
            animate='visible'
            className='max-w-7xl m-auto mt-[30px] max-sm:px-4 space-y-6'
        >
            <Toaster position="top-right" />

            {/* Диалоговое окно подтверждения выхода */}
            {showLogoutDialog && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-[20px] p-6 max-w-md mx-4"
                    >
                        <h3 className="text-xl font-semibold mb-4 text-[#141111]">Выход из системы</h3>
                        <p className="text-gray-600 mb-6">Вы действительно хотите выйти из системы?</p>
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setShowLogoutDialog(false)}
                                className="px-6 py-2 border border-gray-300 rounded-[10px] text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2 bg-red-600 text-white rounded-[10px] hover:bg-red-700 transition-colors"
                            >
                                Выйти
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Строка 1: имя / телефон / почта */}
            <motion.div
                variants={inputVariants}
                custom={0}
                className='flex flex-col lg:flex-row gap-6'
            >
                <div className='flex-1'>
                    <EditableField
                        label='Ваше имя, фамилия:'
                        name='full_name'
                        placeholder='Имя Фамилия'
                        value={profile.full_name}
                        onChange={handleProfileChange}
                    />
                </div>
                <div className='flex-1'>
                    <EditableField
                        label='Номер телефона:'
                        name='phone'
                        type='tel'
                        placeholder='+7 (---) --- -- --'
                        value={profile.phone}
                        onChange={handleProfileChange}
                    />
                </div>
                <div className='flex-1'>
                    <EditableField
                        label='Электронная почта:'
                        name='email'
                        type='email'
                        placeholder='1234@info.ru'
                        value={profile.email}
                        onChange={handleProfileChange}
                    />
                </div>
            </motion.div>

            {/* Строка 2: описание */}
            <motion.div variants={inputVariants} custom={1} className='w-full'>
                <span className='flex flex-col gap-2 w-full'>
                    <p className='text-[14px] text-[#141111]'>Ваше описание:</p>
                    <div className='relative w-full'>
                        <input
                            name='description'
                            value={profile.description}
                            onChange={handleProfileChange}
                            className='outline-none w-full h-[56px] bg-[#F4F5F5] rounded-[10px] px-[24px] pr-[52px]'
                            placeholder='Описание агента недвижимости'
                            type='text'
                        />
                        <Image
                            className='absolute right-6 top-[18px]'
                            width={20}
                            height={20}
                            alt='edit'
                            src='/icons/edit.svg'
                        />
                    </div>
                </span>
            </motion.div>

            {/* Кнопка сохранения профиля */}
            <motion.div variants={inputVariants} custom={2} className='flex'>
                <button
                    onClick={handleProfileSave}
                    disabled={loadingProfile}
                    className='h-[48px] px-8 bg-[#141111] text-white rounded-[10px] text-[14px] font-medium
                               hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {loadingProfile ? 'Сохранение...' : 'Сохранить профиль'}
                </button>
            </motion.div>

            {/* Разделитель */}
            <motion.hr variants={inputVariants} custom={3} className='border-[#E5E5E5]' />

            {/* Строка 3: пароли */}
            <motion.div
                variants={inputVariants}
                custom={4}
                className='flex flex-col lg:flex-row gap-6'
            >
                {/* Новый пароль */}
                <div className='flex-1'>
                    <span className='flex flex-col gap-2 w-full'>
                        <p className='text-[14px] text-[#141111]'>Новый пароль:</p>
                        <div className='relative w-full'>
                            <input
                                name='new_password'
                                value={passwords.new_password}
                                onChange={handlePasswordChange}
                                className='outline-none w-full h-[56px] bg-[#F4F5F5] rounded-[10px] px-[24px] pr-[52px]'
                                placeholder='••••••••••••••••••••'
                                type={showPassword1 ? 'text' : 'password'}
                            />
                            <div
                                className='absolute right-6 top-[18px] cursor-pointer'
                                onClick={() => setShowPassword1((prev) => !prev)}
                            >
                                {showPassword1 ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </div>
                        </div>
                    </span>
                </div>

                {/* Подтверждение пароля */}
                <div className='flex-1'>
                    <span className='flex flex-col gap-2 w-full'>
                        <p className='text-[14px] text-[#141111]'>Повторите пароль:</p>
                        <div className='relative w-full'>
                            <input
                                name='new_password_confirm'
                                value={passwords.new_password_confirm}
                                onChange={handlePasswordChange}
                                className='outline-none w-full h-[56px] bg-[#F4F5F5] rounded-[10px] px-[24px] pr-[52px]'
                                placeholder='••••••••••••••••••••'
                                type={showPassword2 ? 'text' : 'password'}
                            />
                            <div
                                className='absolute right-6 top-[18px] cursor-pointer'
                                onClick={() => setShowPassword2((prev) => !prev)}
                            >
                                {showPassword2 ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </div>
                        </div>
                    </span>
                </div>
            </motion.div>

            {/* Кнопки: Изменить пароль и Выход */}
            <div className="flex justify-between items-center">
                <motion.div variants={inputVariants} custom={5} className='flex'>
                    <button
                        onClick={handlePasswordSave}
                        disabled={loadingPassword}
                        className='h-[48px] px-8 bg-[#141111] text-white rounded-[10px] text-[14px] font-medium
                               hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loadingPassword ? 'Сохранение...' : 'Изменить пароль'}
                    </button>
                </motion.div>

                <motion.div variants={inputVariants} custom={5} className='flex'>
                    <button
                        onClick={() => setShowLogoutDialog(true)}
                        className='h-[48px] px-8 bg-red-600 text-white rounded-[10px] text-[14px] font-medium
                               hover:bg-red-700 transition-colors'
                    >
                        Выйти
                    </button>
                </motion.div>
            </div>
        </motion.div>
    )
}