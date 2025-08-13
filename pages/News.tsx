import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { ICONS } from '../constants';
import type { NewsAPIArticle } from '../types';
import CategoryPill from '../components/CategoryPill';
import NewsCard from '../components/NewsCard';
import NewsSummaryModal from '../components/NewsSummaryModal';

const NEWS_API_KEY = '8f083b290ffac4c88e7140ce7271e7fe';

const NEWS_CATEGORIES = [
    { label: 'Главное', query: '"сельское хозяйство" OR "агротехника"' },
    { label: 'Рынок', query: '"рынок зерна" OR "цены на продукцию"' },
    { label: 'Технологии', query: '"агротехнологии" OR "инновации в апк"' },
    { label: 'Урожай', query: '"прогноз урожая" OR "уборка урожая"' },
    { label: 'Господдержка', query: '"субсидии апк" OR "господдержка фермеров"' },
];

const News: React.FC = () => {
    const [articles, setArticles] = useState<NewsAPIArticle[]>([]);
    const [activeCategory, setActiveCategory] = useState(NEWS_CATEGORIES[0].query);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    const observer = useRef<IntersectionObserver | null>(null);
    const lastArticleElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0]?.isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);
    
    // AI Summary Modal State
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [summaryContent, setSummaryContent] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [currentArticleForSummary, setCurrentArticleForSummary] = useState<NewsAPIArticle | null>(null);

    useEffect(() => {
        setArticles([]);
        setPage(1);
        setHasMore(true);
    }, [activeCategory]);

    useEffect(() => {
        const fetchNews = async () => {
            if (!NEWS_API_KEY) {
                setError("Ключ API для новостей не настроен.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            
            try {
                const query = encodeURIComponent(activeCategory);
                const url = `https://gnews.io/api/v4/search?q=${query}&lang=ru&page=${page}&token=${NEWS_API_KEY}`;
                const response = await fetch(url);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.errors?.[0] || `Ошибка сети: ${response.status}`);
                }
                const data = await response.json();

                setArticles(prev => page === 1 ? data.articles : [...prev, ...data.articles]);
                setHasMore(data.articles.length > 0 && articles.length + data.articles.length < data.totalArticles);

            } catch (e: any) {
                console.error("Failed to fetch news:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [activeCategory, page]);

    const handleGetSummary = async (article: NewsAPIArticle) => {
        if (!process.env.API_KEY) {
            alert("Ключ API для Gemini не настроен.");
            return;
        }
        setCurrentArticleForSummary(article);
        setIsSummaryModalOpen(true);
        setIsSummaryLoading(true);
        setSummaryContent('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Сделай краткую, но содержательную выжимку из следующей новостной статьи для занятого фермера. Выдели 3-4 ключевых тезиса или вывода в виде списка. Статья: "${article.title}. ${article.description} ${article.content}"`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setSummaryContent(response.text);
        } catch (error) {
            console.error("Ошибка при получении выжимки от AI:", error);
            setSummaryContent("Не удалось получить выжимку. Попробуйте позже.");
        } finally {
            setIsSummaryLoading(false);
        }
    };


    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center">
                <Link to="/info" className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 ml-2">Новости и статьи</h1>
            </div>

            <div className="pb-3 overflow-x-auto">
                <div className="flex space-x-2">
                    {NEWS_CATEGORIES.map(cat => (
                        <CategoryPill
                            key={cat.label}
                            label={cat.label}
                            isActive={activeCategory === cat.query}
                            onClick={() => setActiveCategory(cat.query)}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {articles.map((article, index) => {
                    if (articles.length === index + 1) {
                       return <div ref={lastArticleElementRef} key={article.url}><NewsCard article={article} onSummaryClick={handleGetSummary} /></div>
                    }
                    return <NewsCard key={article.url} article={article} onSummaryClick={handleGetSummary} />;
                })}
            </div>
            
            {loading && <div className="text-center p-10 text-gray-500">Загрузка новостей...</div>}
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Ошибка</p>
                    <p>{error}</p>
                </div>
            )}
            {!loading && hasMore && <div className="h-10"></div>}

            {!loading && !hasMore && articles.length > 0 && (
                 <p className="text-center text-gray-500 py-6">Вы просмотрели все новости.</p>
            )}

            {!loading && articles.length === 0 && !error && (
                <p className="text-center text-gray-500 py-10">По этой теме новостей не найдено.</p>
            )}

             <NewsSummaryModal 
                isOpen={isSummaryModalOpen}
                onClose={() => setIsSummaryModalOpen(false)}
                article={currentArticleForSummary}
                summary={summaryContent}
                isLoading={isSummaryLoading}
            />
        </div>
    );
};

export default News;