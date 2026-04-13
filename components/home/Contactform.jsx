'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { postData } from '@/lib/apiService';

export default function ContactForm() {
    const [agreed, setAgreed] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !phone) {
            toast.error('Введите имя и номер телефона');
            return;
        }
        if (!agreed) {
            toast.error('Дайте согласие на обработку персональных данных');
            return;
        }

        setLoading(true);
        try {
            await postData('/site/consultation/', {
                name,
                phone,
                email: '',
                message: '',
                personal_data_consent: true,
            });

            toast.success('Заявка принята.');
            setName('');
            setPhone('');
            setAgreed(false);
        } catch (err) {
            toast.error('Произошла ошибка. Попробуйте снова');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="contact">
            <Toaster position="top-right" />
            <div className="
                herobg rounded-[20px]
                w-[calc(100%-10px)]
                min-h-[600px] md:h-[calc(100vh-10px)]
                overflow-hidden
                relative
                flex flex-col lg:flex-row
                mx-auto
            ">
                {/* LEFT */}
                <div className="
                    flex-1 flex flex-col justify-center
                    px-5 py-10
                    md:px-[52px] md:py-[48px]
                    relative z-10
                ">
                    <h2 className="text-[22px] md:text-[30px] text-white mb-5 md:mb-7">
                        Подберём недвижимость<br />под вашу задачу
                    </h2>

                    <p className="text-[14px] md:text-[16px] text-gray-400 mb-5 md:mb-7">
                        Оставьте заявку — мы предложим подходящие варианты<br className="hidden md:block" />
                        и проконсультируем по всем вопросам
                    </p>

                    <div className="flex flex-col gap-3  w-full">
                        <input
                            type="text"
                            placeholder="Ваше Имя"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="
                                w-full h-[48px] md:h-[60px]
                                bg-white px-4 md:px-6
                                rounded-[10px] outline-none
                                text-[14px] md:text-[16px]
                            "
                        />
                        <input
                            type="tel"
                            placeholder="Ваш телефон"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="
                                w-full h-[48px] md:h-[60px]
                                bg-white px-4 md:px-6
                                rounded-[10px] outline-none
                                text-[14px] md:text-[16px]
                            "
                        />
                    </div>

                    {/* CHECKBOX */}
                    <div
                        className="flex items-start gap-2 mt-4 cursor-pointer max-w-[500px]"
                        onClick={() => setAgreed(!agreed)}
                    >
                        <div className={`
                            w-[22px] h-[22px] min-w-[22px] rounded-[6px]
                            border-2 flex items-center justify-center
                            mt-[2px] shrink-0 transition-all duration-200
                            ${agreed ? 'bg-[#F05D22] border-[#F05D22]' : 'border-white/40 bg-transparent'}
                        `}>
                            {agreed && (
                                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                                    <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className="text-white/60 text-[12px] md:text-[14px] leading-[1.4] select-none">
                            Я даю согласие на обработку моих персональных данных в соответствии с{' '}
                            <Link href="/privacy" className="underline" onClick={e => e.stopPropagation()}>
                                Политикой
                            </Link>
                        </span>
                    </div>

                    {/* BUTTON */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="
                            mt-5 md:mt-6
                            w-[180px] h-[68px]
                            rounded-full
                            text-white text-[13px] md:text-[14px]
                            transition active:scale-95
                            disabled:opacity-60 disabled:cursor-not-allowed
                        "
                        style={{
                            background: 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)',
                        }}
                    >
                        {loading ? 'Отправка...' : 'Подобрать участок'}
                    </button>
                </div>

                {/* RIGHT IMAGE */}
                <div className="
                    relative
                    lg:w-[55%]
                    h-[355px] sm:h-[300px] md:h-[400px] lg:h-auto
                    shrink-0
                    m-[4px]
                    rounded-[20px]
                    overflow-hidden
                ">
                    <Image
                        src="/sec6.png"
                        alt="house"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}