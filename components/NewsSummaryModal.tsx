import React from 'react';
import type { NewsAPIArticle } from '../types';
import { ICONS } from '../constants';

interface NewsSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    article: NewsAPIArticle | null;
    summary: string;
    isLoading: boolean;
}

const LoadingDots: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-pulse"></div>
        <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
    </div>
);

const NewsSummaryModal: React.FC<NewsSummaryModalProps> = ({ isOpen, onClose, article, summary, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[5000] p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Выжимка AI</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <ICONS.plus className="w-6 h-6 rotate-45" />
                    </button>
                </div>

                {article && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700">Статья: <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{article.title}</a></p>
                    </div>
                )}

                <div className="space-y-3 text-sm text-gray-700 min-h-[100px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center text-center py-6">
                            <LoadingDots />
                            <p className="mt-3 text-gray-600">Анализирую статью...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: summary.replace(/\*/g, '•') }} />
                    )}
                </div>

                <button onClick={onClose} className="w-full mt-6 bg-gray-200 text-gray-800 font-bold py-2.5 rounded-lg hover:bg-gray-300 transition-colors">
                    Закрыть
                </button>
            </div>
        </div>
    );
};

export default NewsSummaryModal;
