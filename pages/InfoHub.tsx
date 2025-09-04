import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';
import { CommunityChannel } from '../types';
import TelegramPostCard from '../components/TelegramPostCard';
import { useGetCommunityChannels } from '../hooks/useGetCommunityChannels';
import { useGetTelegramPosts } from '../hooks/useGetTelegramPosts';
import { useGetNotifications } from '../hooks/useGetNotifications';

// --- Reusable Components (без изменений) ---

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex justify-between items-center p-4 font-bold text-lg text-gray-800 hover:bg-gray-50 transition-colors"
                aria-expanded={isOpen}
            >
                <span>{title}</span>
                <ICONS.chevronDown className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-gray-200">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ManagementCard: React.FC<{ to: string, title: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ to, title, icon: Icon }) => (
    <Link to={to} className="flex flex-col items-center justify-center p-3 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 text-center bg-white h-24">
        <Icon className="w-7 h-7 mb-1.5 text-gray-700" />
        <span className="font-semibold text-gray-800 text-xs leading-tight">{title}</span>
    </Link>
);

const ToolCard: React.FC<{ to: string, title: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, color: string }> = ({ to, title, icon: Icon, color }) => (
    <Link to={to} className={`p-4 rounded-xl shadow-md flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow ${color}`}>
        <Icon className="w-7 h-7 text-white" />
        <span className="font-bold text-white text-md">{title}</span>
    </Link>
);

const CommunityChannelCard: React.FC<{ channel: CommunityChannel }> = ({ channel }) => {
    const PlatformIcon = ICONS[channel.iconName];
    return (
        <a href={channel.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0">
                <PlatformIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-grow">
                <h4 className="text-sm font-bold text-gray-800">{channel.name}</h4>
                <p className="text-xs text-gray-500">{channel.description}</p>
            </div>
            <button className="bg-sky-500 text-white font-semibold py-1.5 px-3 rounded-full text-xs hover:bg-sky-600">
                Присоединиться
            </button>
        </a>
    );
};


// --- Main Page Component ---

const InfoHub: React.FC = () => {
    const { data: communityChannels = [], isLoading: loadingChannels } = useGetCommunityChannels();
    const { data: telegramPosts = [], isLoading: loadingPosts } = useGetTelegramPosts();
    const { data: notifications = [], isLoading: loadingNotifs } = useGetNotifications();

    const isLoading = loadingChannels || loadingPosts || loadingNotifs;

    if (isLoading) {
        return <div className="text-center p-10">Загрузка...</div>;
    }
  
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    const regionalChannels = communityChannels.reduce((acc, channel) => {
        if (!acc[channel.region]) {
            acc[channel.region] = [];
        }
        acc[channel.region].push(channel);
        return acc;
    }, {} as Record<string, CommunityChannel[]>);

    const regionOrder: CommunityChannel['region'][] = ['Татарстан', 'Пермский край', 'Чувашия', 'Федеральные'];
    const sortedRegions = Object.keys(regionalChannels).sort((a, b) => {
        const indexA = regionOrder.indexOf(a as any);
        const indexB = regionOrder.indexOf(b as any);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });


    return (
        <div className="p-4 space-y-4">

            <CollapsibleSection title="Управление хозяйством" defaultOpen>
                <div className="grid grid-cols-3 gap-3">
                    <ManagementCard to="/my-shop" title="Мой магазин" icon={ICONS.store} />
                    <ManagementCard to="/my-services" title="Мои услуги" icon={ICONS.briefcase} />
                    <ManagementCard to="/my-fields" title="Мои поля" icon={ICONS.mapPin} />
                    <ManagementCard to="/my-requests" title="Мои заявки" icon={ICONS.clipboardList} />
                    <ManagementCard to="/purchase-history" title="История покупок" icon={ICONS.receipt} />
                    <div className="relative">
                        <ManagementCard to="/notification-center" title="Центр уведомлений" icon={ICONS.bell} />
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                {unreadNotificationsCount}
                            </span>
                        )}
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Полезные инструменты" defaultOpen>
                <div className="space-y-3">
                <ToolCard to="/agro-calculators" title="Агро-калькуляторы" icon={ICONS.calculator} color="bg-gradient-to-r from-yellow-500 to-orange-500"/>
                <ToolCard to="/agro-weather" title="Детальный агропрогноз" icon={ICONS.weather} color="bg-gradient-to-r from-sky-500 to-indigo-500"/>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Новости и анонсы АгроХаб">
                {telegramPosts.length > 0 ? (
                    <div className="space-y-3">
                    {telegramPosts.map((post) => <TelegramPostCard key={post.id} post={post} />)}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-4">Не удалось загрузить новости.</div>
                )}
            </CollapsibleSection>
      
            <CollapsibleSection title="Центр Сообщества">
                {communityChannels.length > 0 ? (
                    <div className="space-y-4">
                        {sortedRegions.map(region => (
                            <div key={region}>
                                <h3 className="font-bold text-gray-600 text-md mb-2">{region}</h3>
                                <div className="space-y-2">
                                    {regionalChannels[region].map(channel => <CommunityChannelCard key={channel.id} channel={channel} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-4">Не удалось загрузить список каналов.</div>
                )}
            </CollapsibleSection>

        </div>
    );
};

export default InfoHub;