
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useMockData from '../hooks/useMockData';
import ProductCard from '../components/ProductCard';

const Shop: React.FC = () => {
    const { shopId } = useParams<{ shopId: string }>();
    const { shops, products, loading } = useMockData();

    const shop = shops.find(s => s.id === shopId);
    const shopProducts = products.filter(p => p.shopId === shopId);

    if (loading) {
        return <div className="text-center p-10">Загрузка данных магазина...</div>;
    }

    if (!shop) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold text-red-500">Магазин не найден</h1>
                <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
                    Вернуться на главную
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <div className="flex items-center gap-4 mb-4">
                     <img src={shop.logoUrl} alt={`${shop.name} logo`} className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{shop.name}</h1>
                        <p className="text-gray-600 mt-1">{shop.description}</p>
                    </div>
                </div>
                <button className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Связаться с магазином
                </button>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">Товары магазина</h2>
                {shopProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {shopProducts.map(product => (
                            <ProductCard key={product.id} product={product} shop={shop} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">В этом магазине пока нет товаров.</p>
                )}
            </div>
        </div>
    );
};

export default Shop;