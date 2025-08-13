import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import useMockData from '../hooks/useMockData';
import { ICONS } from '../constants';
import type { Product } from '../types';

const parsePrice = (price: string): number => {
    return parseFloat(price.replace(/[^0-9.-]+/g,""));
}

const Cart: React.FC = () => {
    const { cartItems, updateItemQuantity, removeFromCart } = useCart();
    const { products, shops, loading } = useMockData();
    const navigate = useNavigate();

    if (loading) {
        return <div className="text-center p-10">Загрузка...</div>;
    }

    const detailedCartItems = cartItems
        .map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            return {
                ...product,
                cartQuantity: item.quantity
            };
        })
        .filter((item): item is Product & { cartQuantity: number } => item !== null);

    const total = detailedCartItems.reduce((acc, item) => {
        return acc + (parsePrice(item.price) * item.cartQuantity);
    }, 0);
    
    const itemsByShop = detailedCartItems.reduce((acc, item) => {
        const shop = shops.find(s => s.id === item.shopId);
        const shopName = shop?.name || 'Неизвестный магазин';
        if (!acc[shopName]) {
            acc[shopName] = [];
        }
        acc[shopName].push(item);
        return acc;
    }, {} as Record<string, (Product & {cartQuantity: number})[]>);


    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <ICONS.cart className="w-24 h-24 text-gray-300 mb-4"/>
                <h1 className="text-2xl font-bold text-gray-800">Ваша корзина пуста</h1>
                <p className="text-gray-500 mt-2">Самое время добавить что-нибудь полезное!</p>
                <Link
                    to="/"
                    className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                    Перейти в маркет
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-800 ml-2">Корзина</h1>
            </div>
            
            <div className="space-y-4">
                 {Object.entries(itemsByShop).map(([shopName, items]) => (
                    <div key={shopName} className="bg-white p-4 rounded-xl shadow-md">
                        <h2 className="font-bold text-gray-700 mb-3">{shopName}</h2>
                        <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</p>
                                    <p className="text-blue-600 font-bold text-md mt-1">{item.price}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button 
                                            onClick={() => updateItemQuantity(item.id, item.cartQuantity - 1)}
                                            className="w-7 h-7 bg-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-300">-</button>
                                        <span>{item.cartQuantity}</span>
                                        <button 
                                            onClick={() => updateItemQuantity(item.id, item.cartQuantity + 1)}
                                            disabled={item.cartQuantity >= item.quantity}
                                            className="w-7 h-7 bg-gray-200 rounded-full font-bold text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500">
                                    <ICONS.trash className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-md sticky bottom-16">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-gray-700">Итого:</span>
                    <span className="text-2xl font-bold text-gray-900">{total.toLocaleString('ru-RU')} ₽</span>
                </div>
                <Link 
                    to="/checkout"
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors block text-center"
                >
                    Оформить заказ
                </Link>
            </div>
        </div>
    );
};

export default Cart;