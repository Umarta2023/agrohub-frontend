import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useMockData from '../hooks/useMockData';
import { ICONS } from '../constants';
import type { Purchase, PurchasedItem } from '../types';

const PurchaseHistory: React.FC = () => {
    const { purchases, shops, loading } = useMockData();
    const [expandedPurchaseId, setExpandedPurchaseId] = useState<string | null>(null);

    const toggleExpand = (purchaseId: string) => {
        setExpandedPurchaseId(prevId => (prevId === purchaseId ? null : purchaseId));
    };

    const itemsByShop = (items: PurchasedItem[]) => {
        return items.reduce((acc, item) => {
            const shop = shops.find(s => s.id === item.shopId);
            const shopName = shop?.name || 'Неизвестный магазин';
            if (!acc[shopName]) {
                acc[shopName] = [];
            }
            acc[shopName].push(item);
            return acc;
        }, {} as Record<string, PurchasedItem[]>);
    };

    if (loading) {
        return <div className="text-center p-10">Загрузка истории...</div>;
    }

    // Sort purchases from newest to oldest
    const sortedPurchases = [...purchases].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center mb-2">
                <Link to="/info" className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 ml-2">История покупок</h1>
            </div>

            {sortedPurchases.length === 0 ? (
                <div className="text-center py-16">
                    <ICONS.receipt className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Вы еще ничего не покупали.</p>
                    <Link to="/" className="mt-4 inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">
                        В магазин
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedPurchases.map((purchase) => (
                        <div key={purchase.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                            <button onClick={() => toggleExpand(purchase.id)} className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors text-left">
                                <div>
                                    <p className="font-bold text-gray-800">Заказ от {new Date(purchase.date).toLocaleDateString('ru-RU')}</p>
                                    <p className="text-sm text-gray-500">Сумма: <span className="font-semibold">{purchase.totalAmount.toLocaleString('ru-RU')} ₽</span></p>
                                </div>
                                <ICONS.chevronDown className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${expandedPurchaseId === purchase.id ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <div className={`grid transition-all duration-300 ease-in-out ${expandedPurchaseId === purchase.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                     <div className="p-4 border-t border-gray-200 space-y-4">
                                        {Object.entries(itemsByShop(purchase.items)).map(([shopName, items]) => (
                                            <div key={shopName}>
                                                <h3 className="font-semibold text-gray-700 mb-2">{shopName}</h3>
                                                <div className="space-y-3">
                                                    {items.map(item => (
                                                        <div key={`${purchase.id}-${item.id}`} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                                                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                                                            <div className="flex-grow">
                                                                <p className="text-sm font-semibold text-gray-800 leading-tight">{item.name}</p>
                                                                <p className="text-xs text-gray-600">{item.quantity} шт. &times; {item.price}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PurchaseHistory;
