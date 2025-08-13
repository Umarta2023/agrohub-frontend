import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';

const OrderSuccess: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white">
            <div className="relative mb-6">
                <div className="w-32 h-32 bg-green-100 rounded-full animate-pulse"></div>
                <ICONS.checkCircle className="absolute inset-0 m-auto w-24 h-24 text-green-500 animate-scale-in" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800">Заказ успешно оформлен!</h1>
            <p className="text-gray-600 mt-3 max-w-sm">
                Мы передали ваш заказ продавцам. Ожидайте звонка для подтверждения деталей.
            </p>
            <Link
                to="/"
                className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
                Вернуться в маркет
            </Link>
        </div>
    );
};

export default OrderSuccess;