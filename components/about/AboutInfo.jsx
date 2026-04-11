import React from 'react'

export default function AboutInfo() {
    return (
        <div className='max-w-[1400px] mt-[100px] mx-auto px-4'>
            <h2 className='text-[#141111] text-[30px] mb-6'>Наш подход к работе</h2>

            <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-[#FAFAFA] rounded-[20px]">
                    <p className='mb-4 text-[#141111] text-sm'>Мы специализируемся на подборе и сопровождении сделок с недвижимостьюв Москве, Московской области и Санкт-Петербурге.</p>
                    <p className='mb-4 text-[#141111] text-sm'>В отличие от классических агентств, мы не предлагаем «всё подряд».Наша задача — найти именно тот объект, который соответствует целям клиента: для жизни, строительства или инвестиций.</p>
                </div>
                <div className="p-6 bg-[#FAFAFA] rounded-[20px]">
                    <h3 className='text-[#141111] text-[20px] font-medium'>Перед тем как предложить объект, мы:</h3>
                    <div className="flex gap-x-2.5 items-center mt-[15px]">
                        <div className="size-2.5 bg-[#F05D22] rounded-full"></div>
                        <p className='text-[#141111] text-sm'>Проводим тщательную проверку всех предложений</p>
                    </div>
                    <div className="flex gap-x-2.5 items-center mt-[15px]">
                        <div className="size-2.5 bg-[#F05D22] rounded-full"></div>
                        <p className='text-[#141111] text-sm'>анализируем локацию</p>
                    </div>
                    <div className="flex gap-x-2.5 items-center mt-[15px]">
                        <div className="size-2.5 bg-[#F05D22] rounded-full"></div>
                        <p className='text-[#141111] text-sm'>оцениваем перспективу роста стоимости</p>
                    </div>
                </div>
            </div>
            <p className='text-[#DF3505] mt-[24px]'>Это позволяет нашим клиентам принимать взвешенные и безопасные решения</p>
        </div>
    )
}
