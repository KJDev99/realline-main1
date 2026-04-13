import Link from 'next/link'
import React from 'react'
export default function HomeLink({ link, label, link2, label2 }) {
    return (
        <div className="flex items-center max-w-[1400px] mx-auto gap-x-2 p-4 lg:p-6 max-md:text-wrap max-md:flex-wrap">
            <Link href={'/'}>
                <div

                    className="font-normal text-[14px] lg:text-[16px] leading-[100%] cursor-pointer"
                >
                    Главная
                </div>
            </Link>
            {
                link && (
                    <p className='px-2'>/</p>
                )
            }
            <Link href={link}>
                <div

                    className="font-normal text-[14px] lg:text-[16px] leading-[100%] cursor-pointer"
                >
                    {label}
                </div>
            </Link>
            {
                link2 && (
                    <p className='px-2'>/</p>
                )
            }

            <Link href={link2}>
                <div

                    className="font-normal text-[14px] lg:text-[16px] leading-[100%] cursor-pointer"
                >
                    {label2}
                </div>
            </Link>


        </div>
    )
}
