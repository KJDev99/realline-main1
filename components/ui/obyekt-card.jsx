import React from 'react'

export default function ObyektCard({ color, textMap = [], title, code, price, statusText, id }) {
    return (
        <div className='w-full max-w-[416px] p-6 bg-[#FAFAFA] rounded-[20px] mx-auto'>
            {/* Sarlavha */}
            <h1 className='font-normal text-[30px] leading-[100%] tracking-[0%] align-middle 
                           max-sm:text-[22px] max-sm:leading-tight'>
                {title}
            </h1>

            {/* Kod */}
            <span className='flex items-center gap-1 mt-[15px] text-[16px] max-sm:text-[14px]'>
                <h2 className='text-[#14111180] font-normal leading-[100%] tracking-[0%] align-middle'>
                    Код:
                </h2>
                <p>{code}</p>
            </span>

            {/* Narx */}
            <span className='flex items-center gap-1 mt-[15px] text-[16px] max-sm:text-[14px]'>
                <h2 className='text-[#14111180] font-normal leading-[100%] tracking-[0%] align-middle'>
                    Цена:
                </h2>
                <p>{price}</p>
            </span>

            {/* Status bloki */}
            <div className='w-full max-w-[368px] rounded-[15px] bg-white p-[15px] mt-6 mb-6 mx-auto max-sm:max-w-[305px]'>
                <h2 className='font-medium text-[20px] leading-[100%] tracking-[0%] align-middle mb-[15px] 
                               max-sm:text-[16px]'>
                    Статус:
                </h2>
                <div className='flex gap-2 items-center'>
                    <div className={`w-[18px] h-[18px] ${color} rounded-full`}></div>
                    <h2 className='font-normal text-[14px] leading-[100%] tracking-[0%] align-middle max-sm:text-[13px]'>
                        {statusText}
                    </h2>
                </div>
            </div>

            {/* TextMap ro‘yxati */}
            {textMap.map((item, index) => (
                <p
                    key={index}
                    className={`${id === 4 || id === 3 ? "text-red-600" : "text-black"
                        } underline cursor-pointer decoration-solid decoration-1 
                        max-sm:text-[14px] underline-offset-1 decoration-auto mt-[15px]`}
                >
                    {item}
                </p>
            ))}
        </div>
    )
}