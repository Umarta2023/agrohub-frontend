
import React, { useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import CategoryPill from '../components/CategoryPill';
import useMockData from '../hooks/useMockData';
import type { Product } from '../types';

const CATEGORIES = ['Все', 'Сельхозтехника', 'Запчасти', 'СЗР и Удобрения', 'Оборудование', 'Сельхозпродукция'];

const Marketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const { products, shops, loading } = useMockData();

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => activeCategory === 'Все' || p.category === activeCategory)
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, activeCategory, searchTerm]);

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
      {loading ? (
        <div className="text-center p-10">Загрузка...</div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-4">
          {filteredProducts.map(product => {
            const shop = shops.find(s => s.id === product.shopId);
            return <ProductCard key={product.id} product={product} shop={shop} />
          })}
        </div>
      )}
    </div>
  );
};

export default Marketplace;