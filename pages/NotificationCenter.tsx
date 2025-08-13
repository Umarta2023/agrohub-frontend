import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useMockData from '../hooks/useMockData';
import { ICONS } from '../constants';
import type { AgroNotification } from '../types';

const getNotificationStyles = (type: AgroNotification['type']) => {
    switch (type) {
        case 'warning':
            return {
                icon: ICONS.warning,
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-400',
                iconColor: 'text-yellow-500'
            };
        case 'task':
            return {
                icon: ICONS.clipboardList,
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-400',
                iconColor: 'text-blue-500'
            };
        case 'info':
            return {
                icon: ICONS.info,
                bgColor: 'bg-green-50',
                borderColor: 'border-green-400',
                iconColor: 'text-green-500'
            };
        default:
            return {
                icon: ICONS.bell,
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-400',
                iconColor: 'text-gray-500'
            };
    }
};

const NotificationCard: React.FC<{ notification: AgroNotification, onClick: () => void }> = ({ notification, onClick }) => {
    const { icon: Icon, bgColor, borderColor, iconColor } = getNotificationStyles(notification.type);
    
    const content = (
        <div 
            onClick={!notification.link ? onClick : undefined} // Non-linkable items are clickable divs
            className={`relative p-4 rounded-xl shadow-md border-l-4 transition-all duration-300 ${borderColor} ${notification.read ? 'bg-white hover:bg-gray-50' : `${bgColor} hover:bg-white`} ${notification.link ? 'cursor-pointer' : ''}`}
        >
            {!notification.read && (
                <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-blue-500 rounded-full" title="Непрочитано"></span>
            )}
            <div className="flex gap-4 items-start">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-gray-800">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(notification.date).toLocaleString('ru-RU')}</p>
                </div>
            </div>
        </div>
    );
    
    return notification.link ? <Link to={notification.link} onClick={onClick}>{content}</Link> : content;
};


const NotificationCenter: React.FC = () => {
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead, loading } = useMockData();
    const navigate = useNavigate();

    const handleNotificationClick = (id: string) => {
        markNotificationAsRead(id);
    };

    const handleReadAll = () => {
        markAllNotificationsAsRead();
    };

    if (loading) {
        return <div className="text-center p-10">Загрузка уведомлений...</div>;
    }

    const unreadCount = notifications.filter(n => !n.read).length;
    const sortedNotifications = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/info" className="p-2 rounded-full hover:bg-gray-200">
                        <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800 ml-2">Центр Уведомлений</h1>
                </div>
                {unreadCount > 0 && (
                     <button onClick={handleReadAll} className="text-sm text-blue-600 font-semibold hover:underline">
                        Прочитать все
                    </button>
                )}
            </div>
            
            {sortedNotifications.length === 0 ? (
                <div className="text-center py-16">
                    <ICONS.bell className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">У вас пока нет уведомлений.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedNotifications.map(notification => (
                        <NotificationCard 
                            key={notification.id} 
                            notification={notification} 
                            onClick={() => handleNotificationClick(notification.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
