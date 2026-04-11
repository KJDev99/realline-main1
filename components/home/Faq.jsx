'use client';

import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import useApiStore from '@/store/useApiStore';

export default function FAQ() {
    const { getData, isLoading, error } = useApiStore();
    const [faqs, setFaqs] = useState([]);
    const [openIndex, setOpenIndex] = useState(0);

    useEffect(() => {
        const fetchFaqs = async () => {
            const data = await getData('site/faq/');
            setFaqs(Array.isArray(data) ? data : data?.results || []);
        };
        fetchFaqs();
    }, []);

    const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

    return (
        <>
            <style>{`
        @keyframes faq-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>

            <section className="w-full bg-white py-16 px-5 md:px-10">
                <h2 className="text-center text-gray-900 font-semibold text-3xl md:text-4xl font-light mb-10">
                    Ответы на частые вопросы
                </h2>

                <div className="flex flex-col gap-3 max-w-2xl mx-auto">

                    {/* Loading */}
                    {isLoading && Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{
                            background: '#F5F5F5', borderRadius: 16, height: 64,
                            animation: `faq-pulse 1.4s ease-in-out ${i * 0.12}s infinite`,
                        }} />
                    ))}

                    {/* Error */}
                    {!isLoading && error && (
                        <p className="text-center text-gray-400 text-sm py-8">
                            {error.message || 'Не удалось загрузить данные'}
                        </p>
                    )}

                    {/* FAQ items */}
                    {!isLoading && !error && faqs.map((faq, i) => {
                        const isOpen = openIndex === i;
                        const question = faq.question || faq.title || faq.name || '';
                        const answer = faq.answer || faq.description || faq.text || '';

                        return (
                            <div
                                key={faq.id ?? i}
                                onClick={() => toggle(i)}
                                style={{
                                    background: '#F5F5F5', borderRadius: 16,
                                    padding: isOpen ? '20px 20px 24px' : '20px',
                                    cursor: 'pointer',
                                    transition: 'padding 0.3s ease',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontSize: 15, fontWeight: 500, color: '#111827', lineHeight: 1.4 }}>
                                        {question}
                                    </span>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: '#E5E7EB',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        {isOpen
                                            ? <FiChevronUp size={16} color="#6B7280" />
                                            : <FiChevronDown size={16} color="#6B7280" />
                                        }
                                    </div>
                                </div>

                                <div style={{
                                    overflow: 'hidden',
                                    maxHeight: isOpen ? 400 : 0,
                                    opacity: isOpen ? 1 : 0,
                                    transition: 'max-height 0.35s ease, opacity 0.3s ease',
                                }}>
                                    <p style={{ marginTop: 14, fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>
                                        {answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty */}
                    {!isLoading && !error && faqs.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-8">Вопросы не найдены</p>
                    )}
                </div>
            </section>
        </>
    );
}