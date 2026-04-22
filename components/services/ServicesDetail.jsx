'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import HomeLink from '../homeLink';
import toast, { Toaster } from 'react-hot-toast';
import { getData, postData } from '@/lib/apiService';
import { FiX } from 'react-icons/fi';

const ORANGE_BG = 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)';
const ORANGE = 'linear-gradient(90deg, #F05D22 0%, #DF3505 35.22%, #F13F03 68.86%, #F94A0B 100%)';
const ORANGE_COLOR = '#F05D22';

function SkeletonBlock({ w = '100%', h = 20, mb = 12 }) {
    return <div style={{ width: w, height: h, borderRadius: 6, background: '#E5E7EB', marginBottom: mb, animation: 'pulse 1.4s ease-in-out infinite' }} />;
}
function ZayavkaModal({ open, onClose }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!name || !phone) { toast.error('Введите имя и номер телефона'); return; }
        if (!agreed) { toast.error('Дайте согласие на обработку данных'); return; }
        setLoading(true);
        try {
            await postData('/site/consultation/', {
                name, phone
            });
            toast.success('Заявка принята!');
            setName(''); setPhone(''); setAgreed(false);
            onClose();
        } catch {
            toast.error('Произошла ошибка. Попробуйте снова');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease',
                }}
            />
            {/* Modal */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1001,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px', pointerEvents: 'none',
            }}>
                <div style={{
                    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460,
                    padding: '36px 32px 32px', position: 'relative', pointerEvents: 'all',
                    animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
                }}>
                    {/* Close */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 16, right: 16,
                            width: 32, height: 32, borderRadius: '50%',
                            border: '1px solid #E5E7EB', background: '#F9FAFB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#6B7280',
                        }}
                    >
                        <FiX size={15} />
                    </button>

                    {/* Header */}
                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
                            Оставить заявку
                        </h3>

                    </div>

                    {/* Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        <input
                            type="text"
                            placeholder="Ваше имя"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{
                                height: 52, borderRadius: 12, border: '1px solid #E5E7EB',
                                background: '#F9FAFB', padding: '0 16px', fontSize: 14,
                                outline: 'none', width: '100%', boxSizing: 'border-box',
                                color: '#111827', transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.target.style.borderColor = ORANGE_COLOR}
                            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                        <input
                            type="tel"
                            placeholder="Номер телефона"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            style={{
                                height: 52, borderRadius: 12, border: '1px solid #E5E7EB',
                                background: '#F9FAFB', padding: '0 16px', fontSize: 14,
                                outline: 'none', width: '100%', boxSizing: 'border-box',
                                color: '#111827', transition: 'border-color 0.15s',
                            }}
                            onFocus={e => e.target.style.borderColor = ORANGE_COLOR}
                            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    {/* Checkbox */}
                    <div
                        onClick={() => setAgreed(a => !a)}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 20 }}
                    >
                        <div style={{
                            width: 20, height: 20, minWidth: 20, borderRadius: 6,
                            border: `2px solid ${agreed ? ORANGE_COLOR : '#D1D5DB'}`,
                            background: agreed ? ORANGE_COLOR : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: 1, transition: 'all 0.15s', flexShrink: 0,
                        }}>
                            {agreed && (
                                <svg width="11" height="8" viewBox="0 0 12 9" fill="none">
                                    <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, userSelect: 'none' }}>
                            Я даю согласие на обработку персональных данных в соответствии с{' '}
                            <a href="/privacy" style={{ color: ORANGE_COLOR, textDecoration: 'underline' }} onClick={e => e.stopPropagation()}>
                                Политикой
                            </a>
                        </span>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            width: '100%', height: 52, borderRadius: 999,
                            background: ORANGE, border: 'none',
                            color: '#fff', fontSize: 15, fontWeight: 500,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s',
                        }}
                    >
                        {loading ? 'Отправка...' : 'Отправить заявку'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
            `}</style>
        </>
    );
}

export default function ServicesDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    function handleZayavka() { setModalOpen(true); }
    useEffect(() => {
        if (!id) return;
        getData(`/site/services/${id}/`)
            .then(setService)
            .catch((err) => console.error('Ошибка загрузки услуги:', err))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <>
            <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
            <Toaster position="top-right" />
            <ZayavkaModal open={modalOpen} onClose={() => setModalOpen(false)} />
            <div className="max-w-[1400px] mx-auto px-0 py-0">

                {loading ? (
                    <div style={{ marginTop: 24 }}>
                        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', marginBottom: 60 }}>
                            <div style={{ flex: 1, minWidth: 280 }}>
                                <SkeletonBlock w="60%" h={40} mb={24} />
                                <SkeletonBlock w="100%" h={14} mb={8} />
                                <SkeletonBlock w="90%" h={14} mb={8} />
                                <SkeletonBlock w="80%" h={14} mb={32} />
                                <SkeletonBlock w={160} h={52} mb={0} />
                            </div>
                            <SkeletonBlock w="45%" h={400} mb={0} />
                        </div>
                    </div>
                ) : !service ? (
                    <p style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 60 }}>Услуга не найдена</p>
                ) : (
                    <>
                        {/* ── HERO ── */}
                        <HomeLink link="/services" label="Услуги" link2={`/services/${service?.id}`} label2={service?.title} />

                        <div className='px-4 mt-6 max-md:mt-3]' style={{ display: 'flex', gap: 48, flexWrap: 'wrap', marginBottom: 64, alignItems: 'flex-start' }}>
                            {/* Left */}
                            <div style={{ flex: 1, minWidth: 280 }}>
                                <h1 className=' max-md:text-[26px] text-[36px] mb-5 max-md:mb-3' style={{ fontWeight: 400, color: '#111827', lineHeight: 1.2 }}>
                                    {service.title}
                                </h1>
                                <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, margin: '0 0 12px' }}>
                                    {service.hero_text}
                                </p>
                                <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, margin: '0 0 32px' }}>
                                    {service.body}
                                </p>

                                <button
                                    onClick={handleZayavka}
                                    style={{
                                        background: ORANGE_BG, color: '#fff', border: 'none',
                                        borderRadius: 999, padding: '16px 32px',
                                        fontSize: 15, fontWeight: 500, cursor: 'pointer',
                                    }}
                                >
                                    {service.cta_label || 'Оставить заявку'}
                                </button>
                            </div>

                            {/* Right — image */}
                            {service.image && (
                                <div style={{ flex: 1, minWidth: 280, height: 400, borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
                                    <Image src={service.image} alt={service.title} fill className="object-cover" priority />
                                </div>
                            )}
                        </div>

                        {/* ── ЧТО ВЫ ПОЛУЧИТЕ ── */}
                        <div className='max-md:px-4' style={{ display: 'flex', gap: 48, flexWrap: 'wrap', marginBottom: 64 }}>
                            {/* Left — feature lines */}
                            <div style={{ flex: 1, minWidth: 260 }}>
                                <h2 style={{ fontSize: 24, fontWeight: 400, color: '#111827', margin: '0 0 24px' }}>
                                    {service.section_features_title || 'Что вы получите'}
                                </h2>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                                    {service.feature_lines?.map((f) => (
                                        <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: '#374151', marginBottom: 12 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE_BG, flexShrink: 0, display: 'inline-block' }} />
                                            {f.text}
                                        </li>
                                    ))}
                                </ul>

                                {/* Pill tags */}
                                {service.pill_tags?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {service.pill_tags.map((tag) => (
                                            <span key={tag.id} style={{
                                                border: '1px solid #E5E7EB', borderRadius: 999,
                                                padding: '6px 16px', fontSize: 13, color: '#374151',
                                            }}>
                                                {tag.text}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right — benefit blocks 2x2 orange */}
                            {service.benefit_blocks?.length > 0 && (
                                <div style={{ flex: 1, minWidth: 260 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        {service.benefit_blocks.map((block) => (
                                            <div key={block.id} style={{
                                                background: ORANGE_BG, borderRadius: 16,
                                                padding: '24px 20px', color: '#fff',
                                            }}>
                                                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.3 }}>
                                                    {block.title}
                                                </h3>
                                                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6, opacity: 0.9 }}>
                                                    {block.body}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* {service.workflow_steps?.length > 0 && (
                            <div style={{ marginBottom: 64 }}>
                                <h2 style={{ fontSize: 24, fontWeight: 400, color: '#111827', margin: '0 0 28px' }}>
                                    {service.section_workflow_title || 'Как мы работаем'}
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                                    {service.workflow_steps.map((step) => (
                                        <div key={step.id} style={{ background: '#F9FAFB', borderRadius: 16, padding: '20px' }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: '50%',
                                                background: ORANGE_BG, color: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 15, fontWeight: 600, marginBottom: 12,
                                            }}>
                                                {step.step_number}
                                            </div>
                                            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
                                                {step.title}
                                            </h3>
                                            <p style={{ fontSize: 13, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
                                                {step.body}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}

                        {/* {service.related_services?.length > 0 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 400, color: '#111827', margin: '0 0 28px' }}>
                                    Другие услуги
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {service.related_services.map((s) => (
                                        <div key={s.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/services/${s.id}`)}>
                                            <div style={{ position: 'relative', height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
                                                <Image src={s.image || '/imgs/herobig.png'} alt={s.title} fill className="object-cover" />
                                            </div>
                                            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>{s.title}</h3>
                                            <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>{s.body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )} */}
                    </>
                )}
            </div>
        </>
    );
}