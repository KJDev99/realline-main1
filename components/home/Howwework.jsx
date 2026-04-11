'use client';

import React, { useEffect, useRef, useState } from 'react';

const STEPS = [
    {
        num: '01',
        title: 'Заявка',
        desc: 'Строительство дома',
        align: 'start',   // text-align left, circle flush left
    },
    {
        num: '02',
        title: 'Определение задачи',
        desc: 'Мы уточняем бюджет, цели покупки и требования к объекту',
        align: 'center',
    },
    {
        num: '03',
        title: 'Подбор объектов',
        desc: 'Подготавливаем список подходящих вариантов',
        align: 'center',
    },
    {
        num: '04',
        title: 'Просмотр и выбор',
        desc: 'Организуем просмотр и помогаем выбрать лучший вариант',
        align: 'center',
    },
    {
        num: '05',
        title: 'Сделка',
        desc: 'Проводим юридическую проверку и сопровождаем оформление',
        align: 'end',    // text-align right, circle flush right
    },
];

const GRADIENT = 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)';

export default function HowWeWork() {
    const sectionRef = useRef(null);
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAnimated(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style>{`
        .hww-line-track {
          position: absolute;
          top: 43px;
          left: 43px;
          right: 43px;
          height: 2px;
          background: #E5E7EB;
          z-index: 0;
        }
        .hww-line-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 2px;
          width: 0%;
          background: ${GRADIENT};
          transition: width 2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }
        .hww-line-fill.run {
          width: 100%;
        }
      `}</style>

            <section ref={sectionRef} className="w-full bg-white py-20 px-5 md:px-10 max-w-350 mx-auto">
                {/* Title */}
                <div className="flex justify-center mb-14">
                    <h2 className="text-gray-900 text-3xl md:text-4xl font-light text-center">
                        Как мы работаем
                    </h2>
                </div>

                {/* Steps */}
                <div className="relative max-w-[1296px] mx-auto">
                    {/* Grey track */}
                    <div className="hww-line-track">

                        <div className={`hww-line-fill ${animated ? 'run' : ''}`} />
                    </div>

                    {/* Row of steps */}
                    <div className="relative z-10 flex items-start justify-between">
                        {STEPS.map((step, i) => (
                            <div
                                key={i}
                                className="flex flex-col"
                                style={{
                                    alignItems:
                                        step.align === 'start'
                                            ? 'flex-start'
                                            : step.align === 'end'
                                                ? 'flex-end'
                                                : 'center',
                                    width: `${100 / STEPS.length}%`,
                                    textAlign:
                                        step.align === 'start'
                                            ? 'left'
                                            : step.align === 'end'
                                                ? 'right'
                                                : 'center',
                                }}
                            >
                                {/* Circle */}
                                <div
                                    style={{
                                        width: 86,
                                        height: 86,
                                        borderRadius: '50%',
                                        background: GRADIENT,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 20,
                                        flexShrink: 0,
                                    }}
                                >
                                    <span className='text-[30px] text-white'>
                                        {step.num}
                                    </span>
                                </div>

                                <h3 className='font-medium text-[20px] leading-[100%] tracking-[0%] align-middle'>
                                    {step.title}
                                </h3>
                                <p className='font-normal text-[16px] leading-[100%] tracking-[0%] text-[#141111] mt-[15px]'>
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}