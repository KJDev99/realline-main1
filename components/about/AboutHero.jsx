import Image from 'next/image';
import React from 'react'

export default function AboutHero() {
    return (
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
                <h2 className="text-[22px] md:text-[30px] text-white mb-5">
                    Реаллайн — эксперты по недвижимости
                </h2>
                <p className="text-[14px] md:text-[16px] text-[#FFFFFF] mb-5">
                    Подбираем, проверяем и сопровождаем сделки с недвижимостью — от земельных участков до инвестиционных объектов.
                </p>
                <p className="text-[14px] md:text-[16px] text-[#FFFFFF] mb-5">
                    Реаллайн — команда специалистов, которая помогает клиентам безопасно и выгодно покупать недвижимость.
                </p>
                <p className="text-[14px] md:text-[16px] text-[#FFFFFF] mb-5">
                    Мы работаем с земельными участками, жилой и коммерческой недвижимостью, подбирая решения под конкретные задачи клиента.
                </p>
            </div>

            {/* RIGHT */}
            <div className="
                relative
                lg:w-[45%]
                h-[355px] sm:h-[300px] md:h-[400px] lg:h-auto
                shrink-0
                m-[4px]
                rounded-[20px]
                overflow-hidden
            ">
                <Image
                    src="/companyo.png"
                    alt="house"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
} 