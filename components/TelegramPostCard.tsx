import React from 'react';
import type { TelegramPost } from '../types';
import { ICONS } from '../constants';

interface TelegramPostCardProps {
    post: TelegramPost;
}

const TelegramPostCard: React.FC<TelegramPostCardProps> = ({ post }) => {

    const timeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <a href={post.channelLink} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                         <ICONS.telegram className="w-6 h-6 text-white"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 leading-tight">{post.channelName}</h3>
                        <p className="text-xs text-gray-500">Официальный канал</p>
                    </div>
                </div>
                
                {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post image" className="w-full h-40 object-cover rounded-lg mb-3" />
                )}
                
                <p className="text-sm text-gray-700 whitespace-pre-line">{post.text}</p>
                
                <div className="text-right text-xs text-gray-400 mt-3">
                    {timeAgo(post.date)}
                </div>
            </div>
        </a>
    );
};

export default TelegramPostCard;
