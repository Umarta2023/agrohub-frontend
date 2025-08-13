import React from 'react';
import type { NewsAPIArticle } from '../types';
import { ICONS } from '../constants';

interface NewsCardProps {
    article: NewsAPIArticle;
    onSummaryClick: (article: NewsAPIArticle) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, onSummaryClick }) => {
    
    const timeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)} г. назад`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)} мес. назад`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)} д. назад`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)} ч. назад`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)} мин. назад`;
        return `${Math.floor(seconds)} сек. назад`;
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
            {article.image && (
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
                </a>
            )}
            <div className="p-4">
                <div className="flex justify-between items-start text-xs text-gray-500 mb-2">
                    <span className="font-semibold truncate pr-2">{article.source.name}</span>
                    <span>{timeAgo(article.publishedAt)}</span>
                </div>
                <h3 className="text-md font-bold text-gray-800 leading-snug">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                        {article.title}
                    </a>
                </h3>
                <p className="text-sm text-gray-600 mt-2">{article.description}</p>
                <div className="flex items-center gap-2 mt-4">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Читать далее
                    </a>
                    <button onClick={() => onSummaryClick(article)} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm" title="Получить краткую выжимку с помощью ИИ">
                       <ICONS.ai_assistant className="w-5 h-5" />
                       <span>Выжимка AI</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsCard;
