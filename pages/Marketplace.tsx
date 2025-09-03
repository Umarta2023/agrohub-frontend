import React, { useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import CategoryPill from '../components/CategoryPill';
import { useGetShops } from '../hooks/useGetShops';
import { useGetProducts } from '../hooks/useGetProducts';

const CATEGORIES = ['Все', 'Сельхозтехника', 'Запчасти', 'СЗР и Удобрения', 'Оборудование', 'Сельхозпродукция'];

const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');

  // --- 1. Получаем реальные данные с сервера ---
  // Добавляем `|| []` чтобы избежать ошибок, пока данные загружаются и равны `undefined`
  const { data: products = [], isLoading: isLoadingProducts, isError: isErrorProducts } = useGetProducts();
  const { data: shops = [], isLoading: isLoadingShops, isError: isErrorShops } = useGetShops();

  // --- 2. Объединяем состояния загрузки и ошибок ---
  const isLoading = isLoadingProducts || isLoadingShops;
  const isError = isErrorProducts || isErrorShops;

  // --- 3. Логика фильтрации остается прежней ---
  // useMemo кэширует результат вычислений, чтобы не фильтровать массив при каждом рендере
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => activeCategory === 'Все' || p.category === activeCategory)
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, activeCategory, searchTerm]);

  // --- 4. Обрабатываем состояния загрузки и ошибки ---
  if (isLoading) {
    return <div className="text-center p-10">Загрузка...</div>;
  }

  if (isError) {
    return <div className="text-center p-10 text-red-500">Не удалось загрузить данные. Попробуйте позже.</div>;
  }

  // --- 5. Основная разметка ---
  return (
    <div>
      <SearchBar 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Поиск по товарам..."
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
        {filteredProducts.map(product => {
          // Находим магазин для каждого товара. ID теперь числа.
          const shop = shops.find(s => s.id === product.shopId);
          // Отображаем карточку товара, только если магазин найден
          return shop ? <ProductCard key={product.id} product={product} shop={shop} /> : null;
        })}
      </div>
      
      {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 py-8">Товары не найдены.</p>
      )}
    </div>
  );
};

export default Marketplace;