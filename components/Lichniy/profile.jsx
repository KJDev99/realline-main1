'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProfilAgent from './profile-agent'
import MeBbyom from './me-obyom'
import NewObyam from './new-obyam';
import { AiFillHome, AiOutlinePlusSquare } from "react-icons/ai";
import { FaUserTie } from "react-icons/fa";
import Link from 'next/link'

export default function Profile() {
    const [activeTab, setActiveTab] = useState("MeBbyom");

    const renderContent = () => {
        switch (activeTab) {
            case 'MeBbyom':
                return <MeBbyom />;
            case 'ProfilAgent':
                return <ProfilAgent />;
            case 'NewObyam':
                return <NewObyam />;
            default:
                return <MeBbyom />;
        }
    }

    const tabs = [
        { id: 'MeBbyom', label: 'Мои объекты', icon: <AiFillHome /> },
        { id: 'NewObyam', label: 'Добавление нового объекта', icon: <AiOutlinePlusSquare /> },
        { id: 'ProfilAgent', label: 'Профиль агента', icon: <FaUserTie /> },
    ];

    return (
        <div className="mt-10 max-w-7xl m-auto px-4">
            <Link href={'/'}>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="font-normal mb-10 text-[14px] lg:text-[16px] leading-[100%] cursor-pointer"
                >
                    Главная / Личный кабинет
                </motion.div>
            </Link>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className='font-normal text-[36px] leading-none tracking-normal align-middle mb-[30px]'
            >
                Личный кабинет агента недвижимости
            </motion.p>

            {/* Tabs */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`font-normal text-[16px] flex justify-center items-center gap-2 leading-[100%] align-middle 
                            w-full md:w-[416px] h-[50px] rounded-full transition-colors
                            ${activeTab === tab.id
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="mt-8 relative min-h-[200px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}