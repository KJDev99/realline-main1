import React from 'react'

export default function AboutWork() {
    const cards = [
        { num: '01', title: 'Честность', desc: 'Мы не скрываем риски и всегда говорим клиенту реальную ситуацию по объекту' },
        { num: '02', title: 'Экспертность', desc: 'Работаем с недвижимостью и знаем рынок — от участков до инвестиционных проектов' },
        { num: '03', title: 'Индивидуальный подход', desc: 'Каждый клиент получает подбор под свои цели, а не шаблонные предложения' },
        { num: '04', title: 'Результат', desc: 'Наша задача — не показать объекты, а довести клиента до сделки' },
    ]

    return (
        <>
            <style>{`
                .about-work-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
                .about-work-card { height: 212px; padding: 24px; }
                .about-work-title { font-size: 30px; }
                .card-title { padding: 30px 0; font-size: 20px; }
                .card-desc { font-size: 16px; line-height: 130%; }

                @media (max-width: 1023px) {
                    .about-work-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
                    .about-work-card { height: auto !important; min-height: 180px; }
                }
                @media (max-width: 767px) {
                    .about-work-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
                    .about-work-card { min-height: 150px !important; padding: 14px !important; }
                    .card-title { padding: 12px 0 !important; font-size: 15px !important; }
                    .card-desc { font-size: 12px !important; }
                    .about-work-title { font-size: 20px !important; }
                }
            `}</style>

            <div className='max-w-[1400px] mx-auto mt-[60px] lg:mt-[100px] mb-[50px] px-4'>
                <h2 className='about-work-title text-[#141111] mb-6'>Наш подход к работе</h2>
                <div className="about-work-grid">
                    {cards.map((item) => (
                        <div
                            key={item.num}
                            style={{
                                background: 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)'
                            }}
                            className='about-work-card rounded-[20px]'
                        >
                            <h3 className='text-[14px] text-white'>{item.num}</h3>
                            <p className='card-title text-white font-medium line-clamp-2'>{item.title}</p>
                            <p className='card-desc text-white line-clamp-3'>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}