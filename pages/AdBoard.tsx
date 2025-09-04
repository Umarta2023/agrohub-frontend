import React, { useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryPill from '../components/CategoryPill';
import { useGetAds } from '../hooks/useGetAds'; // <-- Используем новый хук

// Предполагаемые категории. Если они другие, вы можете их поправить.
const CATEGORIES = ['Все', 'Зерновые', 'Овощи', 'Молочная продукция', 'Масличные'];

// Предполагаем, что у вас есть компонент для отображения одного объявления.
// Если он называется иначе, поправьте название здесь.
const AdCard: React.FC<{ ad: any }> = ({ ad }) => (
    <div className="bg-white p-4 rounded-lg shadow">
        <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover rounded-md mb-2" />
        <h3 className="font-bold">{ad.title}</h3>
        <p className="text-sm text-gray-600">{ad.category}</p>
        <p className="font-semibold mt-1">{ad.price}</p>
        <p className="text-xs text-gray-500">{ad.location}</p>
    </div>
);


const AdBoard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Все');

    // --- Получаем реальные данные с сервера ---
    const { data: ads = [], isLoading, isError } = useGetAds();

    // --- Логика фильтрации ---
    const filteredAds = useMemo(() => {
        return ads
            .filter(ad => activeCategory === 'Все' || ad.category === activeCategory)
            .filter(ad => ad.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [ads, activeCategory, searchTerm]);

    // --- Обработка загрузки и ошибки ---
    if (isLoading) {
        return <div className="text-center p-10">Загрузка объявлений...</div>;
    }

    if (isError) {
        return <div className="text-center p-10 text-red-500">Не удалось загрузить данные.</div>;
    }

    // --- Основная разметка ---
    return (
        <div>
            <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по объявлениям..."
            />
            <div className="px-4 pb-3 overflow-x-auto">
                <div className="flex space-x-2">
                    {CATEGORIES.map(cat => (
                        <CategoryPill
                            key={cat}
                            label={cat}
                            isActive={activeCategory === cat}
                            onClick={() => setActiveCategory(cat)}
                        />
                    ))}
                </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">
                {filteredAds.map(ad => (
                    <AdCard key={ad.id} ad={ad} />
                ))}
            </div>

            {filteredAds.length === 0 && (
                <p className="text-center text-gray-500 py-8">Объявления не найдены.</p>
            )}
        </div>
    );
};

export default AdBoard;