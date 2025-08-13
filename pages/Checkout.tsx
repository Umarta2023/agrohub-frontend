import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import useMockData from '../hooks/useMockData';
import { ICONS } from '../constants';
import { PurchasedItem } from '../types';

const parsePrice = (price: string): number => {
    return parseFloat(price.replace(/[^0-9.-]+/g,""));
}

const Checkout: React.FC = () => {
    const { cartItems, clearCart, getCartCount } = useCart();
    const { products, addPurchase } = useMockData();
    const navigate = useNavigate();

    const detailedCartItems = cartItems
        .map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            return { ...product, cartQuantity: item.quantity };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    const total = detailedCartItems.reduce((acc, item) => {
        if (!item) return acc;
        return acc + (parsePrice(item.price) * item.cartQuantity);
    }, 0);

    const handleConfirmOrder = () => {
        // Create purchase history item
        const purchasedItems: PurchasedItem[] = detailedCartItems.map(item => {
            if (!item) throw new Error("Invalid item in cart"); // Should not happen
            return {
                id: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
                shopId: item.shopId,
                quantity: item.cartQuantity,
            };
        });

        addPurchase(purchasedItems, total); // Save the purchase

        clearCart();
        navigate('/order-success');
    };
    
    if (cartItems.length === 0) {
        // Redirect to home if cart is empty and user lands here
        navigate('/');
        return null;
    }

    return (
        <div className="p-4 space-y-6 flex flex-col h-full">
            <div className="flex items-center flex-shrink-0">
                <Link to="/cart" className="p-2 rounded-full hover:bg-gray-200">
                    <ICONS.arrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
                <h1 className="text-xl font-bold text-gray-800 ml-2">Оформление заказа</h1>
            </div>
            
            <div className="flex-grow space-y-4">
                 <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Сводка по заказу</h2>
                    <div className="space-y-2 text-gray-700">
                        <div className="flex justify-between">
                            <span>Количество товаров:</span>
                            <span className="font-medium">{getCartCount()} шт.</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Общая стоимость:</span>
                            <span className="font-medium">{total.toLocaleString('ru-RU')} ₽</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Данные получателя</h2>
                     <p className="text-gray-500 text-sm">В этой демо-версии мы используем данные из вашего профиля. Нажмите "Подтвердить" для завершения.</p>
                     <div className="mt-4 space-y-2 border-t pt-4">
                        <p><span className="font-medium">Имя:</span> Иван Петров</p>
                        <p><span className="font-medium">Телефон:</span> +7 (918) 123-45-67</p>
                        <p><span className="font-medium">Адрес:</span> Краснодарский край, ст. Каневская</p>
                     </div>
                </div>
            </div>

            <div className="flex-shrink-0 py-2">
                <button
                    onClick={handleConfirmOrder}
                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-lg hover:bg-green-700 transition-colors text-lg"
                >
                    Подтвердить заказ
                </button>
            </div>
        </div>
    );
};

export default Checkout;