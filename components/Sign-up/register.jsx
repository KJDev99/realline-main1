'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { postData } from '@/lib/apiService'
import Image from 'next/image'
import Navbar from '../Navbar'
import HomeLink from '../homeLink'

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        personal_data_consent: false,
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        if (!form.name || !form.phone) {
            toast.error('Введите имя и номер телефона')
            return
        }
        if (!form.personal_data_consent) {
            toast.error('Дайте согласие на обработку персональных данных')
            return
        }

        setLoading(true)
        try {
            await postData('/accounts/register/', {
                name: form.name,
                phone: form.phone,
                personal_data_consent: form.personal_data_consent,
            })

            toast.success('Отправлено на модерацию для проверки. С вами свяжутся!')
            setSuccess(true)
        } catch (err) {
            toast.error(err.message || 'Произошла ошибка. Попробуйте снова')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Navbar />
            <HomeLink link={'/sign-up'} label={'Регистрация'} link2={''} label2={''} />
            <Toaster position="top-right" />
            <div className="max-w-[1400px] mx-auto px-5 pb-10 mt-[-40px]">
                <div className="mt-6 lg:mt-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-normal mb-6 lg:mb-[30px] text-[24px] lg:text-[36px] leading-[100%]"
                    >
                        Регистрация в личный кабинет агента
                    </motion.h1>

                    <div className="grid grid-cols-2 max-md:grid-cols-1 justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="w-full bg-[#141111] text-white p-6 lg:p-10 rounded-[15px]"
                        >
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="font-normal text-[22px] lg:text-[30px] leading-[110%]"
                            >
                                Создайте аккаунт агента и получите возможность размещать объекты
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="font-normal text-[14px] lg:text-[16px] leading-[140%] mt-4 lg:mt-6"
                            >
                                Добавляйте свои объекты недвижимости на сайт и получайте обращения от заинтересованных покупателей
                            </motion.p>

                            <motion.input
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="w-full h-[55px] lg:h-[60px] rounded-[10px] outline-none bg-white text-[#141111] px-4 lg:px-6 mt-4 lg:mt-6"
                                type="text"
                                name="name"
                                placeholder="Ваше имя"
                                value={form.name}
                                onChange={handleChange}
                            />

                            <motion.input
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="w-full h-[55px] lg:h-[60px] rounded-[10px] outline-none bg-white text-[#141111] px-4 lg:px-6 mt-4 lg:mt-6"
                                type="tel"
                                name="phone"
                                placeholder="Ваш телефон"
                                value={form.phone}
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
                                {loading ? 'Отправка...' : 'Отправить заявку'}
                            </motion.button>

                            <Link href="/sign-in">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.9 }}
                                    className="font-normal text-[14px] lg:text-[16px] mt-6 cursor-pointer hover:text-[#F05D22] transition"
                                >
                                    Войти в личный кабинет
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
                                alt="register"
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

