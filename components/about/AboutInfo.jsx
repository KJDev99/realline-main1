import React from 'react'

export default function AboutInfo() {
    return (
        <>
            <style>{`
                .about-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
                .about-info-title { font-size: 30px; }

                @media (max-width: 767px) {
                    .about-info-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
                    .about-info-title { font-size: 20px !important; }
                }
            `}</style>

            <div className='max-w-[1400px] mt-[60px] lg:mt-[100px] mx-auto px-4'>
                <h2 className='about-info-title text-[#141111] mb-6'>Наш подход к работе</h2>

                <div className="about-info-grid">
                    <div className="p-5 lg:p-6 bg-[#FAFAFA] rounded-[20px]">
                        <p className='mb-4 text-[#141111] text-sm leading-[160%]'>
                            Мы специализируемся на подборе и сопровождении сделок с недвижимостью в Москве, Московской области и Санкт-Петербурге.
                        </p>
                        <p className='mb-4 text-[#141111] text-sm leading-[160%]'>
                            В отличие от классических агентств, мы не предлагаем «всё подряд». Наша задача — найти именно тот объект, который соответствует целям клиента: для жизни, строительства или инвестиций.
                        </p>
                    </div>
                    <div className="p-5 lg:p-6 bg-[#FAFAFA] rounded-[20px]">
                        <h3 className='text-[#141111] text-[18px] lg:text-[20px] font-medium'>Перед тем как предложить объект, мы:</h3>
                        {[
                            'Проводим тщательную проверку всех предложений',
                            'Анализируем локацию',
                            'Оцениваем перспективу роста стоимости',
                        ].map((text, i) => (
                            <div key={i} className="flex gap-x-2.5 items-center mt-[15px]">
                                <div className="size-2.5 shrink-0 bg-[#F05D22] rounded-full" />
                                <p className='text-[#141111] text-sm'>{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className='text-[#DF3505] mt-[24px] text-sm lg:text-base'>
                    Это позволяет нашим клиентам принимать взвешенные и безопасные решения
                </p>
            </div>
        </>
    )
}