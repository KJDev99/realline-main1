'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { postData } from '@/lib/apiService'
import { AUTH_CHANGED_EVENT } from '@/store/useFavoriteCompare'
import Navbar from '../Navbar'
import Image from 'next/image'
import HomeLink from '../homeLink'

export default function Login() {
    const router = useRouter()
    const [form, setForm] = useState({
        username: '',
        password: '',
        personal_data_consent: false,
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = async () => {
        if (!form.username || !form.password) {
            toast.error('Введите логин и пароль')
            return
        }
        if (!form.personal_data_consent) {
            toast.error('Дайте согласие на обработку персональных данных')
            return
        }

        setLoading(true)
        try {
            const data = await postData('/accounts/login/', {
                username: form.username,
                password: form.password,
                personal_data_consent: form.personal_data_consent,
            })

            localStorage.setItem('access_token', data.access)
            localStorage.setItem('refresh_token', data.refresh)
            window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT))

            toast.success('Вы успешно вошли в систему')
            router.push('/profile')
        } catch (err) {
            if (err.status === 403) {
                toast.error('Аккаунт не подтверждён администратором')
            } else if (err.status === 401 || err.status === 400) {
                toast.error('Неверный логин или пароль')
            } else {
                toast.error('Произошла ошибка. Попробуйте снова')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Navbar />
            <HomeLink link={'/sign-in'} label={'Вход'} link2={''} label2={''} />
            <Toaster position="top-right" />
            <div className="max-w-[1400px] mx-auto px-5 pb-10 mt-[-40px]">
                <div className="mt-6 lg:mt-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-normal mb-6 lg:mb-[30px] text-[24px] lg:text-[36px] leading-[100%]"
                    >
                        Вход в личный кабинет
                    </motion.h1>

                    <div className="grid grid-cols-2 max-md:grid-cols-1 justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="w-full lg:w-full bg-[#141111] text-white p-6 lg:p-10 rounded-[15px]"
                        >
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="font-normal text-[22px] lg:text-[30px] leading-[110%]"
                            >
                                Войдите в свой аккаунт, чтобы управлять объектами
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="font-normal text-[14px] lg:text-[16px] leading-[140%] mt-4 lg:mt-6 text-white/70"
                            >
                                Добавляйте объекты недвижимости, просматривайте заявки и управляйте своими объявлениями
                            </motion.p>

                            <motion.input
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="w-full h-[55px] lg:h-[60px] rounded-[10px] outline-none bg-white text-[#141111] px-4 lg:px-6 mt-4 lg:mt-6"
                                type="text"
                                name="username"
                                placeholder="Логин"
                                value={form.username}
                                onChange={handleChange}
                            />

                            <motion.input
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="w-full h-[55px] lg:h-[60px] rounded-[10px] outline-none bg-white text-[#141111] px-4 lg:px-6 mt-4 lg:mt-6"
                                type="password"
                                name="password"
                                placeholder="Пароль"
                                value={form.password}
                                onChange={handleChange}
                            />

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                className="flex items-start gap-3 mt-4 lg:mt-6 cursor-pointer select-none"
                                onClick={() => setForm(prev => ({ ...prev, personal_data_consent: !prev.personal_data_consent }))}
                            >
                                <div className={`w-[22px] h-[22px] min-w-[22px] rounded-[6px] border-2 flex items-center justify-center transition-all duration-200 ${form.personal_data_consent ? 'bg-[#F05D22] border-[#F05D22]' : 'border-white/40 bg-transparent'}`}>
                                    {form.personal_data_consent && (
                                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                                            <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-[13px] lg:text-[14px] leading-[140%] text-white/80">
                                    Я даю согласие на обработку моих персональных данных в соответствии с Политикой обработки персональных данных
                                </p>
                            </motion.div>

                            <motion.button
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-[180px] h-[60px] lg:h-[68px] bg-[#F05D22] text-[14px] text-center rounded-full mt-6 font-medium hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Вход...' : 'Войти'}
                            </motion.button>

                            <Link href="/sign-up">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.9 }}
                                    className="font-normal text-[14px] lg:text-[16px] mt-6 cursor-pointer hover:text-[#F05D22] transition"
                                >
                                    Зарегистрироваться
                                </motion.div>
                            </Link>
                        </motion.div>

                        {/* Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="w-full h-[300px] lg:h-[590px] rounded-[15px] overflow-hidden"
                        >
                            <Image
                                width={636}
                                height={590}
                                alt="login"
                                src="/imgs/register.png"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    )
}