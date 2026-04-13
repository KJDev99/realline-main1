'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import HomeLink from '../homeLink';
import { getData } from '@/lib/apiService';

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function SkeletonBlock({ w = '100%', h = 20, mb = 12 }) {
    return (
        <div style={{
            width: w, height: h, borderRadius: 6,
            background: '#E5E7EB', marginBottom: mb,
            animation: 'pulse 1.4s ease-in-out infinite',
        }} />
    );
}

export default function DetailBlog() {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        getData(`/site/articles/${slug}/`)
            .then((data) => setArticle(data))
            .catch((err) => console.error('Ошибка загрузки статьи:', err))
            .finally(() => setLoading(false));
    }, [slug]);

    return (
        <>
            <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
            <div className="max-w-[1400px] mx-auto px-5 pb-10">
                <HomeLink link="/blog" label="Блог" link2={`/blog/${article?.slug}`} label2={article?.title} />

                {loading ? (
                    <div style={{ marginTop: 24 }}>
                        <SkeletonBlock w="50%" h={36} mb={24} />
                        <SkeletonBlock w="100%" h={420} mb={32} />
                        <SkeletonBlock w="70%" h={20} mb={12} />
                        <SkeletonBlock w="100%" h={14} mb={8} />
                        <SkeletonBlock w="90%" h={14} mb={32} />
                        <SkeletonBlock w="40%" h={24} mb={16} />
                        <SkeletonBlock w="100%" h={14} mb={8} />
                        <SkeletonBlock w="80%" h={14} mb={8} />
                    </div>
                ) : !article ? (
                    <p style={{ color: '#9CA3AF', marginTop: 40, textAlign: 'center' }}>Статья не найдена</p>
                ) : (
                    <div style={{ marginTop: 24, maxWidth: 1400 }}>
                        {/* Title + date row */}
                        <div className='max-md:flex-col' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                            <h1 className='max-md:leading-[110%] max-md:text-[26px] text-[32px]' style={{ fontWeight: 400, color: '#141111', margin: 0, lineHeight: 1.2 }}>
                                {article.title}
                            </h1>
                            <span style={{ fontSize: 14, color: '#9CA3AF', whiteSpace: 'nowrap', marginTop: 6 }}>
                                {formatDate(article.published_at)}
                            </span>
                        </div>

                        {/* Main image */}
                        {article.image && (
                            <div style={{ position: 'relative', width: '100%', height: 420, borderRadius: 16, overflow: 'hidden', marginBottom: 32 }}>
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        {/* Lead */}
                        {article.lead && (
                            <>
                                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: '0 0 12px' }}>
                                    {article.description}
                                </h2>
                                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: '0 0 32px' }}>
                                    {article.lead}
                                </p>
                            </>
                        )}

                        {/* Sections */}
                        {article.sections?.map((section, i) => (
                            <div key={i} style={{ marginBottom: 32 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: '0 0 10px' }}>
                                    {section.title}
                                </h2>
                                {section.intro && (
                                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: '0 0 10px' }}>
                                        {section.intro}
                                    </p>
                                )}
                                {section.list_title && (
                                    <p style={{ fontSize: 14, color: '#374151', fontWeight: 500, margin: '0 0 6px' }}>
                                        {section.list_title}
                                    </p>
                                )}
                                {section.items?.length > 0 && (
                                    <ul style={{ margin: '0 0 10px', paddingLeft: 20 }}>
                                        {section.items.map((item, j) => (
                                            <li key={j} style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 4 }}>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {section.closing && (
                                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>
                                        {section.closing}
                                    </p>
                                )}
                            </div>
                        ))}

                        {/* Body */}
                        {article.body && (
                            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginTop: 8 }}>
                                {article.body}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}