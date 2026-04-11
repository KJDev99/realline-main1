import React from 'react'

export default function AboutWork() {
    return (
        <div className='max-w-[1400px] mx-auto mt-[100px] mb-[50px] px-4'>
            <h2 className='text-[#141111] text-[30px] mb-6'>Наш подход к работе</h2>
            <div className="grid grid-cols-4 gap-6">
                <div
                    style={{
                        background: 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)'
                    }}
                    className='rounded-[20px] p-6 h-[212px]'
                >
                    <h3 className='text-[14px] text-white line-clamp-1'>01</h3>
                    <p className='py-[30px] text-white text-[20px] font-medium line-clamp-1'>Честность</p>
                    <p className='text-white text-[16px] leading-[100%] line-clamp-3'>Мы не скрываем риски и всегда говорим клиенту реальную ситуацию по объекту</p>
                </div>
                <div
                    style={{
                        background: 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)'
                    }}
                    className='rounded-[20px] p-6 h-[212px]'
                >
                    <h3 className='text-[14px] text-white line-clamp-1'>02</h3>
                    <p className='py-[30px] text-white text-[20px] font-medium line-clamp-1'>Экспертность</p>
                    <p className='text-white text-[16px] leading-[100%] line-clamp-3'>Работаем с недвижимостьюи знаем рынок — от участков до инвестиционных проектов</p>
                </div>
                <div
                    style={{
                        background: 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)'
                    }}
                    className='rounded-[20px] p-6 h-[212px]'
                >
                    <h3 className='text-[14px] text-white line-clamp-1'>03</h3>
                    <p className='py-[30px] text-white text-[20px] font-medium line-clamp-1'>Индивидуальный подход</p>
                    <p className='text-white text-[16px] leading-[100%] line-clamp-3'>Каждый клиент получает подбор под свои цели, а не шаблонные предложения</p>
                </div>
                <div
                    style={{
                        background: 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)'
                    }}
                    className='rounded-[20px] p-6 h-[212px]'
                >
                    <h3 className='text-[14px] text-white line-clamp-1'>04</h3>
                    <p className='py-[30px] text-white text-[20px] font-medium line-clamp-1'>Результат</p>
                    <p className='text-white text-[16px] leading-[100%] line-clamp-3'>Наша задача — не показать объекты, а довести клиентадо сделки</p>
                </div>
            </div>
        </div>
    )
}
